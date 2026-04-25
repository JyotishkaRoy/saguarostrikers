import { Request, Response } from 'express';
import { MissionService } from '../services/MissionService.js';
import { SiteContentService } from '../services/SiteContentService.js';
import { NoticeService } from '../services/NoticeService.js';
import { ContactService } from '../services/ContactService.js';
import { CalendarEventService } from '../services/CalendarEventService.js';
import { JoinMissionService } from '../services/JoinMissionService.js';
import { FileManagementService } from '../services/FileManagementService.js';
import { GalleryService } from '../services/GalleryService.js';
import { ArtifactService } from '../services/ArtifactService.js';
import { OutreachService } from '../services/OutreachService.js';
import { OutreachParticipantService } from '../services/OutreachParticipantService.js';
import { OutreachArtifactService } from '../services/OutreachArtifactService.js';
import { PDFGenerator } from '../utils/pdfGenerator.js';
import { CreateJoinMissionData } from '../models/types.js';

export class PublicController {
  private missionService: MissionService;
  private siteContentService: SiteContentService;
  private noticeService: NoticeService;
  private contactService: ContactService;
  private calendarEventService: CalendarEventService;
  private joinMissionService: JoinMissionService;
  private fileService: FileManagementService;
  private galleryService: GalleryService;
  private artifactService: ArtifactService;
  private outreachService: OutreachService;
  private outreachParticipantService: OutreachParticipantService;
  private outreachArtifactService: OutreachArtifactService;

  constructor() {
    this.missionService = new MissionService();
    this.siteContentService = new SiteContentService();
    this.noticeService = new NoticeService();
    this.contactService = new ContactService();
    this.calendarEventService = new CalendarEventService();
    this.joinMissionService = new JoinMissionService();
    this.fileService = new FileManagementService();
    this.galleryService = new GalleryService();
    this.artifactService = new ArtifactService();
    this.outreachService = new OutreachService();
    this.outreachParticipantService = new OutreachParticipantService();
    this.outreachArtifactService = new OutreachArtifactService();
  }

  // Get admin dashboard statistics
  async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      const { UserService } = await import('../services/UserService.js');
      const userService = new UserService();
      
      // Fetch all data in parallel (artifacts = Mission Artifacts card; gallery = Mission Gallery card)
      const [
        allUsers,
        allMissions,
        allApplications,
        allArtifacts,
        allGallery,
        allEvents,
        allNotices,
        allMessages,
      ] = await Promise.all([
        userService.getAllUsers(),
        this.missionService.getAllMissions(),
        this.joinMissionService.getAllApplications(),
        this.artifactService.getAllArtifacts(),
        this.galleryService.getAllImages(),
        this.calendarEventService.getAllEvents(),
        this.noticeService.getAllNotices(),
        this.contactService.getAllMessages(),
      ]);

