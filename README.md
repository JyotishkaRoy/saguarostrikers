# Rocketry Mission Platform

A modern, full-featured web platform for managing rocketry missions, building teams, and connecting enthusiasts. Built with a strict multi-tier architecture, comprehensive audit logging, and modern UI/UX.

## 🚀 Features

### Public Features
- **Modern Homepage** with hero section, features, and upcoming events
- **Mission Browsing** - View all published missions
- **About Us Page** - Organization information, vision, mission, and board members
- **Contact Form** - Public can send messages to administrators
- **Responsive Design** - Works beautifully on all devices

### User Features
- **User Registration & Login** - Secure authentication with JWT
- **Show Interest** - Express interest in missions
- **Team Management** - View assigned teams and team members
- **Mission Dashboard** - Track interested missions and their status
- **File Access** - Download project files and view galleries for missions
- **Sub-Event Tracking** - View and track mission sub-events

### Admin Features
- **Mission Management**
  - Create, edit, publish, and delete missions
  - Manage sub-events for each mission
  - View interested users for each mission
  - Track mission status (draft, published, completed, cancelled)

- **Team Building**
  - Create teams for missions
  - Add/remove team members from interested users
  - Assign roles to team members
  - Send emails to entire teams

- **User Management**
  - Create, update, and delete users
  - Activate/deactivate user accounts
  - View user details and activity

- **Notice Management**
  - Create and publish public notices
  - Set notice priority (low, medium, high)
  - Link notices to specific missions
  - Publish/unpublish notices

- **Site Content Management**
  - Edit homepage content (About Us, Vision, Mission)
  - Manage hero images
  - Update board member profiles with images

- **Contact Message Management**
  - View all contact form submissions
  - Respond to messages via Gmail integration
  - Archive and delete messages

- **File Management**
  - Upload files for missions and sub-events
  - Organize files by category
  - Upload gallery images
  - Delete files and images

- **Audit Logging**
  - Comprehensive logging of all system activities
  - Track user actions, IP addresses, and changes
  - Filter logs by user, entity, action, or date range
  - Export logs for compliance

## 🏗️ Architecture

The application follows a **strict multi-tier architecture**:

### Backend Architecture
```
Controllers (API Layer)
    ↓
Services (Business Logic)
    ↓
Data Helpers (Data Access)
    ↓
JSON Files (Data Storage)
```

#### Multi-Tier Principles
- **Controllers** handle HTTP requests/responses and validation
- **Services** contain all business logic and data transformation
- **Data Helpers** handle database operations only
- **No direct database access** from controllers
- **Audit logging** integrated at service layer

