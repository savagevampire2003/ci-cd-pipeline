const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/examdb';

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.warn('MongoDB connection error:', err.message));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: mongoUri,
    touchAfter: 24 * 3600 // lazy session update
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: false, // Set to false for HTTP deployments, true only if using HTTPS
    sameSite: 'lax'
  }
}));

// Import routes and middleware
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const { requireAuth } = require('./middleware/auth');

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationNumber: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', StudentSchema);

// Get all students
app.get('/api/students', requireAuth, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single student
app.get('/api/students/:id', requireAuth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create student
app.post('/api/students', requireAuth, async (req, res) => {
  try {
    const { name, registrationNumber, email, phone, address } = req.body;

    // Validate required fields
    const errors = {};
    if (!name || name.trim() === '') errors.name = 'Name is required';
    if (!registrationNumber || registrationNumber.trim() === '') errors.registrationNumber = 'Registration number is required';
    if (!email || email.trim() === '') errors.email = 'Email is required';
    if (!phone || phone.trim() === '') errors.phone = 'Phone is required';
    if (!address || address.trim() === '') errors.address = 'Address is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const student = new Student({
      name: name.trim(),
      registrationNumber: registrationNumber.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      createdBy: req.session.userId
    });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ errors: { registrationNumber: 'Registration number already exists' } });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update student
app.put('/api/students/:id', requireAuth, async (req, res) => {
  try {
    const { name, registrationNumber, email, phone, address } = req.body;

    // Validate required fields
    const errors = {};
    if (!name || name.trim() === '') errors.name = 'Name is required';
    if (!registrationNumber || registrationNumber.trim() === '') errors.registrationNumber = 'Registration number is required';
    if (!email || email.trim() === '') errors.email = 'Email is required';
    if (!phone || phone.trim() === '') errors.phone = 'Phone is required';
    if (!address || address.trim() === '') errors.address = 'Address is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        registrationNumber: registrationNumber.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ errors: { registrationNumber: 'Registration number already exists' } });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete student
app.delete('/api/students/:id', requireAuth, async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint with database status
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    const isHealthy = dbState === 1;
    const statusCode = isHealthy ? 200 : 503;

    res.status(statusCode).json({
      status: isHealthy ? 'ok' : 'unhealthy',
      database: {
        status: dbStatus[dbState] || 'unknown',
        connected: isHealthy
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      database: {
        status: 'error',
        connected: false,
        error: err.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Serve login page
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Fallback to index.html for SPA (authenticated pages)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
