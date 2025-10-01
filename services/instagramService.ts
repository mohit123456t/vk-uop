import { db } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, deleteDoc, query, where } from 'firebase/firestore';
import authService from './authService';

const INSTAGRAM_ACCOUNTS_COLLECTION = 'instagramAccounts';

// HARDCODED aPI cREDENTIALS
const INSTAGRAM_APP_ID = '4234095126859404';
const INSTAGRAM_APP_SECRET = 'd309a2c47df7307e0121fd274f3bafa5';


// Exchanges a short-lived token for a long-lived token
const getLongLivedAccessToken = async (shortLivedToken: string) => {

    if (!INSTAGRAM_APP_ID || !INSTAGRAM_APP_SECRET) {
        throw new Error("Instagram App ID or App Secret is not hardcoded in instagramService.ts");
    }

    const response = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${INSTAGRAM_APP_ID}&client_secret=${INSTAGRAM_APP_SECRET}&fb_exchange_token=${shortLivedToken}`);
    const data = await response.json();

    if (data.error) {
        console.error("Error from Facebook while exchanging token:", data.error);
        throw new Error(`Facebook token exchange failed: ${data.error.message}`);
    }

    return data.access_token;
};

// This function now orchestrates the entire process of connecting an account via Facebook login.
export const connectInstagramAccount = async () => {
  const currentUser = authService.getCurrentState().userProfile;
  if (!currentUser) {
      throw new Error('User not logged in.');
  }

  try {
    // 1. Get short-lived token from Facebook login popup
    const shortLivedToken = await authService.linkWithFacebook();

    // 2. Exchange for a long-lived token
    const longLivedToken = await getLongLivedAccessToken(shortLivedToken);

    // 3. Get the user's Facebook pages
    const pagesResponse = await fetch(`https://graph.facebook.com/me/accounts?access_token=${longLivedToken}`);
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      throw new Error('Error fetching Facebook pages: ' + pagesData.error.message);
    }

    const connectedAccounts = [];
    const savePromises = []; // Array to hold all database save promises

    // 4. For each page, get the linked Instagram Business Account
    for (const page of pagesData.data) {
        const pageAccessToken = page.access_token;
        const pageResponse = await fetch(`https://graph.facebook.com/${page.id}?fields=instagram_business_account&access_token=${pageAccessToken}`);
        const pageData = await pageResponse.json();

        if (pageData.instagram_business_account) {
            const instagramAccountId = pageData.instagram_business_account.id;

            // 5. Get Instagram account details (username, etc.)
            const igResponse = await fetch(`https://graph.facebook.com/${instagramAccountId}?fields=username,followers_count&access_token=${pageAccessToken}`);
            const igData = await igResponse.json();

            if (igData.error) continue; // Skip if there's an error fetching IG details

            // 6. Check if this account is already connected
            const q = query(collection(db, INSTAGRAM_ACCOUNTS_COLLECTION), where('userId', '==', currentUser.uid), where('instagramUserId', '==', instagramAccountId));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                 // 7. Prepare to save the new account to Firestore
                const accountData = {
                    username: igData.username,
                    instagramUserId: instagramAccountId,
                    accessToken: pageAccessToken,
                    userId: currentUser.uid, 
                    platform: 'instagram',
                    status: 'Active',
                    followers: igData.followers_count || 0,
                    source: 'api',
                    connectedAt: new Date(),
                };

                // Add the save operation promise to our array
                savePromises.push(addDoc(collection(db, INSTAGRAM_ACCOUNTS_COLLECTION), accountData));
                connectedAccounts.push(igData.username);
            } else {
                 console.log(`Account @${igData.username} is already connected.`);
            }
        }
    }

    // 8. IMPORTANT: Wait for all the save operations to fully complete
    await Promise.all(savePromises);

    if(connectedAccounts.length === 0) {
        return "No new Instagram Business Accounts linked to your Facebook pages were found. Make sure your Instagram account is a Business or Creator account and linked to a Facebook page.";
    }

    return `Successfully connected ${connectedAccounts.length} new Instagram account(s): ${connectedAccounts.join(', ')}`;

  } catch (error) {
    console.error('Error connecting Instagram account:', error);
    throw error;
  }
};


