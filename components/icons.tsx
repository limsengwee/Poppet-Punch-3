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

export const VoodooNeedleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.78 2.22a.75.75 0 0 0-1.06 0L4.22 16.72a.75.75 0 0 0 1.06 1.06L19.78 3.28a.75.75 0 0 0 0-1.06Z"/>
    <path d="M19 5a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/>
  </svg>
);

export const SpiderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.25 8a.75.75 0 00-1.5 0 3.25 3.25 0 01-6.5 0 .75.75 0 00-1.5 0 4.75 4.75 0 009.5 0zM12 12.25a.75.75 0 000 1.5h.25a.75.75 0 000-1.5h-.25z" />
      <path fillRule="evenodd" d="M3.75 9.143c0-1.12.91-2.029 2.029-2.029h12.442c1.12 0 2.029.91 2.029 2.029v5.714c0 1.12-.91 2.029-2.029 2.029H5.779c-1.12 0-2.029-.91-2.029-2.029V9.143zm2.029-3.529a3.529 3.529 0 00-3.529 3.53v5.714a3.529 3.529 0 003.529 3.529h12.442a3.529 3.529 0 003.529-3.53V9.143a3.529 3.529 0 00-3.529-3.529H5.779z" clipRule="evenodd" />
      <path d="M11.25 14a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0v-.25zM12.75 12.25a.75.75 0 000 1.5h.25a.75.75 0 000-1.5h-.25zM14.25 14a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0v-.25z" />
  </svg>
);

export const FistIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M17.73 7.3a.75.75 0 00-1.06-1.06l-2.47 2.47-.72-.72a.75.75 0 00-1.06 1.06l1.25 1.25a.75.75 0 001.06 0l2.97-2.97zM20.25 9a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0V9zM19.5 3.75a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0V3.75z"/>
        <path fillRule="evenodd" d="M18.67 1.5h-.42a.75.75 0 000 1.5h.42a.75.75 0 000-1.5zM12 2.25a.75.75 0 000 1.5h.25a.75.75 0 000-1.5H12zM5.25 10.5a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0v-.25zM3.75 4.5a.75.75 0 00-1.5 0v.25a.75.75 0 001.5 0V4.5z"/>
        <path fillRule="evenodd" d="M10.15 4.15A.75.75 0 009.09 3.09l-2.97 2.97a.75.75 0 001.06 1.06l2.47-2.47.72.72a.75.75 0 001.06-1.06l-1.25-1.25zM12.35 15.11a.75.75 0 00-1.06-1.06L8.25 17.09a3.25 3.25 0 004.6 4.6l3.04-3.04a.75.75 0 00-1.06-1.06l-2.48 2.48a1.75 1.75 0 01-2.48-2.48l3.04-3.04z" clipRule="evenodd"/>
    </svg>
);

export const UglyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM8.87 8.13c.62 0 1.12.51 1.12 1.12s-.5 1.12-1.12 1.12-1.12-.5-1.12-1.12.5-1.12 1.12-1.12zm6.25 0c.62 0 1.12.51 1.12 1.12s-.5 1.12-1.12 1.12-1.12-.5-1.12-1.12.5-1.12 1.12-1.12zm-8.23 7.31c.46-.57 1.12-1.03 1.9-1.37.78-.34 1.66-.51 2.59-.51s1.81.17 2.59.51c.78.34 1.44.8 1.9 1.37.2.25.49.31.76.15.27-.16.42-.48.36-.79-.58-2.92-2.9-5.12-5.61-5.12s-5.03 2.2-5.61 5.12c-.06.31.09.63.36.79.27.16.57.1.76-.15z"/>
    </svg>
);

export const CrackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...props}>
        <path d="M19.25 8.5l-6.75 4-6.75-4-1.75 8h17l-1.75-8zM12.5 12.5l5.25 8.25M11.5 12.5L6.25 20.75M12.5 3v9.5" />
    </svg>
);


export const LightningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M11 15H6L13 1V9H18L11 23V15Z" />
  </svg>
);

export const TornadoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M1,3H23V5H1V3M3,7H21V9H3V7M7,11H17V13H7V11M12,15H12V17H12V15M10,19H14V21H10V19Z" />
  </svg>
);

export const RestartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 10.5858L9.17157 7.75736L7.75736 9.17157L10.5858 12L7.75736 14.8284L9.17157 16.2426L12 13.4142L14.8284 16.2426L16.2426 14.8284L13.4142 12L16.2426 9.17157L14.8284 7.75736L12 10.5858Z" />
  </svg>
);

export const BroomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21 1.75a.75.75 0 0 0-1.06-.05L6.21 14.07a3.5 3.5 0 0 0 4.64 5.2l.14-.11L21.05 2.81a.75.75 0 0 0-.05-1.06zM9.5 19a2 2 0 1 1-3.66 1.22l-1.5-3.48A2 2 0 0 1 6.5 14H12v2.5a2.5 2.5 0 0 1-2.5 2.5z" />
  </svg>
);