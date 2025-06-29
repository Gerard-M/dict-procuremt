import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// NOTE: For this application to work, you must configure your Firebase
// Realtime Database security rules to allow public read and write access.
// In the Firebase console, go to Realtime Database > Rules and set them to:
// {
//   "rules": {
//     ".read": "true",
//     ".write": "true"
//   }
// }
// This is for development purposes only. For production, you should
// implement proper authentication and secure your rules.

const firebaseConfig = {
  apiKey: "AIzaSyCd0YgbhT8Xa0W7HsOinQr55hX9IL1UZrk",
  authDomain: "ilcdb-e1b29.firebaseapp.com",
  databaseURL: "https://ilcdb-e1b29-default-rtdb.firebaseio.com",
  projectId: "ilcdb-e1b29",
  storageBucket: "ilcdb-e1b29.firebasestorage.app",
  messagingSenderId: "942775517443",
  appId: "1:942775517443:web:cdde794b370a7225b8a936",
  measurementId: "G-CKZBY9YQ3K"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { db };
