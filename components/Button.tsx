
import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'white' | 'ghost';
  to?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  to, 
  onClick, 
  className = '', 
  type = 'button',
  disabled = false,
  fullWidth = false
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  const shapeStyles = "rounded-full"; // Pill shape for modern look
  
  const variants = {
    primary: "border border-transparent text-white bg-brand-600 hover:bg-brand-700 hover:shadow-glow focus:ring-brand-500 shadow-sm",
    secondary: "border border-transparent text-white bg-accent-500 hover:bg-accent-600 hover:shadow-lg focus:ring-accent-500 shadow-sm",
    outline: "border-2 border-brand-600 text-brand-700 bg-transparent hover:bg-brand-50 focus:ring-brand-500",
    white: "border border-transparent text-brand-700 bg-white hover:bg-slate-50 focus:ring-white shadow-md",
    ghost: "border-transparent text-slate-600 hover:text-brand-600 hover:bg-brand-50",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const combinedClasses = `${baseStyles} ${shapeStyles} ${variants[variant]} ${widthClass} ${className}`;

  if (to) {
    return (
      <Link to={to} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button 
      type={type} 
      className={combinedClasses} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
