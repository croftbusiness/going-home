import { NextResponse } from 'next/server';
import { requireAuth, createServerClient } from '@/lib/auth';

/**
 * Send email for a letter to recipient
 * Only called when:
 * 1. Release is activated AND user has passed away (for after_death letters)
 * 2. Release date arrives AND user has passed away (for on_date letters)
 * 3. Milestone date arrives AND user has passed away (for on_milestone letters)
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const supabase = createServerClient();
    const { letterId } = await request.json();

    if (!letterId) {
      return NextResponse.json({ error: 'Letter ID required' }, { status: 400 });
    }

    // Get letter with recipient info
    const { data: letter, error: letterError } = await supabase
      .from('letters')
      .select(`
        *,
        trusted_contacts (name, email)
      `)
      .eq('id', letterId)
      .eq('user_id', auth.userId)
      .single();

    if (letterError || !letter) {
      return NextResponse.json({ error: 'Letter not found' }, { status: 404 });
    }

    // Check if email already sent
    if (letter.email_sent) {
      return NextResponse.json({ error: 'Email already sent' }, { status: 400 });
    }

    // Verify release settings - ensure user has passed away
    const { data: releaseSettings } = await supabase
      .from('release_settings')
      .select('release_activated, release_activated_at')
      .eq('user_id', auth.userId)
      .single();

    if (!releaseSettings?.release_activated) {
      return NextResponse.json(
        { error: 'Release has not been activated. User must have passed away first.' },
        { status: 403 }
      );
    }

    // Get recipient email
    const recipientEmail = letter.recipient_email || letter.trusted_contacts?.email;
    if (!recipientEmail) {
      return NextResponse.json({ error: 'Recipient email not found' }, { status: 400 });
    }

    // Get user's personal details for email context
    const { data: personalDetails } = await supabase
      .from('personal_details')
      .select('full_name, preferred_name')
      .eq('user_id', auth.userId)
      .single();

    const userName = personalDetails?.preferred_name || personalDetails?.full_name || 'a loved one';

    // Prepare email content
    const emailSubject = letter.title || `A Message From ${userName}`;
    const emailBody = `
Dear ${letter.trusted_contacts?.name || 'Friend'},

You are receiving this message because ${userName} wanted you to have this letter.

${letter.message_text}

${letter.release_type === 'after_death' 
  ? `\nThis message was created to be shared with you after ${userName}'s passing.` 
  : letter.release_type === 'on_date'
  ? `\nThis message was scheduled to be delivered to you on ${new Date(letter.release_date).toLocaleDateString()}.`
  : letter.release_type === 'on_milestone'
  ? `\nThis message was meant to be shared with you on the milestone: ${letter.milestone_type}${letter.milestone_description ? ` (${letter.milestone_description})` : ''}.`
  : ''
}

With love and remembrance,
The Going Home Team
`;

    // TODO: Send email using email service (Resend, SendGrid, etc.)
    // For now, we'll simulate sending and mark as sent
    // In production, integrate with your email service provider
    
    try {
      // Example using fetch to your email API (you'll need to set this up)
      // const emailResponse = await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     from: 'Going Home <noreply@goinghome.app>',
      //     to: recipientEmail,
      //     subject: emailSubject,
      //     text: emailBody,
      //   }),
      // });

      // For now, just log and mark as sent (implement actual email sending)
      console.log('Would send email to:', recipientEmail);
      console.log('Subject:', emailSubject);

      // Mark email as sent
      const { error: updateError } = await supabase
        .from('letters')
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq('id', letterId);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully',
        // In production, remove this after implementing actual email
        note: 'Email functionality needs to be implemented with your email service provider'
      });

    } catch (emailError: any) {
      console.error('Email sending error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email: ' + emailError.message },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

