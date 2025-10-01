import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import authService from './authService';

// COLLECTION NAMES
const YOUTUBE_ACCOUNTS_COLLECTION = 'youtubeAccounts';
const YOUTUBE_SETTINGS_COLLECTION = 'youtubeSettings';

// --- AUTH AND API KEY MANAGEMENT --- //

export const setYouTubeAPIKey = async (apiKey: string) => {
  const currentUser = authService.getCurrentState().userProfile;
  if (!currentUser) throw new Error('User not logged in');
  const q = query(collection(db, YOUTUBE_SETTINGS_COLLECTION), where('userId', '==', currentUser.uid));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, { apiKey });
  } else {
    await addDoc(collection(db, YOUTUBE_SETTINGS_COLLECTION), { userId: currentUser.uid, apiKey });
  }
};

export const getYouTubeAPIKey = async () => {
  const currentUser = authService.getCurrentState().userProfile;
  if (!currentUser) return null;
  const q = query(collection(db, YOUTUBE_SETTINGS_COLLECTION), where('userId', '==', currentUser.uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : querySnapshot.docs[0].data().apiKey;
};

export const setYouTubeAccessToken = async (accessToken: string) => {
  const currentUser = authService.getCurrentState().userProfile;
  if (!currentUser) throw new Error('User not logged in');
  const settingsRef = doc(db, YOUTUBE_SETTINGS_COLLECTION, currentUser.uid);
  await updateDoc(settingsRef, { accessToken }, { merge: true });
};

export const getYouTubeAccessToken = async () => {
  const currentUser = authService.getCurrentState().userProfile;
  if (!currentUser) return null;
  const settingsRef = doc(db, YOUTUBE_SETTINGS_COLLECTION, currentUser.uid);
  const docSnap = await getDocs(query(collection(db, YOUTUBE_SETTINGS_COLLECTION), where('userId', '==', currentUser.uid)));
  return docSnap.empty ? null : docSnap.docs[0].data().accessToken;
};

// --- ACCOUNT MANAGEMENT --- //

// CRASH FIX: Re-adding the missing function that AccountsView.tsx needs.
export const addYouTubeAccount = async (channelId: string) => {
  console.warn('addYouTubeAccount is not implemented', channelId);
  // This is a placeholder to prevent crashes.
};

export const getConnectedYoutubeChannels = async () => {
  const currentUser = authService.getCurrentState().userProfile;
  if (!currentUser) return [];
  const q = query(collection(db, YOUTUBE_ACCOUNTS_COLLECTION), where('userId', '==', currentUser.uid));
  const querySnapshot = await getDocs(q);
  const accounts = [];
  querySnapshot.forEach((doc) => {
    accounts.push({ id: doc.id, ...doc.data() });
  });
  return accounts;
};

export const disconnectYouTubeAccount = async (accountId: string) => {
  await deleteDoc(doc(db, YOUTUBE_ACCOUNTS_COLLECTION, accountId));
};


// --- CORE VIDEO UPLOAD LOGIC --- //

const uploadVideoToYouTube = async (file: File, title: string, description: string) => {
  const accessToken = await getYouTubeAccessToken();
  if (!accessToken) throw new Error('YouTube access token not set. Please connect your account via Google.');

  const metadata = {
    snippet: { title, description, categoryId: '22' },
    status: { privacyStatus: 'unlisted' },
  };

  const formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('video', file);

  try {
    // This now correctly calls our backend uploader function, proxied by Vite.
    const response = await fetch('/api/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`YouTube upload failed: ${error.error.message}`);
    }
    return await response.json();
  } catch (error) { 
    console.error('YouTube upload exception:', error);
    throw error;
  }
};

export const postToYoutube = async (channelId: string, title: string, videoUrl: string) => {
    console.log(`Starting YouTube post for channel ${channelId}. Title: ${title}`);
    
    // THE REAL FIX: Using our own backend function to download the video.
    // This avoids all public proxy and CORS issues.
    const proxyUrl = `/api/downloadProxy?url=${encodeURIComponent(videoUrl)}`;

    try {
        console.log(`Fetching video via OUR OWN backend proxy: ${proxyUrl}`);
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Our backend proxy failed to download the video. Status: ${response.status}. Message: ${errorText}`);
        }
        const videoBlob = await response.blob();
        if (videoBlob.size === 0) {
            throw new Error("Downloaded video file is empty. Our backend proxy returned an empty response.");
        }
        const videoFile = new File([videoBlob], "youtube-reel.mp4", { type: videoBlob.type });
        console.log(`Video downloaded successfully via backend. Size: ${(videoFile.size / 1024 / 1024).toFixed(2)} MB`);

        const description = `Posted via content dashboard. Original URL: ${videoUrl}`;
        return await uploadVideoToYouTube(videoFile, title, description);

    } catch (error) { 
        console.error('Error in postToYoutube wrapper function:', error);
        throw new Error(`Post failed: Could not process the video. (${error.message})`);
    }
};