import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

const INSTAGRAM_ACCOUNTS_COLLECTION = 'instagramAccounts';
const INSTAGRAM_APP_ID = '1841814749704186';
const INSTAGRAM_APP_SECRET = 'c91c8ad6c0e8e0f0b19338530bd302d5';
const REDIRECT_URI = 'http://localhost:5175/instagram-callback';

// Function to initiate Instagram OAuth flow
export const connectInstagramAccount = () => {
  const authURL = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user_profile,user_media&response_type=code`;
  window.location.href = authURL;
};

// Function to handle Instagram OAuth callback
export const handleInstagramCallback = async (code: string) => {
  try {
    const response = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      // Get user info
      const userResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${data.access_token}`);
      const userData = await userResponse.json();

      // Save to Firestore
      const accountData = {
        username: userData.username,
        status: 'Active',
        access_token: data.access_token,
        user_id: data.user_id,
      };

      await addDoc(collection(db, INSTAGRAM_ACCOUNTS_COLLECTION), accountData);
    }
  } catch (error) {
    console.error('Error handling Instagram callback:', error);
  }
};

// Function to disconnect Instagram account by id
export const disconnectInstagramAccount = async (accountId: string) => {
  await deleteDoc(doc(db, INSTAGRAM_ACCOUNTS_COLLECTION, accountId));
};

// Function to get all connected Instagram accounts
export const getInstagramAccounts = async () => {
  const querySnapshot = await getDocs(collection(db, INSTAGRAM_ACCOUNTS_COLLECTION));
  const accounts = [];
  querySnapshot.forEach((doc) => {
    accounts.push({ id: doc.id, ...doc.data() });
  });
  return accounts;
};

// Function to refresh Instagram token (placeholder)
export const refreshInstagramToken = async (accountId: string) => {
  // TODO: Implement token refresh logic
  console.log('Refresh Instagram token for account:', accountId);
};
