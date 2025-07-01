import React, { useEffect, useState } from "react";
import { FiActivity, FiArrowLeft } from 'react-icons/fi';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
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
import CareerOpportunities from "./CareerOpportunities";
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
import { motion, AnimatePresence } from "framer-motion";

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrCreateUser = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          setUserName(docSnap.data().firstName || "");
        } else {
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
      } finally {
        setIsLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(fetchOrCreateUser);
    return () => unsubscribe();
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
        setUserName(user.displayName || "");
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
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

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
      case "career-opportunities":
        return <CareerOpportunities />;
      case "question-papers":
        return <QuestionPaperList openPdf={openPdf} />;
      case "pdf-viewer":
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => handleNavigation("question-papers")}
                className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-all hover:bg-blue-100"
              >
                <FiArrowLeft className="mr-2" /> Back to Question Papers
              </button>
              <a
                href={currentPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-all hover:bg-blue-100"
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
          </motion.div>
        );
      case "quiz-viewer":
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col bg-white rounded-xl shadow-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => handleNavigation("quiz")}
                className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-all hover:bg-blue-100"
              >
                <FiArrowLeft className="mr-2" /> Back to Quizzes
              </button>
              <a
                href={currentQuizLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-all hover:bg-blue-100"
              >
                Open in new tab <FiExternalLink className="ml-2" />
              </a>
            </div>
            <iframe
              src={currentQuizLink}
              className="flex-grow w-full border rounded-lg shadow-inner"
              title="Quiz Viewer"
            />
          </motion.div>
        );
      default:
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BsLightningFill className="text-yellow-500 mr-3 text-2xl animate-pulse" />
                  Welcome back, {userName || "Student"}!
                </h3>
                <p className="text-gray-500 mt-1">What would you like to do today?</p>
              </div>
              <span className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full shadow">
                Quick Access
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Add Certificate",
                  icon: <FiPlusCircle className="text-blue-600 group-hover:text-blue-700 text-xl" />,
                  color: "blue",
                  route: "add-certificate",
                  description: "Add your academic achievements"
                },
                {
                  title: "Add Project",
                  icon: <FiFolderPlus className="text-green-600 group-hover:text-green-700 text-xl" />,
                  color: "green",
                  route: "add-project",
                  description: "Showcase your work"
                },
                {
                  title: "Take Notes",
                  icon: <BsJournalBookmark className="text-purple-600 group-hover:text-purple-700 text-xl" />,
                  color: "purple",
                  route: "noteseditor",
                  description: "Organize your thoughts"
                },
                {
                  title: "Question Papers",
                  icon: <FiBook className="text-orange-600 group-hover:text-orange-700 text-xl" />,
                  color: "orange",
                  route: "question-papers",
                  description: "Practice past exams"
                },
                {
                  title: "Career Opportunities",
                  icon: <FiTrendingUp className="text-teal-600 group-hover:text-teal-700 text-xl" />,
                  color: "teal",
                  route: "career-opportunities",
                  description: "Explore your future"
                },
                {
                  title: "Study Planner",
                  icon: <FiCalendar className="text-indigo-600 group-hover:text-indigo-700 text-xl" />,
                  color: "indigo",
                  route: "studyplanner",
                  description: "Plan your study schedule"
                },
                {
                  title: "View Projects",
                  icon: <FiFolder className="text-amber-600 group-hover:text-amber-700 text-xl" />,
                  color: "amber",
                  route: "projects",
                  description: "Review your portfolio"
                },
                {
                  title: "View Certificates",
                  icon: <FiAward className="text-rose-600 group-hover:text-rose-700 text-xl" />,
                  color: "rose",
                  route: "certificates",
                  description: "See your achievements"
                }
              ].map((item, i) => (
                <motion.button
                  key={i}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavigation(item.route)}
                  className={`group relative flex flex-col items-center p-6 bg-gradient-to-br from-${item.color}-50 to-white rounded-xl border border-${item.color}-100 hover:border-${item.color}-200 shadow-md hover:shadow-lg transition-all duration-300`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-white opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-300"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className={`p-4 mb-3 bg-${item.color}-100 rounded-2xl group-hover:bg-${item.color}-200 transition-all duration-300 shadow-inner`}
                    >
                      {item.icon}
                    </div>
                    <span className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                      {item.title}
                    </span>
                    <span className="text-sm text-gray-500 mt-1 group-hover:text-gray-600 transition-colors duration-300">
                      {item.description}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
    }
  };

  const SidebarItem = ({ icon, text, active, onClick, isCollapsed }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center ${
        active ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
      } rounded-xl p-3 transition-all mb-1`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="text-lg">{icon}</div>
        {!isCollapsed && <span className="ml-3 font-medium">{text}</span>}
      </div>
    </motion.button>
  );

  const SidebarSection = ({ title, isCollapsed, children }) => (
    <div className="pt-4">
      {!isCollapsed && title && (
        <p className="text-xs font-semibold text-gray-500 uppercase mb-2 px-3 tracking-wider">
          {title}
        </p>
      )}
      {children}
    </div>
  );

  const SidebarContent = ({ isMobile = false }) => (
    <div className={`${isMobile ? "p-0" : "p-4 space-y-1"}`}>
      {isMobile && (
        <div className="px-4 py-4 mb-2 border-b border-gray-200">
          <div className="flex justify-center">
            <img
              src="/images/logo.jpg"
              alt="JnanaSetu"
              className="w-32 h-32 object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>
          <div className="mt-2 text-center">
            <h3 className="font-bold text-gray-800">Welcome, {userName || "User"}!</h3>
            <p className="text-xs text-gray-500">{userEmail}</p>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <SidebarItem
          icon={<FiHome />}
          text="Dashboard"
          active={activeSection === "home"}
          onClick={() => handleNavigation("home")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />

        <SidebarItem
          icon={<FiUser />}
          text="Profile"
          active={activeSection === "profile"}
          onClick={() => handleNavigation("profile")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />

        <SidebarItem
          icon={<FiCalendar />}
          text="Study Planner"
          active={activeSection === "studyplanner"}
          onClick={() => handleNavigation("studyplanner")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />
      </div>

      <SidebarSection title="Achievements" isCollapsed={isSidebarCollapsed && !isMobile}>
        <SidebarItem
          icon={<FiPlusCircle />}
          text="Add Certificate"
          active={activeSection === "add-certificate"}
          onClick={() => handleNavigation("add-certificate")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />
        <SidebarItem
          icon={<FiFileText />}
          text="My Certificates"
          active={activeSection === "certificates"}
          onClick={() => handleNavigation("certificates")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />
        <SidebarItem
          icon={<FiFolderPlus />}
          text="Add Project"
          active={activeSection === "add-project"}
          onClick={() => handleNavigation("add-project")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />
        <SidebarItem
          icon={<FiFolder />}
          text="My Projects"
          active={activeSection === "projects"}
          onClick={() => handleNavigation("projects")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />
      </SidebarSection>

      <SidebarSection title="Study Tools" isCollapsed={isSidebarCollapsed && !isMobile}>
        <SidebarItem
          icon={<BsJournalBookmark />}
          text="Notes Maker"
          active={activeSection === "noteseditor"}
          onClick={() => handleNavigation("noteseditor")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />
        <SidebarItem
          icon={<FiClipboard />}
          text="Notes List"
          active={activeSection === "noteslist"}
          onClick={() => handleNavigation("noteslist")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />
        <SidebarItem
          icon={<FiBook />}
          text="Question Papers"
          active={activeSection === "question-papers"}
          onClick={() => handleNavigation("question-papers")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />
      </SidebarSection>

      <SidebarSection title="Career" isCollapsed={isSidebarCollapsed && !isMobile}>
        <SidebarItem
          icon={<FiTrendingUp />}
          text="Career Opportunities"
          active={activeSection === "career-opportunities"}
          onClick={() => handleNavigation("career-opportunities")}
          isCollapsed={isSidebarCollapsed && !isMobile}
        />
      </SidebarSection>

      {(!isSidebarCollapsed || isMobile) && (
        <div className="pt-4 border-t border-gray-200 mt-4">
          <SidebarItem
            icon={<FiLogOut />}
            text="Logout"
            onClick={logout}
            isCollapsed={isSidebarCollapsed && !isMobile}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="text-gray-600 hover:text-gray-800 p-2 rounded-md transition-colors"
        >
          {isMobileSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <h1 className="text-xl font-bold text-gray-800 mx-4 truncate">
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
          {activeSection === "career-opportunities" && "Career Opportunities"}
        </h1>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow">
            {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed inset-0 z-40"
          >
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileSidebarOpen(false)}
            ></div>
            <div className="relative h-full w-72 bg-white shadow-xl z-50 overflow-y-auto">
              <SidebarContent isMobile />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        className={`hidden lg:flex ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } bg-white shadow-xl transition-all duration-300 flex-col sticky top-0 h-screen`}
      >
        {/* Header with logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex-1 flex justify-center">
              <img
                src="/images/logo.jpg"
                alt="JnanaSetu"
                className="w-20 h-20 object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          )}
          {isSidebarCollapsed && (
            <div className="mx-auto">
              <FiAward className="text-blue-600 text-2xl" />
            </div>
          )}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-gray-500 hover:text-gray-700 p-1 ml-2 rounded-full hover:bg-gray-100 transition duration-200"
            title="Toggle Sidebar"
          >
            {isSidebarCollapsed ? <FiMenu size={20} /> : <FiX size={20} />}
          </button>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>

        {/* Collapsed sidebar logout */}
        {isSidebarCollapsed && (
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex justify-center text-gray-600 hover:text-red-500 p-2 rounded-lg transition duration-200"
              title="Logout"
            >
              <FiLogOut size={20} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Desktop Header */}
        <div className="hidden lg:flex bg-white shadow-sm p-4 justify-between items-center sticky top-0 z-20">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">
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
              {activeSection === "career-opportunities" && "Career Opportunities"}
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-md">
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {userName || userEmail}
                  </span>
                  <span className="text-xs text-gray-500">Student</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6 min-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;