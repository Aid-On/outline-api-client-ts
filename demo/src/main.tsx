import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import TestApp from './TestApp';
import './styles/main.css';

console.log('Demo starting...');

const rootElement = document.getElementById('app');
if (!rootElement) {
  console.error('Root element not found');
} else {
  console.log('Root element found, rendering app...');
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error rendering app:', error);
  }
}