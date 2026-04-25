import { generateId } from '../utils/idGenerator.js';
import { ContactDataHelper } from '../data/ContactDataHelper.js';
import { ContactMessage } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';
import { EmailService } from './EmailService.js';
import { MissionService } from './MissionService.js';
import { CreateJoinMissionData } from '../models/types.js';

export class ContactService {
  private contactDataHelper: ContactDataHelper;
  private emailService: EmailService;
  private missionService: MissionService;

  constructor() {
    this.contactDataHelper = new ContactDataHelper();
    this.emailService = new EmailService();
    this.missionService = new MissionService();
  }

  /**
   * Submit contact message (public)
   */
  async submitMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    status?: ContactMessage['status'];
    outreachEventId?: string;
    outreachEventName?: string;
    mappedMissionId?: string;
    applicationPdfPath?: string;
  }): Promise<ContactMessage> {
    const contactMessage: ContactMessage = {
      messageId: generateId(),
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: data.status || 'new',
      outreachEventId: data.outreachEventId,
      outreachEventName: data.outreachEventName,
      mappedMissionId: data.mappedMissionId,
      applicationPdfPath: data.applicationPdfPath,
      createdAt: new Date().toISOString()
    };

    return this.contactDataHelper.createMessage(contactMessage);
  }

  /**
   * Get all messages (admin)
   */
  async getAllMessages(): Promise<ContactMessage[]> {
    return this.contactDataHelper.getAll();
  }

  /**
   * Get messages by subject (e.g. "Outreach Queries")
   */
  async getMessagesBySubject(subject: string): Promise<ContactMessage[]> {
    return this.contactDataHelper.getMessagesBySubject(subject);
  }

  /**
   * Get message by ID
   */
  async getMessageById(messageId: string): Promise<ContactMessage> {
    const message = this.contactDataHelper.getMessageById(messageId);
    
    if (!message) {
      throw createError.notFound('Message not found');
    }

    return message;
  }

  /**
   * Get new messages
   */
  async getNewMessages(): Promise<ContactMessage[]> {
    return this.contactDataHelper.getNewMessages();
  }

  /**
   * Respond to message (sends email and marks as responded)
   */
  async respondToMessage(
    messageId: string,
    response: string,
    respondedBy: string
  ): Promise<ContactMessage> {
    const message = this.contactDataHelper.getMessageById(messageId);
    
    if (!message) {
      throw createError.notFound('Message not found');
    }

    // Send email response
    try {
      const emailSent = await this.emailService.sendEmail({
        to: message.email,
        subject: `Re: ${message.subject}`,
        text: response,
        html: `<p>${response.replace(/\n/g, '<br>')}</p>`
      });

      if (!emailSent) {
        throw createError.internal('Failed to send email response');
      }
    } catch (error) {
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }
      throw createError.internal('Failed to send email response');
    }

    // Mark as responded
    const updatedMessage = this.contactDataHelper.markAsResponded(
      messageId,
      respondedBy,
      response
    );

    if (!updatedMessage) {
      throw createError.internal('Failed to update message status');
    }

    return updatedMessage;
  }

  /**
   * Archive message
   */
  async archiveMessage(messageId: string): Promise<ContactMessage> {
    const message = this.contactDataHelper.getMessageById(messageId);
    
    if (!message) {
      throw createError.notFound('Message not found');
    }

    const archivedMessage = this.contactDataHelper.archiveMessage(messageId);

    if (!archivedMessage) {
      throw createError.internal('Failed to archive message');
    }

    return archivedMessage;
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    const message = this.contactDataHelper.getMessageById(messageId);
    
    if (!message) {
      throw createError.notFound('Message not found');
    }

    const deleted = this.contactDataHelper.deleteMessage(messageId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete message');
    }
  }

  async updateMessage(
    messageId: string,
    updates: Partial<ContactMessage>
  ): Promise<ContactMessage> {
    const message = this.contactDataHelper.getMessageById(messageId);
    if (!message) {
      throw createError.notFound('Message not found');
    }
    const updated = this.contactDataHelper.updateMessage(messageId, updates);
    if (!updated) {
      throw createError.internal('Failed to update message');
    }
    return updated;
  }

  /**
   * Get message count by status
   */
  async getMessageCounts(): Promise<{
    new: number;
    responded: number;
    total: number;
  }> {
    const all = this.contactDataHelper.getAll();
    const newMessages = this.contactDataHelper.getNewMessages();
    const responded = this.contactDataHelper.getRespondedMessages();

    return {
      new: newMessages.length,
      responded: responded.length,
      total: all.length
    };
  }

  async sendOutreachSubmissionEmails(
    application: ContactMessage,
    payload: CreateJoinMissionData & { outreachEventName: string },
    applicationPdfPath?: string
  ): Promise<void> {
    try {
      await this.emailService.sendJoinMissionStudentConfirmation(
        payload.studentEmail,
        payload.studentFirstName,
        payload.parentEmail,
        payload.outreachEventName,
        applicationPdfPath
      );

      const adminEmail = process.env.ADMIN_EMAIL || 'info@saguarostrikers.org';
      await this.emailService.sendJoinMissionAdminNotification(adminEmail, {
        studentName: `${payload.studentFirstName} ${payload.studentLastName}`.trim(),
        parentName: `${payload.parentFirstName} ${payload.parentLastName}`.trim(),
        missionTitle: payload.outreachEventName,
        grade: payload.grade,
        school: payload.schoolName,
        applicationId: application.messageId,
      });
    } catch (error) {
      console.error('Error sending outreach submission emails:', error);
    }
  }

  async sendOutreachStatusEmail(
    message: ContactMessage,
    status: 'approved' | 'rejected' | 'waitlisted',
    reviewNotes?: string
  ): Promise<void> {
    try {
      const studentEmail = this.extractStudentEmailFromSummary(message.message);
      if (!studentEmail) {
        console.warn(`Skipping outreach status email: student email missing for message ${message.messageId}`);
        return;
      }

      const studentName = this.extractStudentNameFromSummary(message.message) || message.name || 'Applicant';
      const eventTitle = message.outreachEventName || 'Outreach Event';

      let missionSlug: string | undefined;
      if (message.mappedMissionId) {
        const mission = await this.missionService.getMissionById(message.mappedMissionId);
        missionSlug = mission?.slug;
      }

      await this.emailService.sendApplicationStatusUpdate(
        studentEmail,
        message.email,
        studentName,
        eventTitle,
        status,
        reviewNotes,
        missionSlug
      );
    } catch (error) {
      console.error('Error sending outreach status email:', error);
    }
  }

  private extractStudentEmailFromSummary(summary: string): string | null {
    const match = summary.match(/Student Email:\s*([^\s]+@[^\s]+)/i);
    return match?.[1]?.trim() || null;
  }

  private extractStudentNameFromSummary(summary: string): string | null {
    const detailsMatch = summary.match(/Student Details[\s\S]*?Name:\s*(.+)/i);
    const name = detailsMatch?.[1]?.split('\n')[0]?.trim();
    return name || null;
  }
}
