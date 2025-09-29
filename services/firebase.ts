import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For security, consider using environment variables for this in production
const firebaseConfig = {
  apiKey: "AIzaSyDuyzYrUlQp-afe1Uv2bBsoZk4ewzlTZ1Y",
  authDomain: "reelpay-18d00.firebaseapp.com",
  projectId: "reelpay-18d00",
  storageBucket: "reelpay-18d00.firebasestorage.app",
  messagingSenderId: "708270652261",
  appId: "1:708270652261:web:6cc61595577607e5633f8c",
  measurementId: "G-2VMHEWCFW9"
};

// Initialize Firebase and export the core services
const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
const database: Database = getDatabase(app);
const storage: FirebaseStorage = getStorage(app);

// Clean, single export point for all Firebase services
export { app, db, auth, database, storage };
