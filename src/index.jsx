import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; // Corrected import to use .jsx

// NOTE: In a real project, Tailwind CSS classes would be included via a CSS file here.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
