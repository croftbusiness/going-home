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
      .from('letters')
      .select(`
        *,
        trusted_contacts (name)
      `)
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const letters = data?.map((letter: any) => ({
      id: letter.id,
      recipientId: letter.recipient_id,
      recipientName: letter.trusted_contacts?.name,
      recipientRelationship: letter.recipient_relationship,
      title: letter.title,
      messageText: letter.message_text,
      visibleAfterDeath: letter.visible_after_death,
      releaseType: letter.release_type || 'after_death',
      releaseDate: letter.release_date,
      milestoneType: letter.milestone_type,
      milestoneDate: letter.milestone_date,
      milestoneDescription: letter.milestone_description,
      letterCategory: letter.letter_category || 'other',
      createdAt: letter.created_at,
      updatedAt: letter.updated_at,
    })) || [];

    return NextResponse.json({ letters });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
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

    // Get recipient email if recipient is selected
    let recipientEmail = null;
    if (body.recipientId) {
      const { data: contact } = await supabase
        .from('trusted_contacts')
        .select('email')
        .eq('id', body.recipientId)
        .single();
      recipientEmail = contact?.email || null;
    }

    const { data, error } = await supabase
      .from('letters')
      .insert({
        user_id: auth.userId,
        recipient_id: body.recipientId || null,
        recipient_relationship: body.recipientRelationship,
        title: body.title,
        message_text: body.messageText,
        visible_after_death: body.visibleAfterDeath ?? true,
        release_type: body.releaseType || 'after_death',
        release_date: body.releaseDate || null,
        milestone_type: body.milestoneType || null,
        milestone_date: body.milestoneDate || null,
        milestone_description: body.milestoneDescription || null,
        letter_category: body.letterCategory || 'other',
        auto_email_enabled: body.autoEmailEnabled ?? (body.releaseType === 'after_death' || body.releaseType === 'on_date' || body.releaseType === 'on_milestone'),
        recipient_email: recipientEmail,
      })
      .select()
      .single();

    if (error) throw error;
    
    // Transform response
    const letter = {
      id: data.id,
      recipientId: data.recipient_id,
      recipientRelationship: data.recipient_relationship,
      title: data.title,
      messageText: data.message_text,
      visibleAfterDeath: data.visible_after_death,
      releaseType: data.release_type,
      releaseDate: data.release_date,
      milestoneType: data.milestone_type,
      milestoneDate: data.milestone_date,
      milestoneDescription: data.milestone_description,
      letterCategory: data.letter_category,
      autoEmailEnabled: data.auto_email_enabled ?? false,
      emailSent: data.email_sent ?? false,
      emailSentAt: data.email_sent_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    
    return NextResponse.json({ letter });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const body = await request.json();

    // Get recipient email if recipient is selected
    let recipientEmail = null;
    if (body.recipientId) {
      const { data: contact } = await supabase
        .from('trusted_contacts')
        .select('email')
        .eq('id', body.recipientId)
        .single();
      recipientEmail = contact?.email || null;
    }

    const { data, error } = await supabase
      .from('letters')
      .update({
        recipient_id: body.recipientId || null,
        recipient_relationship: body.recipientRelationship,
        title: body.title,
        message_text: body.messageText,
        visible_after_death: body.visibleAfterDeath ?? true,
        release_type: body.releaseType || 'after_death',
        release_date: body.releaseDate || null,
        milestone_type: body.milestoneType || null,
        milestone_date: body.milestoneDate || null,
        milestone_description: body.milestoneDescription || null,
        letter_category: body.letterCategory || 'other',
        auto_email_enabled: body.autoEmailEnabled ?? (body.releaseType === 'after_death' || body.releaseType === 'on_date' || body.releaseType === 'on_milestone'),
        recipient_email: recipientEmail,
      })
      .eq('id', id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;
    
    // Transform response
    const letter = {
      id: data.id,
      recipientId: data.recipient_id,
      recipientRelationship: data.recipient_relationship,
      title: data.title,
      messageText: data.message_text,
      visibleAfterDeath: data.visible_after_death,
      releaseType: data.release_type,
      releaseDate: data.release_date,
      milestoneType: data.milestone_type,
      milestoneDate: data.milestone_date,
      milestoneDescription: data.milestone_description,
      letterCategory: data.letter_category,
      autoEmailEnabled: data.auto_email_enabled ?? false,
      emailSent: data.email_sent ?? false,
      emailSentAt: data.email_sent_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    
    return NextResponse.json({ letter });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase
      .from('letters')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
