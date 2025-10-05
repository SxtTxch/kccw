import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  deleteField
} from 'firebase/firestore';
import { db } from './config';

// Test Firestore connection
export const testFirestoreConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Firestore connection...');
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, { 
      test: true, 
      timestamp: serverTimestamp() 
    });
    console.log('Firestore connection test successful, created test doc:', testDoc.id);
    return true;
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    return false;
  }
};

// Update user profile with missing fields
export const updateUserProfileWithMissingFields = async (userId: string, userProfile: UserProfile): Promise<void> => {
  try {
    console.log('Checking and updating user profile with missing fields for user:', userId);
    
    const updates: Partial<UserProfile> = {};
    let hasUpdates = false;
    
    // Check and add volunteer statistics if missing
    if (userProfile.volunteerHours === undefined) {
      updates.volunteerHours = 0;
      hasUpdates = true;
    }
    if (userProfile.totalProjects === undefined) {
      updates.totalProjects = 0;
      hasUpdates = true;
    }
    if (userProfile.currentStreak === undefined) {
      updates.currentStreak = 0;
      hasUpdates = true;
    }
    if (userProfile.longestStreak === undefined) {
      updates.longestStreak = 0;
      hasUpdates = true;
    }
    if (userProfile.impactPoints === undefined) {
      updates.impactPoints = 0;
      hasUpdates = true;
    }
    if (userProfile.specialAchievements === undefined) {
      updates.specialAchievements = 0;
      hasUpdates = true;
    }
    
    // Check and add privacy settings if missing
    if (!userProfile.privacySettings) {
      updates.privacySettings = getDefaultPrivacySettings();
      hasUpdates = true;
    }
    
    // Check and add cookie settings if missing
    if (!userProfile.cookieSettings) {
      updates.cookieSettings = getDefaultCookieSettings();
      hasUpdates = true;
    }
    
    // Check and add badges if missing
    if (!userProfile.badges) {
      updates.badges = getDefaultBadges();
      hasUpdates = true;
    }
    
    // Check and add preferences if missing
    if (!userProfile.preferences) {
      updates.preferences = {
        notifications: true,
        emailUpdates: true,
        smsUpdates: false,
        language: 'pl'
      };
      hasUpdates = true;
    }
    
    // Check and add volunteer info if missing (for volunteers)
    if (userProfile.userType === 'wolontariusz' && !userProfile.volunteerInfo) {
      updates.volunteerInfo = {
        skills: [],
        interests: [],
        availability: [],
        experience: ''
      };
      hasUpdates = true;
    }
    
    // Check and add coordinator info if missing (for coordinators)
    if (userProfile.userType === 'koordynator' && !userProfile.coordinatorInfo) {
      updates.coordinatorInfo = {
        schoolInfo: {
          name: userProfile.schoolName || ''
        }
      };
      hasUpdates = true;
    }
    
    // Check and add organization info if missing (for organizations)
    if (userProfile.userType === 'organizacja' && !userProfile.organizationInfo) {
      updates.organizationInfo = {
        organizationName: userProfile.organizationName || '',
        organizationType: userProfile.organizationType || '',
        krsNumber: userProfile.krsNumber || '',
        description: userProfile.bio || ''
      };
      hasUpdates = true;
    }
    
    // Update the document if there are missing fields
    if (hasUpdates) {
      console.log('Updating user profile with missing fields:', updates);
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('User profile updated successfully with missing fields');
    } else {
      console.log('User profile already has all required fields');
    }
  } catch (error) {
    console.error('Error updating user profile with missing fields:', error);
    throw new Error(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Update all users with missing fields (migration function)
export const updateAllUsersWithMissingFields = async (): Promise<void> => {
  try {
    console.log('Starting migration: updating all users with missing fields...');
    
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    console.log(`Found ${usersSnapshot.docs.length} users to check`);
    
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data() as UserProfile;
        const userId = userDoc.id;
        
        console.log(`Checking user ${userId} (${userData.email})`);
        
        const updates: Partial<UserProfile> = {};
        let hasUpdates = false;
        
        // Check and add volunteer statistics if missing
        if (userData.volunteerHours === undefined) {
          updates.volunteerHours = 0;
          hasUpdates = true;
        }
        if (userData.totalProjects === undefined) {
          updates.totalProjects = 0;
          hasUpdates = true;
        }
        if (userData.currentStreak === undefined) {
          updates.currentStreak = 0;
          hasUpdates = true;
        }
        if (userData.longestStreak === undefined) {
          updates.longestStreak = 0;
          hasUpdates = true;
        }
        if (userData.impactPoints === undefined) {
          updates.impactPoints = 0;
          hasUpdates = true;
        }
        if (userData.specialAchievements === undefined) {
          updates.specialAchievements = 0;
          hasUpdates = true;
        }
        
        // Check and add privacy settings if missing
        if (!userData.privacySettings) {
          updates.privacySettings = getDefaultPrivacySettings();
          hasUpdates = true;
        }
        
        // Check and add cookie settings if missing
        if (!userData.cookieSettings) {
          updates.cookieSettings = getDefaultCookieSettings();
          hasUpdates = true;
        }
        
        // Check and add badges if missing
        if (!userData.badges) {
          updates.badges = getDefaultBadges();
          hasUpdates = true;
        }
        
        // Check and add preferences if missing
        if (!userData.preferences) {
          updates.preferences = {
            notifications: true,
            emailUpdates: true,
            smsUpdates: false,
            language: 'pl'
          };
          hasUpdates = true;
        }
        
        // Check and add volunteer info if missing (for volunteers)
        if (userData.userType === 'wolontariusz' && !userData.volunteerInfo) {
          updates.volunteerInfo = {
            skills: [],
            interests: [],
            availability: [],
            experience: ''
          };
          hasUpdates = true;
        }
        
        // Check and add coordinator info if missing (for coordinators)
        if (userData.userType === 'koordynator' && !userData.coordinatorInfo) {
          updates.coordinatorInfo = {
            schoolInfo: {
              name: userData.schoolName || ''
            }
          };
          hasUpdates = true;
        }
        
        // Check and add organization info if missing (for organizations)
        if (userData.userType === 'organizacja' && !userData.organizationInfo) {
          updates.organizationInfo = {
            organizationName: userData.organizationName || '',
            organizationType: userData.organizationType || '',
            krsNumber: userData.krsNumber || '',
            description: userData.bio || ''
          };
          hasUpdates = true;
        }
        
        // Update the document if there are missing fields
        if (hasUpdates) {
          console.log(`Updating user ${userId} with missing fields:`, updates);
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            ...updates,
            updatedAt: serverTimestamp()
          });
          updatedCount++;
          console.log(`Successfully updated user ${userId}`);
        } else {
          console.log(`User ${userId} already has all required fields`);
        }
        
      } catch (error) {
        console.error(`Error updating user ${userDoc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log(`Migration completed. Updated ${updatedCount} users, ${errorCount} errors`);
  } catch (error) {
    console.error('Error during migration:', error);
    throw new Error(`Failed to update all users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// User types
export interface UserProfile {
  id?: string;
  email: string;
  userType: 'wolontariusz' | 'koordynator' | 'organizacja';
  firstName: string;
  lastName: string;
  birthDate?: string;
  schoolName?: string;
  organizationName?: string;
  organizationType?: string;
  krsNumber?: string;
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
  };
  // Additional metadata
  phoneNumber?: string;
  bio?: string;
  profileImage?: string;
  isVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: any;
  preferences?: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    language: string;
  };
  // Privacy and data processing consents
  privacySettings?: {
    profileVisibility: boolean;
    locationTracking: boolean;
    dataAnalytics: boolean;
    marketingEmails: boolean;
    notificationsPush: boolean;
    dataSharing: boolean;
    cookiesAnalytical: boolean;
    cookiesMarketing: boolean;
    lastUpdated: any;
  };
  // Cookie preferences and tracking
  cookieSettings?: {
    essential: boolean;           // Always true, cannot be disabled
    analytical: boolean;          // Analytical cookies
    marketing: boolean;          // Marketing cookies
    lastUpdated: any;
  };
  // Volunteer specific metadata
  volunteerInfo?: {
    skills: string[];
    interests: string[];
    availability: string[];
    experience: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  
  // Coordinator specific metadata
  coordinatorInfo?: {
    schoolInfo: {
      name: string;
    };
  };
  
  // Organization specific metadata
  organizationInfo?: {
    organizationName: string;
    organizationType: string;
    krsNumber: string;
    description: string;
  };
  
  // Volunteer statistics
  volunteerHours?: number;
  
  // Certificate status for minors
  isMinor?: boolean;
  certificateStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  totalProjects?: number;
  currentStreak?: number;
  longestStreak?: number;
  impactPoints?: number;
  specialAchievements?: number;
  
  // Badge system
  badges?: {
    // Welcome badge (automatic on account creation)
    witaj: {
      earned: boolean;
      earnedDate?: any;
    };
    // Time-based badges
    pierwszyKrok: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // hours worked
      target: number;   // 1 hour
    };
    zaangazowany: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // hours worked
      target: number;   // 10 hours
    };
    wytrwaly: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // hours worked
      target: number;   // 50 hours
    };
    bohater: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // hours worked
      target: number;   // 100 hours
    };
    // Project-based badges
    debiutant: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // projects completed
      target: number;   // 1 project
    };
    aktywny: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // projects completed
      target: number;   // 5 projects
    };
    mistrz: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // projects completed
      target: number;   // 15 projects
    };
    // Consistency badges
    konsekwentny: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // weeks volunteered
      target: number;   // 3 weeks
    };
    niezdomny: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // weeks volunteered
      target: number;   // 7 weeks
    };
    // Leadership badges
    mentor: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // training sessions led
      target: number;   // 1 session
    };
    ambasador: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // volunteers recruited
      target: number;   // 3 volunteers
    };
    // Impact badges
    pomocnik: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // impact points
      target: number;   // 100 points
    };
    zmiana: {
      earned: boolean;
      earnedDate?: any;
      progress: number; // impact points
      target: number;   // 500 points
    };
  };
  
  // Rating system for volunteers
  ratings?: {
    averageRating: number; // Float value (0.0 - 5.0)
    totalRatings: number;
    ratingComments: RatingComment[];
  };
  
      // Opinions received by this user
      receivedOpinions?: {
        totalOpinions: number;
        opinions: RatingComment[];
      };
      
      // User offers (applications to volunteer opportunities)
      offers?: {
        id: string;
        offerId: string;
        offerTitle: string;
        organizationName: string;
        status: 'pending' | 'accepted' | 'rejected';
        appliedAt: any;
        rejectionMessage?: string | null;
      }[];
      
      createdAt?: any;
      updatedAt?: any;
}

