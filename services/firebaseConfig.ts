import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// ============================================================================
// FIREBASE CONFIGURATION SECTION
// ============================================================================
// Instructions:
// 1. Go to Firebase Console (console.firebase.google.com)
// 2. Create a new project or select an existing one.
// 3. Register a web app.
// 4. Copy the "firebaseConfig" object SDK snippet.
// 5. Replace the values below with your specific keys.
// ============================================================================

export const firebaseConfig = {
  apiKey: "AIzaSyCf8QEHR5_kno8KM-AtJVnhcFtULHkMcrk",
  authDomain: "presidency-academy.firebaseapp.com",
  databaseURL: "https://presidency-academy-default-rtdb.firebaseio.com",
  projectId: "presidency-academy",
  storageBucket: "presidency-academy.firebasestorage.app",
  messagingSenderId: "323614994526",
  appId: "1:323614994526:web:f8f5ea5c4551fff38e04cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Database instances for use in services
export const auth = getAuth(app);
export const db = getDatabase(app);

// Helper to check if config is set
export const isFirebaseConfigured = () => {
  return firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";
};