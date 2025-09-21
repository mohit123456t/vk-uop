import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs, query, where, addDoc, doc, updateDoc } from "firebase/firestore";
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

export { db, auth, database, storage };

// Utility functions for reel uploads and account management
export const uploadReel = async (reelData) => {
    try {
        const docRef = await addDoc(collection(db, 'reel_uploads'), reelData);
        return docRef.id;
    } catch (error) {
        console.error('Error uploading reel:', error);
        throw error;
    }
};

export const getUploaderAccounts = async (uploaderId) => {
    try {
        const q = query(collection(db, 'instagram_accounts'), where('uploaderId', '==', uploaderId));
        const querySnapshot = await getDocs(q);
        const accounts = [];
        querySnapshot.forEach(doc => accounts.push({ id: doc.id, ...doc.data() }));
        return accounts;
    } catch (error) {
        console.error('Error fetching uploader accounts:', error);
        throw error;
    }
};

export const checkReelUploadExists = async (reelId, accountId) => {
    try {
        const q = query(
            collection(db, 'reel_uploads'),
            where('reelId', '==', reelId),
            where('accountId', '==', accountId)
        );
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking reel upload:', error);
        throw error;
    }
};

export const getDailyUploadCount = async (uploaderId) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const q = query(
            collection(db, 'reel_uploads'),
            where('uploaderId', '==', uploaderId),
            where('uploadDate', '>=', today + 'T00:00:00'),
            where('uploadDate', '<=', today + 'T23:59:59')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.size;
    } catch (error) {
        console.error('Error getting daily upload count:', error);
        throw error;
    }
};
