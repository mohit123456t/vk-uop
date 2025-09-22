import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  inMemoryPersistence,
  type Auth,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database } from "firebase/database";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDuyzYrUlQp-afe1Uv2bBsoZk4ewzlTZ1Y",
  authDomain: "reelpay-18d00.firebaseapp.com",
  projectId: "reelpay-18d00",
  storageBucket: "reelpay-18d00.firebasestorage.app",
  messagingSenderId: "708270652261",
  appId: "1:708270652261:web:6cc61595577607e5633f8c",
  measurementId: "G-2VMHEWCFW9",
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let database: Database;
let storage: FirebaseStorage;

// Prevent duplicate initialization
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// ✅ Safe Auth Initialization
if (typeof window !== "undefined") {
  auth = initializeAuth(app, {
    persistence: [browserLocalPersistence], // IndexedDB hata diya (illegal invocation fix)
  });
} else {
  // SSR fallback → no IndexedDB, just in-memory
  auth = initializeAuth(app, {
    persistence: inMemoryPersistence,
  });
}

db = getFirestore(app);
database = getDatabase(app);
storage = getStorage(app);

export { app, auth, db, database, storage };
