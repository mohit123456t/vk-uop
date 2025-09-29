import {
  Auth,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { app, db } from './firebase';

// Main user profile interface
export interface UserProfile extends DocumentData {
  uid: string;
  name?: string;
  email: string;
  role?: string;
  createdAt?: any;
  lastLoginAt?: any;
}

// The state broadcasted to the app
export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthStateCallback = (state: AuthState) => void;

class AuthService {
  private static instance: AuthService;
  private auth: Auth;
  private callbacks: Set<AuthStateCallback> = new Set();
  private currentState: AuthState = { user: null, userProfile: null, isAuthenticated: false, isLoading: true };
  private profileUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.auth = getAuth(app);
    onAuthStateChanged(this.auth, this.handleUserChange.bind(this));
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Central state update and notification method
  private updateState(newState: Partial<AuthState>) {
    //isLoading should become false after the first check
    this.currentState = { ...this.currentState, ...newState, isLoading: false };
    this.callbacks.forEach(callback => callback(this.currentState));
  }

  // Called when Firebase auth state changes (login/logout)
  private async handleUserChange(user: User | null) {
    if (this.profileUnsubscribe) {
      this.profileUnsubscribe();
      this.profileUnsubscribe = null;
    }

    if (user) {
      // User is authenticated, listen for their profile document
      const userRef = doc(db, 'users', user.uid);
      this.profileUnsubscribe = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          this.updateState({ user, userProfile: { uid: docSnap.id, ...docSnap.data() } as UserProfile, isAuthenticated: true });
        } else {
          // This can happen if a user authenticates but their profile doc creation failed.
          this.updateState({ user, userProfile: { uid: user.uid, email: user.email! }, isAuthenticated: true });
        }
      });
    } else {
      // User is logged out
      this.updateState({ user: null, userProfile: null, isAuthenticated: false });
    }
  }

  // --- Public API --- //

  public onAuthStateChange(callback: AuthStateCallback): () => void {
    this.callbacks.add(callback);
    // Immediately give the new subscriber the current state
    callback(this.currentState);
    return () => this.callbacks.delete(callback);
  }

  public getCurrentState(): AuthState {
    return this.currentState;
  }

  public async getUsersByRole(role: string): Promise<UserProfile[]> {
    const q = query(collection(db, "users"), where("role", "==", role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      // The doc.id is the UID. We must ensure it's on the returned object.
      // doc.data() contains the rest of the profile.
      return { ...doc.data(), uid: doc.id } as UserProfile;
    });
  }

  // Login with email and password
  public async login(email: string, password: string): Promise<UserProfile> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // Update last login time
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });

    const profileSnap = await getDoc(userRef);
    if (!profileSnap.exists()) throw new Error("User profile not found.");
    
    return { uid: profileSnap.id, ...profileSnap.data() } as UserProfile;
  }

  // Login with Google Popup
  public async loginWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    const profileSnap = await getDoc(userRef);

    if (profileSnap.exists()) {
      // User exists, just update their login time
      await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      return { uid: profileSnap.id, ...profileSnap.data() } as UserProfile;
    } else {
      // New Google user, create their profile
      const newUserProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'Google User',
        email: user.email!,
        role: 'brand', // Default role for new signups
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };
      await setDoc(userRef, newUserProfile);
      return newUserProfile;
    }
  }

  // Register a new user (for brand owners)
  public async registerUser(email: string, password: string, additionalData: Omit<UserProfile, 'uid' | 'email'>): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    
    const newUserProfile: UserProfile = {
      uid: user.uid,
      email,
      ...additionalData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    
    await setDoc(doc(db, 'users', user.uid), newUserProfile);
  }

  // Logout the current user
  public async logout(): Promise<void> {
    await signOut(this.auth);
  }
}

// Export a single instance of the service
const authService = AuthService.getInstance();
export default authService;
