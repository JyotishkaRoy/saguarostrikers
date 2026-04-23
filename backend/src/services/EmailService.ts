import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface EmailAttachment {
  filename: string;
  path: string;
}

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
}

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        const emailService = (process.env.EMAIL_SERVICE || 'gmail').toLowerCase();
        const smtpHost = process.env.EMAIL_SMTP_HOST;
        const smtpPort = process.env.EMAIL_SMTP_PORT ? Number(process.env.EMAIL_SMTP_PORT) : undefined;
        const smtpSecure = process.env.EMAIL_SMTP_SECURE === 'true';

        // Prefer explicit SMTP config when provided.
        if (smtpHost) {
          this.transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort || (smtpSecure ? 465 : 587),
            secure: smtpSecure,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
          });
        } else if (emailService === 'ses') {
          // SES via SMTP defaults (override with EMAIL_SMTP_HOST/PORT/SECURE as needed).
          const region = process.env.AWS_REGION || process.env.SES_REGION || 'us-east-1';
          this.transporter = nodemailer.createTransport({
            host: `email-smtp.${region}.amazonaws.com`,
            port: 587,
            secure: false,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
          });
        } else {
          this.transporter = nodemailer.createTransport({
            service: emailService,
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD,
            },
          });
        }
        console.log('Email service initialized successfully');
      } catch (error) {
        console.warn('Error initializing email service:', error);
        console.warn('Email functionality will be disabled.');
      }
    } else {
      console.warn('Email configuration not found. Email functionality will be disabled.');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service is not configured. Email not sent.');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        cc: options.cc,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Template for Join Mission - Student Confirmation
  async sendJoinMissionStudentConfirmation(
    studentEmail: string,
    studentFirstName: string,
    parentEmail: string,
    missionTitle: string,
    applicationPdfPath?: string
  ): Promise<boolean> {
    const subject = `Application Received - ${missionTitle}`;
    const plainText = `Hi ${studentFirstName},

Thank you for showing your interest in joining ${missionTitle}. You application is currently under review by mission director and/or admin. Once decision is made, you will be notified regarding the same.

Thanks,
Saguaro Strikers`;

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Hi ${studentFirstName},</p>
        <p>
          Thank you for showing your interest in joining ${missionTitle}. You application is currently under review by mission director and/or admin. Once decision is made, you will be notified regarding the same.
        </p>
        <p>Thanks,<br/>Saguaro Strikers</p>
      </body>
      </html>
    `;

    const attachments = applicationPdfPath
      ? [{ filename: 'Join-Mission-Application.pdf', path: applicationPdfPath }]
      : undefined;

    // Primary recipient: student, with parent in CC
    const studentSent = await this.sendEmail({
      to: studentEmail,
      cc: parentEmail,
      subject,
      html,
      text: plainText,
      attachments,
    });

    // Also send a direct copy to parent to avoid relying on CC delivery behavior.
    const parentSent = await this.sendEmail({
      to: parentEmail,
      subject: `[Parent Copy] ${subject}`,
      html,
      text: plainText,
      attachments,
    });

    return studentSent && parentSent;
  }

  // Template for Join Mission - Parent Confirmation
  async sendJoinMissionParentConfirmation(
    parentEmail: string,
    studentName: string,
    parentName: string,
    missionTitle: string
  ): Promise<boolean> {
    const subject = `Application Confirmation - ${studentName}'s Mission Application`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Application Confirmation</h1>
          </div>
          <div class="content">
            <h2>Dear ${parentName},</h2>
            <p>This email confirms that we have received an application for your student, <strong>${studentName}</strong>, to join <strong>${missionTitle}</strong>.</p>
            
            <div class="info-box">
              <h3>Important Information:</h3>
              <ul>
                <li><strong>Student:</strong> ${studentName}</li>
                <li><strong>Mission:</strong> ${missionTitle}</li>
                <li><strong>Status:</strong> Under Review</li>
                <li><strong>Review Timeline:</strong> 3-5 business days</li>
              </ul>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li>Our team will review the application</li>
              <li>You will receive a decision email within 3-5 business days</li>
              <li>If approved, we'll send detailed information about:
                <ul>
                  <li>Mission schedule and meetings</li>
                  <li>Required materials and equipment</li>
                  <li>Safety protocols and requirements</li>
                  <li>Parent participation expectations</li>
                </ul>
              </li>
            </ol>
            
            <h3>Questions?</h3>
            <p>If you have any questions about the application or the mission, please don't hesitate to contact us. We're here to help!</p>
            
            <p>Thank you for your interest in Saguaro Strikers. We look forward to potentially working with ${studentName}!</p>
            
            <p>Best regards,<br><strong>The Saguaro Strikers Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated confirmation email.</p>
            <p>&copy; ${new Date().getFullYear()} Saguaro Strikers. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: parentEmail,
      subject,
      html,
    });
  }

  // Template for Join Mission - Admin Notification
  async sendJoinMissionAdminNotification(
    adminEmail: string,
    applicationDetails: {
      studentName: string;
      parentName: string;
      missionTitle: string;
      grade: string;
      school: string;
      applicationId: string;
    }
  ): Promise<boolean> {
    const subject = `New Mission Application - ${applicationDetails.studentName}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .details table { width: 100%; }
          .details td { padding: 8px; border-bottom: 1px solid #eee; }
          .details td:first-child { font-weight: bold; width: 40%; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Application Received</h1>
          </div>
          <div class="content">
            <h2>Application Details</h2>
            
            <div class="details">
              <table>
                <tr>
                  <td>Student Name:</td>
                  <td>${applicationDetails.studentName}</td>
                </tr>
                <tr>
                  <td>Parent/Guardian:</td>
                  <td>${applicationDetails.parentName}</td>
                </tr>
                <tr>
                  <td>Mission:</td>
                  <td>${applicationDetails.missionTitle}</td>
                </tr>
                <tr>
                  <td>Grade:</td>
                  <td>${applicationDetails.grade}</td>
                </tr>
                <tr>
                  <td>School:</td>
                  <td>${applicationDetails.school}</td>
                </tr>
                <tr>
                  <td>Application ID:</td>
                  <td>${applicationDetails.applicationId}</td>
                </tr>
              </table>
            </div>
            
            <p>A new mission application has been submitted. Please review it in the admin panel and take appropriate action.</p>
            
            <p><strong>Action Required:</strong> Review and approve/reject this application within 3-5 business days.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/applications" class="button">
              Review Application
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({
      to: adminEmail,
      subject,
      html,
    });
  }

  // Template for Application Status Update
  async sendApplicationStatusUpdate(
    studentEmail: string,
    parentEmail: string,
    studentName: string,
    missionTitle: string,
    status: 'approved' | 'rejected' | 'waitlisted',
    message?: string
  ): Promise<boolean> {
    const statusMessages = {
      approved: {
        title: '🎉 Application Approved!',
        heading: 'Congratulations!',
        content: `We're excited to inform you that your application for <strong>${missionTitle}</strong> has been approved!`,
      },
      rejected: {
        title: 'Application Rejected',
        heading: 'Application Status Update',
        content: `Thank you for your interest in <strong>${missionTitle}</strong>. After careful consideration, we're unable to approve your application at this time.`,
      },
      waitlisted: {
        title: 'Application Waitlisted',
        heading: 'You\'re on the Waitlist!',
        content: `Your application for <strong>${missionTitle}</strong> has been placed on our waitlist. We'll contact you if a spot becomes available.`,
      },
    };

    const statusInfo = statusMessages[status];
    const subject = `${statusInfo.title} - ${missionTitle}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: ${status === 'approved' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b'}; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .message-box { background: white; padding: 20px; border-left: 4px solid ${status === 'approved' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#f59e0b'}; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusInfo.title}</h1>
          </div>
          <div class="content">
            <h2>${statusInfo.heading}</h2>
            <h3>Dear ${studentName},</h3>
            
            <p>${statusInfo.content}</p>
            
            ${message ? `
            <div class="message-box">
              <h4>Message from the Team:</h4>
              <p>${message}</p>
            </div>
            ` : ''}
            
            ${status === 'approved' ? `
            <h3>🎓 Your Portal Access:</h3>
            <div class="message-box" style="background: #f0fdf4; border-left-color: #10b981;">
              <p><strong>A user account has been created for you!</strong> You can now log in to the Saguaro Strikers portal to access mission resources, schedules, and team information.</p>
              <p><strong>Login Credentials:</strong></p>
              <ul>
                <li><strong>Email:</strong> ${studentEmail}</li>
                <li><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px; font-family: monospace;">Saguaro@123</code></li>
              </ul>
              <p><strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.</p>
              <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Login to Portal</a></p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
              <li><strong>Log in to the portal</strong> and change your password</li>
              <li>You'll receive a welcome packet with detailed information</li>
              <li>Review the mission schedule and requirements</li>
              <li>Attend the orientation session (date to be announced)</li>
              <li>Complete any required forms or waivers</li>
            </ol>
            <p>We're looking forward to having you on the team!</p>
            ` : ''}
            
            ${status === 'rejected' ? `
            <p>We encourage you to apply for future missions. Your interest in rocketry and aerospace is commendable, and we hope to see you again!</p>
            ` : ''}
            
            ${status === 'waitlisted' ? `
            <p>We'll keep you updated if your status changes. In the meantime, feel free to explore our other missions and programs.</p>
            ` : ''}
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br><strong>The Saguaro Strikers Team</strong></p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Saguaro Strikers. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to both student and parent
    await this.sendEmail({ to: studentEmail, subject, html });
    await this.sendEmail({ to: parentEmail, subject, html });

    return true;
  }
}
