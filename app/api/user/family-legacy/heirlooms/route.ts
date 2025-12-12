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
      .from('legacy_heirlooms')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const heirlooms = data?.map((item: any) => ({
      id: item.id,
      itemName: item.item_name,
      itemPhoto: item.item_photo,
      itemStory: item.item_story,
      recipientName: item.recipient_name,
      videoUrl: item.video_url,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) || [];

    return NextResponse.json({ heirlooms });
  } catch (error: any) {
    console.error('Heirlooms GET error:', error);
    return NextResponse.json({ error: 'Failed to load heirlooms' }, { status: 500 });
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
      .from('legacy_heirlooms')
      .insert({
        user_id: auth.userId,
        item_name: body.itemName,
        item_photo: body.itemPhoto || null,
        item_story: body.itemStory || null,
        recipient_name: body.recipientName || null,
        video_url: body.videoUrl || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      heirloom: {
        id: data.id,
        itemName: data.item_name,
        itemPhoto: data.item_photo,
        itemStory: data.item_story,
        recipientName: data.recipient_name,
        videoUrl: data.video_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Heirlooms POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save heirloom' },
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
      .from('legacy_heirlooms')
      .update({
        item_name: body.itemName,
        item_photo: body.itemPhoto || null,
        item_story: body.itemStory || null,
        recipient_name: body.recipientName || null,
        video_url: body.videoUrl || null,
      })
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      heirloom: {
        id: data.id,
        itemName: data.item_name,
        itemPhoto: data.item_photo,
        itemStory: data.item_story,
        recipientName: data.recipient_name,
        videoUrl: data.video_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Heirlooms PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update heirloom' },
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
      return NextResponse.json({ error: 'Heirloom ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('legacy_heirlooms')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Heirlooms DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete heirloom' },
      { status: 500 }
    );
  }
}






