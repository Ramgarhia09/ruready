// src/components/common/Input/Input.jsx
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reusable Input Component
 * @param {Object} props - Component props
 * @param {'text' | 'email' | 'password' | 'tel' | 'number'} props.type - Input type
 * @param {string} props.placeholder - Placeholder text
 * @param {React.ComponentType} props.icon - Left icon component (from lucide-react)
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {boolean} props.showPassword - Password visibility state (for password inputs)
 * @param {Function} props.onTogglePassword - Toggle password visibility handler
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.name - Input name attribute
 * @param {boolean} props.required - Required field
 * @param {string} props.error - Error message
 * @param {string} props.className - Additional custom classes
 */
const Input = ({ 
  type = 'text', 
  placeholder, 
  icon: Icon, 
  value, 
  onChange, 
  showPassword, 
  onTogglePassword,
  disabled = false,
  name = '',
  required = false,
  error = '',
  className = ''
}) => {
  const isPasswordType = type === 'password';
  const inputType = isPasswordType && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
            <Icon size={24} />
          </div>
        )}
        
        {/* Input Field */}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          name={name}
          required={required}
          className={`
            w-full py-4 pr-14 rounded-2xl border-2 
            focus:outline-none text-lg transition-colors
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${Icon ? 'pl-14' : 'pl-4'}
            ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-pink-400'}
            ${className}
          `}
        />
        
        {/* Password Toggle Button */}
        {isPasswordType && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-500 hover:text-pink-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-2 ml-1">{error}</p>
      )}
    </div>
  );
};

export default Input;