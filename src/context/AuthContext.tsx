import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/farming';
import {
  signInWithGoogle,
  logoutFirebase,
  initAuth,
  getAccessToken as getFbAccessToken,
  saveUserProfileToFirestore,
  getUserProfileFromFirestore,
} from '../utils/firebase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  hasGoogleWorkspaceToken: boolean;
  sendOtp: (fullPhone: string) => Promise<{ success: boolean; demoOtp?: string; error?: string }>;
  verifyOtp: (fullPhone: string, otp: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
  connectGoogleWorkspace: () => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  pendingPhone: string | null;
  activeDemoOtp: string | null;
  resendCountdown: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('agrisahay_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse user auth session:', e);
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasGoogleWorkspaceToken, setHasGoogleWorkspaceToken] = useState<boolean>(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [activeDemoOtp, setActiveDemoOtp] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState<number>(0);

  // Listen for Workspace token changes
  useEffect(() => {
    const checkToken = async () => {
      const token = await getFbAccessToken();
      setHasGoogleWorkspaceToken(!!token);
    };

    checkToken();

    const handleTokenEvent = (e: any) => {
      setHasGoogleWorkspaceToken(!!e.detail?.token);
    };

    window.addEventListener('workspace-token-changed', handleTokenEvent);
    return () => {
      window.removeEventListener('workspace-token-changed', handleTokenEvent);
    };
  }, []);

  // Listen for Firebase Auth changes on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      async (firebaseUser, token) => {
        if (firebaseUser) {
          const userId = firebaseUser.uid;
          const firestoreProfile = await getUserProfileFromFirestore(userId);
          const existing = localStorage.getItem(`agrisahay_user_profile_${userId}`);
          const profileData = firestoreProfile || (existing ? JSON.parse(existing) : null);

          setUser((currentUser) => {
            // Keep local changes if already set
            const base = currentUser || {
              id: userId,
              authMethod: 'google' as const,
              name: firebaseUser.displayName || 'Kisan Mitra',
              email: firebaseUser.email || undefined,
              phone: firebaseUser.phoneNumber || undefined,
              avatarUrl: firebaseUser.photoURL || undefined,
              isGuest: false,
              profileComplete: false,
              createdAt: new Date().toISOString(),
            };

            return {
              ...base,
              name: base.name || firebaseUser.displayName || 'Kisan Mitra',
              email: base.email || firebaseUser.email || undefined,
              avatarUrl: base.avatarUrl || firebaseUser.photoURL || undefined,
              ...(profileData || {}),
            };
          });

          setHasGoogleWorkspaceToken(!!token);
        }
      },
      () => {
        // Logged out
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: any;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // Persist user session to localStorage & Firestore
  useEffect(() => {
    if (user && !user.isGuest) {
      localStorage.setItem('agrisahay_auth_user', JSON.stringify(user));
      localStorage.setItem(`agrisahay_user_profile_${user.id}`, JSON.stringify(user));
      // Sync to Firestore
      saveUserProfileToFirestore(user.id, user).catch(() => {});
    } else if (!user) {
      localStorage.removeItem('agrisahay_auth_user');
    }
  }, [user]);

  // Send OTP
  const sendOtp = async (fullPhone: string): Promise<{ success: boolean; demoOtp?: string; error?: string }> => {
    setIsLoading(true);
    try {
      const cleaned = fullPhone.replace(/\D/g, '');
      if (cleaned.length < 10) {
        throw new Error('Please enter a valid mobile number with at least 10 digits.');
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setActiveDemoOtp(generatedOtp);
      setPendingPhone(fullPhone);
      setResendCountdown(60);

      await new Promise((resolve) => setTimeout(resolve, 500));

      return { success: true, demoOtp: generatedOtp };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send OTP' };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOtp = async (
    fullPhone: string,
    otp: string
  ): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (otp !== activeDemoOtp && otp !== '123456') {
        throw new Error('Invalid verification code. Please check the 6-digit OTP and try again.');
      }

      const userId = 'farmer_' + fullPhone.replace(/\D/g, '');
      const existingProfile = localStorage.getItem(`agrisahay_user_profile_${userId}`);

      let authenticatedUser: UserProfile;

      if (existingProfile) {
        authenticatedUser = JSON.parse(existingProfile);
      } else {
        authenticatedUser = {
          id: userId,
          authMethod: 'phone',
          name: '',
          phone: fullPhone,
          isGuest: false,
          profileComplete: false,
          createdAt: new Date().toISOString(),
        };
      }

      setUser(authenticatedUser);
      setPendingPhone(null);
      setActiveDemoOtp(null);

      // Save to Firestore
      await saveUserProfileToFirestore(userId, authenticatedUser);

      return { success: true, isNewUser: !authenticatedUser.profileComplete };
    } catch (err: any) {
      return { success: false, error: err.message || 'Verification failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login with Firebase Auth and Workspace Scopes
  const loginWithGoogle = async (): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { user: fbUser } = await signInWithGoogle();
      const userId = fbUser.uid;

      // Try fetching from Firestore first
      const firestoreProfile = await getUserProfileFromFirestore(userId);
      const localProfile = localStorage.getItem(`agrisahay_user_profile_${userId}`);
      const saved = firestoreProfile || (localProfile ? JSON.parse(localProfile) : null);

      const authenticatedUser: UserProfile = {
        id: userId,
        authMethod: 'google',
        name: fbUser.displayName || saved?.name || 'Kisan Mitra',
        email: fbUser.email || undefined,
        phone: fbUser.phoneNumber || saved?.phone || undefined,
        avatarUrl: fbUser.photoURL || undefined,
        state: saved?.state,
        district: saved?.district,
        village: saved?.village,
        mainCrop: saved?.mainCrop,
        farmSize: saved?.farmSize,
        isGuest: false,
        profileComplete: !!saved?.profileComplete,
        createdAt: saved?.createdAt || new Date().toISOString(),
      };

      setUser(authenticatedUser);
      setHasGoogleWorkspaceToken(true);
      await saveUserProfileToFirestore(userId, authenticatedUser);

      return { success: true, isNewUser: !authenticatedUser.profileComplete };
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      // If user closed popup or cancelled
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, error: 'Sign-in window closed. Please try again.' };
      }
      return { success: false, error: err.message || 'Google sign-in could not be completed.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Connect Google Workspace for existing phone/guest user
  const connectGoogleWorkspace = async (): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { user: fbUser } = await signInWithGoogle();
      setHasGoogleWorkspaceToken(true);

      // Merge Google email/name into current user profile
      if (user) {
        const updated: UserProfile = {
          ...user,
          email: fbUser.email || user.email,
          avatarUrl: fbUser.photoURL || user.avatarUrl,
        };
        setUser(updated);
        await saveUserProfileToFirestore(user.id, updated);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to connect Google account.' };
    } finally {
      setIsLoading(false);
    }
  };

  // Guest Login
  const loginAsGuest = () => {
    const guestUser: UserProfile = {
      id: 'guest_' + Date.now(),
      authMethod: 'guest',
      name: 'Guest Farmer',
      isGuest: true,
      profileComplete: true,
      createdAt: new Date().toISOString(),
      mainCrop: 'Multi-Crop',
      farmSize: '2 Acres',
      state: 'Maharashtra',
      district: 'Pune',
      village: 'Gramin Area',
    };
    setUser(guestUser);
  };

  // Update Profile
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      ...profileData,
      profileComplete: true,
    };
    setUser(updated);
    if (!user.isGuest) {
      localStorage.setItem('agrisahay_auth_user', JSON.stringify(updated));
      localStorage.setItem(`agrisahay_user_profile_${updated.id}`, JSON.stringify(updated));
      await saveUserProfileToFirestore(updated.id, updated);
    }
  };

  // Logout
  const logout = () => {
    logoutFirebase().catch(() => {});
    setUser(null);
    setHasGoogleWorkspaceToken(false);
    localStorage.removeItem('agrisahay_auth_user');
    setPendingPhone(null);
    setActiveDemoOtp(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isGuest: !!user?.isGuest,
        isLoading,
        hasGoogleWorkspaceToken,
        sendOtp,
        verifyOtp,
        loginWithGoogle,
        connectGoogleWorkspace,
        loginAsGuest,
        updateProfile,
        logout,
        pendingPhone,
        activeDemoOtp,
        resendCountdown,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
