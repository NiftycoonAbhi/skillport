import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import AddCertificate from './AddCertificate';
import CertificateList from './CertificateList';
import AddProject from './AddProject';
import ProjectList from './ProjectList';
import ProfileOverview from './ProfileOverview';
import StudyPlanner from './StudyPlanner';
import NoteEditor from './NoteEditor';
import NoteList from './NotesList';
import QuestionPaperList from './QuestionPaperList';
import QuizList from './QuizList';
import { 
  FiHome, FiPlusCircle, FiFileText, FiFolder, FiFolderPlus, 
  FiLogOut, FiUser, FiAward, FiMenu, FiX, FiBook, FiBookOpen,
  FiExternalLink
} from 'react-icons/fi';

function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [currentQuizLink, setCurrentQuizLink] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleNavigation = (section) => {
    setActiveSection(section);
    setCurrentPdf(null);
    setCurrentQuizLink(null);
    if (windowWidth <= 1024) {
      setIsMobileSidebarOpen(false);
    }
  };

  const openPdf = (pdfUrl) => {
    setCurrentPdf(pdfUrl);
    setActiveSection('pdf-viewer');
  };

  const openQuiz = (quizUrl) => {
    setCurrentQuizLink(quizUrl);
    setActiveSection('quiz-viewer');
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
      case 'noteseditor':
        return <NoteEditor />;
      case 'noteslist':
        return <NoteList />;
      case 'question-papers':
        return <QuestionPaperList openPdf={openPdf} />;
      case 'quiz':
        return <QuizList openQuiz={openQuiz} />;
      case 'pdf-viewer':
        return (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => handleNavigation('question-papers')}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FiArrowLeft className="mr-1" /> Back to Question Papers
              </button>
              <a 
                href={currentPdf} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                Open in new tab <FiExternalLink className="ml-1" />
              </a>
            </div>
            <iframe 
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(currentPdf)}&embedded=true`}
              className="flex-grow w-full border rounded-lg"
              title="PDF Viewer"
            />
          </div>
        );
      case 'quiz-viewer':
        return (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <button 
                onClick={() => handleNavigation('quiz')}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <FiArrowLeft className="mr-1" /> Back to Quizzes
              </button>
              <a 
                href={currentQuizLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                Open in new tab <FiExternalLink className="ml-1" />
              </a>
            </div>
            <iframe 
              src={currentQuizLink}
              className="flex-grow w-full border rounded-lg"
              title="Quiz Viewer"
            />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <FiHome className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to SkillPort</h2>
              <p className="text-gray-600 mb-6">
                Manage your professional portfolio with ease. Add certificates, showcase projects, 
                and track your achievements all in one place.
              </p>
              <button 
                onClick={() => handleNavigation('add-certificate')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        );
    }
  };

  // Sidebar content component to avoid duplication
  const SidebarContent = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'p-4' : 'p-4 space-y-2'}`}>
      <button
        className={`w-full flex items-center ${activeSection === 'home' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
        onClick={() => handleNavigation('home')}
      >
        <FiHome className="text-lg" />
        {(!isSidebarCollapsed || isMobile) && <span className="ml-3">Dashboard</span>}
      </button>
      
      <button
        className={`w-full flex items-center ${activeSection === 'profile' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
        onClick={() => handleNavigation('profile')}
      >
        <FiUser className="text-lg" />
        {(!isSidebarCollapsed || isMobile) && <span className="ml-3">Profile</span>}
      </button>
      
      <button
        className={`w-full flex items-center ${activeSection === 'studyplanner' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
        onClick={() => handleNavigation('studyplanner')}
      >
        <FiFolder className="text-lg" />
        {(!isSidebarCollapsed || isMobile) && <span className="ml-3">StudyPlanner</span>}
      </button>

      <div className="pt-2">
        {(!isSidebarCollapsed || isMobile) && (
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Certificates</p>
        )}
        <button
          className={`w-full flex items-center ${activeSection === 'add-certificate' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
          onClick={() => handleNavigation('add-certificate')}
        >
          <FiPlusCircle className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && <span className="ml-3">Add Certificate</span>}
        </button>
        <button
          className={`w-full flex items-center ${activeSection === 'certificates' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
          onClick={() => handleNavigation('certificates')}
        >
          <FiFileText className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && <span className="ml-3">My Certificates</span>}
        </button>
      </div>
      
      <div className="pt-2">
        {(!isSidebarCollapsed || isMobile) && (
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Projects</p>
        )}
        <button
          className={`w-full flex items-center ${activeSection === 'add-project' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
          onClick={() => handleNavigation('add-project')}
        >
          <FiFolderPlus className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && <span className="ml-3">Add Project</span>}
        </button>
        <button
          className={`w-full flex items-center ${activeSection === 'projects' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
          onClick={() => handleNavigation('projects')}
        >
          <FiFolder className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && <span className="ml-3">My Projects</span>}
        </button>
      </div>
      
      <div className="pt-2">
        {(!isSidebarCollapsed || isMobile) && (
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Notes</p>
        )}
        <button
          className={`w-full flex items-center ${activeSection === 'noteseditor' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
          onClick={() => handleNavigation('noteseditor')}
        >
          <FiFolderPlus className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && <span className="ml-3">Notes Maker</span>}
        </button>
        <button
          className={`w-full flex items-center ${activeSection === 'noteslist' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
          onClick={() => handleNavigation('noteslist')}
        >
          <FiFolder className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && <span className="ml-3">Notes List</span>}
        </button>
      </div>
      
      <div className="pt-2">
        {(!isSidebarCollapsed || isMobile) && (
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Study Materials</p>
        )}
        <button
          className={`w-full flex items-center ${activeSection === 'question-papers' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
          onClick={() => handleNavigation('question-papers')}
        >
          <FiBook className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && <span className="ml-3">Question Papers</span>}
        </button>
        <button
          className={`w-full flex items-center ${activeSection === 'quiz' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'} rounded-lg p-3 transition-all`}
          onClick={() => handleNavigation('quiz')}
        >
          <FiBookOpen className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && <span className="ml-3">Quiz</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-gray-600 hover:text-gray-800 p-2 rounded-md"
        >
          {isMobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <h1 className="text-xl font-semibold text-gray-800 mx-4 truncate">
          {activeSection === 'home' && 'Dashboard'}
          {activeSection === 'profile' && 'Profile'}
          {activeSection === 'add-certificate' && 'Add Certificate'}
          {activeSection === 'certificates' && 'My Certificates'}
          {activeSection === 'add-project' && 'Add Project'}
          {activeSection === 'projects' && 'My Projects'}
          {activeSection === 'studyplanner' && 'Study Planner'}
          {activeSection === 'noteseditor' && 'Notes maker'}
          {activeSection === 'noteslist' && 'Notes List'}
          {activeSection === 'question-papers' && 'Question Papers'}
          {activeSection === 'quiz' && 'Quiz'}
        </h1>
        <div className="flex items-center space-x-2">
          <button
            className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
            onClick={logout}
          >
            <FiLogOut className="mr-1" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
          <div className="relative h-full w-72 bg-white shadow-lg z-50">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-600 flex items-center">
                <FiAward className="mr-2" /> SkillPort
              </h2>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
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
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white shadow-sm p-4 justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">
            {activeSection === 'home' && 'Dashboard'}
            {activeSection === 'profile' && 'Profile'}
            {activeSection === 'add-certificate' && 'Add Certificate'}
            {activeSection === 'certificates' && 'My Certificates'}
            {activeSection === 'add-project' && 'Add Project'}
            {activeSection === 'projects' && 'My Projects'}
            {activeSection === 'studyplanner' && 'Study Planner'}
            {activeSection === 'noteseditor' && 'Notes maker'}
            {activeSection === 'noteslist' && 'Notes List'}
            {activeSection === 'question-papers' && 'Question Papers'}
            {activeSection === 'quiz' && 'Quiz'}
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

        <div className="p-4 lg:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;