### Directory Structure
```
SaguaroStrikers/
├── backend/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── schemas.js            # Data schemas
│   ├── controllers/
│   │   ├── admin/                # Admin controllers
│   │   │   ├── missionAdminController.js
│   │   │   ├── teamAdminController.js
│   │   │   ├── userAdminController.js
│   │   │   ├── noticeAdminController.js
│   │   │   ├── siteContentAdminController.js
│   │   │   ├── contactAdminController.js
│   │   │   ├── fileAdminController.js
│   │   │   └── auditLogAdminController.js
│   │   └── portal/               # Portal controllers
│   │       ├── authController.js
│   │       ├── missionController.js
│   │       ├── fileController.js
│   │       └── publicController.js
│   ├── dataHelpers/              # Data access layer
│   │   ├── userDataHelper.js
│   │   ├── missionDataHelper.js
│   │   ├── subEventDataHelper.js
│   │   ├── teamDataHelper.js
│   │   ├── interestDataHelper.js
│   │   ├── noticeDataHelper.js
│   │   ├── siteContentDataHelper.js
│   │   ├── boardMemberDataHelper.js
│   │   ├── contactMessageDataHelper.js
│   │   ├── fileDataHelper.js
│   │   └── auditLogDataHelper.js
│   ├── middleware/               # Middleware
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── routes/                   # API routes
│   │   ├── admin/                # Admin routes
│   │   ├── authRoutes.js
│   │   ├── publicRoutes.js
│   │   └── userRoutes.js
│   ├── services/                 # Business logic layer
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── missionService.js
│   │   ├── subEventService.js
│   │   ├── teamService.js
│   │   ├── interestService.js
│   │   ├── noticeService.js
│   │   ├── siteContentService.js
│   │   ├── contactService.js
│   │   ├── fileService.js
│   │   ├── emailService.js
│   │   └── auditLogService.js
│   ├── utils/
│   │   └── initialSetup.js       # Initial setup script
│   └── server.js                 # Main server file
├── data/                         # JSON database files
│   ├── users.json
│   ├── missions.json
│   ├── subEvents.json
│   ├── teams.json
│   ├── teamMembers.json
│   ├── interests.json
│   ├── notices.json
│   ├── siteContent.json
│   ├── boardMembers.json
│   ├── contactMessages.json
│   ├── files.json
│   ├── galleries.json
│   └── auditLogs.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/           # Reusable components
│       │   ├── Navbar.js
│       │   ├── Footer.js
│       │   ├── LoadingSpinner.js
│       │   ├── PrivateRoute.js
│       │   └── AdminRoute.js
│       ├── context/              # React context
│       │   └── AuthContext.js
│       ├── pages/                # Page components
│       │   ├── admin/            # Admin pages
│       │   ├── auth/             # Auth pages
│       │   ├── public/           # Public pages
│       │   └── user/             # User pages
│       ├── utils/
│       │   └── api.js            # API client
│       ├── App.js
│       └── index.js
└── uploads/                      # File uploads directory
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service (Gmail integration)
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting
- **UUID** - Unique ID generation

### Frontend
- **React 18** - UI library
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Icons** - Icon library
- **React Toastify** - Notifications
- **Recharts** - Charts (optional)

### Data Storage
- **JSON Files** - Lightweight, file-based storage
- **Auto-backup** - Automatic data backups

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
```bash
cd SaguaroStrikers
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

4. **Configure environment variables**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_strong_jwt_secret_here_change_me
JWT_EXPIRE=7d

# Email Configuration (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=your_email@gmail.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
CLIENT_URL=http://localhost:3000

# Admin Default Credentials
DEFAULT_ADMIN_EMAIL=admin@rocketry.org
DEFAULT_ADMIN_PASSWORD=Admin@123
```

**Important**: For Gmail integration:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App-Specific Password
3. Use the app password in `EMAIL_PASSWORD`

5. **Run initial setup**
```bash
node backend/utils/initialSetup.js
```

This will:
- Initialize all database files
- Create default admin user
- Set up default site content

## 🚀 Running the Application

### Development Mode

**Option 1: Run backend and frontend separately**

Terminal 1 (Backend):
```bash
npm run dev
```

Terminal 2 (Frontend):
```bash
npm run client
```

**Option 2: Run both concurrently**
```bash
npm run dev:full
```

### Production Mode

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Start server:
```bash
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔐 Default Credentials

After running the initial setup:

**Admin Account**
- Email: `admin@rocketry.org`
- Password: `Admin@123`

**⚠️ IMPORTANT**: Change the admin password immediately after first login!

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Public Endpoints

#### Get Homepage Content
```http
GET /api/public/homepage
```

#### Get Missions
```http
GET /api/public/missions
GET /api/public/missions/upcoming
GET /api/public/missions/:slug
```

#### Contact Form
```http
POST /api/public/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about mission",
  "message": "Your message here"
}
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
}
```

### User Endpoints (Requires Authentication)

All user endpoints require `Authorization: Bearer <token>` header

#### Show Interest in Mission
```http
POST /api/user/interests
Content-Type: application/json
Authorization: Bearer <token>

{
  "missionId": "uuid",
  "message": "Optional message"
}
```

#### Get My Interests
```http
GET /api/user/interests
Authorization: Bearer <token>
```

#### Get My Teams
```http
GET /api/user/teams
Authorization: Bearer <token>
```

### Admin Endpoints (Requires Admin Role)

