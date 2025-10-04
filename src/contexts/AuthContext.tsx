import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange } from '../firebase/auth';
import { getUserProfileByEmail, UserProfile, updateUserProfileWithMissingFields } from '../firebase/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        // Get user profile from Firestore
        try {
          console.log('Fetching user profile for email:', user.email);
          const profile = await getUserProfileByEmail(user.email || '');
          console.log('Retrieved user profile:', profile);
          
          if (profile) {
            // Check and update missing fields
            try {
              await updateUserProfileWithMissingFields(profile.id!, profile);
              console.log('Checked and updated missing fields if any');
            } catch (error) {
              console.error('Error updating missing fields:', error);
            }
            
            // Update last login timestamp
            const { updateUserProfile } = await import('../firebase/firestore');
            await updateUserProfile(profile.id!, { lastLoginAt: new Date() });
            console.log('Updated last login timestamp');
          }
          
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { signInUser } = await import('../firebase/auth');
    await signInUser(email, password);
  };

  const signUp = async (email: string, password: string) => {
    const { createUser } = await import('../firebase/auth');
    await createUser(email, password);
  };

  const logout = async () => {
    const { signOutUser } = await import('../firebase/auth');
    await signOutUser();
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
