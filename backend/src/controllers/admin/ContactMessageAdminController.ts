import { Request, Response } from 'express';
import { ContactService } from '../../services/ContactService.js';
import { AuthRequest } from '../../models/types.js';
import { ApiError } from '../../middleware/errorHandler.js';

export class ContactMessageAdminController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  /**
   * Get all contact messages (optional query: subject=Outreach Queries)
   */
  async getAllMessages(req: Request, res: Response): Promise<void> {
    try {
      const subject = req.query.subject as string | undefined;
      const messages = subject
        ? await this.contactService.getMessagesBySubject(subject)
        : await this.contactService.getAllMessages();
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch messages' });
    }
  }

  /**
   * Get outreach queries only (contact messages with subject "Outreach Queries")
   */
  async getOutreachQueries(_req: Request, res: Response): Promise<void> {
    try {
      const messages = await this.contactService.getMessagesBySubject('Outreach Queries');
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch outreach queries' });
    }
  }

  /**
   * Get message by ID
   */
  async getMessageById(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const message = await this.contactService.getMessageById(messageId);
      res.status(200).json({ success: true, data: message });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch message' });
      }
    }
  }

  /**
   * Update message status
   */
  async updateMessageStatus(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { status } = req.body;

      // Handle status update based on requested status
      // Frontend uses 'read'/'unread', backend uses 'new'/'responded'/'archived'
      let updatedMessage;
      if (status === 'read' || status === 'responded') {
        updatedMessage = await this.contactService.archiveMessage(messageId);
      } else if (status === 'unread') {
        // Mark as new by updating directly through data helper
        const helper = this.contactService['contactDataHelper'];
        updatedMessage = helper.updateMessage(messageId, { status: 'new' });
      } else {
        // Use the provided status
        const helper = this.contactService['contactDataHelper'];
        updatedMessage = helper.updateMessage(messageId, { status });
      }

      res.status(200).json({
        success: true,
        message: 'Message status updated successfully',
        data: updatedMessage
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to update message status' });
      }
    }
  }

  /**
   * Respond to message
   */
  async respondToMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      const { response } = req.body;
      
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const updatedMessage = await this.contactService.respondToMessage(
        messageId,
        response,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: 'Response sent successfully',
        data: updatedMessage
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to send response' });
      }
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(req: Request, res: Response): Promise<void> {
    try {
      const { messageId } = req.params;
      await this.contactService.deleteMessage(messageId);

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to delete message' });
      }
    }
  }

  /**
   * Get message statistics
   */
  async getMessageStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.contactService.getMessageCounts();
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
  }
}
