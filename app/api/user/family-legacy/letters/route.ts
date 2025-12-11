import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('legacy_family_letters')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const letters = data?.map((letter: any) => ({
      id: letter.id,
      recipientName: letter.recipient_name,
      message: letter.message,
      scheduledReleaseDate: letter.scheduled_release_date,
      createdAt: letter.created_at,
      updatedAt: letter.updated_at,
    })) || [];

    return NextResponse.json({ letters });
  } catch (error: any) {
    console.error('Legacy Letters GET error:', error);
    return NextResponse.json({ error: 'Failed to load letters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('legacy_family_letters')
      .insert({
        user_id: auth.userId,
        recipient_name: body.recipientName,
        message: body.message,
        scheduled_release_date: body.scheduledReleaseDate || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      letter: {
        id: data.id,
        recipientName: data.recipient_name,
        message: data.message,
        scheduledReleaseDate: data.scheduled_release_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Legacy Letters POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save letter' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('legacy_family_letters')
      .update({
        recipient_name: body.recipientName,
        message: body.message,
        scheduled_release_date: body.scheduledReleaseDate || null,
      })
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      letter: {
        id: data.id,
        recipientName: data.recipient_name,
        message: data.message,
        scheduledReleaseDate: data.scheduled_release_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Legacy Letters PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update letter' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Letter ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('legacy_family_letters')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Legacy Letters DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete letter' },
      { status: 500 }
    );
  }
}




