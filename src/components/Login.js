import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
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
  const navigate = useNavigate();

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setRole('');
    setBio('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          uid: userCred.user.uid,
          firstName,
          lastName,
          phone,
          role,
          bio,
          email,
          createdAt: new Date(),
        });
        alert('✅ Registered Successfully!');
        resetForm();
        setIsRegister(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        if (rememberMe) localStorage.setItem('rememberedEmail', email);
        navigate('/dashboard');
      }
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
            {isRegister ? 'Create an Account' : 'Login to SkillPort'}
          </h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {isRegister && (
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
                <textarea
                  placeholder="Short Bio (Optional)"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="p-3 border rounded col-span-2"
                  rows="2"
                />
              </>
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

            {!isRegister && (
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
              {isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
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
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
