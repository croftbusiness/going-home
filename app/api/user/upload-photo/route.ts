import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

// Configure route for larger file uploads
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds for file uploads

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Check if photos bucket exists, create it if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    const photosBucketExists = buckets?.some(bucket => bucket.id === 'photos');
    
    if (!photosBucketExists) {
      // Try to create the bucket using direct SQL via PostgREST API
      // The service role key has permissions to insert into storage.buckets
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        
        const createBucketResponse = await fetch(`${supabaseUrl}/rest/v1/storage/buckets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            id: 'photos',
            name: 'photos',
            public: false
          })
        });
        
        if (!createBucketResponse.ok) {
          const errorText = await createBucketResponse.text();
          console.warn('Could not create bucket programmatically:', errorText);
          // If bucket already exists (409 conflict), that's okay
          if (createBucketResponse.status !== 409) {
            console.warn('Please create "photos" bucket manually in Supabase Storage if automatic creation fails.');
          }
        }
      } catch (bucketCreateError) {
        console.warn('Bucket creation attempt failed:', bucketCreateError);
        // Continue - we'll get a clearer error when trying to upload
      }
    }

    // Upload file to Supabase Storage (photos bucket)
    const fileName = `${auth.userId}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Photo upload error:', uploadError);
      // Return more specific error message
      let errorMessage = uploadError.message || 'Failed to upload photo to storage';
      
      // Provide helpful error message for common issues
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('does not exist')) {
        errorMessage = 'Photos storage bucket not found. Please create a "photos" bucket in Supabase Storage.';
      } else if (uploadError.message?.includes('new row violates row-level security')) {
        errorMessage = 'Storage access denied. Please check storage bucket policies.';
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? uploadError : undefined
      }, { status: 500 });
    }

    // Since the bucket is private, we need to use signed URLs or serve via API
    // Store the file path and return an API route URL that will serve the image
    const photoApiUrl = `/api/user/photo?path=${encodeURIComponent(fileName)}`;
    
    return NextResponse.json({ 
      url: photoApiUrl,
      filePath: fileName 
    });
  } catch (error: any) {
    console.error('Upload photo error:', error);
    const errorMessage = error?.message || 'Failed to upload photo';
    return NextResponse.json({ 
      error: errorMessage,
      details: error 
    }, { status: 500 });
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
    const photoUrl = searchParams.get('url');

    if (!photoUrl) {
      return NextResponse.json({ error: 'Photo URL required' }, { status: 400 });
    }

    // Extract the file path from the URL
    // New format: /api/user/photo?path=[filePath]
    // Old format: https://[project].supabase.co/storage/v1/object/public/photos/[userId]/[filename]
    let filePath: string;
    
    // Check if it's our API route format
    if (photoUrl.includes('/api/user/photo?path=')) {
      const urlObj = new URL(photoUrl, 'http://localhost'); // Base URL for parsing
      filePath = urlObj.searchParams.get('path') || '';
    } else {
      // Try to extract path from Supabase URL
      const publicUrlMatch = photoUrl.match(/\/photos\/(.+?)(\?|$)/);
      if (publicUrlMatch) {
        filePath = publicUrlMatch[1];
      } else {
        const urlParts = photoUrl.split('/photos/');
        if (urlParts.length !== 2) {
          return NextResponse.json({ error: 'Invalid photo URL format' }, { status: 400 });
        }
        filePath = urlParts[1].split('?')[0];
      }
    }
    
    if (!filePath) {
      return NextResponse.json({ error: 'Could not extract file path from URL' }, { status: 400 });
    }
    
    // Verify the file belongs to the user (starts with their userId)
    if (!filePath.startsWith(auth.userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the file from storage
    const { error: deleteError } = await supabase.storage
      .from('photos')
      .remove([filePath]);

    if (deleteError) {
      console.error('Photo delete error:', deleteError);
      return NextResponse.json({ 
        error: deleteError.message || 'Failed to delete photo' 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete photo error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to delete photo' 
    }, { status: 500 });
  }
}

