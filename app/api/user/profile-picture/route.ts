import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (5MB limit for profile pictures)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Ensure photos bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const photosBucketExists = buckets?.some(bucket => bucket.id === 'photos');
    
    if (!photosBucketExists) {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        
        await fetch(`${supabaseUrl}/rest/v1/storage/buckets`, {
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
      } catch (error) {
        console.warn('Bucket creation attempt failed:', error);
      }
    }

    // Delete old profile picture if exists
    const { data: oldDetails } = await supabase
      .from('personal_details')
      .select('profile_picture_url')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (oldDetails?.profile_picture_url) {
      try {
        // Extract file path from URL
        const oldUrl = oldDetails.profile_picture_url;
        let oldFilePath: string;
        
        if (oldUrl.includes('/api/user/photo?path=')) {
          const urlObj = new URL(oldUrl, 'http://localhost');
          oldFilePath = urlObj.searchParams.get('path') || '';
        } else {
          const match = oldUrl.match(/\/photos\/(.+?)(\?|$)/);
          oldFilePath = match ? match[1] : oldUrl.split('/photos/')[1]?.split('?')[0] || '';
        }
        
        if (oldFilePath && oldFilePath.startsWith(auth.userId)) {
          await supabase.storage.from('photos').remove([oldFilePath]);
        }
      } catch (error) {
        console.warn('Failed to delete old profile picture:', error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new profile picture
    const fileName = `${auth.userId}/profile_${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Profile picture upload error:', uploadError);
      return NextResponse.json({ 
        error: uploadError.message || 'Failed to upload profile picture' 
      }, { status: 500 });
    }

    // Get the URL for the uploaded file
    const photoApiUrl = `/api/user/photo?path=${encodeURIComponent(fileName)}`;

    // Check if personal_details exists
    const { data: existingDetails, error: checkError } = await supabase
      .from('personal_details')
      .select('id')
      .eq('user_id', auth.userId)
      .maybeSingle();

    let updateError = null;

    if (existingDetails) {
      // Update existing record
      const { error } = await supabase
        .from('personal_details')
        .update({ profile_picture_url: photoApiUrl })
        .eq('user_id', auth.userId);
      updateError = error;
    } else {
      // Create new record with just profile picture (minimal required fields)
      // We'll use placeholder values that can be updated later
      const { error } = await supabase
        .from('personal_details')
        .insert({
          user_id: auth.userId,
          full_name: 'User', // Placeholder - will be updated when user fills in personal details
          date_of_birth: '1900-01-01', // Placeholder
          address: '', // Placeholder
          city: '', // Placeholder
          state: '', // Placeholder
          zip_code: '', // Placeholder
          phone: '', // Placeholder
          email: '', // Placeholder
          emergency_contact_name: '', // Placeholder
          emergency_contact_phone: '', // Placeholder
          emergency_contact_relationship: '', // Placeholder
          profile_picture_url: photoApiUrl,
        });
      updateError = error;
    }

    if (updateError) {
      console.error('Could not save profile picture URL to database:', updateError);
      console.error('Error details:', JSON.stringify(updateError, null, 2));
      // Return error with details so frontend can show it
      return NextResponse.json({ 
        url: photoApiUrl,
        filePath: fileName,
        error: `Failed to save profile picture: ${updateError.message || 'Unknown error'}. Make sure you have run the SQL migration to add the profile_picture_url column.`,
        warning: true
      }, { status: 500 });
    }

    return NextResponse.json({ 
      url: photoApiUrl,
      filePath: fileName 
    });
  } catch (error: any) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to upload profile picture' 
    }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    // Get current profile picture URL
    const { data: personalDetails } = await supabase
      .from('personal_details')
      .select('profile_picture_url')
      .eq('user_id', auth.userId)
      .maybeSingle();

    if (!personalDetails?.profile_picture_url) {
      return NextResponse.json({ error: 'No profile picture found' }, { status: 404 });
    }

    // Extract file path
    const photoUrl = personalDetails.profile_picture_url;
    let filePath: string;
    
    if (photoUrl.includes('/api/user/photo?path=')) {
      const urlObj = new URL(photoUrl, 'http://localhost');
      filePath = urlObj.searchParams.get('path') || '';
    } else {
      const match = photoUrl.match(/\/photos\/(.+?)(\?|$)/);
      filePath = match ? match[1] : photoUrl.split('/photos/')[1]?.split('?')[0] || '';
    }

    if (!filePath || !filePath.startsWith(auth.userId)) {
      return NextResponse.json({ error: 'Invalid profile picture path' }, { status: 400 });
    }

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('photos')
      .remove([filePath]);

    if (deleteError) {
      console.error('Profile picture delete error:', deleteError);
      return NextResponse.json({ 
        error: deleteError.message || 'Failed to delete profile picture' 
      }, { status: 500 });
    }

    // Remove URL from personal_details
    const { error: updateError } = await supabase
      .from('personal_details')
      .update({ profile_picture_url: null })
      .eq('user_id', auth.userId);

    if (updateError) {
      console.warn('Could not remove profile picture URL from database:', updateError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Profile picture delete error:', error);
    return NextResponse.json({ 
      error: error?.message || 'Failed to delete profile picture' 
    }, { status: 500 });
  }
}