// Rating comment interface
export interface RatingComment {
  id: string;
  authorId: string;
  authorName: string;
  authorBadges: string[]; // Array of badge names the author has earned
  comment: string;
  rating: number; // 1-5 stars
  createdAt: any;
}


// Helper function to remove undefined values
const removeUndefinedValues = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    }
    return cleaned;
  }
  
  return obj;
};

// Create user profile
export const createUserProfile = async (userData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    console.log('Creating user profile in Firestore with data:', userData);
    
    // Initialize default badges for new users
    const defaultBadges = getDefaultBadges();
    
    // Initialize default statistics for new users
    const defaultStats = {
      volunteerHours: 0,
      totalProjects: 0,
      currentStreak: 0,
      longestStreak: 0,
      impactPoints: 0,
      specialAchievements: 0
    };
    
    // Remove undefined values before saving to Firestore
    const cleanedData = removeUndefinedValues({
      ...userData,
      badges: defaultBadges,
      ...defaultStats
    });
    console.log('Cleaned data for Firestore:', cleanedData);
    
    const docRef = await addDoc(collection(db, 'users'), {
      ...cleanedData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('User profile created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error(`Failed to create user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as UserProfile;
  }
  return null;
};

// Update user profile
export const updateUserProfile = async (userId: string, userData: Partial<UserProfile>): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    ...userData,
    updatedAt: serverTimestamp()
  });
};

