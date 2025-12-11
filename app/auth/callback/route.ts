import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createServerClient } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth/login?error=auth_failed', requestUrl.origin));
    }

    const dbClient = createServerClient();

    // Check if user exists in our custom users table, create if not (for OAuth users)
    const { data: existingUser } = await dbClient
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!existingUser) {
      // Create user record for OAuth users
      // Note: password_hash is required but OAuth users don't have passwords
      // Using a placeholder value since the field is NOT NULL
      const { error: userError } = await dbClient
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email || '',
            password_hash: 'oauth_user', // Placeholder for OAuth users
          },
        ]);

      if (userError) {
        console.error('Error creating user record:', userError);
        // Continue anyway - the session will still work
      }
    }

    // Create session in our custom sessions table
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error: sessionError } = await dbClient
      .from('sessions')
      .insert([
        {
          id: sessionId,
          user_id: data.user.id,
          expires_at: expiresAt.toISOString(),
        },
      ]);

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      return NextResponse.redirect(new URL('/auth/login?error=session_failed', requestUrl.origin));
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    });

    // Check if user needs onboarding
    const { data: userData, error: userError } = await dbClient
      .from('users')
      .select('onboarding_complete')
      .eq('id', data.user.id)
      .single();

    // If column doesn't exist or user hasn't completed onboarding, redirect to onboarding
    if (userError && (userError.code === '42703' || userError.message.includes('column'))) {
      // Column doesn't exist yet - redirect to onboarding
      if (!next.includes('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
      }
    } else if (userData && !userData.onboarding_complete && !next.includes('/onboarding')) {
      // Column exists and user hasn't completed onboarding
      return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
    }

    // Redirect to dashboard or next URL
    return NextResponse.redirect(new URL(next, requestUrl.origin));
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL('/auth/login', requestUrl.origin));
}

