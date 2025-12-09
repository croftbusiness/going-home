import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase-server';
import { createServerClient } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, password, phone } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { phone: phone || '' },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user?.id) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Create session directly after signup
    const dbClient = createServerClient();
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
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
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

    return NextResponse.json({ 
      success: true, 
      userId: data.user.id,
      sessionId,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
