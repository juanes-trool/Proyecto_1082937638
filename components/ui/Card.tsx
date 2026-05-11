// components/ui/Card.tsx
'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ children, className = '', shadow = 'md' }) => {
  const shadowStyles = {
    sm: 'shadow',
    md: 'shadow-lg',
    lg: 'shadow-2xl',
  };

  return (
    <div className={`bg-white rounded-lg ${shadowStyles[shadow]} overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);
