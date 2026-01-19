const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: 'car-damage-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// In-memory storage (for demo - in production use database)
let users = [];
let detectionHistory = [];

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Damage mapping for simulation
const damageParts = [
  { name: "Front Bumper", minCost: 10000, maxCost: 20000, description: "Located at the front of the vehicle, protects against minor collisions", location: "Front of vehicle" },
  { name: "Rear Bumper", minCost: 10000, maxCost: 20000, description: "Located at the rear of the vehicle, protects against rear-end collisions", location: "Rear of vehicle" },
  { name: "Left Door", minCost: 15000, maxCost: 30000, description: "Side door on the driver's side, includes window and lock mechanisms", location: "Left side of vehicle" },
  { name: "Right Door", minCost: 15000, maxCost: 30000, description: "Side door on the passenger's side, includes window and lock mechanisms", location: "Right side of vehicle" },
  { name: "Hood", minCost: 20000, maxCost: 40000, description: "Engine compartment cover, may include dents and scratches", location: "Top front of vehicle" },
  { name: "Trunk", minCost: 18000, maxCost: 35000, description: "Rear storage compartment lid, may include dents and alignment issues", location: "Rear top of vehicle" },
  { name: "Headlight", minCost: 5000, maxCost: 12000, description: "Front lighting assembly, may include cracks or shattered lens", location: "Front corners of vehicle" },
  { name: "Taillight", minCost: 5000, maxCost: 12000, description: "Rear lighting assembly, may include cracks or shattered lens", location: "Rear corners of vehicle" },
  { name: "Windshield", minCost: 8000, maxCost: 25000, description: "Front glass panel, may include chips, cracks, or star breaks", location: "Front of cabin" },
  { name: "Side Mirror", minCost: 3000, maxCost: 8000, description: "Exterior mirrors on doors, may include broken glass or housing damage", location: "Driver and passenger doors" }
];

const severityLevels = ["Minor", "Moderate", "Severe"];

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// Routes to serve pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Authentication routes
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(newUser);
    
    // Set session
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    
    console.log(`New user registered: ${username}`);
    res.json({ 
      message: 'Signup successful', 
      user: { id: newUser.id, username: newUser.username, email: newUser.email } 
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    
    console.log(`User logged in: ${user.username}`);
    res.json({ 
      message: 'Login successful', 
      user: { id: user.id, username: user.username, email: user.email } 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/user', (req, res) => {
  if (req.session.userId) {
    const user = users.find(u => u.id === req.session.userId);
    if (user) {
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email 
        } 
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// History routes
app.get('/api/history', requireAuth, (req, res) => {
  try {
    const userHistory = detectionHistory
      .filter(record => record.userId === req.session.userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ history: userHistory });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.delete('/api/history/:id', requireAuth, (req, res) => {
  try {
    const recordId = parseInt(req.params.id);
    const recordIndex = detectionHistory.findIndex(
      record => record.id === recordId && record.userId === req.session.userId
    );
    
    if (recordIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    detectionHistory.splice(recordIndex, 1);
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// API endpoint for car damage detection
app.post('/api/detect-damage', requireAuth, upload.single('carImage'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    console.log('Received file:', req.file.filename);

    // Simulate damage detection
    const randomDamage = damageParts[Math.floor(Math.random() * damageParts.length)];
    const randomSeverity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    let baseCost = Math.floor(Math.random() * (randomDamage.maxCost - randomDamage.minCost + 1)) + randomDamage.minCost;
    
    let finalCost;
    if (randomSeverity === "Minor") {
      finalCost = Math.floor(baseCost * 0.7);
    } else if (randomSeverity === "Moderate") {
      finalCost = baseCost;
    } else {
      finalCost = Math.floor(baseCost * 1.5);
    }

    const formattedCost = `₹${finalCost.toLocaleString('en-IN')}`;

    // Create detection record
    const detectionRecord = {
      id: detectionHistory.length + 1,
      userId: req.session.userId,
      damagedPart: randomDamage.name,
      severity: randomSeverity,
      estimatedCost: formattedCost,
      damageDescription: randomDamage.description,
      damageLocation: randomDamage.location,
      fileName: req.file.filename,
      timestamp: new Date().toISOString()
    };

    // Save to history
    detectionHistory.push(detectionRecord);

    const result = {
      ...detectionRecord,
      message: "Damage detected successfully!"
    };

    console.log('Detection result:', result);
    res.json(result);

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({
      error: 'Failed to process image',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Please upload an image smaller than 5MB'
      });
    }
  }
  res.status(500).json({
    error: 'Something went wrong',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚗 Car Damage Detection Server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, 'uploads')}`);
  console.log(`👥 Registered users: ${users.length}`);
  console.log(`📊 Detection records: ${detectionHistory.length}`);
});