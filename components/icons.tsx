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
