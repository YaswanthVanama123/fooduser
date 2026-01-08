import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false, onClick }) => {
  const hoverClass = hover ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer' : '';

  return (
    <div
      className={`bg-white rounded-xl shadow-lg transition-all duration-300 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>;
};

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl ${className}`}>{children}</div>;
};

export default Card;
