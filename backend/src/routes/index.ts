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
import { AuditAdminController } from '../controllers/admin/AuditAdminController.js';
import { DiscussionAdminController } from '../controllers/admin/DiscussionAdminController.js';
import { OutreachAdminController } from '../controllers/admin/OutreachAdminController.js';
import { OutreachParticipantAdminController } from '../controllers/admin/OutreachParticipantAdminController.js';
import { OutreachArtifactAdminController } from '../controllers/admin/OutreachArtifactAdminController.js';
import { DiscussionController } from '../controllers/DiscussionController.js';
import { authenticate, requireAdmin, requireUser } from '../middleware/auth.js';
import { adminActivityLogger } from '../middleware/audit.js';
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
const auditAdminController = new AuditAdminController();
const discussionAdminController = new DiscussionAdminController();
const outreachAdminController = new OutreachAdminController();
const outreachParticipantAdminController = new OutreachParticipantAdminController();
const outreachArtifactAdminController = new OutreachArtifactAdminController();
const discussionController = new DiscussionController();

const router = Router();

// ==========================================
// PUBLIC ROUTES (No Authentication)
// ==========================================

// Homepage & Public Content
router.get('/public/homepage', publicController.getHomepage.bind(publicController));
router.get('/public/stats', publicController.getPublicStats.bind(publicController));
router.get('/public/board-members', publicController.getBoardMembers.bind(publicController));
router.get('/public/join-mission-agreements', publicController.getJoinMissionAgreements.bind(publicController));
router.get('/public/future-explorers', publicController.getFutureExplorers.bind(publicController));
router.get('/public/outreaches', publicController.getPublishedOutreaches.bind(publicController));
router.get('/public/outreach/:slug', publicController.getOutreachDetailBySlug.bind(publicController));
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
router.get('/public/calendar-events/mission/:missionId', publicController.getCalendarEventsByMission.bind(publicController));
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

// Public Discussions (list threads, get thread with replies)
router.get('/discussions', discussionController.getThreads.bind(discussionController));
router.get('/discussions/:id', discussionController.getThreadById.bind(discussionController));
router.post('/discussions/:id/replies', authenticate, requireUser, discussionController.addReply.bind(discussionController));
router.put('/discussions/:id/replies/:replyId', authenticate, requireUser, discussionController.updateReply.bind(discussionController));

// ==========================================
// AUTH ROUTES
// ==========================================

router.post('/auth/register', validate(AuthController.registerValidation), authController.register.bind(authController));
router.post('/auth/login', validate(AuthController.loginValidation), authController.login.bind(authController));
router.post('/auth/logout', authenticate, authController.logout.bind(authController));
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
router.get('/user/my-missions', authenticate, requireUser, missionController.getMyMissions.bind(missionController));
router.get('/user/missions', authenticate, requireUser, missionController.getPublishedMissions.bind(missionController));
router.get('/user/missions/:id', authenticate, requireUser, missionController.getMissionWithSubEvents.bind(missionController));

// ==========================================
// ADMIN ROUTES (Admin Only)
// All /admin/* requests are authenticated, require admin, and logged to auditLogs.json
// ==========================================

router.use('/admin', authenticate, requireAdmin, adminActivityLogger);

// Admin - Generic Upload (uses genericUpload for dynamic folder selection)
router.post('/admin/upload', genericUpload.single('file'), handleUploadError, uploadController.uploadFile.bind(uploadController));
router.delete('/admin/upload', uploadController.deleteFile.bind(uploadController));

// Admin - Dashboard
router.get('/admin/dashboard/stats', publicController.getDashboardStats.bind(publicController));

// Admin - Users
router.get('/admin/users',  userController.getAllUsers.bind(userController));
router.get('/admin/users/:id',  userController.getUserById.bind(userController));
router.post('/admin/users',  userController.createUser.bind(userController));
router.put('/admin/users/:id',  userController.updateUser.bind(userController));
router.delete('/admin/users/:id',  userController.deleteUser.bind(userController));
router.patch('/admin/users/:id/toggle-status',  userController.toggleUserStatus.bind(userController));
router.post('/admin/users/:id/upload-profile-image',  genericUpload.single('file'), handleUploadError, userController.uploadUserProfileImage.bind(userController));

