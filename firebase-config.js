// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMu4ivFK3fTL77ZfjazNcNQXVUzP6dF5A",
  authDomain: "car-damage-detection-483d8.firebaseapp.com",
  projectId: "car-damage-detection-483d8",
  storageBucket: "car-damage-detection-483d8.firebasestorage.app",
  messagingSenderId: "80837421932",
  appId: "1:80837421932:web:f236c1015834d6827e6149",
  measurementId: "G-2Y1DQBSREQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the initialized services
export { app, auth, db, storage, analytics };

console.log('Firebase initialized successfully');