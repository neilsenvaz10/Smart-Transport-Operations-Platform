import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_default_key');

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@transitops.com';

export async function sendInvitationEmail(
  fullName: string,
  email: string,
  role: string,
  temporaryPassword: string
) {
  try {
    const data = await resend.emails.send({
      from: `TransitOps <${FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to TransitOps',
      html: `
        <p>Hello ${fullName},</p>
        <p>You have been invited to join TransitOps.</p>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Login Email:</strong> ${email}</p>
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        <p>Please log in and change your password immediately.</p>
        <p>Regards,<br>TransitOps Team</p>
      `,
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Error sending invitation email:', error);
    return { success: false, error };
  }
}
