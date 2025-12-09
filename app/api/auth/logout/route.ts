import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession, createServerClient } from '@/lib/auth';
import { createClient } from '@/lib/supabase-server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (sessionCookie) {
      // Delete session from database
      const supabase = createServerClient();
      await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionCookie.value);

      // Clear session cookie
      cookieStore.set('session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
    }

    // Also sign out from Supabase Auth if they're using OAuth
    try {
      const supabaseAuth = await createClient();
      await supabaseAuth.auth.signOut();
    } catch (error) {
      // Ignore Supabase Auth errors - user might not be using OAuth
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
