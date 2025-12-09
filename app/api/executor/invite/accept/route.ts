import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { token, googleId, email } = await request.json();

    if (!token || !googleId || !email) {
      return NextResponse.json(
        { error: 'Token, Google ID, and email are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Find invitation by token
    const { data: executorAccount, error: findError } = await supabase
      .from('executor_accounts')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single();

    if (findError || !executorAccount) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 404 }
      );
    }

    // Verify email matches
    if (executorAccount.executor_email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email does not match invitation' },
        { status: 403 }
      );
    }

    // Update executor account to accepted
    const { error: updateError } = await supabase
      .from('executor_accounts')
      .update({
        status: 'accepted',
        executor_google_id: googleId,
        invitation_accepted_at: new Date().toISOString(),
      })
      .eq('id', executorAccount.id);

    if (updateError) {
      console.error('Error updating executor account:', updateError);
      return NextResponse.json(
        { error: 'Failed to accept invitation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Executor invite accept error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

