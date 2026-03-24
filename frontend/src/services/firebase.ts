import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { FirebaseConfig } from '../types';

// Firebase configuration from backend/.env
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBwAnMaGuFGWlQbLEE8zmkjDZL06QWaHcs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "asikaso-1b474.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "asikaso-1b474",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "asikaso-1b474.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "685594328760",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:685594328760:web:ea42049b5c39d8398cfe4d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6B8LNQXXZ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

export { app, auth };
