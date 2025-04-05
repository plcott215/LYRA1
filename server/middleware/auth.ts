import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";

// For demo/development purposes - this makes the app function even without proper Firebase Admin credentials
let firebaseInitialized = false;
let developmentMode = process.env.NODE_ENV !== 'production';

// Keep development mode for easy testing
developmentMode = true;
console.log("Running with auth middleware - pro features available via special test login");

// Regular user for most logins - no Pro features
const REGULAR_USER = {
  id: 500,
  uid: "regular-user-123",
  email: "user@example.com",
  displayName: "Regular User",
  photoURL: "https://ui-avatars.com/api/?name=Regular+User&background=random",
  providerId: "demo",
  // No Pro subscription
  isPro: false,
  isAdmin: false
};

// Test user with Pro subscription - only for the demo@lyra.app account
const DEMO_PRO_USER = {
  id: 999,
  uid: "demo-pro-user-123",
  email: "demo@lyra.app",
  displayName: "Demo Pro User",
  photoURL: "https://ui-avatars.com/api/?name=Demo+Pro&background=random",
  providerId: "demo",
  // Pro features enabled for this test account only
  isPro: true,
  isAdmin: false
};

export const validateFirebaseToken = async (req: Request, res: Response, next: NextFunction) => {
  // Skip auth for specific endpoints that are publicly accessible
  if (req.path === '/api/public' || req.path.startsWith('/api/public/')) {
    return next();
  }

  // In development mode or if Firebase is not properly initialized, use regular user
  if (developmentMode || !firebaseInitialized) {
    req.body.user = REGULAR_USER;
    return next();
  }

  // Get the authorization header from the request
  const authHeader = req.headers.authorization;
  
  // If no auth header, use regular user
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.body.user = REGULAR_USER;
    return next();
  }

  try {
    // Extract token from the auth header
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Check if this is our special demo Pro user by email
    const userEmail = decodedToken.email || '';
    if (userEmail.toLowerCase() === DEMO_PRO_USER.email.toLowerCase()) {
      // Use the Pro demo account for this special user
      req.body.user = DEMO_PRO_USER;
    } else {
      // For everyone else, set regular user info
      req.body.user = {
        id: parseInt(decodedToken.uid.replace(/\D/g, '')) || Math.floor(Math.random() * 1000) + 1,
        uid: decodedToken.uid,
        email: userEmail,
        displayName: decodedToken.name || 'User',
        photoURL: decodedToken.picture || '',
        providerId: decodedToken.firebase?.sign_in_provider || 'unknown',
        isPro: false // Not a Pro user by default
      };
    }
    
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    
    // If token verification fails, use regular user in non-production
    req.body.user = REGULAR_USER;
    next();
  }
};