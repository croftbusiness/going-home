import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ error: 'File path required' }, { status: 400 });
    }
    
    // Verify the file belongs to the user
    if (!filePath.startsWith(auth.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('legacy-media')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('Error downloading media:', downloadError);
      return NextResponse.json({ error: 'Failed to get media file' }, { status: 500 });
    }

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer();
    
    // Determine content type from file extension or default to the blob type
    const contentType = fileData.type || 'application/octet-stream';
    
    // Return the file with appropriate headers
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error: any) {
    console.error('Get media error:', error);
    return NextResponse.json({ error: 'Failed to get media file' }, { status: 500 });
  }
}



