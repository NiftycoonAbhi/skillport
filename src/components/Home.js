import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('certificates');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col relative">
      {/* Background with Logo */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="/images/logo.jpg"
            alt="JnanaSetu"
            className="w-64 h-64 object-contain"
          />
        </div>
      </div>

      {/* Hero Content */}
      <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 flex-grow z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
              <span className="block">Your Complete</span>
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Academic Portfolio
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl">
              Showcase your certificates, projects, and achievements with JnanaSetu's all-in-one student platform.
            </p>

            {/* Feature highlights */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <span className="text-gray-700">Digitally store and showcase all your certificates</span>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 p-2 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <span className="text-gray-700">Organize your study notes and materials</span>
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create Your Account
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                Login
              </button>
            </div>
          </div>

          {/* Right content - Interactive preview */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-lg">
              {/* Tabbed interface preview */}
              <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('certificates')}
                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'certificates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Certificates
                  </button>
                  <button
                    onClick={() => setActiveTab('projects')}
                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'projects' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-4 py-3 text-sm font-medium ${activeTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Notes
                  </button>
                </div>

                {/* Certificates Tab Content */}
                {activeTab === 'certificates' && (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900">Your Certificates</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">AWS Certified Developer</h4>
                          <p className="text-sm text-gray-500">Issued: May 2023</p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-green-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Google Data Analytics</h4>
                          <p className="text-sm text-gray-500">Issued: March 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Projects Tab Content */}
                {activeTab === 'projects' && (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900">Your Projects</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">E-commerce Platform</h4>
                          <p className="text-sm text-gray-500">React, Node.js, MongoDB</p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Student Management System</h4>
                          <p className="text-sm text-gray-500">Django, PostgreSQL</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Tab Content */}
                {activeTab === 'notes' && (
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900">Your Notes</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Data Structures Algorithms</h4>
                          <p className="text-sm text-gray-500">Last updated: 2 days ago</p>
                        </div>
                      </div>

                      <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="bg-red-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">Database Systems</h4>
                          <p className="text-sm text-gray-500">Last updated: 1 week ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating element */}
              <div className="absolute -bottom-6 -right-6 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                  </div>
                  <span className="text-sm font-medium">3 new career opportunities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with icons */}
      <footer className="w-full bg-gray-800 text-white py-2 px-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold">Quantum Garden</h3>
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} JnanaSetu. All rights reserved.</p>
          </div>
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-8">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
              <a href="mailto:quantumgarden1@gmail.com" className="text-blue-400 hover:underline">quantumgarden1@gmail.com</a>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
              <a href="tel:+919591585862" className="text-blue-400 hover:underline">91 9591585862</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HeroSection;