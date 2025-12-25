// src/components/common/Button/Button.jsx
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  onClick, 
  type = 'button',
  disabled = false,
  className = ''
}) => {
  const variants = {
    primary: 'bg-pink-500 hover:bg-pink-600 text-white disabled:bg-pink-300',
    secondary: 'bg-pink-300 hover:bg-pink-400 text-white disabled:bg-pink-200',
    outline: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 disabled:bg-gray-100 disabled:text-gray-400'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full py-4 px-6 rounded-2xl font-medium 
        transition-all duration-200 
        flex items-center justify-center gap-3 text-lg
        disabled:cursor-not-allowed disabled:opacity-60
        ${variants[variant]}
        ${className}
      `}
    >
      {Icon && <Icon size={24} />}
      {children}
    </button>
  );
};

export default Button;