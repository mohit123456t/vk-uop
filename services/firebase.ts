import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getDatabase, Database } from "firebase/database";
import { getStorage, FirebaseStorage, ref, uploadBytesResumable, getDownloadURL, UploadTask } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuyzYrUlQp-afe1Uv2bBsoZk4ewzlTZ1Y",
  authDomain: "reelpay-18d00.firebaseapp.com",
  projectId: "reelpay-18d00",
  storageBucket: "reelpay-18d00.appspot.com", // Corrected storage bucket
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

/**
 * Uploads a file to Firebase Storage and reports progress.
 * @param file The file to upload.
 * @param path The path in Firebase Storage to upload the file to.
 * @param onProgress A callback function to receive upload progress (0-100).
 * @returns A promise that resolves with the public download URL of the file.
 */
export const uploadFile = (file: File, path: string, onProgress: (progress: number) => void): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error("Firebase upload error:", error);
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};

// Clean, single export point for all Firebase services
export { app, db, auth, database, storage };