// Update user profile by email
export const updateUserProfileByEmail = async (email: string, userData: Partial<UserProfile>): Promise<void> => {
  try {
    console.log('Updating user profile for email:', email);
    
    // First, find the user by email
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('User not found with email: ' + email);
    }
    
    const userDoc = querySnapshot.docs[0];
    const docRef = doc(db, 'users', userDoc.id);
    
    // Clean the data before saving
    const cleanedData = removeUndefinedValues(userData);
    
    console.log('Updating user document with ID:', userDoc.id);
    console.log('Data to update:', cleanedData);
    
    await updateDoc(docRef, {
      ...cleanedData,
      updatedAt: serverTimestamp()
    });
    
    console.log('User profile updated successfully');
  } catch (error) {
    console.error('Error updating user profile by email:', error);
    throw error;
  }
};

// Get user profile by email
export const getUserProfileByEmail = async (email: string): Promise<UserProfile | null> => {
  try {
    console.log('Searching for user with email:', email);
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    console.log('Query snapshot size:', querySnapshot.size);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const userData = { id: doc.id, ...doc.data() } as UserProfile;
      console.log('Found user profile:', userData);
      return userData;
    }
    
    console.log('No user profile found for email:', email);
    return null;
  } catch (error) {
    console.error('Error in getUserProfileByEmail:', error);
    throw error;
  }
};

