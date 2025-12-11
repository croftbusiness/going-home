import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';
import { createExecutorSession } from '@/lib/executor-auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { accessCode, accountUserId } = await request.json();

    if (!accessCode || accessCode.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid access code format' },
        { status: 400 }
      );
    }

    if (!accountUserId) {
      return NextResponse.json(
        { error: 'Account user ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const executorEmail = cookieStore.get('executor_email')?.value;
    const executorGoogleId = cookieStore.get('executor_google_id')?.value;

    if (!executorEmail || !executorGoogleId) {
      return NextResponse.json(
        { error: 'Executor authentication required. Please log in with Google first.' },
        { status: 401 }
      );
    }

    // Verify executor has access to this account
    const { data: executorAccount } = await supabase
      .from('executor_accounts')
      .select('*')
      .eq('executor_email', executorEmail)
      .eq('account_user_id', accountUserId)
      .eq('status', 'accepted')
      .single();

    if (!executorAccount) {
      return NextResponse.json(
        { error: 'You do not have access to this account' },
        { status: 403 }
      );
    }

    // Find release settings for this specific account
    const { data: releaseSettings, error: settingsError } = await supabase
      .from('release_settings')
      .select('*')
      .eq('user_id', accountUserId)
      .eq('is_locked', true)
      .not('unlock_code_hash', 'is', null)
      .single();

    if (settingsError || !releaseSettings) {
      return NextResponse.json(
        { error: 'Account is not locked or access code not set' },
        { status: 401 }
      );
    }

    // Verify the access code
    if (!releaseSettings.unlock_code_hash) {
      return NextResponse.json(
        { error: 'Access code not set for this account' },
        { status: 401 }
      );
    }

    const isValidCode = await bcrypt.compare(accessCode, releaseSettings.unlock_code_hash);
    if (!isValidCode) {
      return NextResponse.json(
        { error: 'Invalid access code' },
        { status: 401 }
      );
    }

    // Verify executor contact matches
    if (releaseSettings.executor_contact_id !== executorAccount.executor_contact_id) {
      return NextResponse.json(
        { error: 'You are not the designated executor for this account' },
        { status: 403 }
      );
    }

    // Get executor contact information
    const { data: executorContact, error: contactError } = await supabase
      .from('trusted_contacts')
      .select('id, name, email, can_view_personal_details, can_view_medical_contacts, can_view_funeral_preferences, can_view_documents, can_view_letters')
      .eq('id', executorAccount.executor_contact_id)
      .single();

    if (contactError || !executorContact) {
      return NextResponse.json(
        { error: 'Executor contact not found' },
        { status: 404 }
      );
    }

    // Create executor session token
    const executorToken = crypto.randomUUID();

    const permissions = {
      canViewPersonalDetails: executorContact.can_view_personal_details || false,
      canViewMedicalContacts: executorContact.can_view_medical_contacts || false,
      canViewFuneralPreferences: executorContact.can_view_funeral_preferences || false,
      canViewDocuments: executorContact.can_view_documents || false,
      canViewLetters: executorContact.can_view_letters || false,
    };

    // Activate release if not already activated
    if (!releaseSettings.release_activated) {
      const { error: activateError } = await supabase
        .from('release_settings')
        .update({
          release_activated: true,
          release_activated_at: new Date().toISOString(),
        })
        .eq('id', releaseSettings.id);

      if (activateError) {
        console.error('Error activating release:', activateError);
      } else {
        // After activating release (user has passed away), send all "after_death" letters via email
        try {
          const { data: lettersToSend } = await supabase
            .from('letters')
            .select('id')
            .eq('user_id', releaseSettings.user_id)
            .eq('release_type', 'after_death')
            .eq('auto_email_enabled', true)
            .eq('email_sent', false);

          if (lettersToSend && lettersToSend.length > 0) {
            // Send each letter via email in background (don't await to avoid blocking)
            const internalApiKey = process.env.INTERNAL_API_KEY;
            Promise.all(
              lettersToSend.map(async (letter) => {
                try {
                  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user/letters/send-email`, {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'x-internal-api-key': internalApiKey || 'internal-key',
                    },
                    body: JSON.stringify({ 
                      letterId: letter.id,
                      userId: releaseSettings.user_id,
                    }),
                  });
                } catch (emailErr) {
                  console.error(`Failed to send email for letter ${letter.id}:`, emailErr);
                }
              })
            ).catch(err => {
              console.error('Error batch sending letters:', err);
            });
          }
        } catch (emailError) {
          console.error('Error sending letters after release activation:', emailError);
          // Don't fail the release activation if email sending fails
        }
      }
    }

    // Store executor session
    createExecutorSession(
      executorToken,
      releaseSettings.user_id,
      executorAccount.executor_contact_id,
      permissions
    );

    return NextResponse.json({
      success: true,
      token: executorToken,
      userId: releaseSettings.user_id,
      executorContactId: executorAccount.executor_contact_id,
      permissions,
      executorName: executorContact.name,
    });
  } catch (error: any) {
    console.error('Executor verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify access code' },
      { status: 500 }
    );
  }
}

