require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const CollegeRoster = require('../models/CollegeRoster');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Response = require('../models/Response');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const Handover = require('../models/Handover');
const AuditLog = require('../models/AuditLog');

const seedDemoData = async () => {
  try {
    await connectDB();
    console.log('[DemoSeeder] Cleaning existing collections...');

    await Promise.all([
      User.deleteMany({}),
      CollegeRoster.deleteMany({}),
      LostItem.deleteMany({}),
      FoundItem.deleteMany({}),
      Response.deleteMany({}),
      Match.deleteMany({}),
      Notification.deleteMany({}),
      Handover.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[DemoSeeder] Seeding Authorized College Roster (Demonstration)...');
    const rosterList = await CollegeRoster.insertMany([
      {
        collegeId: 'CS2023001',
        name: 'John Doe',
        email: 'john.doe@campusconnect.edu',
        department: 'Computer Science & Engineering',
        academicYear: '3rd Year',
        verificationStatus: 'VERIFIED',
        isDemonstration: true,
      },
      {
        collegeId: 'EC2023042',
        name: 'Sarah Miller',
        email: 'sarah.miller@campusconnect.edu',
        department: 'Electronics & Communication',
        academicYear: '2nd Year',
        verificationStatus: 'VERIFIED',
        isDemonstration: true,
      },
      {
        collegeId: 'ME2024018',
        name: 'Alex Johnson',
        email: 'alex.j@campusconnect.edu',
        department: 'Mechanical Engineering',
        academicYear: '1st Year',
        verificationStatus: 'VERIFIED',
        isDemonstration: true,
      },
      {
        collegeId: 'IT2023055',
        name: 'Emily Davis',
        email: 'emily.d@campusconnect.edu',
        department: 'Information Technology',
        academicYear: '3rd Year',
        verificationStatus: 'VERIFIED',
        isDemonstration: true,
      },
    ]);

    console.log('[DemoSeeder] Seeding Admin and Demo Students...');
    // Create Admin
    const admin = await User.create({
      collegeId: 'ADM2026',
      name: 'Campus Administrator',
      email: 'admin@campusconnect.edu',
      phone: '+1 555-0100',
      department: 'Campus Administration',
      academicYear: 'Staff',
      password: 'AdminPass@2026',
      role: 'admin',
      accountStatus: 'ACTIVE',
      isCollegeVerified: true,
    });

    // Create Verified Student 1 (John Doe)
    const studentJohn = await User.create({
      collegeId: 'CS2023001',
      name: 'John Doe',
      email: 'john.doe@campusconnect.edu',
      phone: '+1 555-0101',
      department: 'Computer Science & Engineering',
      academicYear: '3rd Year',
      password: 'Password@123',
      role: 'student',
      accountStatus: 'ACTIVE',
      isCollegeVerified: true,
    });

    // Create Verified Student 2 (Sarah Miller)
    const studentSarah = await User.create({
      collegeId: 'EC2023042',
      name: 'Sarah Miller',
      email: 'sarah.miller@campusconnect.edu',
      phone: '+1 555-0102',
      department: 'Electronics & Communication',
      academicYear: '2nd Year',
      password: 'Password@123',
      role: 'student',
      accountStatus: 'ACTIVE',
      isCollegeVerified: true,
    });

    // Create Verified Student 3 (Alex Johnson)
    const studentAlex = await User.create({
      collegeId: 'ME2024018',
      name: 'Alex Johnson',
      email: 'alex.j@campusconnect.edu',
      phone: '+1 555-0103',
      department: 'Mechanical Engineering',
      academicYear: '1st Year',
      password: 'Password@123',
      role: 'student',
      accountStatus: 'ACTIVE',
      isCollegeVerified: true,
    });

    // Create Pending Student (Not in roster initially - for demonstration of pending approval)
    const studentPending = await User.create({
      collegeId: 'CV2024099',
      name: 'David Brown (Pending Demo)',
      email: 'david.b@campusconnect.edu',
      phone: '+1 555-0104',
      department: 'Civil Engineering',
      academicYear: '1st Year',
      password: 'Password@123',
      role: 'student',
      accountStatus: 'PENDING_APPROVAL',
      isCollegeVerified: false,
    });

    console.log('[DemoSeeder] Seeding Sample Lost Items...');
    const lostItem1 = await LostItem.create({
      studentId: studentJohn._id,
      itemName: 'College Student ID Card',
      category: 'ID Cards',
      description: 'Standard PVC college identity card in a navy blue lanyard with transparent card case.',
      lastSeenLocation: 'Central Library, 2nd Floor Reading Hall',
      lostDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lostTime: '11:30 AM',
      identifyingDetails: 'ID number CS2023001, has a tiny silver holographic sticker in upper right corner.',
      contactNumber: '+1 555-0101',
      status: 'OPEN',
    });

    const lostItem2 = await LostItem.create({
      studentId: studentSarah._id,
      itemName: 'Apple AirPods Pro 2nd Gen',
      category: 'Electronics',
      description: 'White AirPods Pro earbuds in a light teal silicone protective case with metallic carabiner.',
      lastSeenLocation: 'Student Cafeteria, corner booth near juice bar',
      lostDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lostTime: '01:45 PM',
      identifyingDetails: 'Teal silicone case has a tiny engraved initials "SM" on the back clip.',
      contactNumber: '+1 555-0102',
      status: 'UNDER_REVIEW',
    });

    const lostItem3 = await LostItem.create({
      studentId: studentAlex._id,
      itemName: 'Casio Scientific Calculator FX-991EX',
      category: 'Books and Stationery',
      description: 'Black and white ClassWiz scientific calculator inside a clear plastic zip pouch.',
      lastSeenLocation: 'Academic Block A, Room 102',
      lostDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lostTime: '04:00 PM',
      identifyingDetails: 'Battery cover is secured with a small piece of transparent tape.',
      contactNumber: '+1 555-0103',
      status: 'OPEN',
    });

    console.log('[DemoSeeder] Seeding Sample Found Items...');
    const foundItem1 = await FoundItem.create({
      studentId: studentSarah._id,
      itemName: 'Student ID Card with Navy Lanyard',
      category: 'ID Cards',
      description: 'Found a student ID card attached to a blue college lanyard lying near the library stairs.',
      foundLocation: 'Central Library Staircase',
      foundDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      foundTime: '12:15 PM',
      privateObservations: 'Card belongs to a Computer Science student named John, photo matches CS department.',
      possessionStatus: 'Still with me',
      status: 'AVAILABLE',
    });

    const foundItem2 = await FoundItem.create({
      studentId: studentAlex._id,
      itemName: 'AirPods Earphones with Teal Protective Sleeve',
      category: 'Electronics',
      description: 'Found wireless earbuds case on cafeteria table during lunch.',
      foundLocation: 'Cafeteria Table 14',
      foundDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      foundTime: '02:00 PM',
      privateObservations: 'Light teal silicone sleeve with mini carabiner; battery indicator turns green.',
      possessionStatus: 'Deposited at admin office',
      status: 'AVAILABLE',
    });

    console.log('[DemoSeeder] Seeding Sample Student Response...');
    // Sarah responds to John's lost ID card and links her found report
    const response1 = await Response.create({
      lostItemId: lostItem1._id,
      foundItemId: foundItem1._id,
      responderId: studentSarah._id,
      message: 'Hi, I found an ID card on the library staircase that matches your description. I can bring it to the admin block!',
      description: 'Navy lanyard with CS student ID card found on 2nd floor library stairs.',
      foundLocation: 'Central Library Staircase',
      foundDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'PENDING',
    });

    // Update lostItem1 to UNDER_REVIEW
    lostItem1.status = 'UNDER_REVIEW';
    await lostItem1.save();

    console.log('[DemoSeeder] Seeding Sample In-App Notifications...');
    await Notification.create([
      {
        recipientId: studentJohn._id,
        title: 'Response Received For Your Lost Item',
        message: 'A student reported finding an item matching your "College Student ID Card". The admin is reviewing the match.',
        type: 'RESPONSE_RECEIVED',
        relatedEntityType: 'LostItem',
        relatedEntityId: lostItem1._id,
        isRead: false,
      },
      {
        recipientId: admin._id,
        title: 'New Student Registration Pending',
        message: 'Student David Brown (CV2024099) registered and is awaiting admin approval.',
        type: 'ADMIN_REVIEWED',
        relatedEntityType: 'System',
        relatedEntityId: studentPending._id,
        isRead: false,
      },
      {
        recipientId: admin._id,
        title: 'New Response Submitted',
        message: `Student Sarah Miller responded to lost item "${lostItem1.itemName}".`,
        type: 'RESPONSE_RECEIVED',
        relatedEntityType: 'Response',
        relatedEntityId: response1._id,
        isRead: false,
      },
    ]);

    console.log('[DemoSeeder] Seeding Audit Log entries...');
    await AuditLog.create([
      {
        adminId: admin._id,
        action: 'SYSTEM_SEEDED',
        entityType: 'System',
        description: 'Demonstration environment initialized with sample students, roster, lost/found items, and responses.',
      },
    ]);

    console.log('==================================================');
    console.log('DEMONSTRATION SEED COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('Admin Account:');
    console.log('  College ID: ADM2026');
    console.log('  Password:   AdminPass@2026');
    console.log('');
    console.log('Demo Student Accounts (Password: Password@123):');
    console.log('  1. CS2023001 (John Doe - Active, Lost Item Owner)');
    console.log('  2. EC2023042 (Sarah Miller - Active, Finder & Responder)');
    console.log('  3. ME2024018 (Alex Johnson - Active, Finder)');
    console.log('  4. CV2024099 (David Brown - Pending Approval Demo)');
    console.log('==================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[DemoSeeder] Error during seeding:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDemoData();
}

module.exports = seedDemoData;

