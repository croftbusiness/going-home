import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
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

    // Mark session as completed
    const { error } = await db
      .from('card_sessions')
      .update({
        is_active: false,
        completed_at: new Date().toISOString(),
      })
      .eq('id', session_id);

    if (error) {
      return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error completing session:', error);
    return NextResponse.json({ error: 'Failed to complete session' }, { status: 500 });
  }
}

