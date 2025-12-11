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
      .eq('user_id', userId)
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
      .eq('user_id', userId)
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
      .eq('user_id', userId)
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

    // Send email using existing email service
    try {
      const nodemailer = require('nodemailer');
      
      const smtpHost = process.env.SMTP_HOST;
      const smtpUser = process.env.SMTP_USER;
      const smtpPassword = process.env.SMTP_PASSWORD;

      if (!smtpHost || !smtpUser || !smtpPassword) {
        console.warn('SMTP configuration missing. Cannot send letter email.');
        return NextResponse.json(
          { error: 'Email service not configured. Please configure SMTP settings.' },
          { status: 500 }
        );
      }

      // Check for placeholder values
      const placeholderPatterns = ['your-smtp-host', 'your-email', 'your-app-password', 'example.com'];
      const isPlaceholder = (value: string) => 
        placeholderPatterns.some(pattern => value.toLowerCase().includes(pattern.toLowerCase()));

      if (isPlaceholder(smtpHost) || isPlaceholder(smtpUser) || isPlaceholder(smtpPassword)) {
        console.warn('SMTP configuration contains placeholder values. Cannot send letter email.');
        return NextResponse.json(
          { error: 'Email service not properly configured. Please update SMTP settings in environment variables.' },
          { status: 500 }
        );
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });

      // Create HTML email with better formatting
      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${emailSubject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.8; color: #2C2A29; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF9F7;">
  <div style="background-color: #FCFAF7; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <h1 style="color: #2C2A29; margin-top: 0; font-size: 24px; margin-bottom: 20px;">${emailSubject}</h1>
    
    <p style="color: #2C2A29; font-size: 16px; margin-bottom: 20px;">
      Dear ${letter.trusted_contacts?.name || 'Friend'},
    </p>
    
    <div style="background-color: white; padding: 30px; border-radius: 6px; border-left: 4px solid #A5B99A; margin: 20px 0;">
      <p style="color: #2C2A29; font-size: 16px; white-space: pre-wrap; margin: 0;">${letter.message_text}</p>
    </div>
    
    ${letter.release_type === 'after_death' 
      ? `<p style="color: #2C2A29; opacity: 0.7; font-size: 14px; font-style: italic; margin-top: 20px;">
        This message was created to be shared with you after ${userName}'s passing.
      </p>` 
      : letter.release_type === 'on_date'
      ? `<p style="color: #2C2A29; opacity: 0.7; font-size: 14px; font-style: italic; margin-top: 20px;">
        This message was scheduled to be delivered to you on ${new Date(letter.release_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
      </p>`
      : letter.release_type === 'on_milestone'
      ? `<p style="color: #2C2A29; opacity: 0.7; font-size: 14px; font-style: italic; margin-top: 20px;">
        This message was meant to be shared with you on the milestone: ${letter.milestone_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}${letter.milestone_description ? ` (${letter.milestone_description})` : ''}.
      </p>`
      : ''}
    
    <hr style="border: none; border-top: 1px solid #EBD9B5; margin: 30px 0;" />
    
    <p style="color: #2C2A29; opacity: 0.6; font-size: 12px; margin: 0;">
      With love and remembrance,<br>
      The Going Home Team
    </p>
  </div>
</body>
</html>`;

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || `Going Home <${smtpUser}>`,
        to: recipientEmail,
        subject: emailSubject,
        text: emailBody,
        html: emailHtml,
      });

      console.log(`Letter email sent successfully to ${recipientEmail}`);

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