// Admin - Missions
router.get('/admin/missions',  missionController.getAllMissions.bind(missionController));
router.get('/admin/missions/:id',  missionController.getMissionById.bind(missionController));
router.post('/admin/missions',  missionController.createMission.bind(missionController));
router.put('/admin/missions/:id',  missionController.updateMission.bind(missionController));
router.delete('/admin/missions/:id',  missionController.deleteMission.bind(missionController));

// Admin - Outreaches (same CRUD as missions)
// More specific routes first (with extra path segments) so they don't match :id
router.get('/admin/outreaches',  outreachAdminController.getAllOutreaches.bind(outreachAdminController));
router.get('/admin/outreaches/:outreachId/participants',  outreachParticipantAdminController.getParticipants.bind(outreachParticipantAdminController));
router.post('/admin/outreaches/:outreachId/participants',  outreachParticipantAdminController.addParticipant.bind(outreachParticipantAdminController));
router.delete('/admin/outreaches/:outreachId/participants/:userId',  outreachParticipantAdminController.removeParticipant.bind(outreachParticipantAdminController));
router.get('/admin/outreaches/:outreachId/artifacts',  outreachArtifactAdminController.getByOutreach.bind(outreachArtifactAdminController));
router.get('/admin/outreaches/:id',  outreachAdminController.getOutreachById.bind(outreachAdminController));
router.post('/admin/outreaches',  outreachAdminController.createOutreach.bind(outreachAdminController));
router.put('/admin/outreaches/:id',  outreachAdminController.updateOutreach.bind(outreachAdminController));
router.delete('/admin/outreaches/:id',  outreachAdminController.deleteOutreach.bind(outreachAdminController));

// Admin - Outreach Artifacts (upload)
router.post('/admin/outreach-artifacts',  genericUpload.single('file'), handleUploadError, outreachArtifactAdminController.createArtifact.bind(outreachArtifactAdminController));
router.put('/admin/outreach-artifacts/:artifactId',  outreachArtifactAdminController.updateArtifact.bind(outreachArtifactAdminController));
router.delete('/admin/outreach-artifacts/:artifactId',  outreachArtifactAdminController.deleteArtifact.bind(outreachArtifactAdminController));

// Admin - Calendar Events
router.get('/admin/calendar-events',  calendarEventAdminController.getAllEvents.bind(calendarEventAdminController));
router.get('/admin/calendar-events/for-association',  calendarEventAdminController.getEventsForAssociation.bind(calendarEventAdminController));
router.get('/admin/calendar-events/type/:type',  calendarEventAdminController.getEventsByType.bind(calendarEventAdminController));
router.get('/admin/calendar-events/search',  calendarEventAdminController.searchEvents.bind(calendarEventAdminController));
router.get('/admin/calendar-events/:eventId',  calendarEventAdminController.getEventById.bind(calendarEventAdminController));
router.post('/admin/calendar-events',  calendarEventAdminController.createEvent.bind(calendarEventAdminController));
router.put('/admin/calendar-events/:eventId',  calendarEventAdminController.updateEvent.bind(calendarEventAdminController));
router.delete('/admin/calendar-events/:eventId',  calendarEventAdminController.deleteEvent.bind(calendarEventAdminController));

// Admin - Join Mission Applications
router.get('/admin/applications',  joinMissionAdminController.getAllApplications.bind(joinMissionAdminController));
router.get('/admin/applications/stats',  joinMissionAdminController.getApplicationStats.bind(joinMissionAdminController));
router.get('/admin/applications/search',  joinMissionAdminController.searchApplications.bind(joinMissionAdminController));
router.get('/admin/applications/mission/:missionId',  joinMissionAdminController.getApplicationsByMission.bind(joinMissionAdminController));
router.get('/admin/applications/status/:status',  joinMissionAdminController.getApplicationsByStatus.bind(joinMissionAdminController));
router.get('/admin/applications/:applicationId',  joinMissionAdminController.getApplicationById.bind(joinMissionAdminController));
router.put('/admin/applications/:applicationId',  joinMissionAdminController.updateApplication.bind(joinMissionAdminController));
router.patch('/admin/applications/:applicationId/status',  joinMissionAdminController.updateApplicationStatus.bind(joinMissionAdminController));
router.delete('/admin/applications/:applicationId',  joinMissionAdminController.deleteApplication.bind(joinMissionAdminController));

