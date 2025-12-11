import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for larger files

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (images, audio, or video)
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/x-m4a'];
    const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mov'];
    
    const isValidType = 
      validImageTypes.includes(file.type) || 
      validAudioTypes.includes(file.type) || 
      validVideoTypes.includes(file.type);

    if (!isValidType) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an image, audio, or video file.' },
        { status: 400 }
      );
    }

    // Validate file size (100MB limit for audio/video, 10MB for images)
    const isImage = validImageTypes.includes(file.type);
    const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for audio/video
    
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${isImage ? '10MB' : '100MB'} limit` },
        { status: 400 }
      );
    }

    // Ensure legacy-media bucket exists
    const bucketName = 'legacy-media';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.id === bucketName);

    if (!bucketExists) {
      // Try to create the bucket
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

      try {
        const createBucketResponse = await fetch(`${supabaseUrl}/rest/v1/storage/buckets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            id: bucketName,
            name: bucketName,
            public: false,
            fileSizeLimit: 104857600, // 100MB
          }),
        });

        if (!createBucketResponse.ok && createBucketResponse.status !== 409) {
          const errorText = await createBucketResponse.text();
          console.warn('Could not create bucket programmatically:', errorText);
        }
      } catch (bucketCreateError) {
        console.warn('Bucket creation attempt failed:', bucketCreateError);
      }
    }

    // Upload file to legacy-media bucket
    const fileName = `${auth.userId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      let errorMessage = uploadError.message || 'Failed to upload file';
      
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('does not exist')) {
        errorMessage = 'Legacy media storage bucket not found. Please ensure the legacy-media bucket exists in Supabase Storage.';
      } else if (uploadError.message?.includes('new row violates row-level security')) {
        errorMessage = 'Storage access denied. Please check storage bucket policies.';
      }
      
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Return API route URL for serving the file
    // For images, we can use the photo route, but we need a generic media route
    // For now, let's create a generic media serving route
    const fileUrl = `/api/user/family-legacy/media?path=${encodeURIComponent(fileName)}`;
    
    return NextResponse.json({
      url: fileUrl,
      filePath: fileName,
    });
  } catch (error: any) {
    console.error('Legacy media upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}



