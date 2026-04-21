import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { CalendarEvent, CreateCalendarEventData, UpdateCalendarEventData } from '../models/types';
import { generateId } from '../utils/idGenerator.js';
import { getDataDir } from '../config/paths.js';

export class CalendarEventDataHelper {
  private dataPath: string;

  constructor(dataPath?: string) {
    this.dataPath = dataPath || join(getDataDir(), 'calendarEvents.json');
  }

  private readData(): CalendarEvent[] {
    try {
      const data = readFileSync(this.dataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading calendar events data:', error);
      return [];
    }
  }

  private writeData(events: CalendarEvent[]): void {
    try {
      writeFileSync(this.dataPath, JSON.stringify(events, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing calendar events data:', error);
      throw error;
    }
  }

  async getAllEvents(): Promise<CalendarEvent[]> {
    return this.readData();
  }

  async getEventsByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]> {
    const events = this.readData();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return eventDate >= start && eventDate <= end;
    });
  }

  async getEventsByMonth(month: number, year: number): Promise<CalendarEvent[]> {
    const events = this.readData();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() + 1 === month && eventDate.getFullYear() === year;
    });
  }

  async getEventById(eventId: string): Promise<CalendarEvent | null> {
    const events = this.readData();
    return events.find(event => event.eventId === eventId) || null;
  }

  async getEventsByMission(missionId: string): Promise<CalendarEvent[]> {
    const events = this.readData();
    return events.filter(event => event.missionId === missionId);
  }

  async getUpcomingEvents(limit?: number): Promise<CalendarEvent[]> {
    const events = this.readData();
    const now = new Date();
    
    const upcomingEvents = events
      .filter(event => new Date(event.date) >= now && event.status === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return limit ? upcomingEvents.slice(0, limit) : upcomingEvents;
  }

  /** Upcoming + ongoing events, optionally filtered by type. For mission/outreach association dropdowns. */
  async getUpcomingAndOngoingByTypes(types: string[]): Promise<CalendarEvent[]> {
    const events = this.readData();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return events
      .filter(
        (event) =>
          (event.status === 'upcoming' || event.status === 'ongoing') &&
          (new Date(event.date) >= today || event.status === 'ongoing') &&
          (types.length === 0 || types.includes(event.type))
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createEvent(data: CreateCalendarEventData, createdBy: string): Promise<CalendarEvent> {
    const events = this.readData();
    const now = new Date().toISOString();

    const newEvent: CalendarEvent = {
      eventId: generateId(),
      title: data.title,
      description: data.description,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      type: data.type,
      status: data.status || 'upcoming',
      missionId: data.missionId,
      location: data.location,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };

    events.push(newEvent);
    this.writeData(events);
    return newEvent;
  }

  async updateEvent(eventId: string, data: UpdateCalendarEventData): Promise<CalendarEvent | null> {
    const events = this.readData();
    const index = events.findIndex(event => event.eventId === eventId);

    if (index === -1) {
      return null;
    }

    const updatedEvent: CalendarEvent = {
      ...events[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    events[index] = updatedEvent;
    this.writeData(events);
    return updatedEvent;
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    const events = this.readData();
    const filteredEvents = events.filter(event => event.eventId !== eventId);

    if (filteredEvents.length === events.length) {
      return false;
    }

    this.writeData(filteredEvents);
    return true;
  }

  async searchEvents(query: string): Promise<CalendarEvent[]> {
    const events = this.readData();
    const lowerQuery = query.toLowerCase();

    return events.filter(event =>
      event.title.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      event.location?.toLowerCase().includes(lowerQuery)
    );
  }
}
