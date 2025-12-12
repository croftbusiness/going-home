import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session_id, card_id, status, exited_early } = await request.json();

    if (!session_id || !card_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = createServerClient();
    const userId = auth.userId;

    // Verify session belongs to user
    const { data: session } = await db
      .from('card_sessions')
      .select('user_id')
      .eq('id', session_id)
      .single();

    if (!session || session.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find session item
    const { data: existingItem } = await db
      .from('card_session_items')
      .select('*')
      .eq('session_id', session_id)
      .eq('card_id', card_id)
      .single();

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (status === 'engaged') {
      updateData.engaged_at = new Date().toISOString();
      if (exited_early !== undefined) {
        updateData.exited_early = exited_early;
      }
    }

    if (existingItem) {
      // Update existing item
      const { error } = await db
        .from('card_session_items')
        .update(updateData)
        .eq('id', existingItem.id);

      if (error) {
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
      }
    } else {
      // Create new item
      const { error } = await db
        .from('card_session_items')
        .insert({
          session_id,
          card_id,
          ...updateData,
          origin: 'card',
        });

      if (error) {
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating session item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

