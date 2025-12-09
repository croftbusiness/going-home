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
      .from('legacy_messages')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const messages = (data || []).map((msg: any) => ({
      id: msg.id,
      messageType: msg.message_type,
      title: msg.title,
      recipientType: msg.recipient_type,
      recipientId: msg.recipient_id,
      recipientName: msg.recipient_name,
      fileUrl: msg.file_url,
      fileSize: msg.file_size,
      mimeType: msg.mime_type,
      durationSeconds: msg.duration_seconds,
      description: msg.description,
      playOnDate: msg.play_on_date,
      createdAt: msg.created_at,
      updatedAt: msg.updated_at,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Legacy messages GET error:', error);
    return NextResponse.json({ error: 'Failed to load legacy messages' }, { status: 500 });
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

    const messageData = {
      user_id: auth.userId,
      message_type: body.messageType,
      title: body.title,
      recipient_type: body.recipientType,
      recipient_id: body.recipientId,
      recipient_name: body.recipientName,
      file_url: body.fileUrl,
      file_size: body.fileSize,
      mime_type: body.mimeType,
      duration_seconds: body.durationSeconds,
      description: body.description,
      play_on_date: body.playOnDate,
    };

    const { data, error } = await supabase
      .from('legacy_messages')
      .insert(messageData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ message: data });
  } catch (error) {
    console.error('Legacy messages POST error:', error);
    return NextResponse.json({ error: 'Failed to save legacy message' }, { status: 500 });
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
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get message to delete file from storage
    const { data: message } = await supabase
      .from('legacy_messages')
      .select('file_url')
      .eq('id', id)
      .eq('user_id', auth.userId)
      .single();

    if (message?.file_url) {
      // Extract path from URL
      const pathMatch = message.file_url.match(/legacy-messages\/(.+)$/);
      if (pathMatch) {
        await supabase.storage
          .from('legacy-messages')
          .remove([pathMatch[1]]);
      }
    }

    const { error } = await supabase
      .from('legacy_messages')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Legacy messages DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete legacy message' }, { status: 500 });
  }
}

