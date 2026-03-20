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
  enableGpsAuth: true,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // 로컬 스토리지에서 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        setSettings(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.error('Failed to load settings', e);
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
