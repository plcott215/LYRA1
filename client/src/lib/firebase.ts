import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Define appropriate types
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let googleProvider: GoogleAuthProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.error("Firebase initialization error:", error);
  // Create a simplified mock Auth object with only the minimal required properties
  // This approach avoids type errors with missing properties
  const mockAuth = {
    currentUser: null,
    onAuthStateChanged: () => () => {},
    // Add app reference
    app: {} as FirebaseApp,
    name: 'mock-auth'
  } as unknown as Auth;

  // Initialize fallbacks
  app = {} as FirebaseApp;
  auth = mockAuth;
  googleProvider = new GoogleAuthProvider();
}

// Auth functions
export const signInWithGoogle = async () => {
  try {
    // Check if Firebase is properly configured before attempting sign-in
    if (!import.meta.env.VITE_FIREBASE_API_KEY || 
        !import.meta.env.VITE_FIREBASE_PROJECT_ID ||
        !import.meta.env.VITE_FIREBASE_APP_ID) {
      throw new Error("Firebase configuration is missing. Please use email sign-in instead.");
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Firebase Google sign-in error:", error);
    // Preserve the original error message
    throw error;
  }
};

// Apple sign-in removed

export const signInWithEmail = async (email: string, password: string) => {
  try {
    // Check if Firebase is properly configured before attempting sign-in
    if (!import.meta.env.VITE_FIREBASE_API_KEY || 
        !import.meta.env.VITE_FIREBASE_PROJECT_ID ||
        !import.meta.env.VITE_FIREBASE_APP_ID) {
      throw new Error("Firebase configuration is missing. Please contact support.");
    }
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Firebase email sign-in error:", error);
    // Handle configuration errors specially
    if (error.code === "auth/configuration-not-found") {
      throw new Error("Authentication service is temporarily unavailable. Please try again later.");
    }
    throw new Error(error.message);
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    // Check if Firebase is properly configured before attempting sign-up
    if (!import.meta.env.VITE_FIREBASE_API_KEY || 
        !import.meta.env.VITE_FIREBASE_PROJECT_ID ||
        !import.meta.env.VITE_FIREBASE_APP_ID) {
      throw new Error("Firebase configuration is missing. Please contact support.");
    }
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: any) {
    console.error("Firebase email sign-up error:", error);
    // Handle configuration errors specially
    if (error.code === "auth/configuration-not-found") {
      throw new Error("Account creation is temporarily unavailable. Please try again later.");
    }
    throw new Error(error.message);
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };
