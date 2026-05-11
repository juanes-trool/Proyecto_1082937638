// components/ui/Table.tsx
'use client';

import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full text-sm">
      {children}
    </table>
  </div>
);

interface TableHeadProps {
  children: React.ReactNode;
}

export const TableHead: React.FC<TableHeadProps> = ({ children }) => (
  <thead className="bg-gray-50 border-b-2 border-gray-200">
    {children}
  </thead>
);

interface TableBodyProps {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => (
  <tbody className="divide-y divide-gray-200">
    {children}
  </tbody>
);

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
}

export const TableRow: React.FC<TableRowProps> = ({ children, className = '' }) => (
  <tr className={`hover:bg-gray-50 transition-colors ${className}`}>
    {children}
  </tr>
);

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableCell: React.FC<TableCellProps> = ({ children, className = '', align = 'left' }) => {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td className={`px-6 py-3 ${alignStyles[align]} ${className}`}>
      {children}
    </td>
  );
};

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ children, className = '', align = 'left' }) => {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <th className={`px-6 py-3 font-semibold text-gray-900 ${alignStyles[align]} ${className}`}>
      {children}
    </th>
  );
};
