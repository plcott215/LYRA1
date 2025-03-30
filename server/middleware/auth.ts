import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";

// Initialize Firebase Admin
const firebaseConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  clientEmail: `firebase-adminsdk-${process.env.VITE_FIREBASE_PROJECT_ID}@appspot.gserviceaccount.com`,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
};

// Since we may not have the service account key file, we'll use a simplified auth middleware
// For demo purposes, this will validate the token if present or allow requests through with a demo user
let firebaseInitialized = false;

try {
  if (process.env.VITE_FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    initializeApp({
      credential: cert(firebaseConfig as ServiceAccount)
    });
    firebaseInitialized = true;
    console.log("Firebase Admin initialized");
  } else {
    console.log("Firebase Admin not initialized - missing credentials");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin:", error);
}

// Mock user for demo mode
const DEMO_USER = {
  id: 999,
  uid: "demo-user-123",
  email: "demo@lyra.app",
  displayName: "Demo User",
  photoURL: "https://ui-avatars.com/api/?name=Demo+User&background=random",
  providerId: "demo"
};

export const validateFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  // Skip auth for specific endpoints that are publicly accessible
  if (req.path === '/api/public' || req.path.startsWith('/api/public/')) {
    return next();
  }

  // Get the authorization header from the request
  const authHeader = req.headers.authorization;
  
  // If no auth header or in demo mode, use demo user
  if (!authHeader || !authHeader.startsWith('Bearer ') || !firebaseInitialized) {
    // Set demo user for development/testing
    req.body.user = DEMO_USER;
    return next();
  }

  try {
    // Extract token from the auth header
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token with Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Set user info on the request
    req.body.user = {
      id: parseInt(decodedToken.uid.replace(/\D/g, '')) || Math.floor(Math.random() * 1000) + 1,
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      providerId: decodedToken.firebase.sign_in_provider
    };
    
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    
    // If token verification fails, use demo user
    req.body.user = DEMO_USER;
    next();
  }
};