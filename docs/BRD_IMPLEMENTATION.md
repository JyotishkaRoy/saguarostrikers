# Saguaro Strikers - BRD Implementation Plan

## 📋 Requirements Extracted from BRD

### Basic Details
- **Domain**: www.saguarostrikers.org
- **Email**: info@saguarostrikers.org
- **Security**: SSL certificate
- **Analytics**: Google Analytics 4 integration
- **Text Areas**: Rich Text Editor (RTE) support

### Site Structure

#### 1. **Home** (Landing Page)
- 2-column layout (60% / 40%)
- Column 1: Editable text content (Admin)
- Column 2: Video carousel with player
- Header: Logo + Menu + User login/icon + Banner carousel (25% height)
- Footer: Editable content (10% height)

#### 2. **Know the Strikers**
- **Mission Statement from Mission Commander**
  - 2-column layout (60% / 40%)
  - Column 1: Editable text
  - Column 2: Editable image
  
- **Mission Leaders**
  - Grid layout (max 3 per row)
  - Each leader: Name, Photo, Designation, Email
  - Click photo → Flip card with bio

#### 3. **Missions** (Dynamic sub-menus)
- **[Mission Name]** (e.g., American Rocketry Challenge 2026)
  - **Mission Overview**: 2-column (60%/40%) with text + video carousel
  - **Mission Scientists**: Grid layout with team members
  - **Mission Artifacts**: Table with downloadable files
  - **Mission Gallery**: Photo/video gallery (no download/copy)

#### 4. **Mission Calendar**
- Month-wise calendar starting Jan 2026
- Admin can add/edit/delete events
- Users click events → Layover with description

#### 5. **Join a Mission?**
- Form based on "Joining Form Template.docx"
- Email notifications to Admin, Student, and Parent
- Admin approval/denial workflow

#### 6. **Future Explorers' Program** (Dynamic)
- Row 1: 2-column (60%/40%) - Text + Image carousel
- Row 2: Full-width rich text area

#### 7. **Reach Mission Control**
- Contact form (like Sanhoti)
- Email to info@saguarostrikers.org

#### 8. **Discussion Board** (Optional)
- Thread listing
- Admin initiates threads
- Anyone can reply (with name)

### Analytics Requirements
- Google Analytics 4 integration
- Track: Visits, Duration, Bounce Rate, Time on Page, Page Views

## 🎯 Implementation Status

### ✅ Already Implemented (Core Architecture)
- TypeScript backend with Express
- React frontend with Vite + TypeScript
- Authentication & Authorization
- Mission management (can be adapted for Missions)
- Team management (can be adapted for Mission Scientists)
- File uploads (for artifacts)
- Contact form
- Admin panel structure

### 🔨 To Implement (BRD-Specific Features)

#### High Priority
1. ✅ Copy banner images and logo to public folder
2. 🔨 Update Navbar with logo and banner carousel
3. 🔨 Implement Homepage with 2-column layout + video carousel
4. 🔨 Create Mission Leaders page with flip cards
5. 🔨 Adapt Mission pages for Mission structure
6. 🔨 Implement Mission Calendar
7. 🔨 Create Join a Mission form with email workflow
8. 🔨 Implement Future Explorers' Program page
9. 🔨 Add Discussion Board
10. 🔨 Integrate Google Analytics 4

#### Medium Priority
- Rich Text Editor integration (TinyMCE or Quill)
- Video upload and carousel component
- Image carousel component
- Mission Gallery with protection
- Flip card animations

#### Low Priority
- Advanced calendar features
- Discussion board moderation
- Enhanced analytics dashboard

## 📝 Mapping BRD to Current Structure

| BRD Requirement | Current Implementation | Adaptation Needed |
|----------------|----------------------|-------------------|
| Missions | Missions | Rename, add Mission-specific fields |
| Mission Scientists | Team Members | Adapt for Scientists with bio |
| Mission Artifacts | File Uploads | Add table view for artifacts |
| Mission Leaders | Board Members | Add flip card feature |
| Join a Mission | Interest Form | Enhance with parent email, approval workflow |
| Mission Calendar | New Feature | Build calendar component |
| Future Explorers | New Feature | Build program page |
| Discussion Board | New Feature | Build forum system |

## 🚀 Implementation Approach

### Phase 1: Core UI Updates (Current)
1. Update branding (logo, banners)
2. Implement homepage layout
3. Add video carousel component
4. Create Mission Leaders page

### Phase 2: Mission Management
1. Adapt Mission → Mission
2. Add Mission Scientists
3. Implement Mission Artifacts view
4. Create Mission Gallery

### Phase 3: Forms & Workflows
1. Build Join a Mission form
2. Implement email notifications
3. Add approval workflow
4. Create Future Explorers page

### Phase 4: Community Features
1. Build Mission Calendar
2. Implement Discussion Board
3. Add Google Analytics

### Phase 5: Polish & Enhancement
1. Rich Text Editor integration
2. Advanced animations
3. Performance optimization
4. SEO optimization

## 📦 Assets Copied
- ✅ Banner images (6 images) → `/frontend/public/images/banners/`
- ✅ Logo → `/frontend/public/images/logo/`
- ✅ Joining Form Template (reference)

## 🎨 Design Specifications from BRD
- Header height: ~25% of page
- Footer height: ~10% of page
- 2-column layouts: 60% / 40% split
- Grid layouts: Max 3 items per row
- All text areas: Rich Text Editor support
- Immediate publish on admin changes

## 🔧 Technical Requirements
- SSL certificate (deployment)
- Google Analytics 4 integration
- Email service (Nodemailer already configured)
- Video hosting (YouTube embed or self-hosted)
- Image protection for gallery
- Backup strategy for data

---

**Status**: BRD analyzed, assets copied, implementation plan created
**Next**: Implement Phase 1 - Core UI Updates
