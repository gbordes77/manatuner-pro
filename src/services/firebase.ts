import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getAnalytics } from 'firebase/analytics'
import type { FirebaseConfig } from '@/types'

// Firebase configuration
const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
}

// Initialize Firebase
let app: ReturnType<typeof initializeApp>
let auth: ReturnType<typeof getAuth>
let db: ReturnType<typeof getFirestore>
let functions: ReturnType<typeof getFunctions>
let analytics: ReturnType<typeof getAnalytics> | null = null

export const initializeFirebase = () => {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    functions = getFunctions(app)
    
    // Initialize Analytics only in production
    if (import.meta.env.PROD && firebaseConfig.measurementId) {
      analytics = getAnalytics(app)
    }
    
    // Connect to emulator in development
    if (import.meta.env.DEV) {
      const hostname = 'localhost'
      
      try {
        connectFunctionsEmulator(functions, hostname, 5001)
        console.log('Connected to Functions emulator')
      } catch (error) {
        console.warn('Failed to connect to Functions emulator:', error)
      }
    }
    
    console.log('Firebase initialized successfully')
    return { app, auth, db, functions, analytics }
  } catch (error) {
    console.error('Firebase initialization failed:', error)
    throw error
  }
}

// Export initialized services
export { auth, db, functions, analytics }

// Helper function to check if Firebase is initialized
export const isFirebaseInitialized = () => {
  return !!(app && auth && db && functions)
}

// Firebase error handler
export const getFirebaseErrorMessage = (error: any): string => {
  if (error?.code) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No user found with this email address'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/email-already-in-use':
        return 'Email address is already registered'
      case 'auth/weak-password':
        return 'Password is too weak'
      case 'auth/invalid-email':
        return 'Invalid email address'
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection'
      case 'permission-denied':
        return 'You do not have permission to perform this action'
      case 'unavailable':
        return 'Service temporarily unavailable. Please try again'
      case 'deadline-exceeded':
        return 'Request timed out. Please try again'
      default:
        return error.message || 'An unexpected error occurred'
    }
  }
  
  return error?.message || 'An unexpected error occurred'
} 