import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify user owns this file
    if (!path.startsWith(`${auth.userId}/`)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Download file from storage
    const { data, error } = await supabase.storage
      .from('legacy-messages')
      .download(path);

    if (error) {
      console.error('Download error:', error);
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // Determine content type
    const contentType = path.endsWith('.mp4') ? 'video/mp4' :
                       path.endsWith('.webm') ? 'video/webm' :
                       path.endsWith('.mp3') ? 'audio/mpeg' :
                       path.endsWith('.wav') ? 'audio/wav' :
                       'application/octet-stream';

    return new NextResponse(data, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${path.split('/').pop()}"`,
      },
    });
  } catch (error: any) {
    console.error('Legacy message GET error:', error);
    return NextResponse.json({ error: 'Failed to load file' }, { status: 500 });
  }
}

