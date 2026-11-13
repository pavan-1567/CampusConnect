require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('CampusConnect End-to-End Workflow Integration Tests', () => {
  let studentJohnToken = '';
  let studentSarahToken = '';
  let adminToken = '';
  let createdLostItemId = '';
  let createdFoundItemId = '';
  let createdResponseId = '';
  let createdMatchId = '';
  let createdHandoverId = '';

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }

    // Login John
    const resJohn = await request(app).post('/api/v1/auth/login').send({
      collegeId: 'CS2023001',
      password: 'Password@123',
    });
    studentJohnToken = resJohn.body.token;

    // Login Sarah
    const resSarah = await request(app).post('/api/v1/auth/login').send({
      collegeId: 'EC2023042',
      password: 'Password@123',
    });
    studentSarahToken = resSarah.body.token;

    // Login Admin
    const resAdmin = await request(app).post('/api/v1/auth/login').send({
      collegeId: 'ADM2026',
      password: 'AdminPass@2026',
    });
    adminToken = resAdmin.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  test('Stage 1: Student John submits a lost item report', async () => {
    const res = await request(app)
      .post('/api/v1/lost-items')
      .set('Authorization', `Bearer ${studentJohnToken}`)
      .send({
        itemName: 'Dell XPS 15 Charger',
        category: 'Electronics',
        description: 'Black 130W USB-C Dell laptop power adapter with rolled cord.',
        lastSeenLocation: 'Library Ground Floor Cyber Lab',
        lostDate: '2026-11-05',
        lostTime: '03:30 PM',
        identifyingDetails: 'Has a small white tape label with initials "JD".',
        contactNumber: '+1 555-0101',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('OPEN');
    createdLostItemId = res.body.data._id;
  });

  test('Stage 2: Student Sarah submits a found item report', async () => {
    const res = await request(app)
      .post('/api/v1/found-items')
      .set('Authorization', `Bearer ${studentSarahToken}`)
      .send({
        itemName: 'Dell USB-C Laptop Charger',
        category: 'Electronics',
        description: 'Found a 130W black Dell USB-C charger left at terminal 8.',
        foundLocation: 'Library Cyber Lab Ground Floor',
        foundDate: '2026-11-05',
        foundTime: '04:15 PM',
        privateObservations: 'Initial label "JD" on the power brick.',
        possessionStatus: 'Still with me',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('AVAILABLE');
    createdFoundItemId = res.body.data._id;
  });

  test('Stage 3: Student Sarah responds to John lost item request linking her found report', async () => {
    const res = await request(app)
      .post('/api/v1/responses')
      .set('Authorization', `Bearer ${studentSarahToken}`)
      .send({
        lostItemId: createdLostItemId,
        foundItemId: createdFoundItemId,
        message: 'I found this charger right after the 3:30 PM session ended in the Cyber Lab!',
        description: 'Black Dell 130W charger with USB-C tip.',
        foundLocation: 'Library Ground Floor Cyber Lab',
        foundDate: '2026-11-05',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PENDING');
    createdResponseId = res.body.data._id;
  });

  test('Stage 4: Admin computes AI/rule match suggestions and creates potential match', async () => {
    const suggestionRes = await request(app)
      .get(`/api/v1/admin/matches/suggestions/${createdLostItemId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(suggestionRes.statusCode).toBe(200);
    expect(suggestionRes.body.data.suggestions.length).toBeGreaterThan(0);
    const topMatch = suggestionRes.body.data.suggestions[0];
    expect(topMatch.matchScore).toBeGreaterThan(60);

    const matchRes = await request(app)
      .post('/api/v1/admin/matches')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        lostItemId: createdLostItemId,
        foundItemId: createdFoundItemId,
        responseId: createdResponseId,
        remarks: 'High confidence match: Dell USB-C charger in Cyber Lab on same date.',
      });

    expect(matchRes.statusCode).toBe(201);
    expect(matchRes.body.data.matchStatus).toBe('UNDER_VERIFICATION');
    createdMatchId = matchRes.body.data._id;
  });

  test('Stage 5: Admin performs ownership verification (APPROVE)', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/verification/${createdMatchId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        action: 'APPROVE',
        remarks: 'Student ID and initials "JD" confirmed with college student record.',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.matchStatus).toBe('APPROVED');
  });

  test('Stage 6: Admin schedules collection handover at College Admin Block', async () => {
    const res = await request(app)
      .post('/api/v1/admin/handovers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        matchId: createdMatchId,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        collectionLocation: 'College Admin Block, Room 104',
        remarks: 'Please bring original College ID card for pickup.',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.status).toBe('SCHEDULED');
    createdHandoverId = res.body.data._id;
  });

  test('Stage 7: Admin completes item handover -> marked RETURNED', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/handovers/${createdHandoverId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'COMPLETED',
        finderDepositedAt: new Date().toISOString(),
        remarks: 'Handover complete. John collected the charger with verified ID.',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');

    // Verify Lost Item is now marked RETURNED
    const lostCheck = await request(app).get(`/api/v1/lost-items/${createdLostItemId}`);
    expect(lostCheck.body.data.status).toBe('RETURNED');
  });

  test('Stage 8: Security Test - Student cannot access Admin endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${studentJohnToken}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

