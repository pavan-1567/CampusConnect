require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const CollegeRoster = require('../models/CollegeRoster');

describe('CampusConnect Auth API Tests', () => {
  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
  });

  afterAll(async () => {
    // Clean up test users
    await User.deleteMany({ collegeId: { $in: ['TEST_STUDENT_01', 'TEST_STUDENT_02'] } });
    await CollegeRoster.deleteMany({ collegeId: 'TEST_STUDENT_01' });
    await mongoose.disconnect();
  });

  test('1. Should register a student matching college roster as ACTIVE', async () => {
    await CollegeRoster.create({
      collegeId: 'TEST_STUDENT_01',
      name: 'Roster Test Student',
      email: 'roster.test@campusconnect.edu',
      department: 'Computer Science',
      academicYear: '2nd Year',
      verificationStatus: 'VERIFIED',
    });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        collegeId: 'TEST_STUDENT_01',
        name: 'Roster Test Student',
        email: 'roster.test@campusconnect.edu',
        phone: '+1 555-9988',
        department: 'Computer Science',
        academicYear: '2nd Year',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.accountStatus).toBe('ACTIVE');
    expect(res.body.data.user.isCollegeVerified).toBe(true);
  });

  test('2. Should register an unrostered student as PENDING_APPROVAL', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        collegeId: 'TEST_STUDENT_02',
        name: 'Unrostered Student',
        email: 'unrostered@campusconnect.edu',
        phone: '+1 555-9989',
        department: 'Civil Engineering',
        academicYear: '1st Year',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.requiresApproval).toBe(true);
    expect(res.body.data.user.accountStatus).toBe('PENDING_APPROVAL');
  });

  test('3. Should block login for pending approval account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        collegeId: 'TEST_STUDENT_02',
        password: 'Password@123',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('4. Should successfully log in active student and return cookie & user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        collegeId: 'TEST_STUDENT_01',
        password: 'Password@123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.collegeId).toBe('TEST_STUDENT_01');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  test('5. Should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        collegeId: 'TEST_STUDENT_01',
        password: 'WrongPassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

