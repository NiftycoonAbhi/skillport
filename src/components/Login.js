import React, { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isAdminRegistration, setIsAdminRegistration] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState(''); // Added missing state
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && !isRegister) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, [isRegister]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setRole('');
    setBio('');
    setPassword('');
    setAdminCode('');
    setError('');
    setIsAdminRegistration(false);
  };

  const getFriendlyErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'Please enter a valid email address';
      case 'auth/user-not-found':
        return 'No account found with this email. Please register first';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again';
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please login instead';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials';
      default:
        return 'An error occurred. Please try again';
    }
  };

  const checkEmailRegistered = async (email) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isRegister) {
        // First check if email exists in auth system
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.length > 0) {
          throw { code: 'auth/email-already-in-use' };
        }

        // Then check if email exists in Firestore
        const isRegistered = await checkEmailRegistered(email);
        if (isRegistered) {
          throw { code: 'auth/email-already-in-use' };
        }

        // Proceed with registration
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        await setDoc(doc(db, 'users', userCred.user.uid), {
          uid: userCred.user.uid,
          firstName,
          lastName,
          phone,
          role,
          bio,
          email: email.toLowerCase(),
          isAdmin: false,
          createdAt: serverTimestamp(),
        });
        
        alert('✅ Registered Successfully!');
        resetForm();
        setIsRegister(false);
      } else {
        // Login logic
        try {
          const userCred = await signInWithEmailAndPassword(auth, email, password);
          
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
          } else {
            localStorage.removeItem('rememberedEmail');
          }
          
          const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
          const userData = userDoc.data();
          
          navigate(userData?.isAdmin ? '/admin' : '/dashboard');
        } catch (err) {
          // Handle specific login errors
          if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
            const isRegistered = await checkEmailRegistered(email);
            throw { 
              code: isRegistered ? 'auth/wrong-password' : 'auth/user-not-found' 
            };
          }
          throw err;
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrCreateUser = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setUserName(docSnap.data().firstName || "");
      } else {
        console.log("Creating new user document...");
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          firstName: "",
          lastName: "",
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error handling user data:", error);
    }
  };
  const handleAdminRegistration = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (adminCode !== '9988') {
        throw new Error('Invalid admin registration code');
      }
      
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', userCred.user.uid), {
        uid: userCred.user.uid,
        firstName,
        lastName,
        phone,
        role: 'Admin',
        bio,
        email,
        isAdmin: true,
        createdAt: new Date(),
      });
      
      alert('✅ Admin account created successfully!');
      resetForm();
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code) || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      alert('📩 Password reset link sent to your email. Please check your inbox.');
    } catch (err) {
      setError(getFriendlyErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

 return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 sm:p-6">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Panel */}
          <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-blue-700 p-8 md:w-1/2 lg:p-12">
            <div className="text-center text-white">
              <img 
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" 
                className="w-24 h-24 mx-auto mb-6" 
                alt="App Logo"
              />
              <h2 className="text-3xl font-bold mb-4">Welcome to JnanaSetu</h2>
              <p className="text-blue-100 max-w-md mx-auto">
                Create and manage your profile with ease. Get started in minutes.
              </p>
            </div>
          </div>

          {/* Right Form */}
          <div className="w-full p-6 sm:p-8 md:w-1/2 md:p-10">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                {isAdminRegistration ? 'Admin Registration' : 
                 isRegister ? 'Create an Account' : 'Login'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isAdminRegistration ? 'Register as an administrator' : 
                 isRegister ? 'Join our community' : 'Access your account'}
              </p>
            </div>

            {error && (
              <div className={`mb-4 p-3 rounded text-sm ${
                error.includes('not registered') || error.includes('No account found') ? 
                'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'
              }`}>
                {error}
                {error.includes('not registered') && (
                  <button
                    onClick={() => {
                      resetForm();
                      setIsRegister(true);
                    }}
                    className="ml-2 font-medium text-blue-600 hover:text-blue-500"
                  >
                    Sign up now
                  </button>
                )}
                {error.includes('Incorrect password') && (
                  <button
                    onClick={handleForgotPassword}
                    className="ml-2 font-medium text-blue-600 hover:text-blue-500"
                  >
                    Reset password
                  </button>
                )}
              </div>
            )}

            <form 
              onSubmit={isAdminRegistration ? handleAdminRegistration : handleSubmit} 
              className="space-y-4"
            >             {(isRegister || isAdminRegistration) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  {!isAdminRegistration && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Role</option>
                        <option value="Student">Student</option>
                        <option value="Developer">Developer</option>
                        <option value="Trainer">Trainer</option>
                      </select>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Short Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                    />
                  </div>
                </div>
              )}

              {isAdminRegistration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Registration Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {!isRegister && !isAdminRegistration && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
 <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  isAdminRegistration ? 'Register Admin' : isRegister ? 'Register' : 'Login'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {!isAdminRegistration ? (
                <>
                  <p className="mb-2">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}
                    <button
                      onClick={() => {
                        resetForm();
                        setIsRegister(!isRegister);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
                    >
                      {isRegister ? 'Login here' : 'Sign up'}
                    </button>
                  </p>
                </>
              ) : (
                <p>
                  <button
                    onClick={() => {
                      resetForm();
                      setIsAdminRegistration(false);
                    }}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Back to regular registration
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;