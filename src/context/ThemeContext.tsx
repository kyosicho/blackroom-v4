import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../services/storageService';
import type { AppSettings } from '../types/types';

interface ThemeContextType {
  theme: AppSettings['theme'];
  setTheme: (theme: AppSettings['theme']) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppSettings['theme']>('dark'); // 기본값 다크모드
  const [primaryColor, setPrimaryColorState] = useState<string>('#ee2b5b');

  useEffect(() => {
    // 1. 설정 불러오기
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data) as AppSettings;
        setThemeState(parsed.theme || 'dark');
        setPrimaryColorState(parsed.primaryColor || '#ee2b5b');
      }
    } catch {
      // ignore
    }
  }, []);

  const setTheme = (newTheme: AppSettings['theme']) => {
    setThemeState(newTheme);
    // Settings에 저장
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const parsed = data ? JSON.parse(data) : {};
      parsed.theme = newTheme;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    // 2. DOM에 클래스 적용
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemPreference);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    // 3. 커스텀 컬러 적용
    const root = window.document.documentElement;
    root.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    if (theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
