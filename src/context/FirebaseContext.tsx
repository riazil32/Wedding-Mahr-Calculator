import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithGoogle, logout, db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, collection, addDoc, query, where, onSnapshot, deleteDoc } from 'firebase/firestore';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signingIn: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  saveCalculation: (type: 'zakat' | 'fitrana' | 'mahr', label: string, data: any, result: number, currency: string) => Promise<void>;
  getCalculations: (callback: (calculations: any[]) => void) => () => void;
  deleteCalculation: (id: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser && currentUser.email) {
        // Sync user profile to Firestore with only non-null string fields
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const payload: Record<string, string> = {
            uid: currentUser.uid,
            email: currentUser.email,
            updatedAt: new Date().toISOString()
          };
          if (currentUser.displayName) {
            payload.displayName = currentUser.displayName;
          }
          if (currentUser.photoURL) {
            payload.photoURL = currentUser.photoURL;
          }
          await setDoc(userRef, payload, { merge: true });
        } catch (error) {
          console.warn('User profile sync skipped:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signIn = async () => {
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // User closed the popup intentionally
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(`This domain (${window.location.hostname}) is not yet authorized in Firebase Authentication. Add it under Firebase Console > Authentication > Settings > Authorized domains.`);
      } else {
        setAuthError(error?.message || 'Unable to sign in with Google. Please try again.');
      }
      console.error('Sign in error:', error);
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const saveCalculation = async (type: 'zakat' | 'fitrana' | 'mahr', label: string, data: any, result: number, currency: string) => {
    if (!user) throw new Error('User must be signed in to save calculations');

    const path = 'calculations';
    try {
      await addDoc(collection(db, path), {
        uid: user.uid,
        type,
        label: label || 'Saved Calculation',
        data: data || {},
        result: Number(result) || 0,
        currency: currency || 'GBP',
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const getCalculations = (callback: (calculations: any[]) => void) => {
    if (!user) return () => {};

    const path = 'calculations';
    // Query by uid only and sort in memory so no composite index is required
    const q = query(
      collection(db, path),
      where('uid', '==', user.uid)
    );

    return onSnapshot(q, (snapshot) => {
      const calculations = snapshot.docs
        .map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }))
        .sort((a: any, b: any) => {
          const timeA = new Date(a.createdAt || 0).getTime();
          const timeB = new Date(b.createdAt || 0).getTime();
          return timeB - timeA;
        });
      callback(calculations);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  };

  const deleteCalculation = async (id: string) => {
    if (!user) return;
    const path = `calculations/${id}`;
    try {
      await deleteDoc(doc(db, 'calculations', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <FirebaseContext.Provider value={{
      user,
      loading,
      signingIn,
      authError,
      clearAuthError,
      signIn,
      signOut,
      saveCalculation,
      getCalculations,
      deleteCalculation
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
