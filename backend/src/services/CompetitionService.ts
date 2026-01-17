import { v4 as uuidv4 } from 'uuid';
import { CompetitionDataHelper } from '../data/CompetitionDataHelper.js';
import { SubEventDataHelper } from '../data/SubEventDataHelper.js';
import { Competition, SubEvent, CreateCompetitionData, UpdateCompetitionData } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class CompetitionService {
  private competitionDataHelper: CompetitionDataHelper;
  private subEventDataHelper: SubEventDataHelper;

  constructor() {
    this.competitionDataHelper = new CompetitionDataHelper();
    this.subEventDataHelper = new SubEventDataHelper();
  }

  /**
   * Get all competitions
   */
  async getAllCompetitions(): Promise<Competition[]> {
    return this.competitionDataHelper.getAll();
  }

  /**
   * Get published competitions (public)
   */
  async getPublishedCompetitions(): Promise<Competition[]> {
    return this.competitionDataHelper.getPublishedCompetitions();
  }

  /**
   * Get upcoming competitions (public)
   */
  async getUpcomingCompetitions(): Promise<Competition[]> {
    return this.competitionDataHelper.getUpcomingCompetitions();
  }

  /**
   * Get competition by ID
   */
  async getCompetitionById(competitionId: string): Promise<Competition> {
    const competition = this.competitionDataHelper.getCompetitionById(competitionId);
    
    if (!competition) {
      throw createError.notFound('Competition not found');
    }

    return competition;
  }

  /**
   * Get competition by slug (public)
   */
  async getCompetitionBySlug(slug: string): Promise<Competition> {
    const competition = this.competitionDataHelper.getCompetitionBySlug(slug);
    
    if (!competition) {
      throw createError.notFound('Competition not found');
    }

    return competition;
  }

  /**
   * Create competition
   */
  async createCompetition(data: CreateCompetitionData, createdBy: string): Promise<Competition> {
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (endDate < startDate) {
      throw createError.badRequest('End date cannot be before start date');
    }

    // Generate slug from title
    const slug = this.generateSlug(data.title);

    // Check if slug already exists
    if (this.competitionDataHelper.slugExists(slug)) {
      throw createError.conflict('A competition with similar title already exists');
    }

    const competition: Competition = {
      competitionId: uuidv4(),
      title: data.title,
      slug,
      description: data.description,
      startDate: data.startDate,
      endDate: data.endDate,
      location: data.location,
      status: data.status || 'draft',
      imageUrl: data.imageUrl,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.competitionDataHelper.createCompetition(competition);
  }

  /**
   * Update competition
   */
  async updateCompetition(
    competitionId: string,
    updates: UpdateCompetitionData
  ): Promise<Competition> {
    const competition = this.competitionDataHelper.getCompetitionById(competitionId);
    
    if (!competition) {
      throw createError.notFound('Competition not found');
    }

    // Validate dates if provided
    if (updates.startDate || updates.endDate) {
      const startDate = new Date(updates.startDate || competition.startDate);
      const endDate = new Date(updates.endDate || competition.endDate);
      
      if (endDate < startDate) {
        throw createError.badRequest('End date cannot be before start date');
      }
    }

    const updatedCompetition = this.competitionDataHelper.updateCompetition(competitionId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (!updatedCompetition) {
      throw createError.internal('Failed to update competition');
    }

    return updatedCompetition;
  }

  /**
   * Delete competition (cascades to sub-events, teams, etc.)
   */
  async deleteCompetition(competitionId: string): Promise<void> {
    const competition = this.competitionDataHelper.getCompetitionById(competitionId);
    
    if (!competition) {
      throw createError.notFound('Competition not found');
    }

    // Delete related sub-events
    this.subEventDataHelper.deleteSubEventsByCompetition(competitionId);

    // Delete competition
    const deleted = this.competitionDataHelper.deleteCompetition(competitionId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete competition');
    }
  }

  /**
   * Search competitions
   */
  async searchCompetitions(query: string): Promise<Competition[]> {
    return this.competitionDataHelper.searchCompetitions(query);
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Get competition with sub-events
   */
  async getCompetitionWithSubEvents(competitionId: string): Promise<{
    competition: Competition;
    subEvents: SubEvent[];
  }> {
    const competition = await this.getCompetitionById(competitionId);
    const subEvents = this.subEventDataHelper.getPublishedSubEvents(competitionId);

    return {
      competition,
      subEvents
    };
  }
}
