import { useEffect, useState, createContext, useContext } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

export const AuthContext = createContext({
  currentUser: null,
  isAdmin: false,
  loading: true,
  error: null,
  refreshAuth: () => {}
});

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshAuth = async () => {
    if (auth.currentUser) {
      try {
        await auth.currentUser.getIdToken(true);
        const idTokenResult = await auth.currentUser.getIdTokenResult();
        setIsAdmin(!!idTokenResult.claims.admin);
      } catch (err) {
        console.error("Error refreshing auth:", err);
        setError("Failed to refresh authentication");
      }
    }
  };

  useEffect(() => {
    let unsubscribeUser = () => {};

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          setLoading(true);
          setError(null);

          if (user) {
            // Force refresh token to get latest claims
            const idTokenResult = await user.getIdTokenResult(true);
            const adminClaim = !!idTokenResult.claims.admin;
            
            // Set up Firestore listener for additional admin status
            unsubscribeUser = onSnapshot(
              doc(db, 'users', user.uid),
              (docSnap) => {
                const userData = docSnap.data();
                const firestoreAdminStatus = !!userData?.admin;
                setIsAdmin(adminClaim || firestoreAdminStatus);
              },
              (err) => console.error("Firestore user error:", err)
            );

            setCurrentUser({ 
              ...user, 
              isAdmin: adminClaim,
              uid: user.uid,
              email: user.email,
            });
          } else {
            setCurrentUser(null);
            setIsAdmin(false);
          }
        } catch (err) {
          console.error("Auth error:", err);
          setError(err.message);
          setCurrentUser(null);
          setIsAdmin(false);
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Auth observer error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
    };
  }, []);

  const value = {
    currentUser,
    isAdmin,
    loading,
    error,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}