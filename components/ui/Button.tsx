// components/ui/Button.tsx
'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, className, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      primary: 'bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white hover:from-pink-600 hover:to-fuchsia-700',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      danger: 'bg-red-500 text-white hover:bg-red-600',
      outline: 'border-2 border-gray-300 text-gray-900 hover:bg-gray-50',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <span className="animate-spin">⏳</span>}
        {props.children}
      </button>
    );
  }
);

Button.displayName = 'Button';
