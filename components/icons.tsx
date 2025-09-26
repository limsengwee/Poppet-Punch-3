import React from 'react';

// Fix: Updated MalletIcon props to accept standard SVG props like `style`, resolving the TypeScript error. The hardcoded transform was removed to fix a style override bug.
export const MalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M19.9999 4.00003L14.8283 9.17159L12.707 7.04992L17.8786 1.87869C18.2691 1.48816 18.9023 1.48816 19.2928 1.87869L22.1212 4.70712C22.5117 5.09764 22.5117 5.73081 22.1212 6.12133L19.9999 8.24268V4.00003Z" fill="#a16207"/>
    <path d="M11.2929 8.46447L2 17.7574V22H6.24264L15.5355 12.7071L11.2929 8.46447Z" fill="#ca8a04"/>
    <path d="M12.7071 7.05021L14.8284 9.17154L15.5355 8.46443L13.4142 6.3431L12.7071 7.05021Z" fill="#fbbf24"/>
    <path d="M5.53553 21.2929L6.24264 22L2 22V17.7574L2.70711 18.4645L5.53553 21.2929Z" fill="#854d0e"/>
  </svg>
);

// Fix: Updated UploadIcon to accept all SVG props for consistency and flexibility.
export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M13 10H18L12 3L6 10H11V16H13V10ZM4 18H20V20H4V18Z" />
  </svg>
);

// Fix: Updated SpinnerIcon to accept all SVG props while preserving its base animation class.
export const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>> = ({ className, ...props }) => (
  <svg className={`animate-spin ${className || ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const CoinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400" {...props}>
    <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 20C7.582 20 4 16.418 4 12C4 7.582 7.582 4 12 4C16.418 4 20 7.582 20 12C20 16.418 16.418 20 12 20ZM12 6C8.686 6 6 8.686 6 12C6 12.552 6.448 13 7 13C7.552 13 8 12.552 8 12C8 9.791 9.791 8 12 8C14.209 8 16 9.791 16 12C16 14.209 14.209 16 12 16C11.448 16 11 16.448 11 17C11 17.552 11.448 18 12 18C15.314 18 18 15.314 18 12C18 8.686 15.314 6 12 6Z"></path>
  </svg>
);

export const CameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M4 5H7L9 3H15L17 5H20C21.1046 5 22 5.89543 22 7V19C22 20.1046 21.1046 21 20 21H4C2.89543 21 2 20.1046 2 19V7C2 5.89543 2.89543 5 4 5ZM12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"></path>
  </svg>
);

export const HandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.742 14.017c.913-.173 1.63-1.022 1.55-1.954-.08-1.022-.913-1.74-1.826-1.55L19 10.88V4.5a1 1 0 0 0-1-1s-1.5 0-1.5 1.5V9l-3.21-1.42a1 1 0 0 0-1.29.65L10.02 14H6.5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8.69c.98 0 1.82-.7 1.98-1.66l.78-4.323z" />
  </svg>
);

export const IronHammerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18 2h-4a2 2 0 0 0-2 2v2H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h6v2a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM12 16v6h2v-6h-2z" />
  </svg>
);

export const SpiderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.25 8a.75.75 0 0 0-1.5 0 3.25 3.25 0 0 1-6.5 0 .75.75 0 0 0-1.5 0 4.75 4.75 0 0 0 9.5 0ZM18 12.5a.75.75 0 0 0 0-1.5h-2.14a6.02 6.02 0 0 0-7.72 0H6a.75.75 0 0 0 0 1.5h2.2c.2 1.03.62 2 . whopping.25 2.89V18a.75.75 0 0 0 1.5 0v-2.1a4.52 4.52 0 0 1 4.58 0V18a.75.75 0 0 0 1.5 0v-2.61c.63-.88 1.06-1.86 1.26-2.89H18Z"/>
  </svg>
);

export const PieIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L11 17.93zm6.93-2.21c-.43-2.25-2.25-4.07-4.5-4.5l2.21-6.93c2.62.87 4.45 3.32 4.45 6.27 0 1.54-.53 2.95-1.43 4.09l-.73-1.13z" />
  </svg>
);

export const SparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2l2.35 6.94L22 10l-6.35 5.09L18 22l-6-4.5L6 22l2.35-6.91L2 10l7.65-.06z" />
  </svg>
);

export const LightningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
  </svg>
);

export const DistortIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 5C8.94 5 6.22 6.48 4.66 8.54c2.56-1.11 5.48-.9 7.84.62 2.36 1.52 3.5 4.39 2.98 7.02C17.06 13.48 19 10.43 19 7c0-1.1-.9-2-2-2h-5zm-1.6 12.38c-2.36-1.52-3.5-4.39-2.98-7.02C8.94 10.52 7 13.57 7 17c0 1.1.9 2 2 2h5c3.06 0 5.78-1.48 7.34-3.54-2.56 1.11-5.48.9-7.84-.62z" />
  </svg>
);

export const RestartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm-1-8v4h2v-4h3l-4-4-4 4h3z"></path>
  </svg>
);

export const BroomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.78 5.64c.26-.26.26-.68 0-.94l-1.41-1.41c-.26-.26-.68-.26-.94 0L12 8.69 6.57 3.29c-.26-.26-.68-.26-.94 0L4.22 4.7c-.26.26-.26.68 0 .94L9.62 11H3c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h1v5c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-5h1c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1h-6.62l5.4-5.36zM7 19v-5h4v5H7z" />
  </svg>
);
