import React from 'react';

export const GaneshaIcon = ({ 
  size = "150px", 
  color = "#4A4A4A", 
  accentColor = "#D9383A",
  showBackground = false 
}) => {
  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: showBackground ? '#FFF9E6' : 'transparent',
        padding: showBackground ? '10px' : '0',
        transition: 'all 0.3s ease'
      }}
    >
      <svg 
        viewBox="0 0 100 100" 
        width="100%" 
        height="100%" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M 50 15 
             C 38 15, 30 25, 30 35 
             C 30 42, 34 46, 38 48 
             C 30 52, 22 55, 18 62 
             C 12 72, 20 85, 35 85
             C 45 85, 48 80, 50 75
             C 52 80, 55 85, 65 85
             C 80 85, 88 72, 82 62
             C 78 55, 70 52, 62 48
             C 66 46, 70 42, 70 35
             C 70 25, 62 15, 50 15 Z" 
          fill={color} 
          opacity="0.15" 
        />
        
        <path 
          d="M 50 10 L 46 22 L 54 22 Z M 44 24 L 56 24 L 50 28 Z" 
          fill={color} 
        />

        <path 
          d="M 40 30 C 25 28, 20 45, 35 48 C 38 42, 40 35, 40 30 Z" 
          fill={color} 
        />
        <path 
          d="M 60 30 C 75 28, 80 45, 65 48 C 62 42, 60 35, 60 30 Z" 
          fill={color} 
        />

        <path 
          d="M 46 32 
             C 46 45, 42 55, 45 65 
             C 47 72, 55 72, 57 66 
             C 59 62, 54 58, 52 60
             C 50 62, 52 66, 49 66
             C 47 66, 49 52, 54 32 Z" 
          fill={color} 
        />

        <path 
          d="M 50 30 C 48 35, 50 39, 50 39 C 50 39, 52 35, 50 30 Z" 
          fill={accentColor} 
        />
        <circle cx="50" cy="35" r="1.5" fill={accentColor} />
      </svg>
    </div>
  );
};
