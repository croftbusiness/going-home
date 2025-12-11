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
      .from('legacy_advice')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const advice = data?.map((item: any) => ({
      id: item.id,
      category: item.category,
      message: item.message,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) || [];

    return NextResponse.json({ advice });
  } catch (error: any) {
    console.error('Advice GET error:', error);
    return NextResponse.json({ error: 'Failed to load advice' }, { status: 500 });
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
      .from('legacy_advice')
      .insert({
        user_id: auth.userId,
        category: body.category,
        message: body.message,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      advice: {
        id: data.id,
        category: data.category,
        message: data.message,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Advice POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save advice' },
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
      .from('legacy_advice')
      .update({
        category: body.category,
        message: body.message,
      })
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      advice: {
        id: data.id,
        category: data.category,
        message: data.message,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Advice PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update advice' },
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
      return NextResponse.json({ error: 'Advice ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('legacy_advice')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Advice DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete advice' },
      { status: 500 }
    );
  }
}




