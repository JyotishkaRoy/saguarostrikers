import { v4 as uuidv4 } from 'uuid';
import { InterestDataHelper } from '../data/InterestDataHelper.js';
import { CompetitionDataHelper } from '../data/CompetitionDataHelper.js';
import { UserDataHelper } from '../data/UserDataHelper.js';
import { Interest } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class InterestService {
  private interestDataHelper: InterestDataHelper;
  private competitionDataHelper: CompetitionDataHelper;
  private userDataHelper: UserDataHelper;

  constructor() {
    this.interestDataHelper = new InterestDataHelper();
    this.competitionDataHelper = new CompetitionDataHelper();
    this.userDataHelper = new UserDataHelper();
  }

  /**
   * Show interest in a competition
   */
  async showInterest(
    userId: string,
    competitionId: string,
    message?: string
  ): Promise<Interest> {
    // Verify competition exists and is published
    const competition = this.competitionDataHelper.getCompetitionById(competitionId);
    
    if (!competition) {
      throw createError.notFound('Competition not found');
    }

    if (competition.status !== 'published') {
      throw createError.badRequest('Cannot show interest in unpublished competition');
    }

    // Check if user already showed interest
    if (this.interestDataHelper.hasUserShownInterest(userId, competitionId)) {
      throw createError.conflict('You have already shown interest in this competition');
    }

    const interest: Interest = {
      interestId: uuidv4(),
      userId,
      competitionId,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    return this.interestDataHelper.createInterest(interest);
  }

  /**
   * Get user's interests
   */
  async getUserInterests(userId: string): Promise<Interest[]> {
    return this.interestDataHelper.getInterestsByUser(userId);
  }

  /**
   * Get interests for a competition (admin only)
   */
  async getCompetitionInterests(competitionId: string): Promise<Interest[]> {
    return this.interestDataHelper.getInterestsByCompetition(competitionId);
  }

  /**
   * Get pending interests (admin only)
   */
  async getPendingInterests(competitionId?: string): Promise<Interest[]> {
    return this.interestDataHelper.getPendingInterests(competitionId);
  }

  /**
   * Update interest status (admin only)
   */
  async updateInterestStatus(
    interestId: string,
    status: 'pending' | 'assigned' | 'rejected'
  ): Promise<Interest> {
    const interest = this.interestDataHelper.getInterestById(interestId);
    
    if (!interest) {
      throw createError.notFound('Interest not found');
    }

    const updatedInterest = this.interestDataHelper.updateInterest(interestId, {
      status
    });

    if (!updatedInterest) {
      throw createError.internal('Failed to update interest');
    }

    return updatedInterest;
  }

  /**
   * Delete interest
   */
  async deleteInterest(interestId: string): Promise<void> {
    const interest = this.interestDataHelper.getInterestById(interestId);
    
    if (!interest) {
      throw createError.notFound('Interest not found');
    }

    const deleted = this.interestDataHelper.deleteInterest(interestId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete interest');
    }
  }

  /**
   * Get interest with enriched data
   */
  async getInterestWithDetails(interestId: string): Promise<{
    interest: Interest;
    user?: Omit<import('../models/types.js').User, 'password'>;
    competition?: import('../models/types.js').Competition;
  }> {
    const interest = this.interestDataHelper.getInterestById(interestId);
    
    if (!interest) {
      throw createError.notFound('Interest not found');
    }

    const user = this.userDataHelper.getUserById(interest.userId);
    const competition = this.competitionDataHelper.getCompetitionById(interest.competitionId);

    return {
      interest,
      user: user ? (() => { const { password: _, ...u } = user; return u; })() : undefined,
      competition: competition || undefined
    };
  }
}
