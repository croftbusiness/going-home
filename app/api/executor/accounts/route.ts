import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const executorEmail = cookieStore.get('executor_email')?.value;
    const executorGoogleId = cookieStore.get('executor_google_id')?.value;

    if (!executorEmail) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createServerClient();

    // Get all executor accounts for this email
    const { data: executorAccounts, error } = await supabase
      .from('executor_accounts')
      .select(`
        id,
        account_user_id,
        executor_contact_id,
        status,
        users!account_user_id (
          email
        ),
        personal_details!account_user_id (
          full_name,
          preferred_name
        )
      `)
      .eq('executor_email', executorEmail)
      .in('status', ['pending', 'accepted']);

    if (error) {
      console.error('Error fetching executor accounts:', error);
      return NextResponse.json({ error: 'Failed to load accounts' }, { status: 500 });
    }

    // Transform data
    const accounts = (executorAccounts || []).map((account: any) => {
      const details = personalDetails?.find((pd: any) => pd.user_id === account.account_user_id);
      const userEmail = userEmails?.find((ue: any) => ue.id === account.account_user_id)?.email;
      
      const accountOwnerName = details?.preferred_name || 
                               details?.full_name || 
                               userEmail?.split('@')[0] || 
                               'Account Owner';

      return {
        id: account.id,
        accountUserId: account.account_user_id,
        executorContactId: account.executor_contact_id,
        accountOwnerName,
        status: account.status,
      };
    });

    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Executor accounts GET error:', error);
    return NextResponse.json({ error: 'Failed to load accounts' }, { status: 500 });
  }
}