// Get all users by type
export const getUsersByType = async (userType: string): Promise<UserProfile[]> => {
  const q = query(collection(db, 'users'), where('userType', '==', userType));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as UserProfile[];
};

// Listen to user profile changes
export const listenToUserProfile = (userId: string, callback: (user: UserProfile | null) => void) => {
  const docRef = doc(db, 'users', userId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as UserProfile);
    } else {
      callback(null);
    }
  });
};

// Update user preferences
export const updateUserPreferences = async (userId: string, preferences: UserProfile['preferences']): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    preferences,
    updatedAt: serverTimestamp()
  });
};

// Update volunteer information
export const updateVolunteerInfo = async (userId: string, volunteerInfo: UserProfile['volunteerInfo']): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    volunteerInfo,
    updatedAt: serverTimestamp()
  });
};

// Update coordinator information
export const updateCoordinatorInfo = async (userId: string, coordinatorInfo: UserProfile['coordinatorInfo']): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    coordinatorInfo,
    updatedAt: serverTimestamp()
  });
};

// Update organization information
export const updateOrganizationInfo = async (userId: string, organizationInfo: UserProfile['organizationInfo']): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    organizationInfo,
    updatedAt: serverTimestamp()
  });
};

// Update user verification status
export const updateUserVerification = async (userId: string, isVerified: boolean): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    isVerified,
    updatedAt: serverTimestamp()
  });
};

// Update user activity status
export const updateUserActivity = async (userId: string, isActive: boolean): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    isActive,
    updatedAt: serverTimestamp()
  });
};

// Update privacy settings
export const updatePrivacySettings = async (userId: string, privacySettings: UserProfile['privacySettings']): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    privacySettings: {
      ...privacySettings,
      lastUpdated: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });
};

// Update individual privacy setting
export const updatePrivacySetting = async (userId: string, setting: keyof UserProfile['privacySettings'], value: boolean): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    [`privacySettings.${setting}`]: value,
    'privacySettings.lastUpdated': serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Initialize default privacy settings
export const getDefaultPrivacySettings = (): UserProfile['privacySettings'] => {
  return {
    profileVisibility: false,
    locationTracking: false,
    dataAnalytics: false,
    marketingEmails: false,
    notificationsPush: false,
    dataSharing: false,
    cookiesAnalytical: false,
    cookiesMarketing: false,
    lastUpdated: new Date()
  };
};

// Initialize default cookie settings
export const getDefaultCookieSettings = (): UserProfile['cookieSettings'] => {
  return {
    essential: true,        // Always true, cannot be disabled
    analytical: false,     // Default to false for privacy
    marketing: false,       // Default to false for privacy
    lastUpdated: new Date()
  };
};

// Update cookie settings
export const updateCookieSettings = async (userId: string, cookieSettings: UserProfile['cookieSettings']): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    cookieSettings: {
      ...cookieSettings,
      lastUpdated: serverTimestamp()
    },
    updatedAt: serverTimestamp()
  });
};

// Update individual cookie setting
export const updateCookieSetting = async (userId: string, setting: keyof UserProfile['cookieSettings'], value: boolean): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    [`cookieSettings.${setting}`]: value,
    'cookieSettings.lastUpdated': serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// Get user statistics
export const getUserStats = async (): Promise<{
  totalUsers: number;
  volunteers: number;
  coordinators: number;
  organizations: number;
  activeUsers: number;
  verifiedUsers: number;
}> => {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserProfile[];
  
  return {
    totalUsers: users.length,
    volunteers: users.filter(u => u.userType === 'wolontariusz').length,
    coordinators: users.filter(u => u.userType === 'koordynator').length,
    organizations: users.filter(u => u.userType === 'organizacja').length,
    activeUsers: users.filter(u => u.isActive).length,
    verifiedUsers: users.filter(u => u.isVerified).length
  };
};

