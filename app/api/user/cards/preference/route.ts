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

    const { data: userData } = await db
      .from('users')
      .select('show_cards_on_login, login_count')
      .eq('id', userId)
      .single();

    return NextResponse.json({
      show_cards: userData?.show_cards_on_login !== false,
      login_count: userData?.login_count || 0,
    });
  } catch (error) {
    console.error('Error fetching preference:', error);
    return NextResponse.json({ error: 'Failed to fetch preference' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { show_cards } = await request.json();

    if (typeof show_cards !== 'boolean') {
      return NextResponse.json({ error: 'show_cards must be a boolean' }, { status: 400 });
    }

    const db = createServerClient();
    const userId = auth.userId;

    await db
      .from('users')
      .update({
        show_cards_on_login: show_cards,
      })
      .eq('id', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating preference:', error);
    return NextResponse.json({ error: 'Failed to update preference' }, { status: 500 });
  }
}

