import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { MissionController } from '../controllers/MissionController.js';
import { UserController } from '../controllers/UserController.js';
import { PublicController } from '../controllers/PublicController.js';
import { CalendarEventAdminController } from '../controllers/admin/CalendarEventAdminController.js';
import { JoinMissionAdminController } from '../controllers/admin/JoinMissionAdminController.js';
import { FileManagementAdminController } from '../controllers/admin/FileManagementAdminController.js';
import { GalleryAdminController } from '../controllers/admin/GalleryAdminController.js';
import { ContactMessageAdminController } from '../controllers/admin/ContactMessageAdminController.js';
import { SiteContentAdminController } from '../controllers/admin/SiteContentAdminController.js';
import { BoardMemberAdminController } from '../controllers/admin/BoardMemberAdminController.js';
import { UploadController } from '../controllers/admin/UploadController.js';
import { ArtifactAdminController } from '../controllers/admin/ArtifactAdminController.js';
import { authenticate, requireAdmin, requireUser } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { upload, genericUpload, artifactUpload, galleryUpload, handleUploadError } from '../middleware/upload.js';

// Initialize controllers
const authController = new AuthController();
const missionController = new MissionController();
const userController = new UserController();
const publicController = new PublicController();
const calendarEventAdminController = new CalendarEventAdminController();
const joinMissionAdminController = new JoinMissionAdminController();
const fileManagementAdminController = new FileManagementAdminController();
const galleryAdminController = new GalleryAdminController();
const contactMessageAdminController = new ContactMessageAdminController();
const siteContentAdminController = new SiteContentAdminController();
const boardMemberAdminController = new BoardMemberAdminController();
const uploadController = new UploadController();
const artifactAdminController = new ArtifactAdminController();

const router = Router();

// ==========================================
// PUBLIC ROUTES (No Authentication)
// ==========================================

// Homepage & Public Content
router.get('/public/homepage', publicController.getHomepage.bind(publicController));
router.get('/public/board-members', publicController.getBoardMembers.bind(publicController));
router.get('/public/notices', publicController.getPublicNotices.bind(publicController));
router.post('/public/contact', publicController.submitContactMessage.bind(publicController));

// Public Missions
router.get('/public/missions', missionController.getPublishedMissions.bind(missionController));
router.get('/public/missions/upcoming', missionController.getUpcomingMissions.bind(missionController));
router.get('/public/missions/slug/:slug', missionController.getMissionBySlug.bind(missionController));
router.get('/public/missions/:id', missionController.getMissionWithSubEvents.bind(missionController));

// Public Calendar Events
router.get('/public/calendar-events', publicController.getCalendarEvents.bind(publicController));
router.get('/public/calendar-events/upcoming', publicController.getUpcomingEvents.bind(publicController));
router.get('/public/calendar-events/:eventId', publicController.getEventById.bind(publicController));

// Join Mission Application
router.post('/public/join-mission', publicController.submitJoinMissionApplication.bind(publicController));
router.get('/public/join-mission/mission/:missionId', publicController.getApprovedScientistsByMission.bind(publicController));

// Public User Profiles (limited data)
router.get('/public/users', publicController.getPublicUserProfiles.bind(publicController));

// Public Files (Mission Artifacts)
router.get('/public/files', publicController.getPublicFiles.bind(publicController));
router.get('/public/files/mission/:missionId', publicController.getPublicFilesByMission.bind(publicController));
router.get('/public/files/download/:fileId', publicController.downloadFile.bind(publicController));

// Public Gallery
router.get('/public/gallery', publicController.getPublicGalleryImages.bind(publicController));
router.get('/public/gallery/mission/:missionId', publicController.getPublicGalleryImagesByMission.bind(publicController));
router.get('/public/gallery/:galleryId', publicController.viewGalleryImage.bind(publicController));

// Public Mission Artifacts
router.get('/public/missions/:missionSlug/artifacts', publicController.getPublishedArtifactsByMissionSlug.bind(publicController));

