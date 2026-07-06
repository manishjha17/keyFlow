import React from 'react';

export default function TypingLogo({ size = 32, className = "" }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Keyboard Base */}
      <rect x="5" y="15" width="90" height="50" rx="6" />
      
      {/* Wire/Cable */}
      <path d="M 50 15 L 50 5 L 75 5" />
      
      {/* Keys Row 1 */}
      <rect x="13" y="25" width="10" height="10" rx="2" />
      <rect x="28" y="25" width="10" height="10" rx="2" />
      <rect x="43" y="25" width="10" height="10" rx="2" />
      <rect x="58" y="25" width="10" height="10" rx="2" />
      <rect x="73" y="25" width="10" height="10" rx="2" />
      
      {/* Keys Row 2 */}
      <rect x="13" y="42" width="10" height="10" rx="2" />
      <rect x="28" y="42" width="10" height="10" rx="2" />
      <rect x="43" y="42" width="25" height="10" rx="2" /> {/* Spacebar */}
      <rect x="73" y="42" width="10" height="10" rx="2" />

      {/* Left Hand */}
      <g className="logo-hand-left">
        {/* Palm filling to hide keyboard behind it */}
        <path d="M 15 100 L 15 75 C 15 65 43 65 43 75 L 43 100 Z" fill="var(--bg-color)" />
        {/* Fingers */}
        <path className="logo-finger-1" d="M 19 80 L 19 60 A 4 4 0 0 1 27 60 L 27 80" fill="var(--bg-color)" />
        <path className="logo-finger-2" d="M 27 80 L 27 52 A 4 4 0 0 1 35 52 L 35 80" fill="var(--bg-color)" />
        <path className="logo-finger-3" d="M 35 80 L 35 56 A 4 4 0 0 1 43 56 L 43 80" fill="var(--bg-color)" />
        {/* Cuff */}
        <rect x="13" y="90" width="32" height="10" fill="var(--bg-color)" />
      </g>

      {/* Right Hand */}
      <g className="logo-hand-right">
        {/* Palm filling */}
        <path d="M 85 100 L 85 75 C 85 65 57 65 57 75 L 57 100 Z" fill="var(--bg-color)" />
        {/* Fingers */}
        <path className="logo-finger-6" d="M 81 80 L 81 60 A 4 4 0 0 0 73 60 L 73 80" fill="var(--bg-color)" />
        <path className="logo-finger-5" d="M 73 80 L 73 52 A 4 4 0 0 0 65 52 L 65 80" fill="var(--bg-color)" />
        <path className="logo-finger-4" d="M 65 80 L 65 56 A 4 4 0 0 0 57 56 L 57 80" fill="var(--bg-color)" />
        {/* Cuff */}
        <rect x="55" y="90" width="32" height="10" fill="var(--bg-color)" />
      </g>
    </svg>
  );
}