      // Calculate stats
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const stats = {
        users: {
          total: allUsers.length,
          active: allUsers.filter(u => u.status === 'active').length,
          new: allUsers.filter(u => new Date(u.createdAt) >= thirtyDaysAgo).length,
        },
        missions: {
          total: allMissions.length,
          active: allMissions.filter(m => m.status === 'published' || m.status === 'in-progress').length,
          upcoming: allMissions.filter(m => m.status === 'published' && new Date(m.startDate) > now).length,
        },
        applications: {
          total: allApplications.length,
          pending: allApplications.filter(a => a.status === 'pending' || a.status === 'under_review').length,
          approved: allApplications.filter(a => a.status === 'approved').length,
        },
        files: {
          total: allArtifacts.length,
          public: allArtifacts.filter(a => a.status === 'published').length,
          downloads: 0,
        },
        gallery: {
          total: allGallery.length,
          public: allGallery.filter(g => g.isPublic).length,
          views: allGallery.reduce((sum, g) => sum + (g.viewCount || 0), 0),
        },
        calendarEvents: {
          total: allEvents.length,
          upcoming: allEvents.filter(e => new Date(e.date) >= now && e.status === 'upcoming').length,
        },
        notices: {
          total: allNotices.length,
          published: allNotices.filter(n => n.status === 'published').length,
        },
        contactMessages: {
          total: allMessages.length,
          unread: allMessages.filter(m => m.status === 'new').length,
        },
      };

      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics' });
    }
  }

  /**
   * Get public stats for homepage (active missions, team members, events, completed missions)
   */
  async getPublicStats(_req: Request, res: Response): Promise<void> {
    try {
      const { UserService } = await import('../services/UserService.js');
      const userService = new UserService();

      const [missions, upcomingEvents, users, boardMembers] = await Promise.all([
        this.missionService.getPublishedMissions(),
        this.calendarEventService.getUpcomingEvents(500),
        userService.getAllUsers(),
        this.siteContentService.getAllBoardMembers(true)
      ]);

      const activeMissions = missions.filter(
        m => m.status === 'published' || m.status === 'in-progress'
      ).length;
      const completedMissions = missions.filter(m => m.status === 'completed').length;

      res.status(200).json({
        success: true,
        data: {
          activeMissions,
          users: users.length,
          boardMembers: boardMembers.length,
          upcomingEvents: upcomingEvents.length,
          completedMissions
        }
      });
    } catch (error) {
      console.error('Error fetching public stats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
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

  async getJoinMissionAgreements(_req: Request, res: Response): Promise<void> {
    try {
      const agreements = await this.siteContentService.getJoinMissionAgreements();
      res.status(200).json({ success: true, data: agreements });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch join mission agreements' });
    }
  }

  async getFutureExplorers(_req: Request, res: Response): Promise<void> {
    try {
      const content = await this.siteContentService.getFutureExplorersContent();
      res.status(200).json({ success: true, data: content });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch Future Explorers content' });
    }
  }

  async getPublishedOutreaches(_req: Request, res: Response): Promise<void> {
    try {
      const outreaches = await this.outreachService.getPublishedOutreaches();
      res.status(200).json({ success: true, data: outreaches });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch outreach events' });
    }
  }

  /** Get full outreach detail by slug (published only): outreach, participants, artifacts, gallery. */
  async getOutreachDetailBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const outreach = await this.outreachService.getOutreachBySlug(slug);
      if (outreach.status !== 'published') {
        res.status(404).json({ success: false, message: 'Outreach not found' });
        return;
      }
      const [participants, artifacts, gallery] = await Promise.all([
        this.outreachParticipantService.getPublicParticipantsByOutreachId(outreach.outreachId),
        this.outreachArtifactService.getPublishedByOutreachId(outreach.outreachId),
        this.galleryService.getPublishedImagesByOutreach(outreach.outreachId),
      ]);
      res.status(200).json({
        success: true,
        data: { outreach, participants, artifacts, gallery },
      });
    } catch (error: any) {
      if (error.statusCode === 404) {
        res.status(404).json({ success: false, message: error.message || 'Outreach not found' });
        return;
      }
      res.status(500).json({ success: false, message: 'Failed to fetch outreach details' });
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

  async getCalendarEventsByMission(req: Request, res: Response): Promise<void> {
    try {
      const { missionId } = req.params;
      const events = await this.calendarEventService.getEventsByMission(missionId);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch mission events' });
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

  async submitOutreachApplication(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as CreateJoinMissionData & {
        outreachId: string;
        outreachEventName: string;
      };

      const outreachSummary = [
        `Outreach Event ID: ${payload.outreachId}`,
        `Outreach Event Name: ${payload.outreachEventName}`,
        `Mapped Mission ID: ${payload.missionId || 'none'}`,
        '',
        'Student Details',
        `Name: ${payload.studentFirstName} ${payload.studentMiddleName || ''} ${payload.studentLastName}`.replace(/\s+/g, ' ').trim(),
        `DOB: ${payload.studentDob}`,
        `School: ${payload.schoolName}`,
        `Grade: ${payload.grade}`,
        `Student Email: ${payload.studentEmail}`,
        `Student Phone: ${payload.studentPhone || ''}`,
        '',
        'Parent/Guardian Details',
        `Name: ${payload.parentFirstName} ${payload.parentMiddleName || ''} ${payload.parentLastName}`.replace(/\s+/g, ' ').trim(),
        `Parent Email: ${payload.parentEmail}`,
        `Parent Phone: ${payload.parentPhone}`,
        '',
        'Why fit for this event/mission:',
        payload.fitReason,
      ].join('\n');

      const created = await this.contactService.submitMessage({
        name: `${payload.parentFirstName} ${payload.parentLastName}`.trim(),
        email: payload.parentEmail,
        subject: 'Outreach Queries',
        message: outreachSummary,
        status: 'pending',
        outreachEventId: payload.outreachId,
        outreachEventName: payload.outreachEventName,
        mappedMissionId: payload.missionId || undefined,
      });

      try {
        const agreements = await this.siteContentService.getJoinMissionAgreements();
        const pdfPath = await PDFGenerator.generateOutreachApplicationPDF(
          created.messageId,
          payload.outreachEventName,
          payload,
          agreements,
          created.createdAt
        );
        await this.contactService.updateMessage(created.messageId, {
          applicationPdfPath: pdfPath,
        });
      } catch (pdfError) {
        console.error('Error generating outreach application PDF:', pdfError);
      }

      res.status(201).json({
        success: true,
        message: 'Outreach application submitted successfully.',
        data: created,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to submit outreach application',
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

  // Get published artifacts by mission slug
  async getPublishedArtifactsByMissionSlug(req: Request, res: Response): Promise<void> {
    try {
      const { missionSlug } = req.params;
      
      // Get mission by slug
      const mission = await this.missionService.getMissionBySlug(missionSlug);
      if (!mission) {
        res.status(404).json({ success: false, message: 'Mission not found' });
        return;
      }

      // Get published artifacts for this mission
      const artifacts = await this.artifactService.getPublishedArtifactsByMission(mission.missionId);
      
      res.status(200).json({ success: true, data: artifacts });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch mission artifacts' 
      });
    }
  }

  // Get published gallery images by mission slug
  async getPublishedGalleryByMissionSlug(req: Request, res: Response): Promise<void> {
    try {
      const { missionSlug } = req.params;
      
      // Get mission by slug
      const mission = await this.missionService.getMissionBySlug(missionSlug);
      if (!mission) {
        res.status(404).json({ success: false, message: 'Mission not found' });
        return;
      }

      // Get published gallery images for this mission
      const images = await this.galleryService.getPublishedImagesByMission(mission.missionId);
      
      res.status(200).json({ success: true, data: images });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: error.message || 'Failed to fetch mission gallery' 
      });
    }
  }
}
