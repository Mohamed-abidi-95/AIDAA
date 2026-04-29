// ============================================================================
// MAIN ENTRY POINT
// ============================================================================
// Application entry point that renders the App component

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n'; // Initialize i18n (must be before App)

// ============================================================================
// RENDER APP
// ============================================================================
// Get the root element from HTML
const rootElement = document.getElementById('root');

// Check if root element exists
if (!rootElement) {
  throw new Error('Root element not found in HTML');
}

// Create React root and render the App component
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
