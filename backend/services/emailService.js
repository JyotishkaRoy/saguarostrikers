const nodemailer = require('nodemailer');
const auditLogDataHelper = require('../dataHelpers/auditLogDataHelper');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      try {
        // Check if nodemailer is properly loaded
        if (typeof nodemailer.createTransporter === 'function') {
          this.transporter = nodemailer.createTransporter({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASSWORD
            }
          });
        } else {
          console.warn('Nodemailer not properly loaded. Email functionality will be disabled.');
        }
      } catch (error) {
        console.warn('Error initializing email service:', error.message);
        console.warn('Email functionality will be disabled.');
      }
    } else {
      console.warn('Email configuration not found. Email functionality will be disabled.');
    }
  }

  async sendEmail(to, subject, html, userId, requestInfo = {}) {
    if (!this.transporter) {
      throw new Error('Email service is not configured');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        html
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Log audit
      auditLogDataHelper.createLog({
        userId: userId || 'system',
        action: 'EMAIL_SENT',
        entity: 'email',
        entityId: info.messageId,
        changes: { to, subject },
        ipAddress: requestInfo.ipAddress || '',
        userAgent: requestInfo.userAgent || ''
      });

      return {
        success: true,
        messageId: info.messageId
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendContactResponse(contactMessage, response, userId, requestInfo = {}) {
    const subject = `Re: ${contactMessage.subject}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Response to Your Inquiry</h2>
        <p>Dear ${contactMessage.name},</p>
        <p>Thank you for contacting us. Here is our response:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
          ${response}
        </div>
        <p>Your original message:</p>
        <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0;">
          <p><strong>Subject:</strong> ${contactMessage.subject}</p>
          <p>${contactMessage.message}</p>
        </div>
        <p>If you have any further questions, please don't hesitate to contact us.</p>
        <p>Best regards,<br>Rocketry Mission Team</p>
      </div>
    `;

    return await this.sendEmail(contactMessage.email, subject, html, userId, requestInfo);
  }

  async sendTeamEmail(teamMembers, subject, message, userId, requestInfo = {}) {
    if (!teamMembers || teamMembers.length === 0) {
      throw new Error('No team members to send email to');
    }

    const recipients = teamMembers.map(member => member.user.email).filter(email => email);
    
    if (recipients.length === 0) {
      throw new Error('No valid email addresses found');
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0;">
          ${message}
        </div>
        <p>Best regards,<br>Rocketry Mission Team</p>
      </div>
    `;

    return await this.sendEmail(recipients.join(','), subject, html, userId, requestInfo);
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to Rocketry Mission Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome ${user.firstName}!</h2>
        <p>Thank you for registering with the Rocketry Mission Platform.</p>
        <p>You can now:</p>
        <ul>
          <li>Browse upcoming missions</li>
          <li>Show interest in missions</li>
          <li>Join teams</li>
          <li>Access project files and galleries</li>
        </ul>
        <p>We're excited to have you on board!</p>
        <p>Best regards,<br>Rocketry Mission Team</p>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html, user.userId);
  }

  async sendTeamAssignmentEmail(user, team, mission) {
    const subject = `You've been assigned to ${team.teamName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Team Assignment Notification</h2>
        <p>Hello ${user.firstName},</p>
        <p>Great news! You've been assigned to <strong>${team.teamName}</strong> for the <strong>${mission.title}</strong> mission.</p>
        <p><strong>Mission Details:</strong></p>
        <ul>
          <li><strong>Start Date:</strong> ${new Date(mission.startDate).toLocaleDateString()}</li>
          <li><strong>End Date:</strong> ${new Date(mission.endDate).toLocaleDateString()}</li>
          <li><strong>Location:</strong> ${mission.location}</li>
        </ul>
        <p>Log in to your account to view more details and connect with your team members.</p>
        <p>Best regards,<br>Rocketry Mission Team</p>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html, 'system');
  }
}

module.exports = new EmailService();

