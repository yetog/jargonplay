import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  return (
    <div
      className={`
        bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 
        ${hover ? 'hover:bg-gray-800/70 hover:border-primary-500/50 transition-all duration-300 cursor-pointer transform hover:scale-105' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}