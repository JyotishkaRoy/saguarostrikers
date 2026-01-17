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

  public getInterestsByCompetition(competitionId: string): Interest[] {
    return this.findWhere(interest => interest.competitionId === competitionId);
  }

  public getInterestsByStatus(status: InterestStatus): Interest[] {
    return this.findWhere(interest => interest.status === status);
  }

  public getPendingInterests(competitionId?: string): Interest[] {
    if (competitionId) {
      return this.findWhere(
        interest =>
          interest.competitionId === competitionId && interest.status === 'pending'
      );
    }
    return this.getInterestsByStatus('pending');
  }

  public hasUserShownInterest(userId: string, competitionId: string): boolean {
    this.loadData();
    return this.data.some(
      interest =>
        interest.userId === userId && interest.competitionId === competitionId
    );
  }

  public deleteInterestsByCompetition(competitionId: string): number {
    this.loadData();
    const initialLength = this.data.length;
    this.data = this.data.filter(
      interest => interest.competitionId !== competitionId
    );
    
    if (this.data.length < initialLength) {
      this.saveData();
    }
    
    return initialLength - this.data.length;
  }
}
