import React from 'react';

export default function SahuaroIcon({ className = "w-6 h-6", color = "#FF5100" }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path 
        d="M12 2V22M12 6C12 6 7 6 7 11V15M12 10C12 10 17 10 17 13V17M7 13C7 13 4 13 4 11M17 15C17 15 20 15 20 13" 
        stroke={color} 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Add a central solid part to make it more visible */}
      <rect x="11.25" y="6" width="1.5" height="12" fill={color} opacity="0.5" />
    </svg>
  );
}