// Public Mission Gallery
router.get('/public/missions/:missionSlug/gallery', publicController.getPublishedGalleryByMissionSlug.bind(publicController));

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

// User Profile
router.put('/user/profile', authenticate, requireUser, userController.updateProfile.bind(userController));
router.post('/user/change-password', authenticate, userController.changePassword.bind(userController));
router.post('/user/upload-profile-image', authenticate, requireUser, genericUpload.single('file'), handleUploadError, userController.uploadProfileImage.bind(userController));

// User Missions & Interests
router.get('/user/missions', authenticate, requireUser, missionController.getPublishedMissions.bind(missionController));
router.get('/user/missions/:id', authenticate, requireUser, missionController.getMissionWithSubEvents.bind(missionController));

// ==========================================
// ADMIN ROUTES (Admin Only)
// ==========================================

// Admin - Generic Upload (uses genericUpload for dynamic folder selection)
router.post('/admin/upload', authenticate, requireAdmin, genericUpload.single('file'), handleUploadError, uploadController.uploadFile.bind(uploadController));
router.delete('/admin/upload', authenticate, requireAdmin, uploadController.deleteFile.bind(uploadController));

// Admin - Dashboard
router.get('/admin/dashboard/stats', authenticate, requireAdmin, publicController.getDashboardStats.bind(publicController));

// Admin - Users
router.get('/admin/users', authenticate, requireAdmin, userController.getAllUsers.bind(userController));
router.get('/admin/users/:id', authenticate, requireAdmin, userController.getUserById.bind(userController));
router.post('/admin/users', authenticate, requireAdmin, userController.createUser.bind(userController));
router.put('/admin/users/:id', authenticate, requireAdmin, userController.updateUser.bind(userController));
router.delete('/admin/users/:id', authenticate, requireAdmin, userController.deleteUser.bind(userController));
router.patch('/admin/users/:id/toggle-status', authenticate, requireAdmin, userController.toggleUserStatus.bind(userController));
router.post('/admin/users/:id/upload-profile-image', authenticate, requireAdmin, genericUpload.single('file'), handleUploadError, userController.uploadUserProfileImage.bind(userController));

// Admin - Missions
router.get('/admin/missions', authenticate, requireAdmin, missionController.getAllMissions.bind(missionController));
router.get('/admin/missions/:id', authenticate, requireAdmin, missionController.getMissionById.bind(missionController));
router.post('/admin/missions', authenticate, requireAdmin, missionController.createMission.bind(missionController));
router.put('/admin/missions/:id', authenticate, requireAdmin, missionController.updateMission.bind(missionController));
router.delete('/admin/missions/:id', authenticate, requireAdmin, missionController.deleteMission.bind(missionController));

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
router.get('/admin/files/mission/:missionId', authenticate, requireAdmin, fileManagementAdminController.getFilesByMission.bind(fileManagementAdminController));
router.get('/admin/files/category/:category', authenticate, requireAdmin, fileManagementAdminController.getFilesByCategory.bind(fileManagementAdminController));
router.get('/admin/files/:fileId', authenticate, requireAdmin, fileManagementAdminController.getFileById.bind(fileManagementAdminController));
router.put('/admin/files/:fileId', authenticate, requireAdmin, fileManagementAdminController.updateFile.bind(fileManagementAdminController));
router.patch('/admin/files/:fileId/toggle-visibility', authenticate, requireAdmin, fileManagementAdminController.toggleFileVisibility.bind(fileManagementAdminController));
router.delete('/admin/files/:fileId', authenticate, requireAdmin, fileManagementAdminController.deleteFile.bind(fileManagementAdminController));

