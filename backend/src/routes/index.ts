import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { CompetitionController } from '../controllers/CompetitionController.js';
import { UserController } from '../controllers/UserController.js';
import { PublicController } from '../controllers/PublicController.js';
import { CalendarEventAdminController } from '../controllers/admin/CalendarEventAdminController.js';
import { JoinMissionAdminController } from '../controllers/admin/JoinMissionAdminController.js';
import { FileManagementAdminController } from '../controllers/admin/FileManagementAdminController.js';
import { GalleryAdminController } from '../controllers/admin/GalleryAdminController.js';
import { ContactMessageAdminController } from '../controllers/admin/ContactMessageAdminController.js';
import { SiteContentAdminController } from '../controllers/admin/SiteContentAdminController.js';
import { authenticate, requireAdmin, requireUser } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

// Initialize controllers
const authController = new AuthController();
const competitionController = new CompetitionController();
const userController = new UserController();
const publicController = new PublicController();
const calendarEventAdminController = new CalendarEventAdminController();
const joinMissionAdminController = new JoinMissionAdminController();
const fileManagementAdminController = new FileManagementAdminController();
const galleryAdminController = new GalleryAdminController();
const contactMessageAdminController = new ContactMessageAdminController();
const siteContentAdminController = new SiteContentAdminController();

const router = Router();

// ==========================================
// PUBLIC ROUTES (No Authentication)
// ==========================================

// Homepage & Public Content
router.get('/public/homepage', publicController.getHomepage.bind(publicController));
router.get('/public/board-members', publicController.getBoardMembers.bind(publicController));
router.get('/public/notices', publicController.getPublicNotices.bind(publicController));
router.post('/public/contact', publicController.submitContactMessage.bind(publicController));

// Public Competitions
router.get('/public/competitions', competitionController.getPublishedCompetitions.bind(competitionController));
router.get('/public/competitions/upcoming', competitionController.getUpcomingCompetitions.bind(competitionController));
router.get('/public/competitions/slug/:slug', competitionController.getCompetitionBySlug.bind(competitionController));
router.get('/public/competitions/:id', competitionController.getCompetitionWithSubEvents.bind(competitionController));

// Public Calendar Events
router.get('/public/calendar-events', publicController.getCalendarEvents.bind(publicController));
router.get('/public/calendar-events/upcoming', publicController.getUpcomingEvents.bind(publicController));
router.get('/public/calendar-events/:eventId', publicController.getEventById.bind(publicController));

// Join Mission Application
router.post('/public/join-mission', publicController.submitJoinMissionApplication.bind(publicController));

// Public Files (Mission Artifacts)
router.get('/public/files', publicController.getPublicFiles.bind(publicController));
router.get('/public/files/competition/:competitionId', publicController.getPublicFilesByCompetition.bind(publicController));
router.get('/public/files/download/:fileId', publicController.downloadFile.bind(publicController));

// Public Gallery
router.get('/public/gallery', publicController.getPublicGalleryImages.bind(publicController));
router.get('/public/gallery/competition/:competitionId', publicController.getPublicGalleryImagesByCompetition.bind(publicController));
router.get('/public/gallery/:galleryId', publicController.viewGalleryImage.bind(publicController));

// ==========================================
// AUTH ROUTES
// ==========================================

router.post('/auth/register', validate(AuthController.registerValidation), authController.register.bind(authController));
router.post('/auth/login', validate(AuthController.loginValidation), authController.login.bind(authController));
router.get('/auth/profile', authenticate, requireUser, authController.getProfile.bind(authController));
router.put('/auth/profile', authenticate, requireUser, authController.updateProfile.bind(authController));
router.put('/auth/change-password', authenticate, requireUser, authController.changePassword.bind(authController));

// ==========================================
// USER ROUTES (Authenticated Users)
// ==========================================

// User Competitions & Interests
router.get('/user/competitions', authenticate, requireUser, competitionController.getPublishedCompetitions.bind(competitionController));
router.get('/user/competitions/:id', authenticate, requireUser, competitionController.getCompetitionWithSubEvents.bind(competitionController));

// ==========================================
// ADMIN ROUTES (Admin Only)
// ==========================================