// Admin - File Management
router.get('/admin/files',  fileManagementAdminController.getAllFiles.bind(fileManagementAdminController));
router.get('/admin/files/stats',  fileManagementAdminController.getFileStatistics.bind(fileManagementAdminController));
router.get('/admin/files/search',  fileManagementAdminController.searchFiles.bind(fileManagementAdminController));
router.get('/admin/files/mission/:missionId',  fileManagementAdminController.getFilesByMission.bind(fileManagementAdminController));
router.get('/admin/files/category/:category',  fileManagementAdminController.getFilesByCategory.bind(fileManagementAdminController));
router.get('/admin/files/:fileId',  fileManagementAdminController.getFileById.bind(fileManagementAdminController));
router.put('/admin/files/:fileId',  fileManagementAdminController.updateFile.bind(fileManagementAdminController));
router.patch('/admin/files/:fileId/toggle-visibility',  fileManagementAdminController.toggleFileVisibility.bind(fileManagementAdminController));
router.delete('/admin/files/:fileId',  fileManagementAdminController.deleteFile.bind(fileManagementAdminController));

// Admin - Gallery Management
router.get('/admin/gallery',  galleryAdminController.getAllMissionsWithGalleries.bind(galleryAdminController));
router.get('/admin/gallery/all',  galleryAdminController.getAllImages.bind(galleryAdminController));
router.get('/admin/gallery/stats',  galleryAdminController.getGalleryStatistics.bind(galleryAdminController));
router.get('/admin/gallery/search',  galleryAdminController.searchImages.bind(galleryAdminController));
router.get('/admin/gallery/tags',  galleryAdminController.getImagesByTags.bind(galleryAdminController));
router.get('/admin/gallery/mission/:missionId',  galleryAdminController.getImagesByMission.bind(galleryAdminController));
router.get('/admin/gallery/outreach/:outreachId',  galleryAdminController.getImagesByOutreach.bind(galleryAdminController));
router.get('/admin/gallery/:galleryId',  galleryAdminController.getImageById.bind(galleryAdminController));
router.post('/admin/gallery',  galleryUpload.single('file'), handleUploadError, galleryAdminController.createGalleryImage.bind(galleryAdminController));
router.put('/admin/gallery/:galleryId',  galleryAdminController.updateImage.bind(galleryAdminController));
router.patch('/admin/gallery/:galleryId/toggle-visibility',  galleryAdminController.toggleImageVisibility.bind(galleryAdminController));
router.post('/admin/gallery/:galleryId/tags',  galleryAdminController.addTags.bind(galleryAdminController));
router.delete('/admin/gallery/:galleryId/tags',  galleryAdminController.removeTags.bind(galleryAdminController));
router.delete('/admin/gallery/:galleryId',  galleryAdminController.deleteImage.bind(galleryAdminController));

// Admin - Mission Artifacts
router.get('/admin/artifacts',  artifactAdminController.getAllMissionsWithArtifacts.bind(artifactAdminController));
router.get('/admin/artifacts/mission/:missionId',  artifactAdminController.getArtifactsByMission.bind(artifactAdminController));
router.post('/admin/artifacts',  artifactUpload.single('file'), handleUploadError, artifactAdminController.createArtifact.bind(artifactAdminController));
router.put('/admin/artifacts/:artifactId',  artifactAdminController.updateArtifact.bind(artifactAdminController));
router.delete('/admin/artifacts/:artifactId',  artifactAdminController.deleteArtifact.bind(artifactAdminController));

// Admin - Contact Messages
router.get('/admin/contact-messages',  contactMessageAdminController.getAllMessages.bind(contactMessageAdminController));
router.get('/admin/contact-messages/stats',  contactMessageAdminController.getMessageStats.bind(contactMessageAdminController));
router.get('/admin/outreach-queries',  contactMessageAdminController.getOutreachQueries.bind(contactMessageAdminController));
router.get('/admin/contact-messages/:messageId',  contactMessageAdminController.getMessageById.bind(contactMessageAdminController));
router.patch('/admin/contact-messages/:messageId/status',  contactMessageAdminController.updateMessageStatus.bind(contactMessageAdminController));
router.post('/admin/contact-messages/:messageId/respond',  contactMessageAdminController.respondToMessage.bind(contactMessageAdminController));
router.delete('/admin/contact-messages/:messageId',  contactMessageAdminController.deleteMessage.bind(contactMessageAdminController));

