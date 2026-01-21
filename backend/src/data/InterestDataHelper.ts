import { BaseDataHelper } from './BaseDataHelper.js';
import { Interest, InterestStatus } from '../models/types.js';

export class InterestDataHelper extends BaseDataHelper<Interest> {
  constructor() {
    super('interests.json');
  }

  public getInterestById(interestId: string): Interest | null {
    return this.getById(interestId, 'interestId');
  }

  public createInterest(interestData: Interest): Interest {
    return this.add(interestData);
  }

  public updateInterest(
    interestId: string,
    updates: Partial<Interest>
  ): Interest | null {
    return this.updateById(interestId, 'interestId', updates);
  }

  public deleteInterest(interestId: string): boolean {
    return this.deleteById(interestId, 'interestId');
  }

  public getInterestsByUser(userId: string): Interest[] {
    return this.findWhere(interest => interest.userId === userId);
  }

  public getInterestsByMission(missionId: string): Interest[] {
    return this.findWhere(interest => interest.missionId === missionId);
  }

  public getInterestsByStatus(status: InterestStatus): Interest[] {
    return this.findWhere(interest => interest.status === status);
  }

  public getPendingInterests(missionId?: string): Interest[] {
    if (missionId) {
      return this.findWhere(
        interest =>
          interest.missionId === missionId && interest.status === 'pending'
      );
    }
    return this.getInterestsByStatus('pending');
  }

  public hasUserShownInterest(userId: string, missionId: string): boolean {
    this.loadData();
    return this.data.some(
      interest =>
        interest.userId === userId && interest.missionId === missionId
    );
  }

  public deleteInterestsByMission(missionId: string): number {
    this.loadData();
    const initialLength = this.data.length;
    this.data = this.data.filter(
      interest => interest.missionId !== missionId
    );
    
    if (this.data.length < initialLength) {
      this.saveData();
    }
    
    return initialLength - this.data.length;
  }
}
