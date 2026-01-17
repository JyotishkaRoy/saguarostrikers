const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database file paths
const DB_FILES = {
  USERS: path.join(DATA_DIR, 'users.json'),
  COMPETITIONS: path.join(DATA_DIR, 'competitions.json'),
  SUB_EVENTS: path.join(DATA_DIR, 'subEvents.json'),
  TEAMS: path.join(DATA_DIR, 'teams.json'),
  TEAM_MEMBERS: path.join(DATA_DIR, 'teamMembers.json'),
  INTERESTS: path.join(DATA_DIR, 'interests.json'),
  NOTICES: path.join(DATA_DIR, 'notices.json'),
  SITE_CONTENT: path.join(DATA_DIR, 'siteContent.json'),
  BOARD_MEMBERS: path.join(DATA_DIR, 'boardMembers.json'),
  CONTACT_MESSAGES: path.join(DATA_DIR, 'contactMessages.json'),
  FILES: path.join(DATA_DIR, 'files.json'),
  GALLERIES: path.join(DATA_DIR, 'galleries.json'),
  AUDIT_LOGS: path.join(DATA_DIR, 'auditLogs.json')
};

// Initialize database files with empty arrays if they don't exist
const initializeDatabase = () => {
  Object.values(DB_FILES).forEach(filePath => {
    if (!fs.existsSync(filePath)) {
      const initialData = filePath.includes('siteContent.json') 
        ? {
            homepage: {
              heroImages: [],
              aboutUs: '',
              vision: '',
              mission: ''
            }
          }
        : [];
      fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
    }
  });
};

// Read from JSON file
const readDB = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return filePath.includes('siteContent.json') ? { homepage: { heroImages: [], aboutUs: '', vision: '', mission: '' } } : [];
  }
};

// Write to JSON file
const writeDB = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error.message);
    return false;
  }
};

// Create backup
const createBackup = () => {
  const backupDir = path.join(DATA_DIR, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup_${timestamp}`);
  fs.mkdirSync(backupPath, { recursive: true });
  
  Object.entries(DB_FILES).forEach(([key, filePath]) => {
    if (fs.existsSync(filePath)) {
      const fileName = path.basename(filePath);
      fs.copyFileSync(filePath, path.join(backupPath, fileName));
    }
  });
  
  return backupPath;
};

module.exports = {
  DB_FILES,
  DATA_DIR,
  initializeDatabase,
  readDB,
  writeDB,
  createBackup
};

