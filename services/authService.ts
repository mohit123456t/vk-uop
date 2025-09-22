import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail, // Added for password reset
    User
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
    uid: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
    lastLoginAt: string;
    brandId?: string;
    brandName?: string;
    address?: string;
    mobileNumber?: string;
    ownerName?: string;
    isActive?: boolean;
}

// ... (rest of the interface and helper functions are the same)
interface AuthState {
    user: User | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const toISOStringSafe = (dateValue: any): string => {
    if (!dateValue) return new Date().toISOString();
    if (typeof dateValue.toDate === 'function') return dateValue.toDate().toISOString();
    try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) return date.toISOString();
    } catch (e) {}
    return new Date().toISOString();
};

const getOrCreateUserProfile = async (user: User): Promise<UserProfile | null> => {
    if (!user) return null;
    const userDocRef = doc(db, 'users', user.uid);
    try {
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            await updateDoc(userDocRef, { lastLoginAt: serverTimestamp() });
            const profileData = userDocSnap.data();
            return {
                uid: user.uid,
                email: profileData.email || user.email || '',
                name: profileData.name || user.displayName || 'User',
                role: profileData.role || 'user',
                createdAt: toISOStringSafe(profileData.createdAt),
                lastLoginAt: new Date().toISOString(),
                isActive: profileData.isActive !== false,
                ...profileData
            };
        } else {
            const brandId = Math.floor(100000 + Math.random() * 900000).toString();
            const displayName = user.displayName || 'New Brand';
            const newUserProfileData = {
                uid: user.uid,
                email: user.email || '',
                name: displayName,
                role: 'brand',
                createdAt: serverTimestamp(),
                lastLoginAt: serverTimestamp(),
                brandId: brandId,
                brandName: `${displayName}'s Brand`,
                ownerName: displayName,
                address: '',
                mobileNumber: '',
                isActive: true,
            };
            await setDoc(userDocRef, newUserProfileData);
            return { ...newUserProfileData, createdAt: new Date().toISOString(), lastLoginAt: new Date().toISOString() };
        }
    } catch (error) {
        console.error("Error in getOrCreateUserProfile:", error);
        return null;
    }
};

const authService = {
    state: { user: null, userProfile: null, isLoading: true, isAuthenticated: false } as AuthState,

    onAuthStateChange(callback: (state: AuthState) => void) {
        return onAuthStateChanged(auth, async (user) => {
            this.state.user = user;
            this.state.userProfile = await getOrCreateUserProfile(user);
            this.state.isAuthenticated = !!user;
            this.state.isLoading = false;
            callback(this.state);
        });
    },

    getCurrentUserProfile: (): UserProfile | null => {
        return authService.state.userProfile;
    },

    async findUserByEmail(email: string): Promise<UserProfile | null> {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;

        const userDoc = querySnapshot.docs[0];
        const profileData = userDoc.data();
        return { uid: userDoc.id, ...profileData } as UserProfile;
    },

    async signIn(email: string, password: string): Promise<void> {
        await signInWithEmailAndPassword(auth, email, password);
    },

    async signUpWithRole(name: string, email: string, password: string, role: string, additionalData: any = {}): Promise<string> {
        // This method should be used for creating staff accounts, not for regular user sign-up.
        // It implies temporary authentication or administrative action.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userProfileData: any = {
            uid: user.uid,
            email: user.email || '',
            name,
            role,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            isActive: true,
            ...additionalData,
        };

        if (role === 'brand') {
            userProfileData.brandId = Math.floor(100000 + Math.random() * 900000).toString();
        }

        await setDoc(doc(db, 'users', user.uid), userProfileData);
        return user.uid;
    },

    async updateUserProfile(userId: string, dataToUpdate: Partial<UserProfile>): Promise<void> {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, dataToUpdate);
    },

    async sendPasswordResetEmail(email: string): Promise<void> {
        await sendPasswordResetEmail(auth, email);
    },

    async signOutUser(): Promise<void> {
        await signOut(auth);
    },
    
    async signInWithGoogle(): Promise<void> {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    },
};

// Initialize listener
authService.onAuthStateChange(() => {});

export default authService;
