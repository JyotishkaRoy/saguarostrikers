import { CalendarEventDataHelper } from '../data/CalendarEventDataHelper.js';
import { CalendarEvent, CreateCalendarEventData, UpdateCalendarEventData } from '../models/types';

export class CalendarEventService {
  private dataHelper: CalendarEventDataHelper;

  constructor(dataHelper?: CalendarEventDataHelper) {
    this.dataHelper = dataHelper || new CalendarEventDataHelper();
  }

  async getAllEvents(): Promise<CalendarEvent[]> {
    return await this.dataHelper.getAllEvents();
  }

  async getEventsByMonth(month: number, year: number): Promise<CalendarEvent[]> {
    if (month < 1 || month > 12) {
      throw new Error('Invalid month. Must be between 1 and 12.');
    }

    if (year < 2020 || year > 2100) {
      throw new Error('Invalid year.');
    }

    return await this.dataHelper.getEventsByMonth(month, year);
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }

    if (start > end) {
      throw new Error('Start date must be before end date');
    }

    return await this.dataHelper.getEventsByDateRange(startDate, endDate);
  }

  async getEventById(eventId: string): Promise<CalendarEvent | null> {
    return await this.dataHelper.getEventById(eventId);
  }

  async getEventsByMission(missionId: string): Promise<CalendarEvent[]> {
    return await this.dataHelper.getEventsByMission(missionId);
  }

  async getUpcomingEvents(limit?: number): Promise<CalendarEvent[]> {
    return await this.dataHelper.getUpcomingEvents(limit);
  }

  async getUpcomingAndOngoingByTypes(types: string[]): Promise<CalendarEvent[]> {
    return await this.dataHelper.getUpcomingAndOngoingByTypes(types);
  }

  async createEvent(data: CreateCalendarEventData, createdBy: string): Promise<CalendarEvent> {
    // Validate date
    const eventDate = new Date(data.date);
    if (isNaN(eventDate.getTime())) {
      throw new Error('Invalid event date');
    }

    // Validate title
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Event title is required');
    }

    if (data.title.length > 200) {
      throw new Error('Event title must be less than 200 characters');
    }

    // Validate description
    if (!data.description || data.description.trim().length === 0) {
      throw new Error('Event description is required');
    }

    return await this.dataHelper.createEvent(data, createdBy);
  }

  async updateEvent(eventId: string, data: UpdateCalendarEventData): Promise<CalendarEvent | null> {
    const existingEvent = await this.dataHelper.getEventById(eventId);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Validate date if provided
    if (data.date) {
      const eventDate = new Date(data.date);
      if (isNaN(eventDate.getTime())) {
        throw new Error('Invalid event date');
      }
    }

    // Validate title if provided
    if (data.title !== undefined) {
      if (data.title.trim().length === 0) {
        throw new Error('Event title cannot be empty');
      }
      if (data.title.length > 200) {
        throw new Error('Event title must be less than 200 characters');
      }
    }

    return await this.dataHelper.updateEvent(eventId, data);
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const existingEvent = await this.dataHelper.getEventById(eventId);
    if (!existingEvent) {
      throw new Error('Event not found');
    }

    return await this.dataHelper.deleteEvent(eventId);
  }

  async searchEvents(query: string): Promise<CalendarEvent[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    return await this.dataHelper.searchEvents(query);
  }

  // Helper method to get events grouped by type
  async getEventsByType(type: string): Promise<CalendarEvent[]> {
    const allEvents = await this.dataHelper.getAllEvents();
    return allEvents.filter(event => event.type === type);
  }

  // Helper method to get events for current month
  async getCurrentMonthEvents(): Promise<CalendarEvent[]> {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return await this.getEventsByMonth(month, year);
  }
}
