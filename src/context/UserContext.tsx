import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, User, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { UserFinancialProfile } from '../../types';

interface UserContextType {
  user: User | null;
  loading: boolean;
  financialProfile: UserFinancialProfile | null;
  updateFinancialProfile: (data: Partial<UserFinancialProfile>) => Promise<void>;
  stealthMode: boolean;
  setStealthMode: (val: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [financialProfile, setFinancialProfile] = useState<UserFinancialProfile | null>(null);
  const [stealthMode, setStealthMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setFinancialProfile(null);
      return;
    }

    const path = `financial_profiles/${user.uid}`;
    const unsubscribe = onSnapshot(
      doc(db, 'financial_profiles', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setFinancialProfile(snapshot.data() as UserFinancialProfile);
        } else {
          setFinancialProfile({ uid: user.uid });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, path);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateFinancialProfile = async (data: Partial<UserFinancialProfile>) => {
    if (!user) return;
    const path = `financial_profiles/${user.uid}`;
    try {
      const docRef = doc(db, 'financial_profiles', user.uid);
      const updatedData = {
        ...data,
        uid: user.uid,
        updatedAt: new Date().toISOString(),
      };
      
      // Use setDoc with merge: true to create if it doesn't exist
      await setDoc(docRef, updatedData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      financialProfile, 
      updateFinancialProfile,
      stealthMode,
      setStealthMode
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const useFinancialData = () => {
  const { financialProfile, updateFinancialProfile } = useUser();
  return { financialProfile, updateFinancialProfile };
};
