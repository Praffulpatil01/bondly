import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/firebase/firebase';
import { AuthService } from '@/firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { collections } from '@/firebase/collections';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase authentication state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const userRef = doc(collections.users, firebaseUser.uid);
        const profileRef = doc(collections.profiles, firebaseUser.uid);
        updateDoc(userRef, { onlineStatus: 'online', lastSeen: Date.now() }).catch(() => {});
        updateDoc(profileRef, { onlineStatus: 'online', lastSeen: Date.now() }).catch(() => {});
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    if (auth.currentUser) {
      try {
        const userRef = doc(collections.users, auth.currentUser.uid);
        const profileRef = doc(collections.profiles, auth.currentUser.uid);
        await updateDoc(userRef, { onlineStatus: 'offline', lastSeen: Date.now() });
        await updateDoc(profileRef, { onlineStatus: 'offline', lastSeen: Date.now() });
      } catch (e) {
        console.warn('Failed to set offline status on logout', e);
      }
    }
    localStorage.removeItem('Ryple_demo_user');
    await AuthService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
