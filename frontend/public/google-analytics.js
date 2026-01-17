// Google Analytics 4 Configuration
// Replace 'G-XXXXXXXXXX' with your actual GA4 Measurement ID

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// Initialize GA4 with your measurement ID
// To get your ID: https://analytics.google.com/ > Admin > Data Streams
gtag('config', 'G-XXXXXXXXXX', {
  page_path: window.location.pathname,
  send_page_view: true
});

// Custom event tracking helpers
window.trackEvent = function(eventName, eventParams) {
  gtag('event', eventName, eventParams);
};

// Track file downloads
window.trackDownload = function(fileName) {
  gtag('event', 'file_download', {
    file_name: fileName,
    event_category: 'engagement'
  });
};

// Track application submissions
window.trackApplicationSubmit = function(missionName) {
  gtag('event', 'application_submit', {
    mission_name: missionName,
    event_category: 'conversion'
  });
};

// Track gallery views
window.trackGalleryView = function(imageTitle) {
  gtag('event', 'gallery_view', {
    image_title: imageTitle,
    event_category: 'engagement'
  });
};

// Track calendar event clicks
window.trackCalendarEvent = function(eventType) {
  gtag('event', 'calendar_event_click', {
    event_type: eventType,
    event_category: 'engagement'
  });
};

console.log('✅ Google Analytics initialized');
