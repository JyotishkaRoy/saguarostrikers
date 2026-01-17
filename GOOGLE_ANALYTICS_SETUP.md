# 📊 Google Analytics 4 Setup Guide

## Setup Instructions

### 1. Create GA4 Property
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Admin" (bottom left gear icon)
3. Click "Create Property"
4. Enter property name: "Saguaro Strikers"
5. Select timezone and currency
6. Click "Next"

### 2. Get Your Measurement ID
1. In Admin > Property Settings > Data Streams
2. Click "Add stream" > "Web"
3. Enter your website URL: `https://yourdomain.com`
4. Enter stream name: "Saguaro Strikers Website"
5. Click "Create stream"
6. **Copy your Measurement ID** (format: G-XXXXXXXXXX)

### 3. Add Measurement ID to Website
Replace `G-XXXXXXXXXX` in these files with your actual ID:

**File 1**: `frontend/index.html`
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-ID-HERE"></script>
```

**File 2**: `frontend/public/google-analytics.js`
```javascript
gtag('config', 'G-YOUR-ID-HERE', {
  page_path: window.location.pathname,
  send_page_view: true
});
```

### 4. Verify Installation
1. Visit your website
2. Open Chrome DevTools (F12) > Console
3. Look for: "✅ Google Analytics initialized"
4. In GA4, go to Reports > Realtime
5. You should see your visit in real-time!

---

## 📈 What's Being Tracked

### Automatic Tracking
- ✅ **Page Views**: Every page visit
- ✅ **Sessions**: User sessions with duration
- ✅ **User Demographics**: Location, device, browser
- ✅ **Traffic Sources**: Where users come from
- ✅ **Bounce Rate**: Single-page visits
- ✅ **Engagement Time**: Time spent on site

### Custom Events (Already Implemented)
- 🎯 **File Downloads**: Track which files users download
- 🎯 **Application Submissions**: Track mission applications
- 🎯 **Gallery Views**: Track image/video views
- 🎯 **Calendar Events**: Track event clicks
- 🎯 **Navigation**: Track menu clicks

---

## 🔍 Custom Event Usage

The following custom tracking is already integrated:

### 1. File Downloads
```typescript
// Automatically tracked when users download files
window.trackDownload('Mission_Guidelines.pdf');
```

### 2. Application Submissions
```typescript
// Tracked when join mission form is submitted
window.trackApplicationSubmit('NASA USLI 2024');
```

### 3. Gallery Views
```typescript
// Tracked when users view images in gallery
window.trackGalleryView('Rocket Launch Photo');
```

### 4. Calendar Events
```typescript
// Tracked when users click calendar events
window.trackCalendarEvent('Competition');
```

---

## 📊 Key Reports to Monitor

### Acquisition Reports
- **Traffic acquisition**: Where users come from
- **User acquisition**: New vs returning users

### Engagement Reports
- **Pages and screens**: Most visited pages
- **Events**: Custom event tracking
- **Conversions**: Application submissions

### User Reports
- **User attributes**: Demographics
- **Tech details**: Devices, browsers, OS

### Retention Reports
- **User engagement**: Active users over time
- **User lifetime**: How long users stay engaged

---

## 🎯 Recommended Goals

Set up these conversions in GA4:

1. **Application Submission** (High Priority)
   - Event: `application_submit`
   - Mark as conversion

2. **File Download** (Medium Priority)
   - Event: `file_download`
   - Mark as conversion

3. **Contact Form** (Medium Priority)
   - Event: `contact_submit`
   - Mark as conversion

---

## 🔐 Privacy Compliance

### GDPR/CCPA Compliance
The current implementation is privacy-friendly:
- ✅ No personally identifiable information collected
- ✅ IP anonymization can be enabled
- ✅ Cookie consent can be added if needed

### Optional: Add Cookie Consent
If required by your jurisdiction, add a cookie consent banner before GA loads.

---

## 🚀 Advanced Features (Optional)

### Enhanced Ecommerce (Future)
If you add paid features:
- Track purchases
- Track registration fees
- Product analytics

### User ID Tracking (Future)
Track logged-in users across devices:
```javascript
gtag('config', 'G-XXXXXXXXXX', {
  'user_id': 'USER_12345'
});
```

### Custom Dimensions (Future)
Track user roles:
```javascript
gtag('event', 'page_view', {
  'user_role': 'admin' // or 'user'
});
```

---

## 📱 Mobile App Tracking (Future)

If you build a mobile app, use Firebase Analytics:
- iOS: Firebase SDK
- Android: Firebase SDK
- Links to same GA4 property

---

## ✅ Testing Checklist

- [ ] Replaced measurement ID in both files
- [ ] Deployed to production
- [ ] Visited website
- [ ] Checked browser console for GA confirmation
- [ ] Verified real-time tracking in GA4
- [ ] Tested custom events (download, application, etc.)
- [ ] Set up conversion goals
- [ ] Shared access with team members

---

## 🆘 Troubleshooting

### Not Seeing Data?
1. **Check Measurement ID**: Ensure it's correct in both files
2. **Check Console**: Open DevTools, look for GA errors
3. **Ad Blockers**: Disable them for testing
4. **Wait 24 Hours**: Some reports take time to populate

### Events Not Tracking?
1. Check browser console for errors
2. Test in Incognito mode
3. Verify event names match GA4 expectations
4. Check DebugView in GA4 (Admin > DebugView)

---

## 📚 Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Setup Guide](https://support.google.com/analytics/answer/9304153)
- [Custom Events](https://support.google.com/analytics/answer/12229021)
- [Conversion Tracking](https://support.google.com/analytics/answer/12844695)

---

**Status**: ✅ Implemented and ready to configure with your Measurement ID
