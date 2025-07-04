import React, { useContext, useEffect, useState, createContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Spin } from "antd";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuth = async () => {
    if (auth.currentUser) {
      await auth.currentUser.getIdToken(true);
    }
  };

  useEffect(() => {
    let unsubscribeUserDoc = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const token = await user.getIdTokenResult();
          const adminClaim = token.claims.admin || false;
          setIsAdmin(adminClaim);

          // Subscribe to Firestore user document
          const userDocRef = doc(db, "users", user.uid);
          unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
            const userData = docSnap.data();
            if (userData?.admin !== undefined) {
              setIsAdmin(userData.admin);
            }
          });
        } catch (err) {
          console.error("Error checking admin claim or Firestore:", err);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }

      setLoading(false); // ✅ Always called after user is handled
    });

    return () => {
      unsubscribe();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const value = {
    currentUser,
    isAdmin,
    loading,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Spin tip="Authenticating..." size="large">
            <div className="h-32 w-32" />
          </Spin>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
