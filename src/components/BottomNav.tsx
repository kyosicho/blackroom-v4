import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, PlayCircle, History, Settings } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { id: 'home', icon: Home, label: t.nav.home, path: '/' },
    { id: 'customers', icon: Users, label: t.nav.customers, path: '/customers' },
    { id: 'guide', icon: PlayCircle, label: t.nav.guide, path: '/guide' },
    { id: 'records', icon: History, label: t.nav.records, path: '/records' },
    { id: 'settings', icon: Settings, label: t.nav.settings, path: '/settings' },
  ];

  // Hide on certain pages
  const hiddenPaths = ['/scan-loading', '/scan-result', '/gps-auth', '/consent'];
  if (hiddenPaths.some(p => location.pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-screen-md mx-auto bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-primary/20 pb-6 pt-2 px-4 z-40 left-1/2 -translate-x-1/2">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 p-2 transition-colors min-w-[48px] ${
                isActive 
                  ? 'text-primary' 
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className={`size-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
