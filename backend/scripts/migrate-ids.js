const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Generate 12-digit alphanumeric ID
function generateShortId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  const randomBytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    id += chars[randomBytes[i] % chars.length];
  }
  return id;
}

// Data directory
const DATA_DIR = path.join(__dirname, '../../data');

// Map to store UUID -> ShortID mappings
const idMappings = new Map();

// Get or create a short ID for a UUID
function getShortId(uuid) {
  if (!uuid) return uuid;
  
  // If it's already a short ID (12 chars alphanumeric), return it
  if (uuid.length === 12 && /^[A-Za-z0-9]{12}$/.test(uuid)) {
    return uuid;
  }
  
  // If we've seen this UUID before, return the same short ID
  if (idMappings.has(uuid)) {
    return idMappings.get(uuid);
  }
  
  // Generate a new short ID and store the mapping
  const shortId = generateShortId();
  idMappings.set(uuid, shortId);
  return shortId;
}

// Recursively replace IDs in an object
function replaceIds(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => replaceIds(item));
  }
  
  if (obj && typeof obj === 'object') {
    const newObj = {};
    for (const [key, value] of Object.entries(obj)) {
      // Replace any field ending with 'Id' or named 'createdBy', 'uploadedBy', 'respondedBy', 'reviewedBy'
      if (
        (key.endsWith('Id') || 
         key === 'createdBy' || 
         key === 'uploadedBy' || 
         key === 'respondedBy' ||
         key === 'reviewedBy') &&
        typeof value === 'string'
      ) {
        newObj[key] = getShortId(value);
      } else if (typeof value === 'object') {
        newObj[key] = replaceIds(value);
      } else {
        newObj[key] = value;
      }
    }
    return newObj;
  }
  
  return obj;
}

// List of data files to process
const dataFiles = [
  'users.json',
  'missions.json',
  'subEvents.json',
  'teams.json',
  'teamMembers.json',
  'interests.json',
  'notices.json',
  'boardMembers.json',
  'contactMessages.json',
  'files.json',
  'galleries.json',
  'calendarEvents.json',
  'auditLogs.json',
  'joinMissionApplications.json',
  'discussions.json',
  'discussionReplies.json'
];

console.log('🔄 Starting ID migration to 12-digit alphanumeric format...\n');

// Process each file
dataFiles.forEach(filename => {
  const filePath = path.join(DATA_DIR, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Skipping ${filename} (file not found)`);
    return;
  }
  
  try {
    // Read the file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Replace IDs
    const updatedData = replaceIds(data);
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2));
    
    console.log(`✅ Migrated ${filename}`);
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
});

console.log('\n📊 ID Mapping Summary:');
console.log(`   Total UUIDs converted: ${idMappings.size}`);
console.log('\n✅ ID migration complete!');
console.log('\n💡 Sample mappings (first 5):');
let count = 0;
for (const [uuid, shortId] of idMappings.entries()) {
  if (count++ >= 5) break;
  console.log(`   ${uuid} → ${shortId}`);
}
