import { BaseDataHelper } from './BaseDataHelper.js';
import { Mission, MissionStatus } from '../models/types.js';

export class MissionDataHelper extends BaseDataHelper<Mission> {
  constructor() {
    super('missions.json');
  }

  /**
   * Get mission by ID
   */
  public getMissionById(missionId: string): Mission | null {
    return this.getById(missionId, 'missionId');
  }

  /**
   * Get mission by slug
   */
  public getMissionBySlug(slug: string): Mission | null {
    this.loadData();
    return this.data.find(comp => comp.slug === slug) || null;
  }

  /**
   * Create a new mission
   */
  public createMission(missionData: Mission): Mission {
    return this.add(missionData);
  }

  /**
   * Update mission by ID
   */
  public updateMission(
    missionId: string,
    updates: Partial<Mission>
  ): Mission | null {
    return this.updateById(missionId, 'missionId', updates);
  }

  /**
   * Delete mission by ID
   */
  public deleteMission(missionId: string): boolean {
    return this.deleteById(missionId, 'missionId');
  }

  /**
   * Get missions by status
   */
  public getMissionsByStatus(status: MissionStatus): Mission[] {
    return this.findWhere(comp => comp.status === status);
  }

  /**
   * Get published missions (all visible missions - excludes drafts and cancelled)
   */
  public getPublishedMissions(): Mission[] {
    // Return all missions except drafts and cancelled (published, in-progress, completed, archived are visible)
    return this.findWhere(comp => comp.status !== 'draft' && comp.status !== 'cancelled');
  }

  /**
   * Get upcoming missions: published with future start date.
   * Sorted by startDate ascending so soonest first.
   */
  public getUpcomingMissions(): Mission[] {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const missions = this.findWhere(
      comp =>
        comp.status === 'published' && new Date(comp.startDate) >= now
    );
    return missions.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }

  /**
   * Get ongoing missions (published and between start/end dates)
   */
  public getOngoingMissions(): Mission[] {
    const now = new Date();
    return this.findWhere(
      comp =>
        comp.status === 'published' &&
        new Date(comp.startDate) <= now &&
        new Date(comp.endDate) >= now
    );
  }

  /**
   * Get missions created by user
   */
  public getMissionsByCreator(userId: string): Mission[] {
    return this.findWhere(comp => comp.createdBy === userId);
  }

  /**
   * Check if slug exists
   */
  public slugExists(slug: string): boolean {
    this.loadData();
    return this.data.some(comp => comp.slug === slug);
  }

  /**
   * Search missions by title
   */
  public searchMissions(query: string): Mission[] {
    const lowerQuery = query.toLowerCase();
    return this.findWhere(
      comp =>
        comp.title.toLowerCase().includes(lowerQuery) ||
        comp.description.toLowerCase().includes(lowerQuery)
    );
  }
}
