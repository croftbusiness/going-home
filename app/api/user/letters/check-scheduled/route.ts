import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth';

/**
 * Check for letters scheduled to be sent today
 * This should be called by a cron job daily
 * Only sends letters if:
 * 1. Release is activated (user has passed away)
 * 2. Release date has arrived
 */
export async function POST(request: Request) {
  try {
    // Verify this is called from a cron job or internal service
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Find all letters scheduled for today that haven't been sent yet
    // AND where the user's release has been activated (user has passed away)
    const { data: lettersToSend, error } = await supabase
      .from('letters')
      .select(`
        *,
        release_settings!inner (release_activated, release_activated_at)
      `)
      .eq('release_settings.release_activated', true)
      .eq('auto_email_enabled', true)
      .eq('email_sent', false)
      .or(`release_date.eq.${today},milestone_date.eq.${today}`);

    if (error) {
      console.error('Error fetching scheduled letters:', error);
      return NextResponse.json({ error: 'Failed to fetch letters' }, { status: 500 });
    }

    if (!lettersToSend || lettersToSend.length === 0) {
      return NextResponse.json({ 
        message: 'No letters scheduled for today',
        count: 0 
      });
    }

    // Send emails for each letter
    const results = [];
    const internalApiKey = process.env.INTERNAL_API_KEY || 'internal-key';
    
    for (const letter of lettersToSend) {
      try {
        // Double-check: Only send if release is activated (user has passed)
        const { data: releaseSettings } = await supabase
          .from('release_settings')
          .select('release_activated')
          .eq('user_id', letter.user_id)
          .single();

        if (!releaseSettings?.release_activated) {
          console.log(`Skipping letter ${letter.id}: User has not passed away yet`);
          results.push({ letterId: letter.id, status: 'skipped', reason: 'User has not passed away' });
          continue;
        }

        // Call the send-email endpoint for this letter
        const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/user/letters/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${internalApiKey}`,
          },
          body: JSON.stringify({ 
            letterId: letter.id,
            userId: letter.user_id 
          }),
        });

        if (emailResponse.ok) {
          results.push({ letterId: letter.id, status: 'sent' });
        } else {
          results.push({ letterId: letter.id, status: 'failed', error: await emailResponse.text() });
        }
      } catch (err: any) {
        results.push({ letterId: letter.id, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({
      message: `Processed ${lettersToSend.length} letters`,
      results,
    });

  } catch (error: any) {
    console.error('Check scheduled letters error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check scheduled letters' },
      { status: 500 }
    );
  }
}

