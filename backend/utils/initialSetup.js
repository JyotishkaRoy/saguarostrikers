require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { initializeDatabase, writeDB, DB_FILES } = require('../config/database');

// Initial setup script to create default admin user
async function initialSetup() {
  console.log('Starting initial setup...');
  
  // Initialize database files
  initializeDatabase();
  console.log('✓ Database files initialized');

  // Create default admin user
  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@rocketry.org';
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';

  const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);

  const adminUser = {
    userId: uuidv4(),
    email: defaultAdminEmail,
    password: hashedPassword,
    firstName: 'System',
    lastName: 'Administrator',
    phone: '',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  writeDB(DB_FILES.USERS, [adminUser]);
  console.log('✓ Default admin user created');
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Initial Setup Complete!                                 ║
╠═══════════════════════════════════════════════════════════╣
║   Admin Credentials:                                      ║
║   Email: ${defaultAdminEmail}                             
║   Password: ${defaultAdminPassword}                       
║                                                           ║
║   IMPORTANT: Change the password after first login!      ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Create default homepage content
  const defaultContent = {
    homepage: {
      heroImages: [],
      aboutUs: 'Welcome to our Rocketry Competition Platform. We bring together enthusiasts and teams to participate in exciting rocketry competitions.',
      vision: 'To foster innovation and excellence in rocketry through collaborative competition.',
      mission: 'Our mission is to provide a platform that connects talented individuals with exciting rocketry challenges, promotes teamwork, and advances the field of amateur rocketry.'
    }
  };

  writeDB(DB_FILES.SITE_CONTENT, defaultContent);
  console.log('✓ Default site content created');

  console.log('\nSetup completed successfully!');
  process.exit(0);
}

// Run setup if executed directly
if (require.main === module) {
  initialSetup().catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
  });
}

module.exports = initialSetup;