// Admin - Users
router.get('/admin/users', authenticate, requireAdmin, userController.getAllUsers.bind(userController));
router.get('/admin/users/:id', authenticate, requireAdmin, userController.getUserById.bind(userController));
router.post('/admin/users', authenticate, requireAdmin, userController.createUser.bind(userController));
router.put('/admin/users/:id', authenticate, requireAdmin, userController.updateUser.bind(userController));
router.delete('/admin/users/:id', authenticate, requireAdmin, userController.deleteUser.bind(userController));
router.patch('/admin/users/:id/toggle-status', authenticate, requireAdmin, userController.toggleUserStatus.bind(userController));

// Admin - Competitions
router.get('/admin/competitions', authenticate, requireAdmin, competitionController.getAllCompetitions.bind(competitionController));
router.get('/admin/competitions/:id', authenticate, requireAdmin, competitionController.getCompetitionById.bind(competitionController));
router.post('/admin/competitions', authenticate, requireAdmin, competitionController.createCompetition.bind(competitionController));
router.put('/admin/competitions/:id', authenticate, requireAdmin, competitionController.updateCompetition.bind(competitionController));
router.delete('/admin/competitions/:id', authenticate, requireAdmin, competitionController.deleteCompetition.bind(competitionController));

// Admin - Calendar Events
router.get('/admin/calendar-events', authenticate, requireAdmin, calendarEventAdminController.getAllEvents.bind(calendarEventAdminController));
router.get('/admin/calendar-events/type/:type', authenticate, requireAdmin, calendarEventAdminController.getEventsByType.bind(calendarEventAdminController));
router.get('/admin/calendar-events/search', authenticate, requireAdmin, calendarEventAdminController.searchEvents.bind(calendarEventAdminController));
router.get('/admin/calendar-events/:eventId', authenticate, requireAdmin, calendarEventAdminController.getEventById.bind(calendarEventAdminController));
router.post('/admin/calendar-events', authenticate, requireAdmin, calendarEventAdminController.createEvent.bind(calendarEventAdminController));
router.put('/admin/calendar-events/:eventId', authenticate, requireAdmin, calendarEventAdminController.updateEvent.bind(calendarEventAdminController));
router.delete('/admin/calendar-events/:eventId', authenticate, requireAdmin, calendarEventAdminController.deleteEvent.bind(calendarEventAdminController));

// Admin - Join Mission Applications
router.get('/admin/applications', authenticate, requireAdmin, joinMissionAdminController.getAllApplications.bind(joinMissionAdminController));
router.get('/admin/applications/stats', authenticate, requireAdmin, joinMissionAdminController.getApplicationStats.bind(joinMissionAdminController));
router.get('/admin/applications/search', authenticate, requireAdmin, joinMissionAdminController.searchApplications.bind(joinMissionAdminController));
router.get('/admin/applications/mission/:missionId', authenticate, requireAdmin, joinMissionAdminController.getApplicationsByMission.bind(joinMissionAdminController));
router.get('/admin/applications/status/:status', authenticate, requireAdmin, joinMissionAdminController.getApplicationsByStatus.bind(joinMissionAdminController));
router.get('/admin/applications/:applicationId', authenticate, requireAdmin, joinMissionAdminController.getApplicationById.bind(joinMissionAdminController));
router.patch('/admin/applications/:applicationId/status', authenticate, requireAdmin, joinMissionAdminController.updateApplicationStatus.bind(joinMissionAdminController));
router.delete('/admin/applications/:applicationId', authenticate, requireAdmin, joinMissionAdminController.deleteApplication.bind(joinMissionAdminController));

