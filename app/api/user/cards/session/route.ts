import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = createServerClient();
    const userId = auth.userId;

    // Check for existing active session
    const { data: existingSession } = await db
      .from('card_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingSession) {
      // Get session items
      const { data: items } = await db
        .from('card_session_items')
        .select(`
          *,
          card:user_cards(*)
        `)
        .eq('session_id', existingSession.id)
        .order('created_at', { ascending: true });

      return NextResponse.json({
        session: existingSession,
        items: items || [],
      });
    }

    // No active session
    return NextResponse.json({
      session: null,
      items: [],
    });
  } catch (error) {
    console.error('Error getting session:', error);
    return NextResponse.json({ error: 'Failed to get session' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { card_ids } = await request.json();

    if (!card_ids || !Array.isArray(card_ids) || card_ids.length === 0) {
      return NextResponse.json({ error: 'card_ids array required' }, { status: 400 });
    }

    const db = createServerClient();
    const userId = auth.userId;

    // Deactivate any existing active sessions
    await db
      .from('card_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true);

    // Create new session
    const { data: newSession, error: sessionError } = await db
      .from('card_sessions')
      .insert({
        user_id: userId,
        is_active: true,
      })
      .select()
      .single();

    if (sessionError || !newSession) {
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    // Create session items for each card
    const sessionItems = card_ids.map((cardId: string) => ({
      session_id: newSession.id,
      card_id: cardId,
      status: 'pending',
      origin: 'card',
    }));

    const { error: itemsError } = await db
      .from('card_session_items')
      .insert(sessionItems);

    if (itemsError) {
      console.error('Error creating session items:', itemsError);
      return NextResponse.json({ error: 'Failed to create session items' }, { status: 500 });
    }

    // Don't update last_shown_at here - we'll track card display via session items
    // This allows users to resume sessions without cards being filtered out

    // Fetch created items with card data
    const { data: items } = await db
      .from('card_session_items')
      .select(`
        *,
        card:user_cards(*)
      `)
      .eq('session_id', newSession.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      session: newSession,
      items: items || [],
    });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

