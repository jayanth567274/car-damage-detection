# 🚗 Car Damage Detection System

A demo-level web application that simulates car damage detection using rule-based logic. Built with HTML, CSS, Vanilla JavaScript (frontend) and Node.js/Express (backend).

## 🎯 Project Overview

This is a **portfolio demonstration project** that showcases a simulated car damage detection system. It uses mock logic to generate realistic damage analysis results without requiring actual machine learning models.

## 📁 Folder Structure

```
/car-damage-detection
│
├── /public              # Frontend files
│   ├── index.html       # Main HTML page
│   ├── style.css        # Styling
│   └── script.js        # Client-side JavaScript
│
├── /uploads             # Uploaded images storage
│
├── server.js            # Node.js Express server
├── package.json         # Project dependencies
└── README.md           # This file
```

## 🚀 Features

### Frontend (HTML + CSS + Vanilla JS)
- ✅ Clean, responsive design with centered card layout
- ✅ User authentication (Login/Signup)
- ✅ Session management
- ✅ Image upload with preview functionality
- ✅ Real-time damage analysis simulation
- ✅ Dynamic result display with cost estimation
- ✅ User detection history tracking
- ✅ History management (view/delete records)
- ✅ Loading indicators and error handling
- ✅ Mobile-responsive design

### Backend (Node.js + Express)
- ✅ User authentication routes
- ✅ Password hashing with bcrypt
- ✅ Session management with express-session
- ✅ Image upload handling with Multer
- ✅ File validation (size/type restrictions)
- ✅ User detection history storage
- ✅ Mock damage detection logic
- ✅ Random damage part generation
- ✅ Severity-based cost calculation
- ✅ RESTful API endpoints

### Damage Simulation Logic
The system randomly selects from these car parts:
- **Front/Rear Bumper** (₹10,000 - ₹20,000)
- **Left/Right Door** (₹15,000 - ₹30,000)
- **Hood** (₹20,000 - ₹40,000)
- **Trunk** (₹18,000 - ₹35,000)
- **Headlight/Taillight** (₹5,000 - ₹12,000)
- **Windshield** (₹8,000 - ₹25,000)
- **Side Mirror** (₹3,000 - ₹8,000)

Severity levels adjust costs:
- **Minor**: 70% of base cost
- **Moderate**: 100% of base cost
- **Severe**: 150% of base cost

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling (no frameworks)
- **Vanilla JavaScript** - Client-side logic

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Express-session** - Session management
- **CORS** - Cross-origin resource sharing

## ▶️ How to Run

### Prerequisites
- Node.js installed on your system

### Installation Steps

1. **Clone or download the project**
   ```bash
   # Navigate to project directory
   cd car-damage-detection
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   Open your browser and go to: `http://localhost:3000`

### Development Mode
For automatic restarts during development:
```bash
npm install -g nodemon  # Install nodemon globally (first time only)
npm run dev
```

## 🎮 Usage Instructions

1. **Upload Image**: Click "Choose Car Image" and select a JPG/PNG file
2. **Preview**: See your image preview before analysis
3. **Detect Damage**: Click "🔍 Detect Damage" button
4. **View Results**: See the simulated damage analysis including:
   - Damaged part identification
   - Estimated repair cost (INR)
   - Damage severity level
   - Success message

## 🔧 API Endpoints

### Authentication
**POST** `/api/signup`
- Register new user
- Request: `{ username, email, password }`

**POST** `/api/login`
- User login
- Request: `{ email, password }`

**POST** `/api/logout`
- User logout

**GET** `/api/user`
- Get current user info

### Damage Detection
**POST** `/api/detect-damage`
- **Request**: FormData with `carImage` field
- **Response**: JSON object with damage analysis
- **Success Response**:
  ```json
  {
    "damagedPart": "Front Bumper",
    "severity": "Moderate",
    "estimatedCost": "₹15,000",
    "message": "Damage detected successfully!",
    "fileName": "carImage-123456789.jpg"
  }
  ```

### History Management
**GET** `/api/history`
- Get user's detection history

**DELETE** `/api/history/:id`
- Delete specific history record

## 📱 Responsive Design

The application works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🎨 UI Features

- Gradient background design
- Card-based layout
- Smooth hover animations
- Loading spinners
- Error messaging
- Success indicators
- Clean typography

## ⚠️ Limitations

This is a **demo/portfolio project** with:
- ❌ No real AI/ML image processing
- ❌ Simulated damage detection logic
- ❌ Rule-based random responses
- ✅ Perfect for interviews and demonstrations
- ✅ Easy to explain the concept

## 🔒 Security & Validation

- File type validation (images only)
- File size limit (5MB)
- CORS enabled for cross-origin requests
- Error handling for invalid uploads

## 📝 Interview Talking Points

This project demonstrates:
- Full-stack web development skills
- RESTful API design
- File upload handling
- Asynchronous JavaScript (fetch API)
- Responsive web design
- Error handling and user experience
- Clean, maintainable code structure

## 🤝 Contributing

This is a personal portfolio project. Feel free to fork and modify for your own use!

## 📄 License

ISC License

---

**Built with ❤️ for portfolio demonstration purposes**