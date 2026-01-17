import { Response } from 'express';
import { AuthRequest } from '../../models/types';
import { CalendarEventService } from '../../services/CalendarEventService';

export class CalendarEventAdminController {
  private calendarEventService: CalendarEventService;

  constructor() {
    this.calendarEventService = new CalendarEventService();
  }

  async getAllEvents(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const events = await this.calendarEventService.getAllEvents();
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch events' });
    }
  }

  async getEventById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const event = await this.calendarEventService.getEventById(eventId);

      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }

      res.status(200).json({ success: true, data: event });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch event' });
    }
  }

  async createEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'User not authenticated' });
        return;
      }

      const event = await this.calendarEventService.createEvent(req.body, userId);
      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: event
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create event'
      });
    }
  }

  async updateEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const event = await this.calendarEventService.updateEvent(eventId, req.body);

      if (!event) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Event updated successfully',
        data: event
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update event'
      });
    }
  }

  async deleteEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const deleted = await this.calendarEventService.deleteEvent(eventId);

      if (!deleted) {
        res.status(404).json({ success: false, message: 'Event not found' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete event'
      });
    }
  }

  async searchEvents(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { query } = req.query;
      if (!query) {
        res.status(400).json({ success: false, message: 'Search query is required' });
        return;
      }

      const events = await this.calendarEventService.searchEvents(query as string);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to search events' });
    }
  }

  async getEventsByType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      const events = await this.calendarEventService.getEventsByType(type);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch events by type' });
    }
  }
}
