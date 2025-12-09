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
      .from('children_wishes')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const wishes = (data || []).map((wish: any) => ({
      id: wish.id,
      childName: wish.child_name,
      guardianPreferences: wish.guardian_preferences,
      guardianName: wish.guardian_name,
      guardianContact: wish.guardian_contact,
      milestoneMessages: wish.milestone_messages,
      importantPrinciples: wish.important_principles,
      personalMessage: wish.personal_message,
      createdAt: wish.created_at,
      updatedAt: wish.updated_at,
    }));

    return NextResponse.json({ wishes });
  } catch (error) {
    console.error('Children wishes GET error:', error);
    return NextResponse.json({ error: 'Failed to load children wishes' }, { status: 500 });
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

    const wishData = {
      user_id: auth.userId,
      child_name: body.childName,
      guardian_preferences: body.guardianPreferences,
      guardian_name: body.guardianName,
      guardian_contact: body.guardianContact,
      milestone_messages: body.milestoneMessages,
      important_principles: body.importantPrinciples,
      personal_message: body.personalMessage,
    };

    const { data, error } = await supabase
      .from('children_wishes')
      .insert(wishData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ wish: data });
  } catch (error) {
    console.error('Children wishes POST error:', error);
    return NextResponse.json({ error: 'Failed to save wish' }, { status: 500 });
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

    if (!body.id) {
      return NextResponse.json({ error: 'Wish ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.childName !== undefined) updateData.child_name = body.childName;
    if (body.guardianPreferences !== undefined) updateData.guardian_preferences = body.guardianPreferences;
    if (body.guardianName !== undefined) updateData.guardian_name = body.guardianName;
    if (body.guardianContact !== undefined) updateData.guardian_contact = body.guardianContact;
    if (body.milestoneMessages !== undefined) updateData.milestone_messages = body.milestoneMessages;
    if (body.importantPrinciples !== undefined) updateData.important_principles = body.importantPrinciples;
    if (body.personalMessage !== undefined) updateData.personal_message = body.personalMessage;

    const { data, error } = await supabase
      .from('children_wishes')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ wish: data });
  } catch (error) {
    console.error('Children wishes PUT error:', error);
    return NextResponse.json({ error: 'Failed to update wish' }, { status: 500 });
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
      return NextResponse.json({ error: 'Wish ID is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('children_wishes')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Children wishes DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete wish' }, { status: 500 });
  }
}

