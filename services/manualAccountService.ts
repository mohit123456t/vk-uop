import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import authService from './authService';

const MANUAL_ACCOUNTS_COLLECTION = 'manualAccounts';

// Function to add a manual account (username/password)
export const addManualAccount = async (platform: string, username: string, password: string) => {
  const currentUser = authService.getCurrentState().userProfile;
  if (!currentUser) throw new Error('User not logged in');

  const accountData = {
    platform,
    username,
    password, // Note: Storing password in plain text is not secure, consider encryption
    status: 'Manual',
    userId: currentUser.uid,
    followers: 0,
    createdAt: new Date(),
  };

  const docRef = await addDoc(collection(db, MANUAL_ACCOUNTS_COLLECTION), accountData);
  return docRef;
};

// Function to get all manual accounts for current user
export const getManualAccounts = async () => {
  const currentUser = authService.getCurrentState().userProfile;
  if (!currentUser) return [];
  const q = query(collection(db, MANUAL_ACCOUNTS_COLLECTION), where('userId', '==', currentUser.uid));
  const querySnapshot = await getDocs(q);
  const accounts = [];
  querySnapshot.forEach((doc) => {
    accounts.push({ id: doc.id, ...doc.data() });
  });
  return accounts;
};

// Function to disconnect manual account by id
export const disconnectManualAccount = async (accountId: string) => {
  await deleteDoc(doc(db, MANUAL_ACCOUNTS_COLLECTION, accountId));
};
