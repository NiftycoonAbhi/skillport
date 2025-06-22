// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AddCertificate from './components/AddCertificate';
import AddProject from './components/AddProject';
import ProjectList from './components/ProjectList';
import CertificateList from './components/CertificateList';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-certificate" element={<AddCertificate />} />
        <Route path="/add-project" element={<AddProject />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/certificates" element={<CertificateList />} />
      </Routes>
    </Router>
  );
}

export default App;
