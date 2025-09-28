import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: The error indicates that 'App.tsx' does not have a default export.
// This changes the import to a named import, assuming the component is exported as `export const App`.
import { App } from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);