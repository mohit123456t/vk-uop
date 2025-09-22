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
import { auth, firestore, database } from './firebase';

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
  completedTasks?: number;
  pendingTasks?: number;
  totalEarnings?: number;
  salaryDue?: number;
  activity?: any[];
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
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      if (userDoc.exists()) {
        this.userProfile = {
          ...userDoc.data(),
          uid
        } as UserProfile;

        // Update last login
        await updateDoc(doc(firestore, 'users', uid), {
          lastLoginAt: new Date().toISOString()
        });
      } else {
        // Handle case where user exists in auth but not in firestore
        this.userProfile = null;
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

  onAuthStateChange(callback: (authState: AuthState) => void): () => void {
    this.authStateListeners.push(callback);

    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  async loginWithEmail(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await this.loadUserProfile(user.uid);

      if (!this.userProfile) {
        throw new Error('User profile not found. Please contact administrator.');
      }

      if (!this.userProfile.isActive) {
        throw new Error('This account has been deactivated. Please contact administrator.');
      }

      this.notifyAuthStateListeners();
      return this.userProfile;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  async findUserByEmail(email: string): Promise<UserProfile | null> {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    return null;
  }

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
        isActive: true,
        completedTasks: 0,
        pendingTasks: 0,
        totalEarnings: 0,
        salaryDue: 0,
        activity: [],
      };

      await setDoc(doc(firestore, 'users', user.uid), userProfile);
      await set(ref(database, 'users/' + user.uid), userProfile);

      this.userProfile = userProfile;
      this.notifyAuthStateListeners();

      return userProfile;
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists in Authentication. Please check authentication records.');
      }
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  async loginWithGoogle(): Promise<UserProfile> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let userProfile = await this.getUserProfile(user.uid);

      if (!userProfile) {
        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        userProfile = {
          uid: user.uid,
          email: user.email!,
          name: displayName,
          role: 'brand',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          isActive: true,
          completedTasks: 0,
          pendingTasks: 0,
          totalEarnings: 0,
          salaryDue: 0,
          activity: [],
        };

        await setDoc(doc(firestore, 'users', user.uid), userProfile);
        await set(ref(database, 'users/' + user.uid), userProfile);
      } else {
        await updateDoc(doc(firestore, 'users', user.uid), {
          lastLoginAt: new Date().toISOString()
        });
      }

      if (!userProfile.isActive) {
        throw new Error('This account has been deactivated. Please contact administrator.');
      }
      
      this.userProfile = userProfile;
      this.notifyAuthStateListeners();

      return userProfile;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', uid));
      return userDoc.exists() ? userDoc.data() as UserProfile : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userDocRef = doc(firestore, 'users', uid);
      await updateDoc(userDocRef, updates);
  
      const dbRef = ref(database, 'users/' + uid);
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        await update(dbRef, updates); 
      }
      
      if (this.userProfile && this.userProfile.uid === uid) {
        this.userProfile = { ...this.userProfile, ...updates };
        this.notifyAuthStateListeners();
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  hasRole(requiredRole: UserRole | UserRole[]): boolean {
    if (!this.userProfile) return false;

    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(this.userProfile.role);
    }

    return this.userProfile.role === requiredRole;
  }

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

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentUserProfile(): UserProfile | null {
    return this.userProfile;
  }

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

  isAdmin(): boolean {
    return this.hasRole(['admin', 'super_admin']);
  }

  isSuperAdmin(): boolean {
    return this.hasRole('super_admin');
  }
}

const authService = new AuthService();
export default authService;
