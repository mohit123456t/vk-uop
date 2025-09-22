import { proxy, useSnapshot } from 'valtio';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; // Assuming firebase is initialized and exported from here

// 1. Define the shape of our state
export interface UserProfile {
  uid: string;
  role: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 2. Create the Valtio proxy state
// This state is reactive and can be subscribed to by components.
const state = proxy<AuthState>({
  user: null,
  userProfile: null,
  isLoading: true, // Start in a loading state until Firebase has initialized
  isAuthenticated: false,
});

// 3. Centralized logic to fetch and set the user profile
const updateUserProfile = async (user: User | null) => {
  if (user) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userProfileData = userDoc.data() as UserProfile;
        state.userProfile = { uid: user.uid, ...userProfileData };
        state.isAuthenticated = true;
      } else {
        // This case is for first-time Google Sign-In
        const newUserProfile: UserProfile = {
          uid: user.uid,
          role: 'brand', // Default role
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        await setDoc(userDocRef, newUserProfile);
        state.userProfile = newUserProfile;
        state.isAuthenticated = true;
      }
    } catch (error) {
      console.error("Error fetching/creating user profile:", error);
      // If fetching the profile fails, we consider the user not fully authenticated
      state.userProfile = null;
      state.isAuthenticated = false;
    }
  } else {
    // No user, reset the state
    state.user = null;
    state.userProfile = null;
    state.isAuthenticated = false;
  }
  state.isLoading = false; // Finished loading
};

// 4. Set up the Firebase auth state listener
// This is the heart of the service. It listens to Firebase for auth changes.
onAuthStateChanged(auth, async (user) => {
  state.isLoading = true;
  state.user = user;
  await updateUserProfile(user);
});

// 5. Define the actions (functions to modify state)
const signIn = async (email: string, password: string): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
  // onAuthStateChanged will handle the rest
};

const signInWithGoogle = async (): Promise<void> => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
  // onAuthStateChanged will handle the rest
};

const signOutUser = async (): Promise<void> => {
  await signOut(auth);
  // onAuthStateChanged will handle the rest
};

// 6. Create the public-facing service object
const authService = {
  // The `useAuth` hook is the intended way for components to interact with the state.
  useAuth: () => useSnapshot(state),

  // Direct actions
  signIn,
  signInWithGoogle,
  signOutUser,
};

export default authService;
