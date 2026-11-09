import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types/bus';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  role: UserRole;
  isStudent: boolean;
  isDriver: boolean;
  isAdmin: boolean;
  loading: boolean;
  loginWithGoogle: (desiredRole?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateRole: (newRole: UserRole) => Promise<void>;
  setDemoRole: (role: UserRole, customProfile?: Partial<UserProfile>) => void;
  isDemoUser: boolean;
  canAccessDriverPortal: boolean;
  canAccessAdminPortal: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Sync auth state listener and load user profile with role from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setIsDemoUser(false);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            // Document already exists: load stored role and profile from Firestore
            const data = userSnap.data() as UserProfile;
            setUserProfile(data);
          } else {
            // First-time sign up: determine role based on email or default to student
            let initialRole: UserRole = 'student';
            const emailLower = (user.email || '').toLowerCase();
            if (emailLower.includes('admin') || emailLower.includes('transport')) {
              initialRole = 'admin';
            } else if (emailLower.includes('driver')) {
              initialRole = 'driver';
            }

            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Jain University Member',
              photoURL: user.photoURL || undefined,
              role: initialRole,
              campus: 'Jain Global Campus (Kanaka Road / JGI)',
              studentId: initialRole === 'student' ? `JU-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
              assignedBusId: initialRole === 'driver' ? 'bus-1' : undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // Store in Firestore upon first sign-up
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error('Error fetching or creating user profile in Firestore:', err);
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Jain Student',
            role: 'student',
            campus: 'Jain Global Campus (Kanaka Road / JGI)',
          });
        }
      } else {
        if (!isDemoUser) {
          setCurrentUser(null);
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoUser]);

  /**
   * Google Authentication using signInWithPopup
   * Stores or updates the user profile and role in Firestore upon sign-in
   */
  const loginWithGoogle = async (desiredRole: UserRole = 'student') => {
    try {
      setLoading(true);
      const credential = await signInWithPopup(auth, googleProvider);
      const user = credential.user;

      if (user) {
        setCurrentUser(user);
        setIsDemoUser(false);

        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          // If profile exists, load its existing assigned role
          const existingData = userSnap.data() as UserProfile;
          setUserProfile(existingData);
        } else {
          // Upon first sign-up, create profile with the role selected by user
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || user.email?.split('@')[0] || 'Jain University Member',
            photoURL: user.photoURL || undefined,
            role: desiredRole,
            campus: 'Jain Global Campus (Kanaka Road / JGI)',
            studentId: desiredRole === 'student' ? `JU-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
            assignedBusId: desiredRole === 'driver' ? 'bus-1' : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await setDoc(userDocRef, newProfile);
          setUserProfile(newProfile);
        }
      }
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user from Firebase Auth
   */
  const logout = async () => {
    setIsDemoUser(false);
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  /**
   * Update role in both memory state and persistent Firestore document
   */
  const updateRole = async (newRole: UserRole) => {
    if (!userProfile) return;
    const updated = {
      ...userProfile,
      role: newRole,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updated);

    if (currentUser && !isDemoUser) {
      try {
        await setDoc(doc(db, 'users', currentUser.uid), updated, { merge: true });
      } catch (e) {
        console.error('Error saving role change to Firestore:', e);
      }
    }
  };

  /**
   * Instant Role Switcher for presentations and automated evaluation
   */
  const setDemoRole = (role: UserRole, customProfile?: Partial<UserProfile>) => {
    setIsDemoUser(true);
    const demoProfile: UserProfile = {
      uid: customProfile?.uid || `demo-${role}-uid`,
      email: customProfile?.email || `${role}.demo@jainuniversity.ac.in`,
      displayName:
        customProfile?.displayName ||
        (role === 'admin'
          ? 'Prof. K. Venkatesh (Transport Head)'
          : role === 'driver'
          ? 'Ramesh Kumar (Captain Bus 101)'
          : 'Nishanth S. (JU-2024CS089)'),
      role,
      campus: customProfile?.campus || 'Jain University - JGI Global Campus',
      studentId: role === 'student' ? customProfile?.studentId || 'JU24CS089' : undefined,
      assignedBusId: role === 'driver' ? 'bus-1' : undefined,
      phoneNumber: role === 'driver' ? '+91 98450 12345' : undefined,
    };
    setUserProfile(demoProfile);
    setCurrentUser({
      uid: demoProfile.uid,
      displayName: demoProfile.displayName,
      email: demoProfile.email,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
      providerId: 'google.com',
    } as unknown as User);
  };

  const currentRole: UserRole = userProfile?.role || 'student';
  const isStudent = currentRole === 'student';
  const isDriver = currentRole === 'driver';
  const isAdmin = currentRole === 'admin';

  // Access restrictions based on logged-in user's role
  const canAccessDriverPortal = isDriver || isAdmin;
  const canAccessAdminPortal = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        role: currentRole,
        isStudent,
        isDriver,
        isAdmin,
        loading,
        loginWithGoogle,
        logout,
        updateRole,
        setDemoRole,
        isDemoUser,
        canAccessDriverPortal,
        canAccessAdminPortal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
