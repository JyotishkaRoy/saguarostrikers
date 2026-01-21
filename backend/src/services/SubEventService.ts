import { generateId } from '../utils/idGenerator.js';
import { SubEventDataHelper } from '../data/SubEventDataHelper.js';
import { MissionDataHelper } from '../data/MissionDataHelper.js';
import { SubEvent } from '../models/types.js';
import { createError } from '../middleware/errorHandler.js';

export class SubEventService {
  private subEventDataHelper: SubEventDataHelper;
  private missionDataHelper: MissionDataHelper;

  constructor() {
    this.subEventDataHelper = new SubEventDataHelper();
    this.missionDataHelper = new MissionDataHelper();
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
   * Get sub-events for a mission
   */
  async getSubEventsByMission(missionId: string): Promise<SubEvent[]> {
    return this.subEventDataHelper.getSubEventsByMission(missionId);
  }

  /**
   * Get published sub-events for a mission (public)
   */
  async getPublishedSubEvents(missionId: string): Promise<SubEvent[]> {
    return this.subEventDataHelper.getPublishedSubEvents(missionId);
  }

  /**
   * Create sub-event
   */
  async createSubEvent(data: {
    missionId: string;
    title: string;
    description: string;
    eventDate: string;
    status?: 'draft' | 'published' | 'completed';
  }): Promise<SubEvent> {
    // Verify mission exists
    const mission = this.missionDataHelper.getMissionById(data.missionId);
    
    if (!mission) {
      throw createError.notFound('Mission not found');
    }

    const subEvent: SubEvent = {
      subEventId: generateId(),
      missionId: data.missionId,
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
