import {
  Auth,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  User,
  linkWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot, collection, query, where, getDocs, DocumentData, Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';

// Lazy loader for Firebase services to avoid race conditions in Vite
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

async function getFirebaseServices() {
  if (!app) {
    const firebaseModule = await import('./firebase');
    app = firebaseModule.app;
    db = firebaseModule.db;
    auth = getAuth(app);
  }
  return { app, db, auth };
}

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
  private callbacks: Set<AuthStateCallback> = new Set();
  private currentState: AuthState = { user: null, userProfile: null, isAuthenticated: false, isLoading: true };
  private profileUnsubscribe: (() => void) | null = null;

  private constructor() {
    this.init();
  }

  private async init() {
    const { auth } = await getFirebaseServices();
    onAuthStateChanged(auth, this.handleUserChange.bind(this));
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Central state update and notification method
  private updateState(newState: Partial<AuthState>) {
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
      const { db } = await getFirebaseServices();
      const userRef = doc(db, 'users', user.uid);
      this.profileUnsubscribe = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          this.updateState({ user, userProfile: { uid: docSnap.id, ...docSnap.data() } as UserProfile, isAuthenticated: true });
        } else {
          this.updateState({ user, userProfile: { uid: user.uid, email: user.email! }, isAuthenticated: true });
        }
      });
    } else {
      this.updateState({ user: null, userProfile: null, isAuthenticated: false });
    }
  }

  // --- Public API --- //

  public onAuthStateChange(callback: AuthStateCallback): () => void {
    this.callbacks.add(callback);
    callback(this.currentState);
    return () => this.callbacks.delete(callback);
  }

  public getCurrentState(): AuthState {
    return this.currentState;
  }

  public async getUsersByRole(role: string): Promise<UserProfile[]> {
    const { db } = await getFirebaseServices();
    const q = query(collection(db, "users"), where("role", "==", role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
  }

  public async login(email: string, password: string): Promise<UserProfile> {
    const { auth, db } = await getFirebaseServices();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
    const profileSnap = await getDoc(userRef);
    if (!profileSnap.exists()) throw new Error("User profile not found.");
    return { uid: profileSnap.id, ...profileSnap.data() } as UserProfile;
  }

  public async loginWithGoogle(): Promise<UserProfile> {
    const { auth, db } = await getFirebaseServices();
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db, 'users', user.uid);
    const profileSnap = await getDoc(userRef);

    if (profileSnap.exists()) {
      await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      return { uid: profileSnap.id, ...profileSnap.data() } as UserProfile;
    } else {
      const newUserProfile: UserProfile = {
        uid: user.uid,
        name: user.displayName || 'Google User',
        email: user.email!,
        role: 'brand', // Default role
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };
      await setDoc(userRef, newUserProfile);
      return newUserProfile;
    }
  }

  public async linkWithFacebook(): Promise<string> {
      const { auth } = await getFirebaseServices();
      const provider = new FacebookAuthProvider();
      
      // Force re-authentication and re-request of permissions
      provider.setCustomParameters({
          'auth_type': 'rerequest'
      });

      provider.addScope('instagram_basic');
      provider.addScope('instagram_content_publish');
      provider.addScope('pages_show_list');
      provider.addScope('pages_read_engagement');
      provider.addScope('business_management');

      if (!auth.currentUser) {
          throw new Error("No user is currently signed in to link a Facebook account.");
      }

      const result = await linkWithPopup(auth.currentUser, provider);
      const credential = FacebookAuthProvider.credentialFromResult(result);
      
      if (!credential || !credential.accessToken) {
          throw new Error("Could not retrieve Facebook access token.");
      }
      
      // This is the short-lived user access token
      return credential.accessToken;
  }


  public async registerUser(email: string, password: string, additionalData: Omit<UserProfile, 'uid' | 'email'>): Promise<void> {
    const { auth, db } = await getFirebaseServices();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
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

  public async logout(): Promise<void> {
    const { auth } = await getFirebaseServices();
    await signOut(auth);
  }
}

const authService = AuthService.getInstance();
export default authService;
