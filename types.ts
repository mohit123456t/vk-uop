 export interface Campaign {
    id: string;
    name: string;
    status: string;
    reelsCount: number;
    views: number;
    description: string;
    reels: Reel[];
    targetAudience?: string;
    budget?: number;
    startDate?: string;
    endDate?: string;
    imageUrl?: string;
    assignedUploader?: string;
    assignedTo?: string;
    assignedVideoEditor?: string;
    assignedScriptWriter?: string;
    assignedThumbnailMaker?: string;
}

export interface Reel {
    id: string;
    views: number;
    likes: number;
    status: string;
    uploadedAt: string;
    comments?: number;
    shares?: number;
    saves?: number;
}

export interface Order {
    id: string;
    campaignId: string;
    type: string;
    quantity: number;
    budget: number;
    deadline: string;
    status: string;
    notes?: string;
    createdAt: string;
}

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
    user: any;
    userProfile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}
