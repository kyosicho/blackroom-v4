import React, { createContext, useContext, useEffect } from 'react';
import { useSettings } from './SettingsContext';

interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSettings } = useSettings();
  const theme = settings.theme || 'dark';
  const primaryColor = settings.primaryColor || '#ee2b5b';

  const setTheme = (newTheme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme: newTheme });
  };

  useEffect(() => {
    // 1. 다크/라이트 모드 클래스 적용
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
    // 2. 커스텀 컬러(CSS 변수) 적용 및 v4.3 Custom Background Support
    const root = window.document.documentElement;
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--primary-rgb', hexToRgb(primaryColor));

    // v4.3 Custom Background Support
    // This logic takes precedence for 'dark' class application when themeControlMode is 'background'
    if (settings.themeControlMode === 'background' && settings.backgroundColor) {
      root.style.setProperty('--background-dark', settings.backgroundColor);
      root.style.setProperty('--background-light', settings.backgroundColor);
      // 배경색의 밝기에 따라 텍스트 색상 최적화 (단순화: 어두우면 다크모드 강제)
      const isDark = isColorDark(settings.backgroundColor);
      if (isDark) {
        root.classList.add('dark');
        root.classList.remove('light'); // Ensure 'light' is removed
      } else {
        root.classList.remove('dark');
        root.classList.add('light'); // Ensure 'light' is added
      }
    } else if (settings.themeControlMode === 'system' || settings.theme === 'system') {
      // If themeControlMode is system or theme is system, apply system preference
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    } else {
      // Default theme control based on settings.theme
      if (settings.theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
    }
  }, [settings.theme, settings.primaryColor, settings.backgroundColor, settings.themeControlMode]);

  // 시스템 테마 변경 감지
  useEffect(() => {
    // This listener should only be active if the theme is explicitly 'system'
    // and not overridden by 'background' themeControlMode.
    if (settings.themeControlMode === 'background' || theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, settings.themeControlMode]); // Added settings.themeControlMode to dependencies

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

// Helpers to determine if color is dark
function isColorDark(hex: string) {
  const rgb = hexToRgb(hex).split(' ').map(Number);
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness < 128;
}

function hexToRgb(hex: string) {
  let r = 0, g = 0, b = 0;
  // 3 digits
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  }
  // 6 digits
  else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return `${r} ${g} ${b}`;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
