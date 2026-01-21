import { BaseDataHelper } from './BaseDataHelper.js';
import { SubEvent, SubEventStatus } from '../models/types.js';

export class SubEventDataHelper extends BaseDataHelper<SubEvent> {
  constructor() {
    super('subEvents.json');
  }

  /**
   * Get sub-event by ID
   */
  public getSubEventById(subEventId: string): SubEvent | null {
    return this.getById(subEventId, 'subEventId');
  }

  /**
   * Create a new sub-event
   */
  public createSubEvent(subEventData: SubEvent): SubEvent {
    return this.add(subEventData);
  }

  /**
   * Update sub-event by ID
   */
  public updateSubEvent(
    subEventId: string,
    updates: Partial<SubEvent>
  ): SubEvent | null {
    return this.updateById(subEventId, 'subEventId', updates);
  }

  /**
   * Delete sub-event by ID
   */
  public deleteSubEvent(subEventId: string): boolean {
    return this.deleteById(subEventId, 'subEventId');
  }

  /**
   * Get all sub-events for a mission
   */
  public getSubEventsByMission(missionId: string): SubEvent[] {
    return this.findWhere(subEvent => subEvent.missionId === missionId);
  }

  /**
   * Get sub-events by status
   */
  public getSubEventsByStatus(status: SubEventStatus): SubEvent[] {
    return this.findWhere(subEvent => subEvent.status === status);
  }

  /**
   * Get published sub-events for a mission
   */
  public getPublishedSubEvents(missionId: string): SubEvent[] {
    return this.findWhere(
      subEvent =>
        subEvent.missionId === missionId && subEvent.status === 'published'
    );
  }

  /**
   * Delete all sub-events for a mission
   */
  public deleteSubEventsByMission(missionId: string): number {
    this.loadData();
    const initialLength = this.data.length;
    this.data = this.data.filter(subEvent => subEvent.missionId !== missionId);
    
    if (this.data.length < initialLength) {
      this.saveData();
    }
    
    return initialLength - this.data.length;
  }

  /**
   * Count sub-events for a mission
   */
  public countByMission(missionId: string): number {
    return this.countWhere(subEvent => subEvent.missionId === missionId);
  }
}