// Admin - Site Content
router.get('/admin/site-content',  siteContentAdminController.getAllContent.bind(siteContentAdminController));
router.get('/admin/site-content/hero-images',  siteContentAdminController.getHeroImages.bind(siteContentAdminController));
router.put('/admin/site-content/hero-images',  siteContentAdminController.updateHeroImages.bind(siteContentAdminController));
router.post('/admin/site-content/upload-banner',  upload.single('banner'), handleUploadError, siteContentAdminController.uploadBannerImage.bind(siteContentAdminController));
router.post('/admin/site-content/upload-featured-video',  upload.single('video'), handleUploadError, siteContentAdminController.uploadFeaturedVideo.bind(siteContentAdminController));
router.delete('/admin/site-content/featured-video',  siteContentAdminController.deleteFeaturedVideo.bind(siteContentAdminController));
router.post('/admin/site-content/upload-mission-director',  upload.single('missionDirector'), handleUploadError, siteContentAdminController.uploadMissionDirectorImage.bind(siteContentAdminController));
router.get('/admin/site-content/future-explorers',  siteContentAdminController.getFutureExplorers.bind(siteContentAdminController));
router.put('/admin/site-content/future-explorers',  siteContentAdminController.updateFutureExplorers.bind(siteContentAdminController));
router.post('/admin/site-content/future-explorers/upload-carousel',  upload.single('file'), handleUploadError, siteContentAdminController.uploadFutureExplorersCarouselImage.bind(siteContentAdminController));
router.put('/admin/site-content/future-explorers/carousel/:imageId',  siteContentAdminController.updateFutureExplorersCarouselImage.bind(siteContentAdminController));
router.delete('/admin/site-content/future-explorers/carousel/:imageId',  siteContentAdminController.deleteFutureExplorersCarouselImage.bind(siteContentAdminController));
router.put('/admin/site-content/future-explorers/carousel-order',  siteContentAdminController.setFutureExplorersCarouselOrder.bind(siteContentAdminController));
router.put('/admin/site-content/:contentId',  siteContentAdminController.updateContent.bind(siteContentAdminController));

// Admin - Audit Logs
router.get('/admin/audit-logs',  auditAdminController.getAllLogs.bind(auditAdminController));

// Admin - Discussions (stats before :id)
router.get('/admin/discussions/stats',  discussionAdminController.getStats.bind(discussionAdminController));
router.get('/admin/discussions',  discussionAdminController.getAllThreads.bind(discussionAdminController));
router.post('/admin/discussions',  discussionAdminController.createThread.bind(discussionAdminController));
router.put('/admin/discussions/:id',  discussionAdminController.updateThread.bind(discussionAdminController));
router.patch('/admin/discussions/:id/status',  discussionAdminController.updateThreadStatus.bind(discussionAdminController));
router.delete('/admin/discussions/:threadId/replies/:replyId',  discussionAdminController.deleteReply.bind(discussionAdminController));
router.delete('/admin/discussions/:id',  discussionAdminController.deleteThread.bind(discussionAdminController));

// Admin - Board Members (Mission Leaders)
router.get('/admin/board-members',  boardMemberAdminController.getAllBoardMembers.bind(boardMemberAdminController));
router.get('/admin/board-members/:id',  boardMemberAdminController.getBoardMemberById.bind(boardMemberAdminController));
router.post('/admin/board-members',  boardMemberAdminController.createBoardMember.bind(boardMemberAdminController));
router.put('/admin/board-members/:id',  boardMemberAdminController.updateBoardMember.bind(boardMemberAdminController));
router.delete('/admin/board-members/:id',  boardMemberAdminController.deleteBoardMember.bind(boardMemberAdminController));
router.post('/admin/board-members/reorder',  boardMemberAdminController.reorderBoardMembers.bind(boardMemberAdminController));
router.post('/admin/board-members/upload-leader-image',  upload.single('image'), handleUploadError, boardMemberAdminController.uploadBoardMemberImage.bind(boardMemberAdminController));

// Search
router.get('/search/missions', missionController.searchMissions.bind(missionController));

// Health Check
router.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

export default router;
