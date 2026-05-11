// components/ui/Badge.tsx
'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary',
  size = 'sm',
  className = '' 
}) => {
  const variantStyles = {
    primary: 'bg-pink-100 text-pink-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`${variantStyles[variant]} ${sizeStyles[size]} rounded-full font-medium ${className}`}>
      {children}
    </span>
  );
};
