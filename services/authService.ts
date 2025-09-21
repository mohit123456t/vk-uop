import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { auth, db, database } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  brandName?: string;
  address?: string;
  mobileNumber?: string;
  ownerName?: string;
  createdAt: string;
  lastLoginAt: string;
  isActive: boolean;
}

export type UserRole =
  | 'brand'
  | 'uploader'
  | 'script_writer'
  | 'video_editor'
  | 'thumbnail_maker'
  | 'admin'
  | 'super_admin';

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

class AuthService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;
  private authStateListeners: ((authState: AuthState) => void)[] = [];

  constructor() {
    this.initializeAuthListener();
  }

  private initializeAuthListener() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;

      if (user) {
        await this.loadUserProfile(user.uid);
      } else {
        this.userProfile = null;
      }

      this.notifyAuthStateListeners();
    });
  }

  private async loadUserProfile(uid: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        this.userProfile = {
          ...userDoc.data(),
          uid
        } as UserProfile;

        // Update last login
        await updateDoc(doc(db, 'users', uid), {
          lastLoginAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  private notifyAuthStateListeners() {
    const authState: AuthState = {
      user: this.currentUser,
      userProfile: this.userProfile,
      isLoading: false,
      isAuthenticated: !!this.currentUser && !!this.userProfile
    };

    this.authStateListeners.forEach(listener => listener(authState));
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (authState: AuthState) => void): () => void {
    this.authStateListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Login with email and password
  async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    try {
      // Special handling for Super Admin
      if (email === 'mohitmleena2@gmail.com' && password === '123456789') {
        const superAdminProfile: UserProfile = {
          uid: 'super-admin-temp',
          email: 'mohitmleena2@gmail.com',
          name: 'Super Admin',
          role: 'super_admin',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isActive: true
        };

        this.userProfile = superAdminProfile;
        this.notifyAuthStateListeners();

        return superAdminProfile;
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Ensure user profile exists
      let userProfile = await this.getUserProfile(user.uid);
      if (!userProfile) {
        throw new Error('User profile not found. Please contact administrator.');
      }

      return userProfile;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Register new user
  async registerUser(
    email: string,
    password: string,
    userData: Omit<UserProfile, 'uid' | 'createdAt' | 'lastLoginAt' | 'isActive'>
  ): Promise<UserProfile> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userProfile: UserProfile = {
        ...userData,
        uid: user.uid,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isActive: true
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Save to Realtime Database
      await set(ref(database, 'users/' + user.uid), userProfile);

      this.userProfile = userProfile;
      this.notifyAuthStateListeners();

      return userProfile;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Login with Google OAuth
  async loginWithGoogle(): Promise<UserProfile> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists
      let userProfile = await this.getUserProfile(user.uid);

      if (!userProfile) {
        // Create profile for new Google user
        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        userProfile = {
          uid: user.uid,
          email: user.email!,
          name: displayName,
          role: 'brand', // Default role for Google sign-in
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isActive: true
        };

        await setDoc(doc(db, 'users', user.uid), userProfile);
        await set(ref(database, 'users/' + user.uid), userProfile);
      } else {
        // Update last login
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: new Date().toISOString()
        });
      }

      this.userProfile = userProfile;
      this.notifyAuthStateListeners();

      return userProfile;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? userDoc.data() as UserProfile : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
      await set(ref(database, 'users/' + uid), updates);

      if (this.userProfile && this.userProfile.uid === uid) {
        this.userProfile = { ...this.userProfile, ...updates };
        this.notifyAuthStateListeners();
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Check if user has required role
  hasRole(requiredRole: UserRole | UserRole[]): boolean {
    if (!this.userProfile) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(this.userProfile.role);
    }

    return this.userProfile.role === requiredRole;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userProfile = null;
      this.notifyAuthStateListeners();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get current user profile
  getCurrentUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  // Get auth error message
  private getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole(['admin', 'super_admin']);
  }

  // Check if user is super admin
  isSuperAdmin(): boolean {
    return this.hasRole('super_admin');
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;
