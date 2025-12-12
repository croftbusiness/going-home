import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

export async function DELETE(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    // Get user data before deletion for cleanup
    const { data: userData } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', auth.userId)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete files from storage (avatars, documents, photos)
    try {
      // Get all documents
      const { data: documents } = await supabase
        .from('documents')
        .select('file_url')
        .eq('user_id', auth.userId);

      // Get personal details for profile picture
      const { data: personalDetails } = await supabase
        .from('personal_details')
        .select('profile_picture_url')
        .eq('user_id', auth.userId)
        .single();

      // Get funeral preferences for photo
      const { data: funeralPrefs } = await supabase
        .from('funeral_preferences')
        .select('photo_preference_url')
        .eq('user_id', auth.userId)
        .single();

      // Delete files from storage
      const filesToDelete: string[] = [];
      
      if (personalDetails?.profile_picture_url) {
        filesToDelete.push(personalDetails.profile_picture_url);
      }
      
      if (funeralPrefs?.photo_preference_url) {
        filesToDelete.push(funeralPrefs.photo_preference_url);
      }
      
      if (documents) {
        documents.forEach(doc => {
          if (doc.file_url) {
            filesToDelete.push(doc.file_url);
          }
        });
      }

      // Delete files from Supabase Storage
      for (const fileUrl of filesToDelete) {
        try {
          // Extract bucket and path from URL
          const urlParts = fileUrl.split('/storage/v1/object/public/');
          if (urlParts.length === 2) {
            const [bucket, ...pathParts] = urlParts[1].split('/');
            const path = pathParts.join('/');
            
            await supabase.storage
              .from(bucket)
              .remove([path]);
          }
        } catch (error) {
          console.error('Error deleting file:', fileUrl, error);
          // Continue with deletion even if file deletion fails
        }
      }
    } catch (error) {
      console.error('Error cleaning up files:', error);
      // Continue with account deletion even if file cleanup fails
    }

    // Delete all sessions for this user
    await supabase
      .from('sessions')
      .delete()
      .eq('user_id', auth.userId);

    // Delete trusted contacts where this user is the owner
    // (CASCADE should handle this, but being explicit)
    await supabase
      .from('trusted_contacts')
      .delete()
      .eq('owner_id', auth.userId);

    // Update trusted contacts where this user is a viewer (remove their access)
    // Find contacts where the email matches this user's email
    const { data: userEmail } = await supabase
      .from('users')
      .select('email')
      .eq('id', auth.userId)
      .single();

    if (userEmail?.email) {
      // Get trusted contact IDs where this user is a viewer
      const { data: viewerContacts } = await supabase
        .from('trusted_contacts')
        .select('id')
        .eq('email', userEmail.email);

      if (viewerContacts && viewerContacts.length > 0) {
        const contactIds = viewerContacts.map(c => c.id);
        
        // Delete viewer tokens for these contacts
        await supabase
          .from('viewer_tokens')
          .delete()
          .in('trusted_contact_id', contactIds);
      }
    }

    // Delete Spotify tokens if they exist
    await supabase
      .from('spotify_tokens')
      .delete()
      .eq('user_id', auth.userId);

    // Finally, delete the user account
    // This will cascade delete all related data due to ON DELETE CASCADE
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', auth.userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully' 
    });
  } catch (error: any) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete account' }, { status: 500 });
  }
}

