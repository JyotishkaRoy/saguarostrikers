import { generateId } from '../utils/idGenerator.js';
import { ContactDataHelper } from '../data/ContactDataHelper.js';
import { ContactMessage } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';
import { EmailService } from './EmailService.js';

export class ContactService {
  private contactDataHelper: ContactDataHelper;
  private emailService: EmailService;

  constructor() {
    this.contactDataHelper = new ContactDataHelper();
    this.emailService = new EmailService();
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
}
