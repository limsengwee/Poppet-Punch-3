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
    <path d="M21.5 12.5C21.5 12.2239 21.2761 12 21 12H19.25V5.5C19.25 4.11929 18.1307 3 16.75 3C15.3693 3 14.25 4.11929 14.25 5.5V11.5H11.75V2.5C11.75 1.11929 10.6307 0 9.25 0C7.86929 0 6.75 1.11929 6.75 2.5V11.5H4.75C4.25 11.5 3.75 11.75 3.5 12.25C2.5 14.25 3.75 16.5 3.75 16.5C3.75 16.5 4.75 22 9.25 22H16.25C20.75 22 21.5 17 21.5 16.5V12.5Z"/>
  </svg>
);

export const VoodooNeedleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.707,2.293a1,1,0,0,0-1.414,0L2.586,20H2a1,1,0,0,0,0,2H4.414l-1.707-1.707a1,1,0,0,0-1.414,1.414L3,23.414V21a1,1,0,0,0,2,0V18.414L20.293,3.707A1,1,0,0,0,21.707,2.293Z"/>
    <path d="M19,7a3,3,0,1,0-3-3A3,3,0,0,0,19,7Z"/>
  </svg>
);

export const SpiderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.7,7.26a.5.5,0,0,0-.7-.4L16.22,8.4V6.5a.5.5,0,0,0-1,0v2.75l-2.61.87a4,4,0,0,0-1.22,0L8.78,9.25V6.5a.5.5,0,0,0-1,0V8.4L5,6.86a.5.5,0,0,0-.7.4L3.06,9.9a.5.5,0,0,0,.35.65l2.7,1.35V13a.5.5,0,0,0,1,0v-1l2.5-.83.39.2a.5.5,0,0,0,.52,0l.39-.2,2.5.83v1a.5.5,0,0,0,1,0v-1.1l2.7-1.35a.5.5,0,0,0,.35-.65ZM12,14.4a3.2,3.2,0,1,0,3.2,3.2A3.2,3.2,0,0,0,12,14.4Zm-5,1.5a.5.5,0,0,0,0,1H8.83l.89,1.78a.5.5,0,0,0,.86,0l.89-1.78h1.83a.5.5,0,0,0,0-1H11.5l-1-2a.5.5,0,0,0-.86,0l-1,2Z"/>
  </svg>
);

export const BlisterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".3"/>
      <path d="M12,5a7,7,0,1,0,7,7A7,7,0,0,0,12,5Zm0,12a5,5,0,1,1,5-5A5,5,0,0,1,12,17Z"/>
      <path d="M14.2,8.25a3,3,0,0,0-4.4,0,1,1,0,0,0,1.4,1.4,1,1,0,0,1,1.6,0,1,1,0,0,0,1.4-1.4Z"/>
    </svg>
);

export const UglyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/>
        <path d="M15.5,8A1.5,1.5,0,1,0,14,9.5,1.5,1.5,0,0,0,15.5,8Z"/>
        <path d="M8.5,8A1.5,1.5,0,1,0,7,9.5,1.5,1.5,0,0,0,8.5,8Z"/>
        <path d="M12,14a4,4,0,0,0-3.8,2.9,1,1,0,0,0,1,1.1,1,1,0,0,0,1-.7,2,2,0,0,1,3.6,0,1,1,0,0,0,1,.7.9.9,0,0,0,.7-1.2A4.1,4.1,0,0,0,12,14Z"/>
    </svg>
);

export const CrackIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
       <path d="M21.2,3.31,14.65,9.86l-2.12-2.12,2.44-2.44-1.41-1.41-2.44,2.44L8.28,3.48,6.87,4.9,9.7,7.72,3.31,14.11l1.41,1.41L11.11,9.13l2.83,2.83-6.39,6.39,1.41,1.41,6.39-6.39,2.12,2.12-6.55,6.55,1.41,1.41,6.55-6.55,2.83,2.83,1.41-1.41L14.86,14.65l6.55-6.55Z"/>
    </svg>
);

export const SkullIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/>
    <path d="M12,6a3,3,0,0,0-3,3,1,1,0,0,0,2,0,1,1,0,0,1,1-1h0a1,1,0,0,1,1,1,1,1,0,0,0,2,0A3,3,0,0,0,12,6Z"/>
    <path d="M15.5,12A2.5,2.5,0,1,0,13,14.5,2.5,2.5,0,0,0,15.5,12Z"/>
    <path d="M8.5,12A2.5,2.5,0,1,0,6,14.5,2.5,2.5,0,0,0,8.5,12Z"/>
    <path d="M12,16.25a.75.75,0,0,0-.75.75v2a.75.75,0,0,0,1.5,0v-2A.75.75,0,0,0,12,16.25Z"/>
    <path d="M9.25,16.25a.75.75,0,0,0-.75.75v1a.75.75,0,0,0,1.5,0v-1A.75.75,0,0,0,9.25,16.25Z"/>
    <path d="M14.75,16.25a.75.75,0,0,0-.75.75v1a.75.75,0,0,0,1.5,0v-1A.75.75,0,0,0,14.75,16.25Z"/>
  </svg>
);

export const ClogIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.1,4.4c-2.4-1-5.2-0.5-7,1.3l-4,4c-2.4,2.4-2,6.1,0.8,7.9l-3.1,3.1c-0.5,0.5-0.5,1.3,0,1.8l0.9,0.9
        c0.5,0.5,1.3,0.5,1.8,0l3.1-3.1c1.8,2.7,5.5,3.2,7.9,0.8l4-4C24.4,12.2,22.4,6.2,19.1,4.4z M10.4,18.1c-1.4,0-2.6-1.2-2.6-2.6
        s1.2-2.6,2.6-2.6s2.6,1.2,2.6,2.6S11.8,18.1,10.4,18.1z"/>
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