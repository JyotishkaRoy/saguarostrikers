# Quick Start Guide

Get your Rocketry Competition Platform up and running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

### 2. Configure Environment
Create `.env` file in root directory:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=my_super_secret_jwt_key_123
JWT_EXPIRE=7d
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=your_email@gmail.com
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
CLIENT_URL=http://localhost:3000
DEFAULT_ADMIN_EMAIL=admin@rocketry.org
DEFAULT_ADMIN_PASSWORD=Admin@123
```

### 3. Initialize Database
```bash
node backend/utils/initialSetup.js
```

### 4. Start Development Servers

**Option A - Both servers in one terminal:**
```bash
npm run dev:full
```

**Option B - Separate terminals:**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
npm run client
```

### 5. Access the Application
- **Website**: http://localhost:3000
- **API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

### 6. Login as Admin
- **Email**: admin@rocketry.org
- **Password**: Admin@123

**⚠️ Change this password immediately!**

## 📋 Quick Feature Checklist

### As Admin
- [ ] Login to admin dashboard
- [ ] Change default password
- [ ] Edit site content (About, Vision, Mission)
- [ ] Add board members
- [ ] Create a competition
- [ ] Publish the competition
- [ ] Create sub-events
- [ ] Upload files and images

### As User
- [ ] Register new account
- [ ] Login
- [ ] Browse competitions
- [ ] Show interest in a competition
- [ ] View your dashboard

### Testing Public Pages
- [ ] Visit homepage
- [ ] View competitions page
- [ ] Check about page
- [ ] Submit contact form

## 🔧 Common Commands

```bash
# Install all dependencies
npm run install-all

# Run backend only
npm run dev

# Run frontend only
npm run client

# Run both (recommended)
npm run dev:full

# Build frontend for production
cd frontend && npm run build

# Start production server
npm start

# Re-initialize database
node backend/utils/initialSetup.js
```

## 📝 Project Structure Quick Reference

```
SaguaroStrikers/
├── backend/
│   ├── controllers/    # Handle HTTP requests
│   ├── services/       # Business logic
│   ├── dataHelpers/    # Database operations
│   ├── middleware/     # Auth, validation, etc.
│   ├── routes/         # API routes
│   └── server.js       # Main server
├── frontend/
│   └── src/
│       ├── pages/      # React pages
│       ├── components/ # Reusable components
│       ├── context/    # React context (Auth)
│       └── utils/      # API client
├── data/               # JSON database files
└── uploads/            # Uploaded files
```

## 🎯 Development Workflow

### Creating New Features

1. **Add Data Helper** (if needed)
   - Create in `backend/dataHelpers/`
   - Handle database operations only

2. **Add Service**
   - Create in `backend/services/`
   - Implement business logic
   - Transform data (snake_case ↔ camelCase)
   - Add audit logging

3. **Add Controller**
   - Create in `backend/controllers/`
   - Handle HTTP requests/responses
   - Use service layer only

4. **Add Routes**
   - Add to appropriate route file
   - Apply middleware (auth, validation)

5. **Update Frontend**
   - Add API calls in `utils/api.js`
   - Create/update React components
   - Add routing if needed

### Testing Flow

1. **Test Backend API**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Test Authentication**
   - Login through frontend
   - Check browser localStorage for token

3. **Test Admin Features**
   - Login as admin
   - Try creating competition
   - Check audit logs

4. **Test User Features**
   - Register new user
   - Show interest
   - Check dashboard

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>
```

### Frontend won't start
```bash
# Check if port 3000 is in use
lsof -i :3000

# Clear node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Database issues
```bash
# Re-initialize database
node backend/utils/initialSetup.js

# Check data files exist
ls -la data/
```

### Email not working
1. Enable 2FA on Gmail
2. Generate App Password
3. Use App Password in `.env`
4. Don't use your actual Gmail password

## 📚 Next Steps

1. **Customize Design**
   - Edit `frontend/src/index.css` for global styles
   - Modify color variables in `:root`

2. **Add Your Content**
   - Login as admin
   - Edit site content
   - Add board members
   - Create competitions

3. **Configure Email**
   - Set up Gmail app password
   - Test contact form
   - Test admin responses

4. **Deploy**
   - Choose hosting provider
   - Set environment variables
   - Build frontend
   - Start server

## 🎉 You're Ready!

Your Rocketry Competition Platform is now running. Start by:
1. Logging in as admin
2. Customizing site content
3. Creating your first competition
4. Inviting users to register

For detailed documentation, see `README.md`

---

**Happy Building! 🚀**

