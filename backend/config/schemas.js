// Data schemas for validation and documentation

const UserSchema = {
  userId: 'string (UUID)',
  email: 'string (unique)',
  password: 'string (hashed)',
  firstName: 'string',
  lastName: 'string',
  role: 'enum: admin, user',
  status: 'enum: active, inactive',
  phone: 'string (optional)',
  createdAt: 'ISO datetime',
  updatedAt: 'ISO datetime',
  lastLogin: 'ISO datetime (optional)'
};

const CompetitionSchema = {
  competitionId: 'string (UUID)',
  title: 'string',
  slug: 'string (unique, auto-generated from title)',
  description: 'string',
  startDate: 'ISO date',
  endDate: 'ISO date',
  location: 'string',
  status: 'enum: draft, published, completed, cancelled',
  imageUrl: 'string (optional)',
  createdBy: 'string (userId)',
  createdAt: 'ISO datetime',
  updatedAt: 'ISO datetime'
};

const SubEventSchema = {
  subEventId: 'string (UUID)',
  competitionId: 'string (foreign key)',
  title: 'string',
  description: 'string',
  eventDate: 'ISO date',
  status: 'enum: draft, published, completed',
  createdAt: 'ISO datetime',
  updatedAt: 'ISO datetime'
};

const TeamSchema = {
  teamId: 'string (UUID)',
  competitionId: 'string (foreign key)',
  teamName: 'string',
  description: 'string',
  createdBy: 'string (userId)',
  createdAt: 'ISO datetime',
  updatedAt: 'ISO datetime'
};

const TeamMemberSchema = {
  memberId: 'string (UUID)',
  teamId: 'string (foreign key)',
  userId: 'string (foreign key)',
  role: 'string (e.g., Team Lead, Member)',
  joinedAt: 'ISO datetime'
};

const InterestSchema = {
  interestId: 'string (UUID)',
  userId: 'string (foreign key)',
  competitionId: 'string (foreign key)',
  message: 'string (optional)',
  status: 'enum: pending, assigned, rejected',
  createdAt: 'ISO datetime'
};

const NoticeSchema = {
  noticeId: 'string (UUID)',
  title: 'string',
  content: 'string',
  type: 'enum: general, competition',
  competitionId: 'string (foreign key, optional)',
  status: 'enum: draft, published, unpublished',
  priority: 'enum: low, medium, high',
  createdBy: 'string (userId)',
  createdAt: 'ISO datetime',
  updatedAt: 'ISO datetime',
  publishedAt: 'ISO datetime (optional)'
};

const BoardMemberSchema = {
  boardMemberId: 'string (UUID)',
  name: 'string',
  position: 'string',
  bio: 'string',
  imageUrl: 'string (optional)',
  order: 'number',
  status: 'enum: active, inactive',
  createdAt: 'ISO datetime',
  updatedAt: 'ISO datetime'
};

const ContactMessageSchema = {
  messageId: 'string (UUID)',
  name: 'string',
  email: 'string',
  subject: 'string',
  message: 'string',
  status: 'enum: new, responded, archived',
  respondedBy: 'string (userId, optional)',
  respondedAt: 'ISO datetime (optional)',
  response: 'string (optional)',
  createdAt: 'ISO datetime'
};

const FileSchema = {
  fileId: 'string (UUID)',
  fileName: 'string',
  originalName: 'string',
  filePath: 'string',
  fileType: 'string',
  fileSize: 'number',
  category: 'enum: project, document, other',
  competitionId: 'string (foreign key, optional)',
  subEventId: 'string (foreign key, optional)',
  uploadedBy: 'string (userId)',
  uploadedAt: 'ISO datetime',
  description: 'string (optional)'
};

const GallerySchema = {
  galleryId: 'string (UUID)',
  imageUrl: 'string',
  title: 'string',
  description: 'string (optional)',
  competitionId: 'string (foreign key, optional)',
  subEventId: 'string (foreign key, optional)',
  uploadedBy: 'string (userId)',
  uploadedAt: 'ISO datetime'
};

const AuditLogSchema = {
  logId: 'string (UUID)',
  userId: 'string (foreign key)',
  action: 'string',
  entity: 'string',
  entityId: 'string',
  changes: 'object',
  ipAddress: 'string',
  userAgent: 'string',
  timestamp: 'ISO datetime'
};

module.exports = {
  UserSchema,
  CompetitionSchema,
  SubEventSchema,
  TeamSchema,
  TeamMemberSchema,
  InterestSchema,
  NoticeSchema,
  BoardMemberSchema,
  ContactMessageSchema,
  FileSchema,
  GallerySchema,
  AuditLogSchema
};

