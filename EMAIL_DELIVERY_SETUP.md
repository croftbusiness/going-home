# Email Delivery Setup for Timed Release Letters

## Overview

Letters with timed release will automatically email recipients:
- **After Death**: When executor activates release (confirms user has passed)
- **On Date**: On scheduled date, BUT only if user has passed away by that time
- **On Milestone**: On milestone date, BUT only if user has passed away by that time

## Safety Feature

**IMPORTANT**: Letters scheduled for specific dates or milestones will NOT be sent if the user is still alive. The system checks that `release_settings.release_activated = true` before sending any email.

## Database Migration

Run the updated schema to add email tracking columns:

```sql
ALTER TABLE letters 
ADD COLUMN IF NOT EXISTS auto_email_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS recipient_email TEXT;
```

## Email Service Integration

The email functionality is currently stubbed out. You need to integrate with an email service provider:

### Option 1: Resend (Recommended)
1. Sign up at https://resend.com
2. Get your API key
3. Update `app/api/user/letters/send-email/route.ts`:

```typescript
const emailResponse = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    from: 'Going Home <noreply@yourdomain.com>',
    to: recipientEmail,
    subject: emailSubject,
    html: `<pre style="font-family: serif; white-space: pre-wrap;">${emailBody}</pre>`,
  }),
});
```

### Option 2: SendGrid
1. Sign up at https://sendgrid.com
2. Install: `npm install @sendgrid/mail`
3. Update the route to use SendGrid SDK

### Option 3: Nodemailer (SMTP)
1. Configure SMTP settings
2. Install: `npm install nodemailer`
3. Update the route to use Nodemailer

## Environment Variables

Add to `.env.local`:

```env
RESEND_API_KEY=your_resend_api_key_here
# OR
SENDGRID_API_KEY=your_sendgrid_api_key_here
# OR
SMTP_HOST=smtp.example.com
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
```

## Scheduled Email Checking

For date-based and milestone-based releases, set up a daily cron job:

### Using Vercel Cron (Recommended)

Create `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/user/letters/check-scheduled",
    "schedule": "0 9 * * *"
  }]
}
```

Or use Vercel Cron Jobs in dashboard.

### Using External Cron Service

Set up a cron job to call:
```
POST https://yourdomain.com/api/user/letters/check-scheduled
Authorization: Bearer YOUR_CRON_SECRET
```

Add to `.env.local`:
```env
CRON_SECRET=your_secret_key_here
```

## Testing

1. Create a letter with `auto_email_enabled: true`
2. Set release type to "after_death"
3. Activate release settings (simulating user passing)
4. Check that email is sent to recipient
5. Verify email_sent flag is set to true

## Email Content

The email includes:
- Personalized greeting with recipient name
- The full letter message
- Context about when/why it was created
- Going Home branding

## Important Notes

- Emails are only sent if `release_settings.release_activated = true`
- Date-based letters check this status on the scheduled date
- If user hasn't passed away by scheduled date, email is NOT sent
- Executor must confirm death before any emails are sent
- This prevents accidentally sending letters while user is still alive







