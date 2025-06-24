import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
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
  const [adminCode, setAdminCode] = useState(''); // New state for admin registration code
  const [isAdminRegistration, setIsAdminRegistration] = useState(false); // New state for admin registration mode
  const navigate = useNavigate();

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setRole('');
    setBio('');
    setEmail('');
    setPassword('');
    setAdminCode('');
    setError('');
    setIsAdminRegistration(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        // Regular user registration
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        // Set user data in Firestore
        await setDoc(doc(db, 'users', userCred.user.uid), {
          uid: userCred.user.uid,
          firstName,
          lastName,
          phone,
          role,
          bio,
          email,
          isAdmin: false, // Regular users are not admins by default
          createdAt: new Date(),
        });
        
        alert('✅ Registered Successfully!');
        resetForm();
        setIsRegister(false);
      } else {
        // Login logic
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        
        // Check if user is admin
        const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
        const userData = userDoc.data();
        
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        }
        
        // Redirect based on admin status
        if (userData?.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdminRegistration = async (e) => {
    e.preventDefault();
    try {
      // In a real app, this should be handled server-side
      // This is just for demonstration - in production, use Firebase Admin SDK on your backend
      if (adminCode !== '9988') { // Replace with your actual secret code
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
      setError(err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return setError('Please enter your email to reset password');
    try {
      await sendPasswordResetEmail(auth, email);
      alert('📩 Password reset link sent to your email.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="flex shadow-xl rounded-lg bg-white max-w-6xl w-full overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-center items-center bg-blue-100 p-10 w-1/2">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" className="w-32 mb-6" alt="logo" />
          <h2 className="text-3xl font-bold text-blue-700 mb-2">Welcome to SkillPort</h2>
          <p className="text-gray-600 text-center max-w-sm">
            Create and manage your profile, certificates, and projects with ease. Get started in minutes.
          </p>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">
            {isAdminRegistration ? 'Admin Registration' : isRegister ? 'Create an Account' : 'Login to SkillPort'}
          </h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={isAdminRegistration ? handleAdminRegistration : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {(isRegister || isAdminRegistration) && (
              <>
                <input
                  type="text"
                  placeholder="First Name *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="p-3 border rounded col-span-1"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="p-3 border rounded col-span-1"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="p-3 border rounded col-span-1"
                />
                {!isAdminRegistration && (
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="p-3 border rounded col-span-1"
                  >
                    <option value="">Select Role (Optional)</option>
                    <option value="Student">Student</option>
                    <option value="Developer">Developer</option>
                    <option value="Trainer">Trainer</option>
                  </select>
                )}
                <textarea
                  placeholder="Short Bio (Optional)"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="p-3 border rounded col-span-2"
                  rows="2"
                />
              </>
            )}

            {isAdminRegistration && (
              <input
                type="password"
                placeholder="Admin Registration Code *"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="p-3 border rounded col-span-2"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border rounded col-span-2"
            />

            <div className="relative col-span-2">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="p-3 border rounded w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {!isRegister && !isAdminRegistration && (
              <div className="col-span-2 flex justify-between items-center text-xs text-gray-600">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  Remember Me
                </label>
                <button type="button" onClick={handleForgotPassword} className="text-blue-600 hover:underline">
                  Forgot Password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
            >
              {isAdminRegistration ? 'Register Admin' : isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 mt-4 space-y-2">
            {!isAdminRegistration && (
              <>
                <p>
                  {isRegister ? 'Already have an account?' : 'New to SkillPort?'}
                  <button
                    onClick={() => {
                      resetForm();
                      setIsRegister(!isRegister);
                    }}
                    className="ml-1 text-green-600 hover:underline"
                  >
                    {isRegister ? 'Login here' : 'Register'}
                  </button>
                </p>
                {/* <p>
                  Need admin access?{' '}
                  <button
                    onClick={() => {
                      resetForm();
                      setIsAdminRegistration(true);
                    }}
                    className="text-purple-600 hover:underline"
                  >
                    Register as admin
                  </button>
                </p> */}
              </>
            )}
            {isAdminRegistration && (
              <p>
                <button
                  onClick={() => {
                    resetForm();
                    setIsAdminRegistration(false);
                  }}
                  className="text-green-600 hover:underline"
                >
                  Back to regular registration
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;