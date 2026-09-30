import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore (use specific database ID if provisioned)
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Configure Google Auth Provider with requested Google Workspace scopes
export const googleAuthProvider = new GoogleAuthProvider();

// Scopes required for Calendar, Tasks, and Contacts
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/tasks.readonly',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://www.googleapis.com/auth/user.phonenumbers.read',
  'https://www.googleapis.com/auth/user.emails.read',
];

// Add scopes to provider
WORKSPACE_SCOPES.forEach((scope) => {
  googleAuthProvider.addScope(scope);
});

// MANDATORY: In-memory access token storage (NEVER store in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Custom event to notify components when access token changes
const notifyTokenChanged = (token: string | null) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('workspace-token-changed', { detail: { token } }));
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  notifyTokenChanged(token);
};

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      notifyTokenChanged(null);
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Google Sign-In with Popup for Firebase Auth + Workspace Scopes
export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    googleAuthProvider.setCustomParameters({
      prompt: 'consent',
      access_type: 'offline',
    });

    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve OAuth access token from Google sign in');
    }

    cachedAccessToken = credential.accessToken;
    notifyTokenChanged(cachedAccessToken);

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Sign out from Firebase
export const logoutFirebase = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  notifyTokenChanged(null);
};

// ==========================================
// FIRESTORE HELPERS FOR AGRISAHAY
// ==========================================

// Save farmer user profile to Firestore
export const saveUserProfileToFirestore = async (userId: string, data: any) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore saveUserProfile notice:', err);
  }
};

// Fetch farmer profile from Firestore
export const getUserProfileFromFirestore = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn('Firestore getUserProfile notice:', err);
    return null;
  }
};

// Save Journal Entry to Firestore
export const saveJournalEntryToFirestore = async (entry: any) => {
  try {
    const entryRef = doc(db, 'journalEntries', String(entry.id));
    await setDoc(entryRef, { ...entry, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('Firestore saveJournalEntry notice:', err);
  }
};

// Fetch Journal Entries for a user from Firestore
export const getJournalEntriesFromFirestore = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'journalEntries'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data());
  } catch (err) {
    console.warn('Firestore getJournalEntries notice:', err);
    return [];
  }
};

// Save Farm Marketplace Listing to Firestore
export const saveFarmListingToFirestore = async (listing: any) => {
  try {
    const listingRef = doc(db, 'farmListings', listing.id);
    await setDoc(listingRef, { ...listing, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn('Firestore saveFarmListing notice:', err);
  }
};

// Fetch all Farm Listings from Firestore
export const getFarmListingsFromFirestore = async () => {
  try {
    const q = query(collection(db, 'farmListings'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data());
  } catch (err) {
    console.warn('Firestore getFarmListings notice:', err);
    return [];
  }
};
