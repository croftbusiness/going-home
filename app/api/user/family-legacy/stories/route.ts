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
      .from('legacy_stories')
      .select('*')
      .eq('user_id', auth.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const stories = data?.map((story: any) => ({
      id: story.id,
      storyTitle: story.story_title,
      storyText: story.story_text,
      audioUrl: story.audio_url,
      photoUrls: story.photo_urls || [],
      createdAt: story.created_at,
      updatedAt: story.updated_at,
    })) || [];

    return NextResponse.json({ stories });
  } catch (error: any) {
    console.error('Stories GET error:', error);
    return NextResponse.json({ error: 'Failed to load stories' }, { status: 500 });
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
      .from('legacy_stories')
      .insert({
        user_id: auth.userId,
        story_title: body.storyTitle,
        story_text: body.storyText,
        audio_url: body.audioUrl || null,
        photo_urls: body.photoUrls || [],
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      story: {
        id: data.id,
        storyTitle: data.story_title,
        storyText: data.story_text,
        audioUrl: data.audio_url,
        photoUrls: data.photo_urls || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Stories POST error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save story' },
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
      .from('legacy_stories')
      .update({
        story_title: body.storyTitle,
        story_text: body.storyText,
        audio_url: body.audioUrl || null,
        photo_urls: body.photoUrls || [],
      })
      .eq('id', body.id)
      .eq('user_id', auth.userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      story: {
        id: data.id,
        storyTitle: data.story_title,
        storyText: data.story_text,
        audioUrl: data.audio_url,
        photoUrls: data.photo_urls || [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (error: any) {
    console.error('Stories PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update story' },
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
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('legacy_stories')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Stories DELETE error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete story' },
      { status: 500 }
    );
  }
}