// Function to disconnect an Instagram account by its Firestore document ID
export const disconnectInstagramAccount = async (accountId: string) => {
  await deleteDoc(doc(db, INSTAGRAM_ACCOUNTS_COLLECTION, accountId));
};

// Function to get all connected Instagram accounts for the current user
export const getInstagramAccounts = async () => {
  const currentUser = authService.getCurrentState().userProfile;
  if (!currentUser) return [];
  
  const q = query(collection(db, INSTAGRAM_ACCOUNTS_COLLECTION), where('userId', '==', currentUser.uid));
  const querySnapshot = await getDocs(q);
  
  const accounts = [];
  querySnapshot.forEach((doc) => {
    accounts.push({ id: doc.id, ...doc.data() });
  });
  
  return accounts;
};

// Posts content to a specific Instagram account, now with automatic Google Drive link conversion
export const postToInstagram = async (accountId: string, mediaUrl: string, caption: string) => {
    const currentUser = authService.getCurrentState().userProfile;
    if (!currentUser) throw new Error("User not logged in");

    const accountDoc = await getDoc(doc(db, INSTAGRAM_ACCOUNTS_COLLECTION, accountId));
    if (!accountDoc.exists() || accountDoc.data().userId !== currentUser.uid) {
        throw new Error("Instagram account not found or access denied.");
    }

    const accountData = accountDoc.data();
    const token = accountData.accessToken;
    const instagramUserId = accountData.instagramUserId;

    if (!token) {
        throw new Error("Access token not found. Please try reconnecting the account.");
    }
    if (!instagramUserId) {
        throw new Error("Instagram User ID not found. Please try reconnecting the account.");
    }

    // Automatically convert Google Drive links to direct download links
    let finalMediaUrl = mediaUrl;
    if (mediaUrl.includes("drive.google.com/file/d/")) {
        const match = mediaUrl.match(/\/d\/(.*?)(?:\/view|$)/);
        if (match && match[1]) {
            finalMediaUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
            console.log(`Converted Google Drive URL to: ${finalMediaUrl}`);
        }
    }

    console.log(`Posting to Instagram account ${instagramUserId} with caption: ${caption}`);

    try {
        // Step 1: Create Media Container
        const createContainerUrl = `https://graph.facebook.com/v19.0/${instagramUserId}/media`;
        const createContainerParams = new URLSearchParams({
            media_type: 'REELS',
            video_url: finalMediaUrl, // Use the converted URL
            caption: caption,
            access_token: token,
        });

        const createContainerResponse = await fetch(`${createContainerUrl}?${createContainerParams}`, { method: 'POST' });
        const createContainerData = await createContainerResponse.json();

        if (createContainerData.error) {
            throw new Error(`Error creating media container: ${createContainerData.error.message}`);
        }

        const containerId = createContainerData.id;

        // Step 2: Poll for status until the container is ready (Increased timeout and added logging)
        let isContainerReady = false;
        for (let i = 0; i < 40; i++) { // Increased to 40 attempts (4 minutes total)
            await new Promise(resolve => setTimeout(resolve, 6000));
            const statusResponse = await fetch(`https://graph.facebook.com/${containerId}?fields=status_code&access_token=${token}`);
            const statusData = await statusResponse.json();
            
            console.log("Container status poll:", statusData); // Added for debugging

            if (statusData.status_code === 'FINISHED') {
                isContainerReady = true;
                break;
            }
             if (statusData.status_code === 'ERROR') {
                throw new Error("Instagram's server failed to process the video. Check video format and permissions.");
            }
        }

        if (!isContainerReady) {
            throw new Error("Media container did not become ready in time. Please try again later.");
        }

        // Step 3: Publish Media Container
        const publishContainerUrl = `https://graph.facebook.com/v19.0/${instagramUserId}/media_publish`;
        const publishContainerParams = new URLSearchParams({
            creation_id: containerId,
            access_token: token,
        });

        const publishResponse = await fetch(`${publishContainerUrl}?${publishContainerParams}`, { method: 'POST' });
        const publishData = await publishResponse.json();

        if (publishData.error) {
            throw new Error(`Error publishing media: ${publishData.error.message}`);
        }

        return { success: true, message: `Reel successfully posted to @${accountData.username}!` };

    } catch (error) {
        console.error('Error posting to Instagram:', error);
        throw error;
    }
};
