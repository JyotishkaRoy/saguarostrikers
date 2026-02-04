import { generateId } from '../utils/idGenerator.js';
import { OutreachParticipantDataHelper } from '../data/OutreachParticipantDataHelper.js';
import { OutreachDataHelper } from '../data/OutreachDataHelper.js';
import { UserDataHelper } from '../data/UserDataHelper.js';
import { OutreachParticipant } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class OutreachParticipantService {
  private participantDataHelper: OutreachParticipantDataHelper;
  private outreachDataHelper: OutreachDataHelper;
  private userDataHelper: UserDataHelper;

  constructor() {
    this.participantDataHelper = new OutreachParticipantDataHelper();
    this.outreachDataHelper = new OutreachDataHelper();
    this.userDataHelper = new UserDataHelper();
  }

  async getByOutreachId(outreachId: string): Promise<OutreachParticipant[]> {
    const outreach = this.outreachDataHelper.getOutreachById(outreachId);
    if (!outreach) throw createError.notFound('Outreach not found');
    return this.participantDataHelper.getByOutreachId(outreachId);
  }

  async addParticipant(outreachId: string, userId: string, role?: string): Promise<OutreachParticipant> {
    const outreach = this.outreachDataHelper.getOutreachById(outreachId);
    if (!outreach) throw createError.notFound('Outreach not found');
    const user = this.userDataHelper.getUserById(userId);
    if (!user) throw createError.notFound('User not found');
    if (user.status !== 'active') throw createError.badRequest('Only active users can be added as participants');
    if (this.participantDataHelper.exists(outreachId, userId)) {
      throw createError.conflict('User is already a participant');
    }
    const participant: OutreachParticipant = {
      outreachParticipantId: generateId(),
      outreachId,
      userId,
      role: role || undefined,
      addedAt: new Date().toISOString(),
    };
    return this.participantDataHelper.addParticipant(participant);
  }

  async removeParticipant(outreachId: string, userId: string): Promise<void> {
    const outreach = this.outreachDataHelper.getOutreachById(outreachId);
    if (!outreach) throw createError.notFound('Outreach not found');
    const removed = this.participantDataHelper.removeParticipant(outreachId, userId);
    if (!removed) throw createError.notFound('Participant not found');
  }

  /** Returns public participant info (name, role) for display on public outreach detail page. */
  async getPublicParticipantsByOutreachId(outreachId: string): Promise<{ userId: string; firstName: string; lastName: string; role?: string; profileImageUrl?: string }[]> {
    const outreach = this.outreachDataHelper.getOutreachById(outreachId);
    if (!outreach) throw createError.notFound('Outreach not found');
    const participants = this.participantDataHelper.getByOutreachId(outreachId);
    return participants
      .map((p) => {
        const user = this.userDataHelper.getUserById(p.userId);
        if (!user) return null;
        return {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          role: p.role,
          profileImageUrl: user.profileImageUrl,
        };
      })
      .filter((x): x is { userId: string; firstName: string; lastName: string; role?: string; profileImageUrl?: string } => x !== null);
  }
}
