import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const FACEBOOK_ACCOUNTS_COLLECTION = 'facebookAccounts';

// Function to initiate Facebook OAuth flow (placeholder)
export const connectFacebookAccount = async () => {
  // TODO: Implement Facebook OAuth flow initiation
  console.log('Initiate Facebook OAuth flow');
};

// Function to disconnect Facebook account by id
export const disconnectFacebookAccount = async (accountId: string) => {
  await deleteDoc(doc(db, FACEBOOK_ACCOUNTS_COLLECTION, accountId));
};

// Function to get all connected Facebook accounts
export const getFacebookAccounts = async () => {
  const querySnapshot = await getDocs(collection(db, FACEBOOK_ACCOUNTS_COLLECTION));
  const accounts = [];
  querySnapshot.forEach((doc) => {
    accounts.push({ id: doc.id, ...doc.data() });
  });
  return accounts;
};

// Function to refresh Facebook token (placeholder)
export const refreshFacebookToken = async (accountId: string) => {
  // TODO: Implement token refresh logic
  console.log('Refresh Facebook token for account:', accountId);
};
