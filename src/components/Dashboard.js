// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import AddCertificate from './AddCertificate';
import CertificateList from './CertificateList';
import AddProject from './AddProject';
import ProjectList from './ProjectList';
import ProfileOverview from './ProfileOverview';
import { FiHome, FiPlusCircle, FiFileText, FiFolder, FiFolderPlus, FiLogOut, FiUser, FiAward } from 'react-icons/fi';
import StudyPlanner from './StudyPlanner';

function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const logout = () => {
    auth.signOut();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeSection) {
       case 'profile':
      return <ProfileOverview />;
      case 'add-certificate':
        return <AddCertificate />;
      case 'certificates':
        return <CertificateList />;
      case 'add-project':
        return <AddProject />;
      case 'projects':
        return <ProjectList />;
        case 'studyplanner':
        return <StudyPlanner />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center max-w-md">
              <FiHome className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to SkillPort</h2>
              <p className="text-gray-600 mb-6">
                Manage your professional portfolio with ease. Add certificates, showcase projects, 
                and track your achievements all in one place.
              </p>
              <button 
                onClick={() => setActiveSection('add-certificate')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <h2 className="text-xl font-bold text-blue-600 flex items-center">
              <FiAward className="mr-2" /> SkillPort
            </h2>
          )}
          {isSidebarCollapsed && (
            <div className="mx-auto">
              <FiAward className="text-blue-600 text-xl" />
            </div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isSidebarCollapsed ? '»' : '«'}
          </button>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          <button
            className={`w-full flex items-center ${activeSection === 'home' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
            onClick={() => setActiveSection('home')}
          >
            <FiHome className="text-lg" />
            {!isSidebarCollapsed && <span className="ml-3">Dashboard</span>}
          </button>
          <button
            className={`w-full flex items-center ${activeSection === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
            onClick={() => setActiveSection('profile')}
          >
            <FiUser className="text-lg" />
            {!isSidebarCollapsed && <span className="ml-3">Profile</span>}
          </button>
          <button
              className={`w-full flex items-center ${activeSection === 'projects' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
              onClick={() => setActiveSection('studyplanner')}
            >
              <FiFolder className="text-lg" />
              {!isSidebarCollapsed && <span className="ml-3">StudyPlanner</span>}
            </button>
          <div className="pt-2">
            <p className={`text-xs font-semibold text-gray-500 uppercase ${isSidebarCollapsed ? 'hidden' : 'block'} mb-2`}>Certificates</p>
            <button
              className={`w-full flex items-center ${activeSection === 'add-certificate' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
              onClick={() => setActiveSection('add-certificate')}
            >
              <FiPlusCircle className="text-lg" />
              {!isSidebarCollapsed && <span className="ml-3">Add Certificate</span>}
            </button>
            <button
              className={`w-full flex items-center ${activeSection === 'certificates' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
              onClick={() => setActiveSection('certificates')}
            >
              <FiFileText className="text-lg" />
              {!isSidebarCollapsed && <span className="ml-3">My Certificates</span>}
            </button>
          </div>
          
          <div className="pt-2">
            <p className={`text-xs font-semibold text-gray-500 uppercase ${isSidebarCollapsed ? 'hidden' : 'block'} mb-2`}>Projects</p>
            <button
              className={`w-full flex items-center ${activeSection === 'add-project' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
              onClick={() => setActiveSection('add-project')}
            >
              <FiFolderPlus className="text-lg" />
              {!isSidebarCollapsed && <span className="ml-3">Add Project</span>}
            </button>
            <button
              className={`w-full flex items-center ${activeSection === 'projects' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
              onClick={() => setActiveSection('projects')}
            >
              <FiFolder className="text-lg" />
              {!isSidebarCollapsed && <span className="ml-3">My Projects</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {activeSection === 'home' && 'Dashboard'}
            {activeSection === 'add-certificate' && 'Add Certificate'}
            {activeSection === 'certificates' && 'My Certificates'}
            {activeSection === 'add-project' && 'Add Project'}
            {activeSection === 'projects' && 'My Projects'}
          </h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FiUser className="text-gray-500 mr-2" />
              <span className="text-gray-700">{userEmail}</span>
            </div>
            <button
              className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
              onClick={logout}
            >
              <FiLogOut className="mr-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;