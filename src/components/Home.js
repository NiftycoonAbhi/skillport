import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-tr from-white via-blue-50 to-blue-100 flex flex-col">
      
      {/* Top Navbar */}
      <header className="w-full px-4 md:px-8 py-4 flex justify-between items-center bg-white shadow-sm border-b">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 tracking-tight">
          SkillPort<span className="text-indigo-500">.</span>
        </h1>
        <div className="space-x-2 md:space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 md:px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 md:px-5 py-2 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-16 py-10 md:py-20 flex-1 w-full max-w-7xl mx-auto gap-12">
        {/* Text Content */}
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-800 leading-snug mb-4">
            Build a Digital Portfolio <br className="hidden sm:inline" /> and Let Your Skills Shine
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-6 leading-relaxed">
            SkillPort empowers you to showcase your certificates, projects, and achievements — all in one beautifully organized profile.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-6 sm:px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full text-base sm:text-lg hover:bg-indigo-700 shadow transition"
          >
            Get Started Now
          </button>
        </div>

        {/* Image / Illustration */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src="images/home.jpeg"
            alt="Illustration of developer"
            className="rounded-full w-60 sm:w-72 md:w-80 h-60 sm:h-72 md:h-80 object-cover shadow-lg border-4 border-white"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500 border-t px-4">
        © {new Date().getFullYear()} SkillPort. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