All admin endpoints require `Authorization: Bearer <admin_token>` header

#### Mission Management
```http
GET    /api/admin/missions
POST   /api/admin/missions
PUT    /api/admin/missions/:id
DELETE /api/admin/missions/:id
POST   /api/admin/missions/:id/publish
GET    /api/admin/missions/:id/interests
```

#### Team Management
```http
POST   /api/admin/teams
GET    /api/admin/teams/:id
PUT    /api/admin/teams/:id
DELETE /api/admin/teams/:id
POST   /api/admin/teams/:teamId/members
DELETE /api/admin/members/:memberId
POST   /api/admin/teams/:teamId/send-email
```

#### User Management
```http
GET    /api/admin/users
POST   /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
PATCH  /api/admin/users/:id/status
```

## 🗄️ Data Schema

### User Schema
```json
{
  "userId": "UUID",
  "email": "string",
  "password": "hashed_string",
  "firstName": "string",
  "lastName": "string",
  "role": "admin|user",
  "status": "active|inactive",
  "phone": "string",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime",
  "lastLogin": "ISO datetime"
}
```

### Mission Schema
```json
{
  "missionId": "UUID",
  "title": "string",
  "slug": "string (unique, never changes)",
  "description": "string",
  "startDate": "ISO date",
  "endDate": "ISO date",
  "location": "string",
  "status": "draft|published|completed|cancelled",
  "imageUrl": "string",
  "createdBy": "userId",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime"
}
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt with salt rounds
- **Input Validation** - Express-validator for all inputs
- **Rate Limiting** - Prevent abuse
- **Helmet** - Security headers
- **CORS Configuration** - Controlled cross-origin access
- **Audit Logging** - Track all system activities
- **Role-Based Access Control** - Admin and user roles
- **SQL Injection Prevention** - No SQL, JSON-based storage

## 📊 Audit Logging

All admin actions are logged with:
- User ID
- Action performed
- Entity affected
- Changes made
- IP address
- User agent
- Timestamp

Access audit logs:
```http
GET /api/admin/audit/logs
GET /api/admin/audit/logs/recent?limit=100
GET /api/admin/audit/logs/user/:userId
GET /api/admin/audit/logs/date-range?startDate=2024-01-01&endDate=2024-12-31
```

## 🎨 Design Features

- **Modern UI** - Clean, professional design
- **Gradient Backgrounds** - Eye-catching visuals
- **Responsive Layout** - Mobile-first approach
- **Smooth Animations** - Enhanced UX
- **Toast Notifications** - Real-time feedback
- **Loading States** - User-friendly loading indicators
- **Icon Integration** - React Icons throughout

## 🤝 Contributing

This is a standalone project. For modifications:

1. Follow the existing architecture patterns
2. Maintain multi-tier separation
3. Add audit logging for admin actions
4. Update this README for major changes

## 📝 License

MIT License - Feel free to use this project for learning or personal use.

## 🐛 Troubleshooting

### Common Issues

**Issue**: Cannot connect to backend
- **Solution**: Ensure backend is running on port 5000
- Check `.env` configuration
- Verify no other service is using port 5000

**Issue**: Email not sending
- **Solution**: Verify Gmail app password is correct
- Ensure 2FA is enabled on Gmail account
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`

**Issue**: File upload fails
- **Solution**: Check `uploads/` directory exists
- Verify `MAX_FILE_SIZE` in `.env`
- Ensure file type is allowed

**Issue**: Admin can't login
- **Solution**: Run initial setup script again
- Check `data/users.json` for admin user
- Verify JWT_SECRET is set

## 📞 Support

For issues or questions:
1. Check this README thoroughly
2. Review the code comments
3. Check audit logs for error tracking

## 🎯 Roadmap

Potential future enhancements:
- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Mobile app (React Native)
- [ ] Advanced search and filters
- [ ] Document version control
- [ ] Calendar integration
- [ ] Video conferencing integration
- [ ] Payment gateway for mission fees

---

**Built with ❤️ for the rocketry community**

