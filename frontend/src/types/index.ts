// Frontend type definitions for Saguaro Strikers

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  phone?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Mission {
  missionId: string;
  title: string;
  slug: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'in-progress' | 'completed' | 'cancelled' | 'archived';
  imageUrl?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubEvent {
  subEventId: string;
  missionId: string;
  title: string;
  description: string;
  eventDate: string;
  status: 'draft' | 'published' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  teamId: string;
  missionId: string;
  teamName: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  eventId: string;
  title: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'launch' | 'meeting' | 'mission' | 'deadline' | 'workshop' | 'other';
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  missionId?: string;
  location?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  memberId: string;
  teamId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user?: User;
}

export interface Interest {
  interestId: string;
  userId: string;
  missionId: string;
  message?: string;
  status: 'pending' | 'assigned' | 'rejected';
  createdAt: string;
}

export interface Notice {
  noticeId: string;
  title: string;
  content: string;
  type: 'general' | 'mission';
  missionId?: string;
  status: 'draft' | 'published' | 'unpublished';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
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

export interface ContactMessage {
  messageId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'responded' | 'archived';
  respondedBy?: string;
  respondedAt?: string;
  response?: string;
  createdAt: string;
}

export interface FileUpload {
  fileId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  category: 'project' | 'document' | 'other';
  missionId?: string;
  subEventId?: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

export interface GalleryImage {
  galleryId: string;
  imageUrl: string;
  title: string;
  description?: string;
  missionId?: string;
  subEventId?: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface MissionArtifact {
  artifactId: string;
  missionId: string;
  description: string;
  fileName: string;
  originalFileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  status: 'draft' | 'published' | 'unpublished';
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface FeaturedVideo {
  id?: string;
  title: string;
  url: string;
  thumbnail?: string;
}

export interface HomepageContent {
  heroImages: string[];
  aboutUs: string;
  vision: string;
  mission: string;
  missionCommanderMessage?: string;
  missionCommanderName?: string;
  missionCommanderTitle?: string;
  missionCommanderImage?: string;
  featuredVideos?: FeaturedVideo[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any[];
}

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
