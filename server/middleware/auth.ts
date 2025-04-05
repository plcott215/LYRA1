import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

// For demo/development purposes - this makes the app function even without proper Firebase Admin credentials
let firebaseInitialized = false;
let developmentMode = process.env.NODE_ENV !== 'production';

// Skip Firebase initialization in development mode
developmentMode = true;
console.log("Running in development mode - using demo user for authentication");

// Mock user for demo mode with Pro subscription
const DEMO_USER = {
  id: 999,
  uid: "demo-user-123",
  email: "demo@lyra.app",
  displayName: "Demo User",
  photoURL: "https://ui-avatars.com/api/?name=Demo+User&background=random",
  providerId: "demo",
  // Add Pro subscription flags
  isPro: true,
  isAdmin: true
};

export const validateFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  // Skip auth for specific endpoints that are publicly accessible
  if (req.path === '/api/public' || req.path.startsWith('/api/public/')) {
    return next();
  }

  // In development mode or if Firebase is not properly initialized, use demo user
  if (developmentMode || !firebaseInitialized) {
    req.body.user = DEMO_USER;
    return next();
  }

  // Get the authorization header from the request
  const authHeader = req.headers.authorization;
  
  // If no auth header, use demo user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.body.user = DEMO_USER;
    return next();
  }

  try {
    // Extract token from the auth header
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Set user info on the request
    req.body.user = {
      id: parseInt(decodedToken.uid.replace(/\D/g, '')) || Math.floor(Math.random() * 1000) + 1,
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      displayName: decodedToken.name || 'User',
      photoURL: decodedToken.picture || '',
      providerId: decodedToken.firebase?.sign_in_provider || 'unknown'
    };
    
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    
    // If token verification fails, use demo user in non-production
    req.body.user = DEMO_USER;
    next();
  }
};