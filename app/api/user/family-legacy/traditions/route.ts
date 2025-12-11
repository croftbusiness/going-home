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
      .from('legacy_traditions')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const traditions = data?.map((tradition: any) => ({
      id: tradition.id,
      traditionName: tradition.tradition_name,
      description: tradition.description,
      whenItOccurs: tradition.when_it_occurs,
      personalMeaning: tradition.personal_meaning,
      createdAt: tradition.created_at,
      updatedAt: tradition.updated_at,
    })) || [];

    return NextResponse.json({ traditions });
  } catch (error: any) {
    console.error('Traditions GET error:', error);
    return NextResponse.json({ error: 'Failed to load traditions' }, { status: 500 });
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
      .from('legacy_traditions')
      .insert({
        user_id: auth.userId,
        tradition_name: body.traditionName,
        description: body.description,
        when_it_occurs: body.whenItOccurs || null,
        personal_meaning: body.personalMeaning || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      tradition: {
        id: data.id,
        traditionName: data.tradition_name,
        description: data.description,
        whenItOccurs: data.when_it_occurs,
        personalMeaning: data.personal_meaning,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Traditions POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save tradition' },
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
      .from('legacy_traditions')
      .update({
        tradition_name: body.traditionName,
        description: body.description,
        when_it_occurs: body.whenItOccurs || null,
        personal_meaning: body.personalMeaning || null,
      })
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      tradition: {
        id: data.id,
        traditionName: data.tradition_name,
        description: data.description,
        whenItOccurs: data.when_it_occurs,
        personalMeaning: data.personal_meaning,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Traditions PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update tradition' },
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
      return NextResponse.json({ error: 'Tradition ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('legacy_traditions')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Traditions DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete tradition' },
      { status: 500 }
    );
  }
}




