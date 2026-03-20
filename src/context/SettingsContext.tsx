import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AppSettings, ShopMode } from '../types/types';
import { STORAGE_KEYS } from '../services/storageService';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  shopMode: ShopMode;
}

const DEFAULT_SETTINGS: AppSettings = {
  artistName: '원장님',
  shopName: 'BLACKROOM',
  weeklyGoal: 15,
  theme: 'dark',
  language: 'ko',
  shopMode: 'pmu',
  shopId: 'BLACKROOM-DEFAULT',
  enableGpsAuth: true,
  themeControlMode: 'background',
  backgroundColor: '#0f172a', // 기본 어두운 배경 (slate-900)
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // 로컬 스토리지에서 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        let parsedSettings: AppSettings = JSON.parse(saved);
        // shopId가 없는 기존 유저를 위해 랜덤 아이디 생성
        if (!parsedSettings.shopId) {
          parsedSettings.shopId = Math.random().toString(36).substring(2, 8).toUpperCase();
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsedSettings));
        }
        setSettings(parsedSettings);
      } else {
        // 초기 데이터 세팅 시 샵 코드 부여
        const initial = { ...DEFAULT_SETTINGS }; // DEFAULT_SETTINGS 복사
        initial.shopId = Math.random().toString(36).substring(2, 8).toUpperCase();
        setSettings(initial);
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initial));
      }
    } catch (e) {
      console.error('Failed to load or parse settings from localStorage', e);
      // 에러 발생 시, 기본 설정에 shopId를 부여하여 사용
      const initial = { ...DEFAULT_SETTINGS };
      initial.shopId = Math.random().toString(36).substring(2, 8).toUpperCase();
      setSettings(initial);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(initial)); // 에러 시에도 저장
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, shopMode: settings.shopMode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