// Badge system functions
export const getDefaultBadges = () => {
  return {
    witaj: {
      earned: true,
      earnedDate: new Date()
    },
    pierwszyKrok: {
      earned: false,
      progress: 0,
      target: 1
    },
    zaangazowany: {
      earned: false,
      progress: 0,
      target: 10
    },
    wytrwaly: {
      earned: false,
      progress: 0,
      target: 50
    },
    bohater: {
      earned: false,
      progress: 0,
      target: 100
    },
    debiutant: {
      earned: false,
      progress: 0,
      target: 1
    },
    aktywny: {
      earned: false,
      progress: 0,
      target: 5
    },
    mistrz: {
      earned: false,
      progress: 0,
      target: 15
    },
    konsekwentny: {
      earned: false,
      progress: 0,
      target: 3
    },
    niezdomny: {
      earned: false,
      progress: 0,
      target: 7
    },
    mentor: {
      earned: false,
      progress: 0,
      target: 1
    },
    ambasador: {
      earned: false,
      progress: 0,
      target: 3
    },
    pomocnik: {
      earned: false,
      progress: 0,
      target: 100
    },
    zmiana: {
      earned: false,
      progress: 0,
      target: 500
    }
  };
};

// Update badge progress
export const updateBadgeProgress = async (userId: string, badgeType: string, progress: number): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  const badgePath = `badges.${badgeType}.progress`;
  
  await updateDoc(docRef, {
    [badgePath]: progress,
    updatedAt: serverTimestamp()
  });
};

// Check and award badge if earned
export const checkAndAwardBadge = async (userId: string, badgeType: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return false;
    
    const userData = userDoc.data() as UserProfile;
    const badge = userData.badges?.[badgeType as keyof typeof userData.badges];
    
    if (!badge || badge.earned) return false;
    
    if ('progress' in badge && 'target' in badge && badge.progress >= badge.target) {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, {
        [`badges.${badgeType}.earned`]: true,
        [`badges.${badgeType}.earnedDate`]: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking badge:', error);
    return false;
  }
};

// Offer interface
export interface Offer {
  id: string;
  title: string;
  description: string;
  organization: string;
  organizationId: string;
  category: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  requirements: string[];
  benefits: string[];
  contactEmail: string;
  contactPhone?: string;
  status: 'active' | 'inactive' | 'completed';
  urgency: 'low' | 'medium' | 'high';
  createdAt: any;
  updatedAt: any;
  participants: string[]; // Array of user IDs
  // Bounty system fields
  hasBounty?: boolean;
  bountyAmount?: number;
}

// Get all offers
export const getAllOffers = async (): Promise<Offer[]> => {
  try {
    console.log('Fetching all offers...');
    const offersRef = collection(db, 'offers');
    const q = query(offersRef, where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    
    const offers: Offer[] = [];
    querySnapshot.forEach((doc) => {
      offers.push({
        id: doc.id,
        ...doc.data()
      } as Offer);
    });
    
    // Sort by createdAt in JavaScript instead of Firestore
    offers.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
      }
      return 0;
    });
    
    console.log(`Fetched ${offers.length} offers`);
    return offers;
  } catch (error) {
    console.error('Error fetching offers:', error);
    return [];
  }
};

// Get offers by organization ID
export const getOffersByOrganization = async (organizationId: string): Promise<Offer[]> => {
  try {
    console.log('Fetching offers for organization:', organizationId);
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('./config');
    
    const offersRef = collection(db, 'offers');
    const q = query(offersRef, where('organizationId', '==', organizationId));
    const querySnapshot = await getDocs(q);
    const offers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`Found ${offers.length} offers for organization ${organizationId}`);
    return offers;
  } catch (error) {
    console.error('Error fetching offers by organization:', error);
    return [];
  }
};