// Admin - File Management
router.get('/admin/files', authenticate, requireAdmin, fileManagementAdminController.getAllFiles.bind(fileManagementAdminController));
router.get('/admin/files/stats', authenticate, requireAdmin, fileManagementAdminController.getFileStatistics.bind(fileManagementAdminController));
router.get('/admin/files/search', authenticate, requireAdmin, fileManagementAdminController.searchFiles.bind(fileManagementAdminController));
router.get('/admin/files/competition/:competitionId', authenticate, requireAdmin, fileManagementAdminController.getFilesByCompetition.bind(fileManagementAdminController));
router.get('/admin/files/category/:category', authenticate, requireAdmin, fileManagementAdminController.getFilesByCategory.bind(fileManagementAdminController));
router.get('/admin/files/:fileId', authenticate, requireAdmin, fileManagementAdminController.getFileById.bind(fileManagementAdminController));
router.put('/admin/files/:fileId', authenticate, requireAdmin, fileManagementAdminController.updateFile.bind(fileManagementAdminController));
router.patch('/admin/files/:fileId/toggle-visibility', authenticate, requireAdmin, fileManagementAdminController.toggleFileVisibility.bind(fileManagementAdminController));
router.delete('/admin/files/:fileId', authenticate, requireAdmin, fileManagementAdminController.deleteFile.bind(fileManagementAdminController));

// Admin - Gallery Management
router.get('/admin/gallery', authenticate, requireAdmin, galleryAdminController.getAllImages.bind(galleryAdminController));
router.get('/admin/gallery/stats', authenticate, requireAdmin, galleryAdminController.getGalleryStatistics.bind(galleryAdminController));
router.get('/admin/gallery/search', authenticate, requireAdmin, galleryAdminController.searchImages.bind(galleryAdminController));
router.get('/admin/gallery/tags', authenticate, requireAdmin, galleryAdminController.getImagesByTags.bind(galleryAdminController));
router.get('/admin/gallery/competition/:competitionId', authenticate, requireAdmin, galleryAdminController.getImagesByCompetition.bind(galleryAdminController));
router.get('/admin/gallery/:galleryId', authenticate, requireAdmin, galleryAdminController.getImageById.bind(galleryAdminController));
router.put('/admin/gallery/:galleryId', authenticate, requireAdmin, galleryAdminController.updateImage.bind(galleryAdminController));
router.patch('/admin/gallery/:galleryId/toggle-visibility', authenticate, requireAdmin, galleryAdminController.toggleImageVisibility.bind(galleryAdminController));
router.post('/admin/gallery/:galleryId/tags', authenticate, requireAdmin, galleryAdminController.addTags.bind(galleryAdminController));
router.delete('/admin/gallery/:galleryId/tags', authenticate, requireAdmin, galleryAdminController.removeTags.bind(galleryAdminController));
router.delete('/admin/gallery/:galleryId', authenticate, requireAdmin, galleryAdminController.deleteImage.bind(galleryAdminController));

// Admin - Contact Messages
router.get('/admin/contact-messages', authenticate, requireAdmin, contactMessageAdminController.getAllMessages.bind(contactMessageAdminController));
router.get('/admin/contact-messages/stats', authenticate, requireAdmin, contactMessageAdminController.getMessageStats.bind(contactMessageAdminController));
router.get('/admin/contact-messages/:messageId', authenticate, requireAdmin, contactMessageAdminController.getMessageById.bind(contactMessageAdminController));
router.patch('/admin/contact-messages/:messageId/status', authenticate, requireAdmin, contactMessageAdminController.updateMessageStatus.bind(contactMessageAdminController));
router.post('/admin/contact-messages/:messageId/respond', authenticate, requireAdmin, contactMessageAdminController.respondToMessage.bind(contactMessageAdminController));
router.delete('/admin/contact-messages/:messageId', authenticate, requireAdmin, contactMessageAdminController.deleteMessage.bind(contactMessageAdminController));

// Admin - Site Content
router.get('/admin/site-content', authenticate, requireAdmin, siteContentAdminController.getAllContent.bind(siteContentAdminController));
router.get('/admin/site-content/hero-images', authenticate, requireAdmin, siteContentAdminController.getHeroImages.bind(siteContentAdminController));
router.put('/admin/site-content/hero-images', authenticate, requireAdmin, siteContentAdminController.updateHeroImages.bind(siteContentAdminController));
router.put('/admin/site-content/:contentId', authenticate, requireAdmin, siteContentAdminController.updateContent.bind(siteContentAdminController));

// Search
router.get('/search/competitions', competitionController.searchCompetitions.bind(competitionController));

// Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

export default router;
