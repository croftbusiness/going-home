import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  // Check if email configuration is missing or contains placeholder values
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn('Email configuration missing. Emails will not be sent.');
    return null;
  }

  // Check for placeholder values
  const placeholderPatterns = [
    'your-smtp-host',
    'your-email',
    'your-app-password',
    'your-smtp',
    'example.com',
    'placeholder',
  ];

  const isPlaceholder = (value: string) => 
    placeholderPatterns.some(pattern => 
      value.toLowerCase().includes(pattern.toLowerCase())
    );

  if (isPlaceholder(smtpHost) || isPlaceholder(smtpUser) || isPlaceholder(smtpPassword)) {
    console.warn('Email configuration contains placeholder values. Emails will not be sent. Please configure SMTP settings in .env.local');
    return null;
  }

  try {
    return nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
};

export interface TrustedContactEmailData {
  contactName: string;
  contactEmail: string;
  userName: string;
  userEmail: string;
  relationship: string;
  permissions: {
    canViewPersonalDetails: boolean;
    canViewMedicalContacts: boolean;
    canViewFuneralPreferences: boolean;
    canViewDocuments: boolean;
    canViewLetters: boolean;
  };
}

export async function sendTrustedContactEmail(data: TrustedContactEmailData): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn('Email transporter not available. Skipping email send.');
    return false;
  }

  const permissionsList: string[] = [];
  if (data.permissions.canViewPersonalDetails) permissionsList.push('Personal Details');
  if (data.permissions.canViewMedicalContacts) permissionsList.push('Medical Contacts');
  if (data.permissions.canViewFuneralPreferences) permissionsList.push('Funeral Preferences');
  if (data.permissions.canViewDocuments) permissionsList.push('Documents');
  if (data.permissions.canViewLetters) permissionsList.push('Letters');

  const permissionsText = permissionsList.length > 0
    ? permissionsList.join(', ')
    : 'No specific access permissions have been granted at this time.';

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been added as a Trusted Contact</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #2C2A29; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FAF9F7;">
  <div style="background-color: #FCFAF7; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h1 style="color: #2C2A29; margin-top: 0; font-size: 24px;">You've been added as a Trusted Contact</h1>
    
    <p>Dear ${data.contactName},</p>
    
    <p>${data.userName} has added you as a trusted contact in their Going Home account. This means you may be granted access to important information in the future, should the need arise.</p>
    
    <div style="background-color: #EBD9B5; border-left: 4px solid #A5B99A; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; font-weight: 600;">Your Relationship:</p>
      <p style="margin: 5px 0 0 0;">${data.relationship}</p>
    </div>
    
    <div style="background-color: #FCFAF7; border: 1px solid #EBD9B5; padding: 20px; margin: 20px 0; border-radius: 4px;">
      <h2 style="color: #2C2A29; font-size: 18px; margin-top: 0;">Access Permissions</h2>
      <p style="margin-bottom: 10px;">You have been granted access to the following information (when release is activated):</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        ${data.permissions.canViewPersonalDetails ? '<li>Personal Details</li>' : ''}
        ${data.permissions.canViewMedicalContacts ? '<li>Medical Contacts</li>' : ''}
        ${data.permissions.canViewFuneralPreferences ? '<li>Funeral Preferences</li>' : ''}
        ${data.permissions.canViewDocuments ? '<li>Documents</li>' : ''}
        ${data.permissions.canViewLetters ? '<li>Personal Letters</li>' : ''}
      </ul>
      ${permissionsList.length === 0 ? '<p style="color: #666; font-style: italic;">No specific access permissions have been granted at this time.</p>' : ''}
    </div>
    
    <div style="background-color: #FAF9F7; padding: 15px; margin: 20px 0; border-radius: 4px; border: 1px solid #EBD9B5;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <strong>Important:</strong> This information will only be accessible after the account holder activates the release process. You will be notified if and when this happens.
      </p>
    </div>
    
    <p>If you have any questions about this, please contact ${data.userName} directly at ${data.userEmail}.</p>
    
    <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #EBD9B5; color: #666; font-size: 12px;">
      This is an automated message from Going Home App. Please do not reply to this email.
    </p>
  </div>
</body>
</html>
  `;

  const emailText = `
You've been added as a Trusted Contact

Dear ${data.contactName},

${data.userName} has added you as a trusted contact in their Going Home account. This means you may be granted access to important information in the future, should the need arise.

Your Relationship: ${data.relationship}

Access Permissions:
${permissionsText}

Important: This information will only be accessible after the account holder activates the release process. You will be notified if and when this happens.

If you have any questions about this, please contact ${data.userName} directly at ${data.userEmail}.

---
This is an automated message from Going Home App. Please do not reply to this email.
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: data.contactEmail,
      subject: `${data.userName} has added you as a Trusted Contact`,
      text: emailText,
      html: emailHtml,
    });
    console.log(`Trusted contact email sent successfully to ${data.contactEmail}`);
    return true;
  } catch (error: any) {
    // Check for specific connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error(`SMTP connection error: ${error.message}. Please check your SMTP_HOST configuration in .env.local`);
    } else {
      console.error('Error sending trusted contact email:', error);
    }
    return false;
  }
}

