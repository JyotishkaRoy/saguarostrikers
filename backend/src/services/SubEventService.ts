import { v4 as uuidv4 } from 'uuid';
import { SubEventDataHelper } from '../data/SubEventDataHelper.js';
import { CompetitionDataHelper } from '../data/CompetitionDataHelper.js';
import { SubEvent } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class SubEventService {
  private subEventDataHelper: SubEventDataHelper;
  private competitionDataHelper: CompetitionDataHelper;

  constructor() {
    this.subEventDataHelper = new SubEventDataHelper();
    this.competitionDataHelper = new CompetitionDataHelper();
  }

  /**
   * Get sub-event by ID
   */
  async getSubEventById(subEventId: string): Promise<SubEvent> {
    const subEvent = this.subEventDataHelper.getSubEventById(subEventId);
    
    if (!subEvent) {
      throw createError.notFound('Sub-event not found');
    }

    return subEvent;
  }

  /**
   * Get sub-events for a competition
   */
  async getSubEventsByCompetition(competitionId: string): Promise<SubEvent[]> {
    return this.subEventDataHelper.getSubEventsByCompetition(competitionId);
  }

  /**
   * Get published sub-events for a competition (public)
   */
  async getPublishedSubEvents(competitionId: string): Promise<SubEvent[]> {
    return this.subEventDataHelper.getPublishedSubEvents(competitionId);
  }

  /**
   * Create sub-event
   */
  async createSubEvent(data: {
    competitionId: string;
    title: string;
    description: string;
    eventDate: string;
    status?: 'draft' | 'published' | 'completed';
  }): Promise<SubEvent> {
    // Verify competition exists
    const competition = this.competitionDataHelper.getCompetitionById(data.competitionId);
    
    if (!competition) {
      throw createError.notFound('Competition not found');
    }

    const subEvent: SubEvent = {
      subEventId: uuidv4(),
      competitionId: data.competitionId,
      title: data.title,
      description: data.description,
      eventDate: data.eventDate,
      status: data.status || 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.subEventDataHelper.createSubEvent(subEvent);
  }

  /**
   * Update sub-event
   */
  async updateSubEvent(
    subEventId: string,
    updates: {
      title?: string;
      description?: string;
      eventDate?: string;
      status?: 'draft' | 'published' | 'completed';
    }
  ): Promise<SubEvent> {
    const subEvent = this.subEventDataHelper.getSubEventById(subEventId);
    
    if (!subEvent) {
      throw createError.notFound('Sub-event not found');
    }

    const updatedSubEvent = this.subEventDataHelper.updateSubEvent(subEventId, {
      ...updates,
      updatedAt: new Date().toISOString()
    });

    if (!updatedSubEvent) {
      throw createError.internal('Failed to update sub-event');
    }

    return updatedSubEvent;
  }

  /**
   * Delete sub-event
   */
  async deleteSubEvent(subEventId: string): Promise<void> {
    const subEvent = this.subEventDataHelper.getSubEventById(subEventId);
    
    if (!subEvent) {
      throw createError.notFound('Sub-event not found');
    }

    const deleted = this.subEventDataHelper.deleteSubEvent(subEventId);
    
    if (!deleted) {
      throw createError.internal('Failed to delete sub-event');
    }
  }
}
