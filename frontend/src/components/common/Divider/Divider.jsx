// src/components/common/Divider/Divider.jsx
import React from 'react';

/**
 * Reusable Divider Component
 * @param {Object} props - Component props
 * @param {string} props.text - Text to display in the center
 * @param {string} props.className - Additional custom classes
 * @param {'horizontal' | 'vertical'} props.orientation - Divider orientation
 */
const Divider = ({ 
  text, 
  className = '',
  orientation = 'horizontal'
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        <div className="w-0.5 flex-1 bg-gray-300"></div>
        {text && <span className="text-gray-400 font-medium text-lg">{text}</span>}
        <div className="w-0.5 flex-1 bg-gray-300"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 my-6 ${className}`}>
      <div className="flex-1 h-0.5 bg-gray-300"></div>
      {text && <span className="text-gray-400 font-medium text-lg">{text}</span>}
      <div className="flex-1 h-0.5 bg-gray-300"></div>
    </div>
  );
};

export default Divider;