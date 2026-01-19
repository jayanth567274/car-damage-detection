const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files from public folder

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Store uploaded files in uploads folder
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only accept image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  }
});

// Damage mapping for simulation
const damageParts = [
  { name: "Front Bumper", minCost: 10000, maxCost: 20000 },
  { name: "Rear Bumper", minCost: 10000, maxCost: 20000 },
  { name: "Left Door", minCost: 15000, maxCost: 30000 },
  { name: "Right Door", minCost: 15000, maxCost: 30000 },
  { name: "Hood", minCost: 20000, maxCost: 40000 },
  { name: "Trunk", minCost: 18000, maxCost: 35000 },
  { name: "Headlight", minCost: 5000, maxCost: 12000 },
  { name: "Taillight", minCost: 5000, maxCost: 12000 },
  { name: "Windshield", minCost: 8000, maxCost: 25000 },
  { name: "Side Mirror", minCost: 3000, maxCost: 8000 }
];

const severityLevels = ["Minor", "Moderate", "Severe"];

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for car damage detection
app.post('/api/detect-damage', upload.single('carImage'), (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No image file uploaded'
      });
    }

    console.log('Received file:', req.file.filename);

    // Simulate damage detection with random logic
    const randomDamage = damageParts[Math.floor(Math.random() * damageParts.length)];
    const randomSeverity = severityLevels[Math.floor(Math.random() * severityLevels.length)];
    
    // Calculate estimated cost based on severity
    let baseCost = Math.floor(Math.random() * (randomDamage.maxCost - randomDamage.minCost + 1)) + randomDamage.minCost;
    
    // Adjust cost based on severity
    let finalCost;
    if (randomSeverity === "Minor") {
      finalCost = Math.floor(baseCost * 0.7); // 70% of base cost
    } else if (randomSeverity === "Moderate") {
      finalCost = baseCost; // 100% of base cost
    } else {
      finalCost = Math.floor(baseCost * 1.5); // 150% of base cost
    }

    // Format cost in Indian Rupees
    const formattedCost = `₹${finalCost.toLocaleString('en-IN')}`;

    // Return mock detection result
    const result = {
      damagedPart: randomDamage.name,
      severity: randomSeverity,
      estimatedCost: formattedCost,
      message: "Damage detected successfully!",
      fileName: req.file.filename
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
});