// Get volunteers participating in organization's offers
export const getVolunteersFromOffers = async (organizationId: string): Promise<any[]> => {
  try {
    console.log('Fetching volunteers from organization offers:', organizationId);
    const { collection, query, where, getDocs, doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('./config');
    
    // Get all offers for this organization
    const offersRef = collection(db, 'offers');
    const offersQuery = query(offersRef, where('organizationId', '==', organizationId));
    const offersSnapshot = await getDocs(offersQuery);
    
    const volunteersMap = new Map();
    
    // For each offer, get participants
    for (const offerDoc of offersSnapshot.docs) {
      const offer = { id: offerDoc.id, ...offerDoc.data() };
      
      if (offer.participants && offer.participants.length > 0) {
        // Get user data for each participant
        for (const participantId of offer.participants) {
          if (!volunteersMap.has(participantId)) {
            try {
              const userRef = doc(db, 'users', participantId);
              const userSnap = await getDoc(userRef);
              
              if (userSnap.exists()) {
                const userData = { id: userSnap.id, ...userSnap.data() };
                volunteersMap.set(participantId, {
                  ...userData,
                  offerId: offer.id,
                  offerTitle: offer.title,
                  offerCategory: offer.category
                });
              }
            } catch (error) {
              console.error(`Error fetching user ${participantId}:`, error);
            }
          }
        }
      }
    }
    
    const volunteers = Array.from(volunteersMap.values());
    console.log(`Found ${volunteers.length} volunteers from organization offers`);
    return volunteers;
  } catch (error) {
    console.error('Error fetching volunteers from offers:', error);
    return [];
  }
};

// Get offer by ID
export const getOfferById = async (offerId: string): Promise<Offer | null> => {
  try {
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);
    
    if (offerSnap.exists()) {
      return {
        id: offerSnap.id,
        ...offerSnap.data()
      } as Offer;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching offer:', error);
    return null;
  }
};

// Sign up for an offer
export const signUpForOffer = async (offerId: string, firestoreUserId: string): Promise<boolean> => {
  try {
    console.log(`Signing up user ${firestoreUserId} for offer ${offerId}`);
    
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);
    
    if (!offerSnap.exists()) {
      console.error('Offer not found');
      return false;
    }
    
    const offerData = offerSnap.data() as Offer;
    
    // Check if user is already signed up
    if (offerData.participants.includes(firestoreUserId)) {
      console.log('User already signed up for this offer');
      return false;
    }
    
    // Check if offer is full
    if (offerData.currentParticipants >= offerData.maxParticipants) {
      console.log('Offer is full');
      return false;
    }
    
    // First, add application to user's offers (this can fail safely)
    const userRef = doc(db, 'users', firestoreUserId);
    const applicationData = {
      id: Date.now().toString(), // Generate unique ID
      offerId: offerId,
      offerTitle: offerData.title,
      organizationName: offerData.organization,
      status: 'pending' as 'pending' | 'accepted' | 'rejected',
      appliedAt: new Date(),
      rejectionMessage: null as string | null
    };

    // Check if user document exists, if not create it
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.log('User document does not exist, creating it...');
      await setDoc(userRef, {
        offers: [applicationData],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(userRef, {
        offers: arrayUnion(applicationData),
        updatedAt: serverTimestamp()
      });
    }

    // Only after successfully adding to user, add to offer participants
    await updateDoc(offerRef, {
      participants: arrayUnion(firestoreUserId),
      currentParticipants: offerData.currentParticipants + 1,
      updatedAt: serverTimestamp()
    });
    
    console.log('Successfully signed up for offer');
    return true;
  } catch (error) {
    console.error('Error signing up for offer:', error);
    return false;
  }
};

// Cancel signup for an offer
export const cancelOfferSignup = async (offerId: string, firestoreUserId: string): Promise<boolean> => {
  try {
    console.log(`Canceling signup for user ${firestoreUserId} from offer ${offerId}`);
    
    const offerRef = doc(db, 'offers', offerId);
    const offerSnap = await getDoc(offerRef);
    
    if (!offerSnap.exists()) {
      console.error('Offer not found');
      return false;
    }
    
    const offerData = offerSnap.data() as Offer;
    
    // Check if user is signed up
    if (!offerData.participants.includes(firestoreUserId)) {
      console.log('User is not signed up for this offer - this is okay, they may have only applied but not been added to participants');
      return true; // Return true to indicate "success" since there's nothing to cancel
    }
    
    // Remove user from participants
    await updateDoc(offerRef, {
      participants: arrayRemove(firestoreUserId),
      currentParticipants: offerData.currentParticipants - 1,
      updatedAt: serverTimestamp()
    });
    
    console.log('Successfully canceled offer signup');
    return true;
  } catch (error) {
    console.error('Error canceling offer signup:', error);
    return false;
  }
};

// Create a new offer (for organizations)
export const createOffer = async (offerData: Omit<Offer, 'id' | 'createdAt' | 'updatedAt' | 'participants' | 'currentParticipants'>): Promise<string | null> => {
  try {
    console.log('Creating new offer:', offerData.title);

    const offersRef = collection(db, 'offers');
    const newOffer = await addDoc(offersRef, {
      ...offerData,
      participants: [],
      currentParticipants: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Offer created with ID:', newOffer.id);
    return newOffer.id;
  } catch (error) {
    console.error('Error creating offer:', error);
    return null;
  }
};

// Rating system functions
export const addVolunteerRating = async (volunteerId: string, ratingData: Omit<RatingComment, 'id' | 'createdAt'>): Promise<boolean> => {
  try {
    console.log('Adding rating for volunteer:', volunteerId, 'by:', ratingData.authorId);

    const userRef = doc(db, 'users', volunteerId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error('Volunteer not found');
      return false;
    }

    const userData = userSnap.data() as UserProfile;
    const currentRatings = userData.ratings || {
      averageRating: 0,
      totalRatings: 0,
      ratingComments: []
    };

    // Create new rating comment
    const newRatingComment: RatingComment = {
      id: Date.now().toString(),
      ...ratingData,
      createdAt: serverTimestamp()
    };

    // Add to comments array
    const updatedComments = [...currentRatings.ratingComments, newRatingComment];

    // Calculate new average rating
    const totalRatingSum = updatedComments.reduce((sum, comment) => sum + comment.rating, 0);
    const newAverageRating = totalRatingSum / updatedComments.length;

    // Update user profile with new rating data and receivedOpinions
    await updateDoc(userRef, {
      ratings: {
        averageRating: newAverageRating,
        totalRatings: updatedComments.length,
        ratingComments: updatedComments
      },
      receivedOpinions: {
        totalOpinions: updatedComments.length,
        opinions: updatedComments
      },
      updatedAt: serverTimestamp()
    });

    console.log('Rating added successfully. New average:', newAverageRating);
    return true;
  } catch (error) {
    console.error('Error adding rating:', error);
    return false;
  }
};

export const getVolunteerRatings = async (volunteerId: string): Promise<{ averageRating: number; totalRatings: number; comments: RatingComment[] } | null> => {
  try {
    console.log('Fetching ratings for volunteer:', volunteerId);

    const userRef = doc(db, 'users', volunteerId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error('Volunteer not found');
      return null;
    }

    const userData = userSnap.data() as UserProfile;
    const ratings = userData.ratings;
    const receivedOpinions = userData.receivedOpinions;

    if (!ratings && !receivedOpinions) {
      return {
        averageRating: 0,
        totalRatings: 0,
        comments: []
      };
    }

    // Use receivedOpinions if available, otherwise fall back to ratings
    const opinions = receivedOpinions?.opinions || ratings?.ratingComments || [];
    const averageRating = ratings?.averageRating || 0;
    const totalRatings = ratings?.totalRatings || opinions.length;

    return {
      averageRating: averageRating,
      totalRatings: totalRatings,
      comments: opinions
    };
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return null;
  }
};

// Migration function to move from givenOpinions to receivedOpinions structure
export const migrateOpinionsStructure = async (): Promise<void> => {
  try {
    console.log('Starting migration from givenOpinions to receivedOpinions...');
    
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    
    const batch = writeBatch(db);
    let batchCount = 0;
    
    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data() as UserProfile;
      
      // Check if user has givenOpinions that need to be migrated
      if ((userData as any).givenOpinions && (userData as any).givenOpinions.opinions.length > 0) {
        console.log(`Migrating opinions for user: ${userData.firstName} ${userData.lastName}`);
        
        // Remove givenOpinions field
        batch.update(userDoc.ref, {
          givenOpinions: deleteField(),
          updatedAt: serverTimestamp()
        });
        
        batchCount++;
        
        // Process each opinion and add it to the target user's receivedOpinions
        for (const opinion of (userData as any).givenOpinions.opinions) {
          const targetUserRef = doc(db, 'users', opinion.targetUserId);
          const targetUserSnap = await getDoc(targetUserRef);
          
          if (targetUserSnap.exists()) {
            const targetUserData = targetUserSnap.data() as UserProfile;
            const currentReceivedOpinions = targetUserData.receivedOpinions || {
              totalOpinions: 0,
              opinions: []
            };
            
            // Create RatingComment from UserOpinion
            const ratingComment: RatingComment = {
              id: opinion.id,
              authorId: userData.id || userDoc.id,
              authorName: `${userData.firstName} ${userData.lastName}`,
              authorBadges: userData.badges ? Object.keys(userData.badges).filter(badge => userData.badges![badge as keyof typeof userData.badges].earned) : [],
              comment: opinion.comment,
              rating: opinion.rating,
              createdAt: opinion.createdAt
            };
            
            // Add to target user's receivedOpinions
            const updatedReceivedOpinions = [...currentReceivedOpinions.opinions, ratingComment];
            
            batch.update(targetUserRef, {
              receivedOpinions: {
                totalOpinions: updatedReceivedOpinions.length,
                opinions: updatedReceivedOpinions
              },
              updatedAt: serverTimestamp()
            });
            
            batchCount++;
          }
        }
      }
      
      // Commit batch every 500 operations (Firestore limit)
      if (batchCount >= 500) {
        await batch.commit();
        batchCount = 0;
      }
    }
    
    // Commit remaining operations
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

// Get user offers (applications)
export const getUserOffers = async (firestoreUserId: string): Promise<any[]> => {
  try {
    const userRef = doc(db, 'users', firestoreUserId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error('User not found');
      return [];
    }

    const userData = userSnap.data() as UserProfile;
    return userData.offers || [];
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return [];
  }
};

// Delete user application
export const deleteUserApplication = async (firestoreUserId: string, applicationId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', firestoreUserId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error('User not found');
      return false;
    }

    const userData = userSnap.data() as UserProfile;
    const offers = userData.offers || [];
    
    // Find and remove the offer
    const updatedOffers = offers.filter((offer: any) => offer.id !== applicationId);
    
    await updateDoc(userRef, {
      offers: updatedOffers,
      updatedAt: serverTimestamp()
    });

    console.log('Application deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting application:', error);
    return false;
  }
};

// Update offer status (accept/deny with optional message)
export const updateOfferStatus = async (
  firestoreUserId: string, 
  offerId: string, 
  status: 'accepted' | 'rejected', 
  rejectionMessage?: string
): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', firestoreUserId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      console.error('User not found');
      return false;
    }

    const userData = userSnap.data() as UserProfile;
    const offers = userData.offers || [];
    
    // Find and update the offer
    const updatedOffers = offers.map((offer: any) => {
      if (offer.id === offerId) {
        return {
          ...offer,
          status: status,
          rejectionMessage: status === 'rejected' ? rejectionMessage || null : null,
          updatedAt: serverTimestamp()
        };
      }
      return offer;
    });
    
    await updateDoc(userRef, {
      offers: updatedOffers,
      updatedAt: serverTimestamp()
    });

    console.log(`Offer ${offerId} status updated to ${status}`);
    return true;
  } catch (error) {
    console.error('Error updating offer status:', error);
    return false;
  }
};

