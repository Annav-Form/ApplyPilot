import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../server/app.js';

let mongod;

const runTests = async () => {
  console.log('🧪 Starting ApplyPilot Automated Backend Integration Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Start In-Memory MongoDB Server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('📦 Connected to In-Memory MongoDB for automated test execution.\n');

    // TEST 1: Health check endpoint
    const healthRes = await request(app).get('/api/health');
    assert(healthRes.status === 200 && healthRes.body.status === 'ok', 'GET /api/health returns 200 ok');

    // TEST 2: Register user validation - missing password
    const badRegRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Rahul Sharma', email: 'rahul@test.com' });
    assert(badRegRes.status === 400, 'POST /api/auth/register fails with 400 if password missing');

    // TEST 3: Successful student registration
    const userAReg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rahul Sharma',
        email: 'rahul@test.com',
        password: 'Password123!',
        college: 'IIT Delhi',
        targetRole: 'Software Development Engineer',
        graduationYear: 2027,
      });
    assert(userAReg.status === 201 && userAReg.body.token, 'POST /api/auth/register creates user and returns JWT');
    const tokenA = userAReg.body.token;

    // TEST 4: Duplicate registration should return 409
    const dupRegRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Rahul',
        email: 'rahul@test.com',
        password: 'Password123!',
      });
    assert(dupRegRes.status === 409, 'POST /api/auth/register prevents duplicate email (409 Conflict)');

    // TEST 5: Student Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul@test.com', password: 'Password123!' });
    assert(loginRes.status === 200 && loginRes.body.token, 'POST /api/auth/login succeeds with valid credentials');

    // TEST 6: Get Me (Protected)
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenA}`);
    assert(meRes.status === 200 && meRes.body.user.email === 'rahul@test.com', 'GET /api/auth/me returns authenticated student');

    // TEST 7: Unauthorized request without token
    const unauthRes = await request(app).get('/api/applications');
    assert(unauthRes.status === 401, 'GET /api/applications returns 401 without Bearer token');

    // TEST 8: Create an Application (with Tier & Difficulty)
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const appRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        company: 'Google',
        role: 'SWE Intern',
        tier: 'Excellent',
        difficulty: 'Hard to Crack',
        priority: 'High',
        status: 'Applied',
        location: 'Bangalore, India',
        source: 'Referral',
        deadline: inThreeDays,
        salary: '₹1.25L/month',
      });
    assert(appRes.status === 201 && appRes.body.application._id, 'POST /api/applications creates an application with Tier & Difficulty');
    const appId = appRes.body.application._id;

    // TEST 9: Add a Round to the Application
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const roundRes = await request(app)
      .post(`/api/applications/${appId}/rounds`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        roundType: 'Online Assessment',
        name: 'Google Online Challenge',
        scheduledAt: tomorrow,
        status: 'Upcoming',
        durationMinutes: 60,
      });
    assert(roundRes.status === 201 && roundRes.body.rounds.length === 1, 'POST /api/applications/:appId/rounds adds OA/interview round');
    const roundId = roundRes.body.rounds[0]._id;

    // TEST 10: Update the Round outcome
    const updateRoundRes = await request(app)
      .put(`/api/applications/${appId}/rounds/${roundId}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        status: 'Completed',
        outcome: 'Cleared',
        notes: 'Cleared all 2 questions within 40 minutes.',
      });
    assert(updateRoundRes.status === 200 && updateRoundRes.body.round.outcome === 'Cleared', 'PUT /api/applications/:appId/rounds/:roundId updates round details');

    // TEST 11: Quick Application Status change
    const statusUpdateRes = await request(app)
      .patch(`/api/applications/${appId}/status`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ status: 'Interview' });
    assert(statusUpdateRes.status === 200 && statusUpdateRes.body.application.status === 'Interview', 'PATCH /api/applications/:id/status updates status');

    // TEST 12: Upcoming rounds endpoint
    const upcomingRes = await request(app)
      .get('/api/rounds/upcoming')
      .set('Authorization', `Bearer ${tokenA}`);
    assert(upcomingRes.status === 200 && Array.isArray(upcomingRes.body.rounds), 'GET /api/rounds/upcoming returns rounds list');

    // TEST 13: Dashboard statistics
    const dashRes = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${tokenA}`);
    assert(
      dashRes.status === 200 &&
      dashRes.body.stats.totalApplications === 1 &&
      dashRes.body.stats.activeApplications === 1,
      'GET /api/dashboard/stats calculates accurate live metrics'
    );

    // TEST 14: Playbook Item CRUD
    const playbookRes = await request(app)
      .post('/api/playbooks')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        topic: 'Graph BFS & Dijkstra',
        targetGroups: ['Excellent', 'Hard to Crack'],
        priority: 'High',
        estimatedHours: 8,
        notes: 'LeetCode 743, 207',
      });
    assert(playbookRes.status === 201 && playbookRes.body.item._id, 'POST /api/playbooks creates a preparation study item');
    const playbookId = playbookRes.body.item._id;

    // TEST 15: Toggle Playbook Item completion
    const toggleRes = await request(app)
      .patch(`/api/playbooks/${playbookId}/toggle`)
      .set('Authorization', `Bearer ${tokenA}`);
    assert(toggleRes.status === 200 && toggleRes.body.item.isCompleted === true, 'PATCH /api/playbooks/:id/toggle marks item complete');

    // TEST 16: Multi-tenant ownership isolation: User B cannot access User A's application
    const userBReg = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Priya Verma',
        email: 'priya@test.com',
        password: 'Password123!',
      });
    const tokenB = userBReg.body.token;

    const crossUserRes = await request(app)
      .get(`/api/applications/${appId}`)
      .set('Authorization', `Bearer ${tokenB}`);
    assert(crossUserRes.status === 404, 'Multi-tenant isolation: User B receives 404 accessing User A application');

    // TEST 17: User B seeding Demo Data
    const demoRes = await request(app)
      .post('/api/demo/seed')
      .set('Authorization', `Bearer ${tokenB}`);
    assert(demoRes.status === 201 && demoRes.body.applicationsCount > 0, 'POST /api/demo/seed creates realistic sample applications and playbooks');

    // TEST 18: Demo duplicate prevention
    const dupDemoRes = await request(app)
      .post('/api/demo/seed')
      .set('Authorization', `Bearer ${tokenB}`);
    assert(dupDemoRes.status === 409, 'POST /api/demo/seed blocks duplicate seeding when records already exist');

    console.log(`\n========================================`);
    console.log(`🎉 Automated Tests Complete: ${passed} passed, ${failed} failed.`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test runner caught unexpected error:', err);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongod) {
      await mongod.stop();
    }
    process.exit(0);
  }
};

runTests();
