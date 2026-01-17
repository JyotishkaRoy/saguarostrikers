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
// Competition Types
// ============================================

export interface Competition {
  competitionId: string;
  title: string;
  slug: string; // Never changes once created
  description: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  location: string;
  status: CompetitionStatus;
  imageUrl?: string;
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
}

export type CompetitionStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export interface SubEvent {
  subEventId: string;
  competitionId: string;
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
  competitionId: string;
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
  competitionId: string;
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
  competitionId?: string;
  status: PublishStatus;
  priority: Priority;
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type NoticeType = 'general' | 'competition';
export type PublishStatus = 'draft' | 'published' | 'unpublished';
export type Priority = 'low' | 'medium' | 'high';

// ============================================
// Site Content Types
// ============================================

export interface SiteContent {
  homepage: HomepageContent;
}

export interface HeroCTA {
  text: string;
  link: string;
  style: 'primary' | 'secondary';
}

export interface HomepageContent {
  heroImages: string[];
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCTAs?: HeroCTA[];
  aboutUs: string;
  vision: string;
  mission: string;
}

export interface BoardMember {
  boardMemberId: string;
  name: string;
  position: string;
  bio: string;
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
  respondedBy?: string; // userId
  respondedAt?: string;
  response?: string;
  createdAt: string;
}

export type MessageStatus = 'new' | 'responded' | 'archived';

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
  competitionId?: string;
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
  competitionId?: string;
  subEventId?: string;
  uploadedBy: string; // userId
  uploadedAt: string;
  isPublic: boolean; // Whether image is publicly accessible
  viewCount: number;
  tags?: string[];
}

export interface CreateFileData {
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: FileCategory;
  competitionId?: string;
  subEventId?: string;
  description?: string;
  isPublic?: boolean;
}

export interface CreateGalleryImageData {
  imageUrl: string;
  title: string;
  description?: string;
  competitionId?: string;
  subEventId?: string;
  isPublic?: boolean;
  tags?: string[];
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

export interface CreateCompetitionData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status?: CompetitionStatus;
  imageUrl?: string;
}

export interface UpdateCompetitionData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  status?: CompetitionStatus;
  imageUrl?: string;
}

export interface CreateTeamData {
  competitionId: string;
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
  competitionId?: string; // Optional link to competition
  location?: string;
  createdBy: string; // userId
  createdAt: string;
  updatedAt: string;
}

export type CalendarEventType = 'launch' | 'meeting' | 'competition' | 'deadline' | 'workshop' | 'other';
export type CalendarEventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface CreateCalendarEventData {
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: CalendarEventType;
  status?: CalendarEventStatus;
  competitionId?: string;
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
  competitionId?: string;
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
  missionId: string; // competitionId
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
}

export interface UpdateApplicationStatusData {
  status: ApplicationStatus;
  reviewNotes?: string;
}