// Get all students (volunteers) from a specific school
export const getStudentsBySchool = async (schoolName: string) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('userType', '==', 'wolontariusz'),
      where('schoolName', '==', schoolName)
    );
    
    const querySnapshot = await getDocs(q);
    const students = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Check for minors and create certificateStatus field if missing
    const updatePromises = students.map(async (student) => {
      const isMinor = student.isMinor || (() => {
        if (!student.birthDate) return false;
        const today = new Date();
        const birth = new Date(student.birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;
        return actualAge < 18;
      })();

      if (isMinor && !student.certificateStatus) {
        console.log(`Creating certificateStatus field for minor student: ${student.firstName} ${student.lastName}`);
        try {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('./config');
          const userRef = doc(db, 'users', student.id);
          await updateDoc(userRef, {
            certificateStatus: 'none',
            isMinor: true
          });
          console.log(`Updated student ${student.id} with certificateStatus: none`);
        } catch (error) {
          console.error(`Error updating student ${student.id}:`, error);
        }
      }
    });

    await Promise.all(updatePromises);

    // Refetch students to get updated data
    const updatedQuerySnapshot = await getDocs(q);
    const updatedStudents = updatedQuerySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Found ${updatedStudents.length} students from school: ${schoolName}`);
    return updatedStudents;
  } catch (error) {
    console.error('Error fetching students by school:', error);
    return [];
  }
};

// Get all users from Firestore
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersRef = collection(db, 'users');
    const usersSnap = await getDocs(usersRef);
    
    const users: UserProfile[] = [];
    usersSnap.forEach((doc) => {
      const userData = doc.data() as UserProfile;
      users.push({
        ...userData,
        id: doc.id
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

// Fetch certificate applications for a specific student
export const getCertificateApplications = async (studentId: string) => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('./config');
    
    const applicationsRef = collection(db, 'certificateApplications');
    const q = query(
      applicationsRef,
      where('studentId', '==', studentId)
    );
    
    const querySnapshot = await getDocs(q);
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort by submittedAt on the client side to avoid index requirement
    applications.sort((a, b) => {
      if (!a.submittedAt || !b.submittedAt) return 0;
      return b.submittedAt.seconds - a.submittedAt.seconds;
    });
    
    console.log(`Found ${applications.length} certificate applications for student: ${studentId}`);
    return applications;
  } catch (error) {
    console.error('Error fetching certificate applications:', error);
    return [];
  }
};


