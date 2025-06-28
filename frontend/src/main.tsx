// src/main.tsx
console.log('main.tsx: Script started executing.'); // NEW: Very early log

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Import the AuthProvider from its new location
import { AuthProvider } from './context/AuthProvider'; // Make sure this path is correct

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Wrap your App component with AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
