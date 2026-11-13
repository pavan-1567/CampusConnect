require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await connectDB();

    const collegeId = (process.env.ADMIN_COLLEGE_ID || 'ADM2026').toUpperCase();
    const email = (process.env.ADMIN_EMAIL || 'admin@campusconnect.edu').toLowerCase();
    const name = process.env.ADMIN_NAME || 'Campus Administrator';
    const password = process.env.ADMIN_PASSWORD || 'AdminPass@2026';

    let admin = await User.findOne({ $or: [{ collegeId }, { email }] });

    if (admin) {
      console.log(`[AdminSeeder] Admin account already exists: ${admin.collegeId} (${admin.email})`);
      admin.role = 'admin';
      admin.accountStatus = 'ACTIVE';
      admin.isCollegeVerified = true;
      admin.password = password; // Will trigger pre-save hashing
      await admin.save();
      console.log('[AdminSeeder] Admin credentials updated.');
    } else {
      admin = await User.create({
        collegeId,
        name,
        email,
        phone: '+1 555-0199',
        department: 'Campus Administration',
        academicYear: 'Staff',
        password,
        role: 'admin',
        accountStatus: 'ACTIVE',
        isCollegeVerified: true,
      });
      console.log(`[AdminSeeder] Admin account created successfully: ${admin.collegeId}`);
    }

    console.log('--------------------------------------------------');
    console.log('Admin Credentials:');
    console.log(`College ID: ${collegeId}`);
    console.log(`Password:   ${password}`);
    console.log('--------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[AdminSeeder] Error seeding admin:', err.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;

