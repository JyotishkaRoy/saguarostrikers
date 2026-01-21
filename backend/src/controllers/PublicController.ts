import { Request, Response } from 'express';
import { MissionService } from '../services/MissionService.js';
import { SiteContentService } from '../services/SiteContentService.js';
import { NoticeService } from '../services/NoticeService.js';
import { ContactService } from '../services/ContactService.js';
import { CalendarEventService } from '../services/CalendarEventService.js';
import { JoinMissionService } from '../services/JoinMissionService.js';
import { FileManagementService } from '../services/FileManagementService.js';
import { GalleryService } from '../services/GalleryService.js';

export class PublicController {
  private missionService: MissionService;
  private siteContentService: SiteContentService;
  private noticeService: NoticeService;
  private contactService: ContactService;
  private calendarEventService: CalendarEventService;
  private joinMissionService: JoinMissionService;
  private fileService: FileManagementService;
  private galleryService: GalleryService;

  constructor() {
    this.missionService = new MissionService();
    this.siteContentService = new SiteContentService();
    this.noticeService = new NoticeService();
    this.contactService = new ContactService();
    this.calendarEventService = new CalendarEventService();
    this.joinMissionService = new JoinMissionService();
    this.fileService = new FileManagementService();
    this.galleryService = new GalleryService();
  }

  async getHomepage(_req: Request, res: Response): Promise<void> {
    try {
      const [homepage, upcomingMissions, notices, boardMembers] = await Promise.all([
        this.siteContentService.getHomepageContent(),
        this.missionService.getUpcomingMissions(),
        this.noticeService.getPublishedNotices(),
        this.siteContentService.getAllBoardMembers(true)
      ]);

      res.status(200).json({
        success: true,
        data: {
          homepage,
          upcomingMissions,
          notices: notices.slice(0, 5), // Latest 5 notices
          boardMembers
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to load homepage data' });
    }
  }

  async submitContactMessage(req: Request, res: Response): Promise<void> {
    try {
      const message = await this.contactService.submitMessage(req.body);
      res.status(201).json({
        success: true,
        message: 'Thank you for contacting us. We will get back to you soon.',
        data: message
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to submit message' });
    }
  }

  async getPublicNotices(_req: Request, res: Response): Promise<void> {
    try {
      const notices = await this.noticeService.getPublishedNotices();
      res.status(200).json({ success: true, data: notices });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch notices' });
    }
  }

  async getBoardMembers(_req: Request, res: Response): Promise<void> {
    try {
      const boardMembers = await this.siteContentService.getAllBoardMembers(true);
      res.status(200).json({ success: true, data: boardMembers });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch board members' });
    }
  }

  // Calendar Events
  async getCalendarEvents(req: Request, res: Response): Promise<void> {
    try {
      const { month, year, startDate, endDate } = req.query;

      let events;
      if (month && year) {
        events = await this.calendarEventService.getEventsByMonth(
          parseInt(month as string),
          parseInt(year as string)
        );
      } else if (startDate && endDate) {
        events = await this.calendarEventService.getEventsByDateRange(
          startDate as string,
          endDate as string
        );
      } else {
        // Get upcoming events by default
        events = await this.calendarEventService.getUpcomingEvents(20);
      }

      res.status(200).json({ success: true, data: events });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message || 'Failed to fetch calendar events' });
    }
  }

  async getUpcomingEvents(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const events = await this.calendarEventService.getUpcomingEvents(limit);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch upcoming events' });
    }
  }

  async getEventById(req: Request, res: Response): Promise<void> {
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

  // Join Mission Application
  async submitJoinMissionApplication(req: Request, res: Response): Promise<void> {
    try {
      const application = await this.joinMissionService.submitApplication(req.body);
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully! Check your email for confirmation.',
        data: application
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit application'
      });
    }
  }

  // Public Files (Mission Artifacts)
  async getPublicFiles(_req: Request, res: Response): Promise<void> {
    try {
      const files = await this.fileService.getPublicFiles();
      res.status(200).json({ success: true, data: files });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch files' });
    }
  }

  async getPublicFilesByMission(req: Request, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const allFiles = await this.fileService.getFilesByMission(missionId);
      const publicFiles = allFiles.filter(f => f.isPublic);
      res.status(200).json({ success: true, data: publicFiles });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch files' });
    }
  }

  async downloadFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const file = await this.fileService.getFileById(fileId);

      if (!file) {
        res.status(404).json({ success: false, message: 'File not found' });
        return;
      }

      if (!file.isPublic) {
        res.status(403).json({ success: false, message: 'File is not publicly accessible' });
        return;
      }

      // Record download
      await this.fileService.recordDownload(fileId);

      res.status(200).json({ success: true, data: file });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to download file' });
    }
  }

  // Public Gallery
  async getPublicGalleryImages(_req: Request, res: Response): Promise<void> {
    try {
      const images = await this.galleryService.getPublicImages();
      res.status(200).json({ success: true, data: images });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch gallery images' });
    }
  }

  async getPublicGalleryImagesByMission(req: Request, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const allImages = await this.galleryService.getImagesByMission(missionId);
      const publicImages = allImages.filter(i => i.isPublic);
      res.status(200).json({ success: true, data: publicImages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch gallery images' });
    }
  }

  async viewGalleryImage(req: Request, res: Response): Promise<void> {
    try {
      const { galleryId } = req.params;
      const image = await this.galleryService.getImageById(galleryId);

      if (!image) {
        res.status(404).json({ success: false, message: 'Image not found' });
        return;
      }

      if (!image.isPublic) {
        res.status(403).json({ success: false, message: 'Image is not publicly accessible' });
        return;
      }

      // Record view
      await this.galleryService.recordView(galleryId);

      res.status(200).json({ success: true, data: image });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to view image' });
    }
  }

  // Get approved scientists (applications) by mission ID
  async getApprovedScientistsByMission(req: Request, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      
      // Get all applications for this mission
      const applications = await this.joinMissionService.getApplicationsByMission(missionId);
      
      // Filter only approved applications
      const approvedScientists = applications.filter(app => app.status === 'approved');
      
      res.status(200).json({ success: true, data: approvedScientists });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch mission scientists' });
    }
  }

  // Get public user profiles (limited data for display purposes)
  async getPublicUserProfiles(_req: Request, res: Response): Promise<void> {
    try {
      // Import UserService if not already available
      const { UserService } = await import('../services/UserService.js');
      const userService = new UserService();
      
      const users = await userService.getAllUsers();
      
      // Return only non-sensitive data
      const publicProfiles = users.map(user => ({
        userId: user.userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      }));
      
      res.status(200).json({ success: true, data: publicProfiles });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch user profiles' });
    }
  }
}
