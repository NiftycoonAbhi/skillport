import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // PWA support
import { AuthProvider } from './contexts/AuthContext'; // ✅ Import your AuthContext

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <AuthProvider> {/* ✅ Wrap App with AuthProvider */}
    <App />
  </AuthProvider>
);

// ✅ Enable service worker for PWA functionality
serviceWorkerRegistration.register();