// Admin - Gallery Management
router.get('/admin/gallery', authenticate, requireAdmin, galleryAdminController.getAllMissionsWithGalleries.bind(galleryAdminController));
router.get('/admin/gallery/all', authenticate, requireAdmin, galleryAdminController.getAllImages.bind(galleryAdminController));
router.get('/admin/gallery/stats', authenticate, requireAdmin, galleryAdminController.getGalleryStatistics.bind(galleryAdminController));
router.get('/admin/gallery/search', authenticate, requireAdmin, galleryAdminController.searchImages.bind(galleryAdminController));
router.get('/admin/gallery/tags', authenticate, requireAdmin, galleryAdminController.getImagesByTags.bind(galleryAdminController));
router.get('/admin/gallery/mission/:missionId', authenticate, requireAdmin, galleryAdminController.getImagesByMission.bind(galleryAdminController));
router.get('/admin/gallery/:galleryId', authenticate, requireAdmin, galleryAdminController.getImageById.bind(galleryAdminController));
router.post('/admin/gallery', authenticate, requireAdmin, galleryUpload.single('file'), handleUploadError, galleryAdminController.createGalleryImage.bind(galleryAdminController));
router.put('/admin/gallery/:galleryId', authenticate, requireAdmin, galleryAdminController.updateImage.bind(galleryAdminController));
router.patch('/admin/gallery/:galleryId/toggle-visibility', authenticate, requireAdmin, galleryAdminController.toggleImageVisibility.bind(galleryAdminController));
router.post('/admin/gallery/:galleryId/tags', authenticate, requireAdmin, galleryAdminController.addTags.bind(galleryAdminController));
router.delete('/admin/gallery/:galleryId/tags', authenticate, requireAdmin, galleryAdminController.removeTags.bind(galleryAdminController));
router.delete('/admin/gallery/:galleryId', authenticate, requireAdmin, galleryAdminController.deleteImage.bind(galleryAdminController));

// Admin - Mission Artifacts
router.get('/admin/artifacts', authenticate, requireAdmin, artifactAdminController.getAllMissionsWithArtifacts.bind(artifactAdminController));
router.get('/admin/artifacts/mission/:missionId', authenticate, requireAdmin, artifactAdminController.getArtifactsByMission.bind(artifactAdminController));
router.post('/admin/artifacts', authenticate, requireAdmin, artifactUpload.single('file'), handleUploadError, artifactAdminController.createArtifact.bind(artifactAdminController));
router.put('/admin/artifacts/:artifactId', authenticate, requireAdmin, artifactAdminController.updateArtifact.bind(artifactAdminController));
router.delete('/admin/artifacts/:artifactId', authenticate, requireAdmin, artifactAdminController.deleteArtifact.bind(artifactAdminController));

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
router.post('/admin/site-content/upload-banner', authenticate, requireAdmin, upload.single('banner'), handleUploadError, siteContentAdminController.uploadBannerImage.bind(siteContentAdminController));
router.post('/admin/site-content/upload-mission-director', authenticate, requireAdmin, upload.single('missionDirector'), handleUploadError, siteContentAdminController.uploadMissionDirectorImage.bind(siteContentAdminController));
router.put('/admin/site-content/:contentId', authenticate, requireAdmin, siteContentAdminController.updateContent.bind(siteContentAdminController));

// Admin - Board Members (Mission Leaders)
router.get('/admin/board-members', authenticate, requireAdmin, boardMemberAdminController.getAllBoardMembers.bind(boardMemberAdminController));
router.get('/admin/board-members/:id', authenticate, requireAdmin, boardMemberAdminController.getBoardMemberById.bind(boardMemberAdminController));
router.post('/admin/board-members', authenticate, requireAdmin, boardMemberAdminController.createBoardMember.bind(boardMemberAdminController));
router.put('/admin/board-members/:id', authenticate, requireAdmin, boardMemberAdminController.updateBoardMember.bind(boardMemberAdminController));
router.delete('/admin/board-members/:id', authenticate, requireAdmin, boardMemberAdminController.deleteBoardMember.bind(boardMemberAdminController));
router.post('/admin/board-members/reorder', authenticate, requireAdmin, boardMemberAdminController.reorderBoardMembers.bind(boardMemberAdminController));
router.post('/admin/board-members/upload-leader-image', authenticate, requireAdmin, upload.single('image'), handleUploadError, boardMemberAdminController.uploadBoardMemberImage.bind(boardMemberAdminController));

// Search
router.get('/search/missions', missionController.searchMissions.bind(missionController));

// Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

export default router;
