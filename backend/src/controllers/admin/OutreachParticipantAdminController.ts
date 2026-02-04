import { Response } from 'express';
import { AuthRequest } from '../../models/types.js';
import { OutreachParticipantService } from '../../services/OutreachParticipantService.js';
import { UserDataHelper } from '../../data/UserDataHelper.js';
import { ApiError } from '../../middleware/errorHandler.js';

export class OutreachParticipantAdminController {
  private participantService: OutreachParticipantService;
  private userDataHelper: UserDataHelper;

  constructor() {
    this.participantService = new OutreachParticipantService();
    this.userDataHelper = new UserDataHelper();
  }

  async getParticipants(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { outreachId } = req.params;
      const participants = await this.participantService.getByOutreachId(outreachId);
      const withUsers = participants.map(p => {
        const user = this.userDataHelper.getUserById(p.userId);
        return {
          ...p,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
        };
      });
      res.status(200).json({ success: true, data: withUsers });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to fetch participants' });
      }
    }
  }

  async addParticipant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { outreachId } = req.params;
      const { userId, role } = req.body;
      if (!userId) {
        res.status(400).json({ success: false, message: 'userId is required' });
        return;
      }
      const participant = await this.participantService.addParticipant(outreachId, userId, role);
      res.status(201).json({ success: true, message: 'Participant added', data: participant });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to add participant' });
      }
    }
  }

  async removeParticipant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { outreachId, userId } = req.params;
      await this.participantService.removeParticipant(outreachId, userId);
      res.status(200).json({ success: true, message: 'Participant removed' });
    } catch (error) {
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({ success: false, message: 'Failed to remove participant' });
      }
    }
  }
}
