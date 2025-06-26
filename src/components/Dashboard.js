import React, { useEffect, useState } from "react";
import { FiActivity } from 'react-icons/fi';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase'; // adjust path as needed
import { useNavigate } from "react-router-dom";
import AddCertificate from "./AddCertificate";
import CertificateList from "./CertificateList";
import AddProject from "./AddProject";
import ProjectList from "./ProjectList";
import ProfileOverview from "./ProfileOverview";
import StudyPlanner from "./StudyPlanner";
import NoteEditor from "./NoteEditor";
import NoteList from "./NotesList";
import QuestionPaperList from "./QuestionPaperList";
import QuizList from "./QuizList";
import {
  FiHome,
  FiPlusCircle,
  FiFileText,
  FiFolder,
  FiFolderPlus,
  FiLogOut,
  FiUser,
  FiAward,
  FiMenu,
  FiX,
  FiBook,
  FiBookOpen,
  FiExternalLink,
  FiCalendar,
  FiPieChart,
  FiSettings,
  FiMessageSquare,
  FiTrendingUp,
  FiClipboard,
  FiLayers,
  FiClock,
  FiStar,
  FiHelpCircle,
} from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import { BsLightningFill, BsJournalBookmark } from "react-icons/bs";

function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");
  const [activeSection, setActiveSection] = useState("home");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [currentQuizLink, setCurrentQuizLink] = useState(null);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserName(data.firstName || "");
        } else {
          console.log("No such user!");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUserName();
  }, []);


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        setUserName(user.FirstName);
      } else {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const logout = () => {
    auth.signOut();
    navigate("/");
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
    setActiveSection("pdf-viewer");
  };

  const openQuiz = (quizUrl) => {
    setCurrentQuizLink(quizUrl);
    setActiveSection("quiz-viewer");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileOverview />;
      case "add-certificate":
        return <AddCertificate />;
      case "certificates":
        return <CertificateList />;
      case "add-project":
        return <AddProject />;
      case "projects":
        return <ProjectList />;
      case "studyplanner":
        return <StudyPlanner />;
      case "noteseditor":
        return <NoteEditor />;
      case "noteslist":
        return <NoteList />;
      case "question-papers":
        return <QuestionPaperList openPdf={openPdf} />;
      // case "quiz":
      //   return <QuizList openQuiz={openQuiz} />;
      case "pdf-viewer":
        return (
          <div className="h-full flex flex-col bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => handleNavigation("question-papers")}
                className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-all"
              >
                <FiArrowLeft className="mr-2" /> Back to Question Papers
              </button>
              <a
                href={currentPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-all"
              >
                Open in new tab <FiExternalLink className="ml-2" />
              </a>
            </div>
            <iframe
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                currentPdf
              )}&embedded=true`}
              className="flex-grow w-full border rounded-lg shadow-inner"
              title="PDF Viewer"
            />
          </div>
        );
      case "quiz-viewer":
        return (
          <div className="h-full flex flex-col bg-white rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => handleNavigation("quiz")}
                className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-all"
              >
                <FiArrowLeft className="mr-2" /> Back to Quizzes
              </button>
              <a
                href={currentQuizLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-all"
              >
                Open in new tab <FiExternalLink className="ml-2" />
              </a>
            </div>
            <iframe
              src={currentQuizLink}
              className="flex-grow w-full border rounded-lg shadow-inner"
              title="Quiz Viewer"
            />
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {/* Welcome Card - Enhanced with glass morphism effect */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-6 text-white col-span-1 md:col-span-2 lg:col-span-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                 <h2 className="text-2xl md:text-3xl font-bold mb-2">
  Welcome back, <span className="text-blue-200">{userName}</span>!
</h2>

                  <p className="text-blue-100 max-w-lg">
                    Ready to boost your learning today? Track your progress and
                    achieve your goals with our comprehensive tools.
                  </p>
                </div>
                <button
                  onClick={() => handleNavigation("studyplanner")}
                  className="bg-white/90 hover:bg-white text-blue-700 hover:text-blue-800 px-6 py-3 rounded-xl font-semibold transition-all flex items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <FiCalendar className="mr-2" /> Plan Your Study
                </button>
              </div>
              {/* Decorative elements */}
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-400/20 rounded-full"></div>
              <div className="absolute -left-5 -bottom-5 w-20 h-20 bg-indigo-400/20 rounded-full"></div>
            </div>

            {/* Quick Actions - Enhanced with better card styling */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <BsLightningFill className="text-yellow-500 mr-3 text-xl animate-pulse" />
                  Quick Actions
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Shortcuts
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Add Certificate */}
                <button
                  onClick={() => handleNavigation("add-certificate")}
                  className="group relative flex flex-col items-center justify-center p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="p-3 mb-2 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors duration-300">
                      <FiPlusCircle className="text-blue-600 text-xl group-hover:text-blue-700 transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                      Add Certificate
                    </span>
                  </div>
                </button>

                {/* Add Project */}
                <button
                  onClick={() => handleNavigation("add-project")}
                  className="group relative flex flex-col items-center justify-center p-5 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 hover:border-green-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-green-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="p-3 mb-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors duration-300">
                      <FiFolderPlus className="text-green-600 text-xl group-hover:text-green-700 transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                      Add Project
                    </span>
                  </div>
                </button>

                {/* Take Notes */}
                <button
                  onClick={() => handleNavigation("noteseditor")}
                  className="group relative flex flex-col items-center justify-center p-5 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 hover:border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="p-3 mb-2 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors duration-300">
                      <BsJournalBookmark className="text-purple-600 text-xl group-hover:text-purple-700 transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                      Take Notes
                    </span>
                  </div>
                </button>

                {/* Question Papers */}
                <button
                  onClick={() => handleNavigation("question-papers")}
                  className="group relative flex flex-col items-center justify-center p-5 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100 hover:border-orange-200 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-orange-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="p-3 mb-2 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors duration-300">
                      <FiBook className="text-orange-600 text-xl group-hover:text-orange-700 transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                      Question Papers
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Additional Card (optional) */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <FiActivity className="text-pink-500 mr-3" />
                Your Progress
              </h3>
              <div className="h-40 flex items-center justify-center bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                <p className="text-gray-500 text-center p-4">
                  Visual progress chart or statistics could go here
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  const SidebarContent = ({ isMobile = false }) => (
    <div className={`${isMobile ? "p-4" : "p-4 space-y-1"}`}>
      {!isMobile && !isSidebarCollapsed && (
        <div className="px-3 py-4 mb-2">
          <h2 className="text-xl font-bold text-blue-600 flex items-center">
            <FiAward className="mr-2" /> SkillPort
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Student Learning Dashboard
          </p>
        </div>
      )}

      {isMobile && (
        <div className="px-3 py-4 mb-2 border-b border-gray-200">
          <h2 className="text-xl font-bold text-blue-600 flex items-center">
            <FiAward className="mr-2" /> SkillPort
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Student Learning Dashboard
          </p>
        </div>
      )}

      <div className="space-y-1">
        <button
          className={`w-full flex items-center ${
            activeSection === "home"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("home")}
        >
          <FiHome className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">Dashboard</span>
          )}
        </button>

        <button
          className={`w-full flex items-center ${
            activeSection === "profile"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("profile")}
        >
          <FiUser className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">Profile</span>
          )}
        </button>

        <button
          className={`w-full flex items-center ${
            activeSection === "studyplanner"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("studyplanner")}
        >
          <FiCalendar className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">Study Planner</span>
          )}
        </button>
      </div>

      <div className="pt-4">
        {(!isSidebarCollapsed || isMobile) && (
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-3">
            Achievements
          </p>
        )}
        <button
          className={`w-full flex items-center ${
            activeSection === "add-certificate"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("add-certificate")}
        >
          <FiPlusCircle className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">Add Certificate</span>
          )}
        </button>
        <button
          className={`w-full flex items-center ${
            activeSection === "certificates"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("certificates")}
        >
          <FiFileText className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">My Certificates</span>
          )}
        </button>
        <button
          className={`w-full flex items-center ${
            activeSection === "add-project"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("add-project")}
        >
          <FiFolderPlus className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">Add Project</span>
          )}
        </button>
        <button
          className={`w-full flex items-center ${
            activeSection === "projects"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("projects")}
        >
          <FiFolder className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">My Projects</span>
          )}
        </button>
      </div>

      <div className="pt-4">
        {(!isSidebarCollapsed || isMobile) && (
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-3">
            Study Tools
          </p>
        )}
        <button
          className={`w-full flex items-center ${
            activeSection === "noteseditor"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("noteseditor")}
        >
          <BsJournalBookmark className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">Notes Maker</span>
          )}
        </button>
        <button
          className={`w-full flex items-center ${
            activeSection === "noteslist"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("noteslist")}
        >
          <FiClipboard className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">Notes List</span>
          )}
        </button>
        <button
          className={`w-full flex items-center ${
            activeSection === "question-papers"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("question-papers")}
        >
          <FiBook className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">Question Papers</span>
          )}
        </button>
        {/* <button
          className={`w-full flex items-center ${
            activeSection === "quiz"
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700 hover:bg-gray-100"
          } rounded-xl p-3 transition-all`}
          onClick={() => handleNavigation("quiz")}
        >
          <FiHelpCircle className="text-lg" />
          {(!isSidebarCollapsed || isMobile) && (
            <span className="ml-3">Quizzes</span>
          )}
        </button> */}
      </div>

      {(!isSidebarCollapsed || isMobile) && (
        <div className="pt-4 border-t border-gray-200 mt-4">
          <button
            className="w-full flex items-center text-gray-700 hover:bg-gray-100 rounded-xl p-3 transition-all"
            onClick={logout}
          >
            <FiLogOut className="text-lg" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-gray-600 hover:text-gray-800 p-2 rounded-md"
        >
          {isMobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <h1 className="text-xl font-semibold text-gray-800 mx-4 truncate">
          {activeSection === "home" && "Dashboard"}
          {activeSection === "profile" && "Profile"}
          {activeSection === "add-certificate" && "Add Certificate"}
          {activeSection === "certificates" && "My Certificates"}
          {activeSection === "add-project" && "Add Project"}
          {activeSection === "projects" && "My Projects"}
          {activeSection === "studyplanner" && "Study Planner"}
          {activeSection === "noteseditor" && "Notes Maker"}
          {activeSection === "noteslist" && "Notes List"}
          {activeSection === "question-papers" && "Question Papers"}
          {/* {activeSection === "quiz" && "Quizzes"} */}
        </h1>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
          <div className="relative h-full w-72 bg-white shadow-lg z-50 overflow-y-auto">
            <SidebarContent isMobile />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } bg-white shadow-lg transition-all duration-300 flex-col sticky top-0 h-screen`}
      >
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
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
          >
            {isSidebarCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
        {isSidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex justify-center text-gray-600 hover:text-red-500 p-2 rounded-lg"
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white shadow-sm p-4 justify-between items-center sticky top-0 z-20">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {activeSection === "home" && "Dashboard"}
              {activeSection === "profile" && "My Profile"}
              {activeSection === "add-certificate" && "Add Certificate"}
              {activeSection === "certificates" && "My Certificates"}
              {activeSection === "add-project" && "Add Project"}
              {activeSection === "projects" && "My Projects"}
              {activeSection === "studyplanner" && "Study Planner"}
              {activeSection === "noteseditor" && "Notes Maker"}
              {activeSection === "noteslist" && "My Notes"}
              {activeSection === "question-papers" && "Question Papers"}
              {/* {activeSection === "quiz" && "Practice Quizzes"} */}
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            {/* <button className="text-gray-500 hover:text-blue-600 transition-colors relative">
              <FiMessageSquare size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button> */}

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-md">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {userEmail}
                  </span>
                  <span className="text-xs text-gray-500">Student</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 min-h-[calc(100vh-80px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
