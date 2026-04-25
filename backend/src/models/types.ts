// Type definitions for Saguaro Strikers platform
// Based on Sanhoti architecture pattern

import { Request } from 'express';

// ============================================
// Auth & User Types
// ============================================

export interface User {
  userId: string;
  email: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

// ============================================
// Mission Types
// ============================================

export interface Mission {
  missionId: string;
  title: string;
  slug: string; // Never changes once created
  description: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  location: string;
  status: MissionStatus;
  imageUrl?: string;
  calendarEventId?: string;
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
}

export type MissionStatus = 'draft' | 'published' | 'in-progress' | 'completed' | 'cancelled' | 'archived';

// ============================================
// Outreach Types (same structure as Mission for admin/outreaches)
// ============================================

export interface Outreach {
  outreachId: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: OutreachStatus;
  imageUrl?: string;
  calendarEventId?: string; // Optional link to a calendar event
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type OutreachStatus = 'draft' | 'published' | 'in-progress' | 'completed' | 'cancelled' | 'archived';

export interface OutreachParticipant {
  outreachParticipantId: string;
  outreachId: string;
  userId: string;
  role?: string;
  addedAt: string;
}

export interface SubEvent {
  subEventId: string;
  missionId: string;
  title: string;
  description: string;
  eventDate: string; // ISO date
  status: SubEventStatus;
  createdAt: string;
  updatedAt: string;
}

export type SubEventStatus = 'draft' | 'published' | 'completed';

// ============================================
// Team Types
// ============================================

export interface Team {
  teamId: string;
  missionId: string;
  teamName: string;
  description: string;
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  memberId: string;
  teamId: string;
  userId: string;
  role: string; // Team role (e.g., "Team Lead", "Member")
  joinedAt: string;
}

export interface Interest {
  interestId: string;
  userId: string;
  missionId: string;
  message?: string;
  status: InterestStatus;
  createdAt: string;
}

export type InterestStatus = 'pending' | 'assigned' | 'rejected';

// ============================================
// Notice & News Types
// ============================================

export interface Notice {
  noticeId: string;
  title: string;
  content: string;
  type: NoticeType;
  missionId?: string;
  status: PublishStatus;
  priority: Priority;
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type NoticeType = 'general' | 'mission';
export type PublishStatus = 'draft' | 'published' | 'unpublished';
export type Priority = 'low' | 'medium' | 'high';

// ============================================
// Discussion Types
// ============================================

export interface DiscussionReply {
  replyId: string;
  content: string;
  authorId: string;
  authorName?: string;
  authorEmail?: string;
  authorRole?: string;
  createdAt: string;
}

export interface DiscussionThread {
  threadId: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'closed';
  missionId?: string; // Optional: link thread to a specific mission
  createdBy?: string;
  replies: DiscussionReply[];
  replyCount: number;
  lastReplyAt: string | null;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Site Content Types
// ============================================

export interface JoinMissionAgreements {
  agreementFinancial: string;
  agreementPhotograph: string;
  agreementLiability: string;
}

export interface FutureExplorersCarouselImage {
  imageId: string;
  url: string;
  sequence: number;
  active: boolean;
}

export interface FutureExplorersContent {
  row1Col1Html: string;
  carouselImages: FutureExplorersCarouselImage[];
  row2Html: string;
}

export interface SiteContent {
  homepage: HomepageContent;
  joinMission?: JoinMissionAgreements;
  futureExplorers?: FutureExplorersContent;
}

export interface HeroCTA {
  text: string;
  link: string;
  style: 'primary' | 'secondary';
}

export interface FeaturedVideo {
  id?: string;
  title: string;
  url: string; // YouTube/Vimeo embed URL or uploaded video file URL
  thumbnail?: string;
}

export interface HomepageContent {
  heroImages: string[];
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCTAs?: HeroCTA[];
  aboutUs: string;
  vision: string;
  mission: string;
  missionCommanderMessage?: string;
  missionCommanderName?: string;
  missionCommanderTitle?: string;
  missionCommanderImage?: string;
  featuredVideos?: FeaturedVideo[];
}

export interface BoardMember {
  boardMemberId: string;
  name: string;
  position: string;
  bio: string;
  email: string;
  imageUrl?: string;
  order: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Contact & Message Types
// ============================================

export interface ContactMessage {
  messageId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  outreachEventId?: string;
  outreachEventName?: string;
  mappedMissionId?: string;
  applicationPdfPath?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  respondedBy?: string; // userId
  respondedAt?: string;
  response?: string;
  createdAt: string;
}

export type MessageStatus =
  | 'new'
  | 'responded'
  | 'archived'
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'waitlisted';

// ============================================
// File & Gallery Types
// ============================================

export interface FileUpload {
  fileId: string;
  fileName: string; // Stored filename
  originalName: string; // Original filename
  filePath: string;
  fileType: string; // MIME type
  fileSize: number; // Bytes
  category: FileCategory;
  missionId?: string;
  subEventId?: string;
  uploadedBy: string; // userId
  uploadedAt: string;
  description?: string;
  isPublic: boolean; // Whether file is publicly accessible
  downloadCount: number;
}

export type FileCategory = 'project' | 'document' | 'artifact' | 'other';

export interface GalleryImage {
  galleryId: string;
  imageUrl: string;
  title: string;
  description?: string;
  missionId?: string;
  outreachId?: string;
  subEventId?: string;
  uploadedBy: string; // userId
  uploadedAt: string;
  isPublic: boolean; // Whether image is publicly accessible
  viewCount: number;
  tags?: string[];
  status?: 'draft' | 'published' | 'unpublished'; // Gallery item status (similar to artifacts)
}

export interface CreateFileData {
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: FileCategory;
  missionId?: string;
  subEventId?: string;
  description?: string;
  isPublic?: boolean;
}

// ============================================
// Mission Artifact Types
// ============================================

export interface MissionArtifact {
  artifactId: string;
  missionId: string; // Required - every artifact must be associated with a mission
  description: string;
  fileName: string; // Stored filename
  originalFileName: string; // Original filename for display
  filePath: string; // Relative path from uploads root
  fileType: string; // MIME type
  fileSize: number; // Bytes
  status: ArtifactStatus;
  uploadedBy: string; // userId
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type ArtifactStatus = 'draft' | 'published' | 'unpublished';

export interface CreateArtifactData {
  missionId: string;
  description: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
}

export interface UpdateArtifactData {
  description?: string;
  status?: ArtifactStatus;
}

// Outreach Artifacts (same structure as mission artifacts, keyed by outreachId)
export interface OutreachArtifact {
  artifactId: string;
  outreachId: string;
  description: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  status: ArtifactStatus;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CreateOutreachArtifactData {
  outreachId: string;
  description: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
}

export interface UpdateOutreachArtifactData {
  description?: string;
  status?: ArtifactStatus;
}

export interface CreateGalleryImageData {
  imageUrl: string;
  title: string;
  description?: string;
  missionId?: string;
  outreachId?: string;
  subEventId?: string;
  isPublic?: boolean;
  tags?: string[];
  status?: 'draft' | 'published' | 'unpublished';
}

// ============================================
// Audit Log Types
// ============================================

export interface AuditLog {
  logId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// Request Info for Audit Logging
// ============================================

export interface RequestInfo {
  ipAddress: string;
  userAgent: string;
}

// ============================================
// Service Layer Types
// ============================================

export interface CreateMissionData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status?: MissionStatus;
  imageUrl?: string;
  calendarEventId?: string;
}

export interface UpdateMissionData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: MissionStatus;
  imageUrl?: string;
  calendarEventId?: string;
}

export interface CreateOutreachData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status?: OutreachStatus;
  imageUrl?: string;
  calendarEventId?: string;
}

export interface UpdateOutreachData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: OutreachStatus;
  imageUrl?: string;
  calendarEventId?: string;
}

export interface CreateTeamData {
  missionId: string;
  teamName: string;
  description: string;
}

export interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CreateUserData extends RegisterUserData {
  role?: UserRole;
  status?: UserStatus;
}

// ============================================
// Calendar Event Types
// ============================================

export interface CalendarEvent {
  eventId: string;
  title: string;
  description: string;
  date: string; // ISO date
  startTime?: string; // Optional time in HH:MM format
  endTime?: string;
  type: CalendarEventType;
  status: CalendarEventStatus;
  missionId?: string; // Optional link to mission
  location?: string;
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
}

export type CalendarEventType = 'rocketry-competition' | 'robotics-competition' | 'summer-camp-stem' | 'community-outreach' | 'other';
export type CalendarEventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface CreateCalendarEventData {
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: CalendarEventType;
  status?: CalendarEventStatus;
  missionId?: string;
  location?: string;
}

export interface UpdateCalendarEventData {
  title?: string;
  description?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  type?: CalendarEventType;
  status?: CalendarEventStatus;
  missionId?: string;
  location?: string;
}

// ============================================
// Join Mission Application Types
// ============================================

export interface JoinMissionApplication {
  applicationId: string;
  // Student Details
  studentFirstName: string;
  studentMiddleName?: string;
  studentLastName: string;
  studentDob: string;
  schoolName: string;
  grade: string;
  studentAddressLine1: string;
  studentAddressLine2?: string;
  studentCity: string;
  studentState: string;
  studentZip: string;
  studentEmail: string;
  studentPhone?: string;
  studentSlack?: string;
  // Mission Selection
  missionId: string;
  missionRole?: string;
  shortBio?: string;
  fitReason: string;
  studentSignature: string;
  studentSignatureDate: string;
  // Parent Details
  parentFirstName: string;
  parentMiddleName?: string;
  parentLastName: string;
  parentAddressLine1: string;
  parentAddressLine2?: string;
  parentCity: string;
  parentState: string;
  parentZip: string;
  parentEmail: string;
  parentPhone: string;
  parentAlternateEmail?: string;
  // Agreements
  agreementFinancial: boolean;
  agreementPhotograph: boolean;
  agreementLiability: boolean;
  parentSignature: string;
  parentSignatureDate: string;
  // Application Status
  status: ApplicationStatus;
  reviewedBy?: string; // userId of admin who reviewed
  reviewedAt?: string;
  reviewNotes?: string;
  isDirectAssignment?: boolean; // Flag for admin direct assignments (skips validation)
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';

export interface CreateJoinMissionData {
  studentFirstName: string;
  studentMiddleName?: string;
  studentLastName: string;
  studentDob: string;
  schoolName: string;
  grade: string;
  studentAddressLine1: string;
  studentAddressLine2?: string;
  studentCity: string;
  studentState: string;
  studentZip: string;
  studentEmail: string;
  studentPhone?: string;
  studentSlack?: string;
  missionId: string;
  missionRole?: string;
  shortBio?: string;
  fitReason: string;
  studentSignature: string;
  studentSignatureDate: string;
  parentFirstName: string;
  parentMiddleName?: string;
  parentLastName: string;
  parentAddressLine1: string;
  parentAddressLine2?: string;
  parentCity: string;
  parentState: string;
  parentZip: string;
  parentEmail: string;
  parentPhone: string;
  parentAlternateEmail?: string;
  agreementFinancial: boolean;
  agreementPhotograph: boolean;
  agreementLiability: boolean;
  parentSignature: string;
  parentSignatureDate: string;
  isDirectAssignment?: boolean; // Flag for admin direct assignments (skips validation)
}

export interface UpdateApplicationStatusData {
  status: ApplicationStatus;
  reviewNotes?: string;
}

export interface UpdateJoinMissionApplicationData {
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentPhone?: string;
  missionRole?: string;
  shortBio?: string;
}
