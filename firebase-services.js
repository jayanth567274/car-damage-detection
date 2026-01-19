import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

// User authentication functions
export async function registerUser(email, password, username) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Store additional user data in Firestore
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      email: email,
      username: username,
      createdAt: new Date()
    });
    
    console.log('User registered successfully:', user.uid);
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
  }
}

export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('User logged in successfully:', user.uid);
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    console.log('User logged out successfully');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}

export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// History management functions
export async function saveDetectionHistory(userId, detectionData) {
  try {
    const docRef = await addDoc(collection(db, "detectionHistory"), {
      userId: userId,
      ...detectionData,
      timestamp: new Date()
    });
    
    console.log('Detection history saved with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error saving detection history:', error);
    return { success: false, error: error.message };
  }
}

export async function getUserDetectionHistory(userId) {
  try {
    const q = query(collection(db, "detectionHistory"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const history = [];
    querySnapshot.forEach((doc) => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort by timestamp (newest first)
    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    console.log('Retrieved detection history:', history.length, 'records');
    return { success: true, history };
  } catch (error) {
    console.error('Error fetching detection history:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteDetectionHistory(userId, recordId) {
  try {
    // First verify the record belongs to the user
    const recordRef = doc(db, "detectionHistory", recordId);
    const recordSnapshot = await getDocs(query(collection(db, "detectionHistory"), where("userId", "==", userId)));
    
    let recordExists = false;
    recordSnapshot.forEach((doc) => {
      if (doc.id === recordId) {
        recordExists = true;
      }
    });
    
    if (!recordExists) {
      throw new Error('Record not found or unauthorized');
    }
    
    await deleteDoc(recordRef);
    console.log('Detection history deleted:', recordId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting detection history:', error);
    return { success: false, error: error.message };
  }
}

console.log('Firebase services module loaded');