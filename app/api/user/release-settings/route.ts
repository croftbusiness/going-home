import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';
import { sendExecutorInvitation, generateInvitationToken } from '@/lib/executor-invite';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('release_settings')
      .select(`
        *,
        trusted_contacts (name, relationship)
      `)
      .eq('user_id', auth.userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const settings = data ? {
      isLocked: data.is_locked,
      executorContactId: data.executor_contact_id,
      executorContactName: data.trusted_contacts?.name,
      releaseActivated: data.release_activated,
      releaseActivatedAt: data.release_activated_at,
    } : null;

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
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

    let unlockCodeHash = null;
    if (body.unlockCode) {
      unlockCodeHash = await bcrypt.hash(body.unlockCode, 10);
    }

    // Check if record exists
    const { data: existing } = await supabase
      .from('release_settings')
      .select('id, executor_contact_id')
      .eq('user_id', auth.userId)
      .single();

    const releaseSettingsData: any = {
      user_id: auth.userId,
      is_locked: body.isLocked,
      executor_contact_id: body.executorContactId,
    };

    // Only update unlock_code_hash if a new code is provided
    if (unlockCodeHash) {
      releaseSettingsData.unlock_code_hash = unlockCodeHash;
    }

    let data, error;
    if (existing) {
      // Update existing record
      const result = await supabase
        .from('release_settings')
        .update(releaseSettingsData)
        .eq('user_id', auth.userId)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('release_settings')
        .insert(releaseSettingsData)
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    // If executor contact is assigned and changed, send invitation
    if (body.executorContactId && body.executorContactId !== existing?.executor_contact_id) {
      try {
        // Get executor contact info
        const { data: executorContact } = await supabase
          .from('trusted_contacts')
          .select('name, email')
          .eq('id', body.executorContactId)
          .single();

        // Get account owner info
        const { data: userData } = await supabase
          .from('users')
          .select('email')
          .eq('id', auth.userId)
          .single();

        const { data: personalDetails } = await supabase
          .from('personal_details')
          .select('full_name, preferred_name')
          .eq('user_id', auth.userId)
          .single();

        if (executorContact && userData) {
          // Check if executor account already exists
          const { data: existingExecutorAccount } = await supabase
            .from('executor_accounts')
            .select('id, status')
            .eq('executor_email', executorContact.email)
            .eq('account_user_id', auth.userId)
            .single();

          if (!existingExecutorAccount || existingExecutorAccount.status === 'pending') {
            // Generate invitation token
            const invitationToken = generateInvitationToken();

            // Create or update executor account
            const executorAccountData: any = {
              executor_email: executorContact.email,
              account_user_id: auth.userId,
              executor_contact_id: body.executorContactId,
              invitation_token: invitationToken,
              invitation_sent_at: new Date().toISOString(),
              status: 'pending',
            };

            if (existingExecutorAccount) {
              await supabase
                .from('executor_accounts')
                .update(executorAccountData)
                .eq('id', existingExecutorAccount.id);
            } else {
              await supabase
                .from('executor_accounts')
                .insert(executorAccountData);
            }

            // Send invitation email
            const accountOwnerName = personalDetails?.preferred_name || personalDetails?.full_name || userData.email?.split('@')[0] || 'Someone';
            
            sendExecutorInvitation({
              executorEmail: executorContact.email,
              executorName: executorContact.name,
              accountOwnerName,
              accountOwnerEmail: userData.email,
              invitationToken,
            }).catch((emailError) => {
              console.error('Failed to send executor invitation email:', emailError);
            });
          }
        }
      } catch (inviteError) {
        // Log but don't fail the request if invitation fails
        console.error('Error sending executor invitation:', inviteError);
      }
    }

    return NextResponse.json({ settings: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
