// components/ui/EmptyState.tsx
'use client';

import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = '📭', 
  title, 
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
