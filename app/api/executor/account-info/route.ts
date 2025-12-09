import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const executorEmail = cookieStore.get('executor_email')?.value;

    if (!executorEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Verify this executor has access to this account
    const { data: executorAccount } = await supabase
      .from('executor_accounts')
      .select('id')
      .eq('executor_email', executorEmail)
      .eq('account_user_id', userId)
      .in('status', ['pending', 'accepted'])
      .single();

    if (!executorAccount) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get account owner info
    const { data: personalDetails } = await supabase
      .from('personal_details')
      .select('full_name, preferred_name')
      .eq('user_id', userId)
      .single();

    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    const accountOwnerName = personalDetails?.preferred_name || 
                             personalDetails?.full_name || 
                             userData?.email?.split('@')[0] || 
                             'Account Owner';

    return NextResponse.json({ accountOwnerName });
  } catch (error: any) {
    console.error('Executor account info GET error:', error);
    return NextResponse.json({ error: 'Failed to load account info' }, { status: 500 });
  }
}

