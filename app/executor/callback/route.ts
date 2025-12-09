import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createServerClient } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.redirect('/executor/login?error=no_code');
    }

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      return NextResponse.redirect('/executor/login?error=auth_failed');
    }

    const userEmail = data.user.email;
    if (!userEmail) {
      return NextResponse.redirect('/executor/login?error=no_email');
    }

    // Check if this user is an executor for any accounts
    const dbClient = createServerClient();
    const { data: executorAccounts } = await dbClient
      .from('executor_accounts')
      .select('id, account_user_id, executor_contact_id, status')
      .eq('executor_email', userEmail)
      .in('status', ['pending', 'accepted']);

    if (!executorAccounts || executorAccounts.length === 0) {
      // No executor accounts found - redirect to login with message
      return NextResponse.redirect('/executor/login?error=not_executor');
    }

    // Store executor session info
    const cookieStore = await cookies();
    cookieStore.set('executor_email', userEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    cookieStore.set('executor_google_id', data.user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    });

    // Check if this is an invitation acceptance flow
    const invitationToken = searchParams.get('token');
    if (invitationToken) {
      // Redirect back to invitation acceptance page with session established
      return NextResponse.redirect(`/executor/invite/accept?token=${invitationToken}&code=${code}`);
    }

    // Redirect to accounts selection page
    return NextResponse.redirect('/executor/accounts');
  } catch (error) {
    console.error('Executor callback error:', error);
    return NextResponse.redirect('/executor/login?error=callback_failed');
  }
}

