import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    // Check custom session first
    const customSession = await getSession();
    
    // Check Supabase session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Must have both to be considered "fully logged in" for our app logic
    if (!user || !customSession) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      userId: user.id,
      email: user.email 
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
