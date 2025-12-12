import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createServerClient } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { card_id } = await request.json();

    if (!card_id) {
      return NextResponse.json({ error: 'Missing card_id' }, { status: 400 });
    }

    const db = createServerClient();
    const userId = auth.userId;

    // Snooze for 7 days
    const snoozeUntil = new Date();
    snoozeUntil.setDate(snoozeUntil.getDate() + 7);

    await db
      .from('user_cards')
      .update({
        snoozed_until: snoozeUntil.toISOString(),
      })
      .eq('id', card_id)
      .eq('user_id', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error snoozing card:', error);
    return NextResponse.json({ error: 'Failed to snooze card' }, { status: 500 });
  }
}

