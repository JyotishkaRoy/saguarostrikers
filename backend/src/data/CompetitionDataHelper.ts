import { BaseDataHelper } from './BaseDataHelper.js';
import { Competition, CompetitionStatus } from '../models/types.js';

export class CompetitionDataHelper extends BaseDataHelper<Competition> {
  constructor() {
    super('competitions.json');
  }

  /**
   * Get competition by ID
   */
  public getCompetitionById(competitionId: string): Competition | null {
    return this.getById(competitionId, 'competitionId');
  }

  /**
   * Get competition by slug
   */
  public getCompetitionBySlug(slug: string): Competition | null {
    this.loadData();
    return this.data.find(comp => comp.slug === slug) || null;
  }

  /**
   * Create a new competition
   */
  public createCompetition(competitionData: Competition): Competition {
    return this.add(competitionData);
  }

  /**
   * Update competition by ID
   */
  public updateCompetition(
    competitionId: string,
    updates: Partial<Competition>
  ): Competition | null {
    return this.updateById(competitionId, 'competitionId', updates);
  }

  /**
   * Delete competition by ID
   */
  public deleteCompetition(competitionId: string): boolean {
    return this.deleteById(competitionId, 'competitionId');
  }

  /**
   * Get competitions by status
   */
  public getCompetitionsByStatus(status: CompetitionStatus): Competition[] {
    return this.findWhere(comp => comp.status === status);
  }

  /**
   * Get published competitions
   */
  public getPublishedCompetitions(): Competition[] {
    return this.getCompetitionsByStatus('published');
  }

  /**
   * Get upcoming competitions (published and in future)
   */
  public getUpcomingCompetitions(): Competition[] {
    const now = new Date();
    return this.findWhere(
      comp => comp.status === 'published' && new Date(comp.startDate) > now
    );
  }

  /**
   * Get ongoing competitions (published and between start/end dates)
   */
  public getOngoingCompetitions(): Competition[] {
    const now = new Date();
    return this.findWhere(
      comp =>
        comp.status === 'published' &&
        new Date(comp.startDate) <= now &&
        new Date(comp.endDate) >= now
    );
  }

  /**
   * Get competitions created by user
   */
  public getCompetitionsByCreator(userId: string): Competition[] {
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
   * Search competitions by title
   */
  public searchCompetitions(query: string): Competition[] {
    const lowerQuery = query.toLowerCase();
    return this.findWhere(
      comp =>
        comp.title.toLowerCase().includes(lowerQuery) ||
        comp.description.toLowerCase().includes(lowerQuery)
    );
  }
}
