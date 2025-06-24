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
     <footer className="bg-gray-50">
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Copyright section */}
      <div className="flex flex-col items-center md:items-start">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} SkillPort. All rights reserved.
        </p>
      </div>

      {/* Contact section */}
      <div className="flex flex-col items-center">
        <div className="flex items-center space-x-4">
          <a href="mailto:abhilashbadiger0000@gmail.com" aria-label="Email">
            <svg className="w-5 h-5 text-gray-500 hover:text-blue-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </a>
          <a href="tel:+91 8951104063" aria-label="Phone">
            <svg className="w-5 h-5 text-gray-500 hover:text-green-500 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/abhilashbadiger/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <svg className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
            </svg>
          </a>
          {/* <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <svg className="w-5 h-5 text-gray-500 hover:text-gray-900 transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a> */}
        </div>
      </div>

      {/* Developer credit */}
      <div className="flex flex-col items-center md:items-end">
        <p className="text-sm text-gray-500">
          Developed by <span className="font-medium">Abhilash</span>
        </p>
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}

export default Home;
