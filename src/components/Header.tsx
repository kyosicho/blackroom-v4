import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = true, rightElement }) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-border-dark">
      <div className="flex items-center p-4 justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-slate-900 dark:text-slate-100">arrow_back</span>
            </button>
          )}
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </div>
        {rightElement && (
          <div className="flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
