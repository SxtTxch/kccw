import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCNX5U-nlxxUcbvF61Gj6tkMssIdBmBmCg",
  authDomain: "kccw-a2786.firebaseapp.com",
  projectId: "kccw-a2786",
  storageBucket: "kccw-a2786.firebasestorage.app",
  messagingSenderId: "782338075484",
  appId: "1:782338075484:web:1667423357315006876f99",
  measurementId: "G-MWGJ03P681"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Debug function to check Firebase initialization
export const checkFirebaseInitialization = () => {
  console.log('Firebase app initialized:', app);
  console.log('Firebase auth:', auth);
  console.log('Firebase db:', db);
  console.log('Firebase storage:', storage);
  return {
    app: !!app,
    auth: !!auth,
    db: !!db,
    storage: !!storage
  };
};

export default app;
