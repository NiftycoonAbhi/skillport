import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName: firstName || '',
        lastName: lastName || '',
        phone: phone || '',
        role: role || '',
        bio: bio || '',
        createdAt: new Date()
      });

      alert('🎉 Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 overflow-hidden">
      <div className="bg-white shadow-lg p-6 rounded-xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-center mb-4 text-green-700">Create an Account</h2>

        <form onSubmit={handleRegister} className="space-y-3 text-sm text-gray-700">
          {/* First and Last Name */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block mb-1 font-medium">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-green-400"
                placeholder="John"
              />
            </div>
            <div className="w-1/2">
              <label className="block mb-1 font-medium">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-green-400"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-medium">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-green-400"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-green-400"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-green-400"
              placeholder="e.g., Developer, Designer, Student"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Short Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-green-400"
              placeholder="Tell us something about yourself..."
              rows="2"
            ></textarea>
          </div>

          <div className="relative">
            <label className="block mb-1 font-medium">Password *</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring focus:border-green-400 pr-12"
              placeholder="Enter a secure password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-8 right-3 text-lg text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-1.5 rounded transition"
          >
            Create Account
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already registered?
          <button
            className="ml-1 text-blue-600 hover:underline"
            onClick={() => navigate('/login')}
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
