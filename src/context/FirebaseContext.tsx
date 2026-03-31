import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithGoogle, logout, db, handleFirestoreError, OperationType } from '../firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc } from 'firebase/firestore';

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync user profile to Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          await setDoc(userRef, {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error('Error syncing user profile:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
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
        label,
        data,
        result,
        currency,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const getCalculations = (callback: (calculations: any[]) => void) => {
    if (!user) return () => {};

    const path = 'calculations';
    const q = query(
      collection(db, path),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const calculations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
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
    <FirebaseContext.Provider value={{ user, loading, signIn, signOut, saveCalculation, getCalculations, deleteCalculation }}>
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

import { auth } from '../firebase';
