import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { card_id, direction } = await request.json();

    if (!card_id || !direction) {
      return NextResponse.json({ error: 'Missing card_id or direction' }, { status: 400 });
    }

    const db = createServerClient();
    const userId = auth.userId;

    // Record interaction
    await db
      .from('card_interactions')
      .insert({
        user_id: userId,
        card_id,
        direction,
        created_at: new Date().toISOString(),
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording interaction:', error);
    return NextResponse.json({ error: 'Failed to record interaction' }, { status: 500 });
  }
}

