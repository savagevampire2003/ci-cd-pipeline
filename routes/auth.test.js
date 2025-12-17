const request = require('supertest');
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const fc = require('fast-check');
const User = require('../models/User');
const authRoutes = require('./auth');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));
  app.use('/api/auth', authRoutes);
  return app;
};

// MongoDB Memory Server setup
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-examdb';
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
  }
}, 30000);

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
}, 30000);

beforeEach(async () => {
  await User.deleteMany({});
});

// Feature: devops-pipeline-enhancement, Property 1: Valid registration creates hashed password
// Validates: Requirements 1.2
describe('Property 1: Valid registration creates hashed password', () => {
  test('for any valid registration data, the stored password should be hashed and not equal to plaintext', async () => {
    const app = createTestApp();

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 50 }),
          fullName: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0)
        }),
        async (userData) => {
          // Clear any existing users with this username/email
          await User.deleteMany({ $or: [{ username: userData.username }, { email: userData.email }] });

          // Register user
          const response = await request(app)
            .post('/api/auth/register')
            .send(userData)
            .expect(201);

          // Verify user was created
          expect(response.body.message).toBe('User registered successfully');
          expect(response.body.user.username).toBe(userData.username);

          // Fetch user from database
          const savedUser = await User.findOne({ username: userData.username });
          expect(savedUser).toBeTruthy();

          // Verify password is hashed (not equal to plaintext)
          expect(savedUser.password).not.toBe(userData.password);
          expect(savedUser.password.length).toBeGreaterThan(userData.password.length);
          expect(savedUser.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: devops-pipeline-enhancement, Property 2: Duplicate username/email rejection
// Validates: Requirements 1.3
describe('Property 2: Duplicate username/email rejection', () => {
  test('for any existing user, attempting to register with same username or email should be rejected', async () => {
    const app = createTestApp();

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 50 }),
          fullName: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0)
        }),
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 50 }),
          fullName: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0)
        }),
        async (firstUser, secondUser) => {
          // Clear database
          await User.deleteMany({});

          // Register first user
          await request(app)
            .post('/api/auth/register')
            .send(firstUser)
            .expect(201);

          // Try to register with same username
          const duplicateUsername = { ...secondUser, username: firstUser.username };
          const response1 = await request(app)
            .post('/api/auth/register')
            .send(duplicateUsername);

          expect(response1.status).toBe(400);
          expect(response1.body.error).toBe('Username or email already exists');

          // Try to register with same email
          const duplicateEmail = { ...secondUser, email: firstUser.email };
          const response2 = await request(app)
            .post('/api/auth/register')
            .send(duplicateEmail);

          expect(response2.status).toBe(400);
          expect(response2.body.error).toBe('Username or email already exists');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: devops-pipeline-enhancement, Property 3: Valid credentials create session
// Validates: Requirements 1.4
describe('Property 3: Valid credentials create session', () => {
  test('for any registered user with valid credentials, logging in should create a session', async () => {
    const app = createTestApp();

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 50 }),
          fullName: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0)
        }),
        async (userData) => {
          // Clear database
          await User.deleteMany({});

          // Register user
          await request(app)
            .post('/api/auth/register')
            .send(userData)
            .expect(201);

          // Login with valid credentials
          const agent = request.agent(app);
          const loginResponse = await agent
            .post('/api/auth/login')
            .send({ username: userData.username, password: userData.password })
            .expect(200);

          expect(loginResponse.body.message).toBe('Login successful');
          expect(loginResponse.body.user.username).toBe(userData.username);

          // Verify session persists by accessing protected endpoint
          const meResponse = await agent
            .get('/api/auth/me')
            .expect(200);

          expect(meResponse.body.user.username).toBe(userData.username);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: devops-pipeline-enhancement, Property 4: Invalid credentials rejection
// Validates: Requirements 1.5
describe('Property 4: Invalid credentials rejection', () => {
  test('for any invalid credential combination, login attempts should be rejected', async () => {
    const app = createTestApp();

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 50 }),
          fullName: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0)
        }),
        fc.string({ minLength: 6, maxLength: 50 }),
        async (userData, wrongPassword) => {
          // Ensure wrong password is different
          fc.pre(wrongPassword !== userData.password);

          // Clear database
          await User.deleteMany({});

          // Register user
          await request(app)
            .post('/api/auth/register')
            .send(userData)
            .expect(201);

          // Try to login with wrong password
          const response1 = await request(app)
            .post('/api/auth/login')
            .send({ username: userData.username, password: wrongPassword });

          expect(response1.status).toBe(401);
          expect(response1.body.error).toBe('Invalid username or password');

          // Try to login with non-existent username
          const response2 = await request(app)
            .post('/api/auth/login')
            .send({ username: 'nonexistent_user_12345', password: userData.password });

          expect(response2.status).toBe(401);
          expect(response2.body.error).toBe('Invalid username or password');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: devops-pipeline-enhancement, Property 5: Logout destroys session
// Validates: Requirements 1.6
describe('Property 5: Logout destroys session', () => {
  test('for any authenticated user session, logging out should destroy the session', async () => {
    const app = createTestApp();

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 50 }),
          fullName: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0)
        }),
        async (userData) => {
          // Clear database
          await User.deleteMany({});

          // Register user
          await request(app)
            .post('/api/auth/register')
            .send(userData)
            .expect(201);

          // Login
          const agent = request.agent(app);
          await agent
            .post('/api/auth/login')
            .send({ username: userData.username, password: userData.password })
            .expect(200);

          // Verify session exists
          await agent
            .get('/api/auth/me')
            .expect(200);

          // Logout
          await agent
            .post('/api/auth/logout')
            .expect(200);

          // Verify session is destroyed
          const response = await agent
            .get('/api/auth/me');

          expect(response.status).toBe(401);
          expect(response.body.error).toBe('Not authenticated');
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: devops-pipeline-enhancement, Property 6: Protected route authentication
// Validates: Requirements 1.7
describe('Property 6: Protected route authentication', () => {
  test('for any protected endpoint, requests without valid authentication should be rejected', async () => {
    const app = createTestApp();

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-zA-Z0-9_]+$/.test(s)),
          email: fc.emailAddress(),
          password: fc.string({ minLength: 6, maxLength: 50 }),
          fullName: fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length > 0)
        }),
        async (userData) => {
          // Clear database
          await User.deleteMany({});

          // Register user
          await request(app)
            .post('/api/auth/register')
            .send(userData)
            .expect(201);

          // Try to access /me endpoint without authentication
          const response = await request(app)
            .get('/api/auth/me');

          expect(response.status).toBe(401);
          expect(response.body.error).toBe('Not authenticated');

          // Now login and verify access is granted
          const agent = request.agent(app);
          await agent
            .post('/api/auth/login')
            .send({ username: userData.username, password: userData.password })
            .expect(200);

          const authenticatedResponse = await agent
            .get('/api/auth/me')
            .expect(200);

          expect(authenticatedResponse.body.user.username).toBe(userData.username);
        }
      ),
      { numRuns: 100 }
    );
  });
});
