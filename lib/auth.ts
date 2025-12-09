import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return null;
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionCookie.value)
    .gte('expires_at', new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  // Update last activity
  await supabase
    .from('sessions')
    .update({ last_activity: new Date().toISOString() })
    .eq('id', data.id);

  return data;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    return {
      error: 'Unauthorized',
      status: 401,
    };
  }

  return {
    userId: session.user_id,
    sessionId: session.id,
  };
}
