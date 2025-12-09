import { sendTrustedContactEmail } from './email';
import { createServerClient } from './auth';
import crypto from 'crypto';

export interface ExecutorInvitationData {
  executorEmail: string;
  executorName: string;
  accountOwnerName: string;
  accountOwnerEmail: string;
  invitationToken: string;
}

export async function sendExecutorInvitation(data: ExecutorInvitationData): Promise<boolean> {
  const transporter = createServerClient();
  if (!transporter) {
    console.warn('Email transporter not available. Skipping executor invitation email.');
    return false;
  }

  // Use VERCEL_URL in production, fallback to NEXT_PUBLIC_APP_URL, then localhost for dev
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const invitationUrl = `${baseUrl}/executor/invite/accept?token=${data.invitationToken}`;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Executor Invitation - Going Home</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #2C2A29; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF9F7;">
  <div style="background-color: #FCFAF7; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #2C2A29; margin-top: 0; font-size: 24px;">You've been invited to be an Executor</h1>
    
    <p>Dear ${data.executorName},</p>
    
    <p>${data.accountOwnerName} has invited you to be an executor for their Going Home account. As an executor, you will be able to access their account information when needed, using an access code that will be provided to you.</p>
    
    <div style="background-color: #EBD9B5; border-left: 4px solid #A5B99A; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: 600;">What this means:</p>
      <ul style="margin: 10px 0 0 20px; padding: 0;">
        <li>You will be able to access their account information when needed</li>
        <li>You'll need an access code (provided separately) to view the information</li>
        <li>You'll only see information you've been granted permission to view</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${invitationUrl}" style="display: inline-block; padding: 14px 28px; background-color: #A5B99A; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
        Accept Invitation
      </a>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px; color: #666;">
      If you did not expect this invitation or have questions, please contact ${data.accountOwnerName} directly at ${data.accountOwnerEmail}.
    </p>
    
    <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #EBD9B5; color: #666; font-size: 12px;">
      This is an automated message from Going Home App. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
  `;

  const emailText = `
You've been invited to be an Executor

Dear ${data.executorName},

${data.accountOwnerName} has invited you to be an executor for their Going Home account. As an executor, you will be able to access their account information when needed, using an access code that will be provided to you.

What this means:
- You will be able to access their account information when needed
- You'll need an access code (provided separately) to view the information
- You'll only see information you've been granted permission to view

Accept the invitation here: ${invitationUrl}

If you did not expect this invitation or have questions, please contact ${data.accountOwnerName} directly at ${data.accountOwnerEmail}.

---
This is an automated message from Going Home App. Please do not reply to this email.
  `;

  try {
    const nodemailer = require('nodemailer');
    
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.warn('SMTP configuration missing. Cannot send executor invitation email.');
      return false;
    }

    // Check for placeholder values
    const placeholderPatterns = ['your-smtp-host', 'your-email', 'your-app-password'];
    const isPlaceholder = (value: string) => 
      placeholderPatterns.some(pattern => value.toLowerCase().includes(pattern.toLowerCase()));

    if (isPlaceholder(smtpHost) || isPlaceholder(smtpUser) || isPlaceholder(smtpPassword)) {
      console.warn('SMTP configuration contains placeholder values. Cannot send executor invitation email.');
      return false;
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

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || smtpUser,
      to: data.executorEmail,
      subject: `${data.accountOwnerName} has invited you to be an Executor`,
      text: emailText,
      html: emailHtml,
    });
    
    console.log(`Executor invitation email sent successfully to ${data.executorEmail}`);
    return true;
  } catch (error) {
    console.error('Error sending executor invitation email:', error);
    return false;
  }
}

export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

