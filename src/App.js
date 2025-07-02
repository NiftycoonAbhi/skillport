import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AddCertificate from './components/AddCertificate';
import AddProject from './components/AddProject';
import ProjectList from './components/ProjectList';
import CertificateList from './components/CertificateList';
import StudyPlanner from './components/StudyPlanner';
import NoteEditor from './components/NoteEditor';
import NotesList from './components/NotesList';
import AdminDashboard from './pages/AdminDashboard';
import CareerOpportunities from "./components/CareerOpportunities";
import ChatbotDoubtSolver from './components/ChatbotDoubtSolver';

// Create a component to conditionally render the chatbot
const AppContent = () => {
  const location = useLocation();
  const hideChatbotPaths = ['/', '/login', '/register'];
  const shouldShowChatbot = !hideChatbotPaths.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-certificate" element={<AddCertificate />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/certificates" element={<CertificateList />} />
        <Route path="/studyplanner" element={<StudyPlanner />} />
        <Route path="/noteseditor" element={<NoteEditor />} />
        <Route path="/noteslist" element={<NotesList />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/career-opportunities" element={<CareerOpportunities />} />
      </Routes>

      {/* {shouldShowChatbot && <ChatbotDoubtSolver />} */}
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;