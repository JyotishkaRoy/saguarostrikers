import { generateId } from '../utils/idGenerator.js';
import { InterestDataHelper } from '../data/InterestDataHelper.js';
import { MissionDataHelper } from '../data/MissionDataHelper.js';
import { UserDataHelper } from '../data/UserDataHelper.js';
import { Interest } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class InterestService {
  private interestDataHelper: InterestDataHelper;
  private missionDataHelper: MissionDataHelper;
  private userDataHelper: UserDataHelper;

  constructor() {
    this.interestDataHelper = new InterestDataHelper();
    this.missionDataHelper = new MissionDataHelper();
    this.userDataHelper = new UserDataHelper();
  }

  /**
   * Show interest in a mission
   */
  async showInterest(
    userId: string,
    missionId: string,
    message?: string
  ): Promise<Interest> {
    // Verify mission exists and is published
    const mission = this.missionDataHelper.getMissionById(missionId);
    
    if (!mission) {
      throw createError.notFound('Mission not found');
    }

    if (mission.status !== 'published') {
      throw createError.badRequest('Cannot show interest in unpublished mission');
    }

    // Check if user already showed interest
    if (this.interestDataHelper.hasUserShownInterest(userId, missionId)) {
      throw createError.conflict('You have already shown interest in this mission');
    }

    const interest: Interest = {
      interestId: generateId(),
      userId,
      missionId,
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
   * Get interests for a mission (admin only)
   */
  async getMissionInterests(missionId: string): Promise<Interest[]> {
    return this.interestDataHelper.getInterestsByMission(missionId);
  }

  /**
   * Get pending interests (admin only)
   */
  async getPendingInterests(missionId?: string): Promise<Interest[]> {
    return this.interestDataHelper.getPendingInterests(missionId);
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
    mission?: import('../models/types.js').Mission;
  }> {
    const interest = this.interestDataHelper.getInterestById(interestId);
    
    if (!interest) {
      throw createError.notFound('Interest not found');
    }

    const user = this.userDataHelper.getUserById(interest.userId);
    const mission = this.missionDataHelper.getMissionById(interest.missionId);

    return {
      interest,
      user: user ? (() => { const { password: _, ...u } = user; return u; })() : undefined,
      mission: mission || undefined
    };
  }
}
