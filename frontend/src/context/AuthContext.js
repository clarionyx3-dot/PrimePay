import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Ctx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged check karta hai ke user login hai ya nahi
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setLoading(true); // Data fetch karte waqt loading on rakhein
      setUser(u);
      
      if (u) {
        console.log("Firebase Auth User Found! UID:", u.uid);
        try {
          // Firestore se 'users' collection mein is UID ka data uthao
          const docRef = doc(db, 'users', u.uid);
          const s = await getDoc(docRef);
          
          if (s.exists()) {
            const data = s.data();
            console.log("Firestore Profile Data:", data);
            setProfile(data);
          } else {
            console.warn("UID toh sahi hai, lekin Firestore mein 'users' collection mein ye document nahi mila!");
            setProfile(null);
          }
        } catch (error) {
          console.error("Firestore Error:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = (e, p) => {
    console.log("Login attempt for:", e);
    return signInWithEmailAndPassword(auth, e, p);
  };

  // Logout function
  const logout = () => {
    console.log("Logging out...");
    return signOut(auth);
  };

  // Jo data hum baaki components ko dena chahte hain
  const value = {
    user,
    profile,
    loading,
    role: profile?.role || null,
    restaurantId: profile?.restaurantId || null,
    isSuperAdmin: profile?.role === 'superadmin',
    isAdmin: profile?.role === 'admin',
    isClient: profile?.role === 'client',
    login,
    logout,
  };

  return (
    <Ctx.Provider value={value}>
      {!loading && children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);