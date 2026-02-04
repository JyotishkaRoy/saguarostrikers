import { BaseDataHelper } from './BaseDataHelper.js';
import { OutreachParticipant } from '../models/types.js';

export class OutreachParticipantDataHelper extends BaseDataHelper<OutreachParticipant> {
  constructor() {
    super('outreach-participants.json');
  }

  getByOutreachId(outreachId: string): OutreachParticipant[] {
    return this.findWhere(p => p.outreachId === outreachId);
  }

  getByUserId(userId: string): OutreachParticipant[] {
    return this.findWhere(p => p.userId === userId);
  }

  exists(outreachId: string, userId: string): boolean {
    this.loadData();
    return this.data.some(p => p.outreachId === outreachId && p.userId === userId);
  }

  addParticipant(participant: OutreachParticipant): OutreachParticipant {
    return this.add(participant);
  }

  removeParticipant(outreachId: string, userId: string): boolean {
    this.loadData();
    const p = this.data.find(x => x.outreachId === outreachId && x.userId === userId);
    if (!p) return false;
    return this.deleteById(p.outreachParticipantId, 'outreachParticipantId');
  }
}
