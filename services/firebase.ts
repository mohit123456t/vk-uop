
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where, addDoc, doc, updateDoc, orderBy } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuyzYrUlQp-afe1Uv2bBsoZk4ewzlTZ1Y",
  authDomain: "reelpay-18d00.firebaseapp.com",
  projectId: "reelpay-18d00",
  storageBucket: "reelpay-18d00.firebasestorage.app",
  messagingSenderId: "708270652261",
  appId: "1:708270652261:web:6cc61595577607e5633f8c",
  measurementId: "G-2VMHEWCFW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Realtime Database
const database = getDatabase(app);

// Initialize Auth
const auth = getAuth(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage, database, collection, getDocs, query, where, addDoc, doc, updateDoc, orderBy };
