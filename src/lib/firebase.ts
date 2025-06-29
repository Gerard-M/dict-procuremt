import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

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
