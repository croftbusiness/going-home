import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for file uploads

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Check if bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
    }
    
    const bucketExists = buckets?.some(bucket => bucket.id === 'funeral-assets');
    if (!bucketExists) {
      console.error('Funeral-assets bucket does not exist');
      return NextResponse.json({ 
        error: 'Storage bucket not found. Please create the "funeral-assets" bucket in Supabase Storage and run the storage policies migration.',
        details: process.env.NODE_ENV === 'development' ? 'Bucket "funeral-assets" does not exist' : undefined
      }, { status: 500 });
    }

    // Upload file to Supabase Storage
    // Path structure: {user_id}/{category}/{timestamp}_{filename}
    const fileName = `${auth.userId}/${category}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('funeral-assets')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      
      // Provide helpful error messages
      let errorMessage = uploadError.message || 'Failed to upload file';
      
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('does not exist')) {
        errorMessage = 'Storage bucket "funeral-assets" not found. Please create it in Supabase Storage.';
      } else if (uploadError.message?.includes('new row violates row-level security') || uploadError.message?.includes('RLS')) {
        errorMessage = 'Storage access denied. Please check storage bucket policies. Ensure RLS policies allow users to upload to their own folder.';
      } else if (uploadError.message?.includes('duplicate') || uploadError.message?.includes('already exists')) {
        errorMessage = 'File already exists. Please try again.';
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? uploadError : undefined
      }, { status: 500 });
    }

    // Get public URL (bucket is private, so we'll use signed URL or API route)
    // For private buckets, we should use signed URLs or serve via API route
    // Since the bucket is private, getPublicUrl won't work - we need to use a signed URL or API route
    const { data: { publicUrl } } = supabase.storage
      .from('funeral-assets')
      .getPublicUrl(fileName);

    // For private buckets, we should return an API route URL instead
    // But for now, let's use signed URL or check if bucket is public
    // Actually, let's create a signed URL that expires in 1 year
    const { data: signedUrlData } = await supabase.storage
      .from('funeral-assets')
      .createSignedUrl(fileName, 31536000); // 1 year expiry

    return NextResponse.json({
      url: signedUrlData?.signedUrl || publicUrl,
      fileName: file.name,
      category,
      path: fileName,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}

