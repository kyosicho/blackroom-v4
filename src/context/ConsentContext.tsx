import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Consent } from '../types/types';
import { STORAGE_KEYS, getAll, getById, create, generateId, setAll } from '../services/storageService';
import { supabaseService, supabase } from '../services/supabaseService';
import { useSettings } from './SettingsContext';

interface ConsentContextType {
  consents: Consent[];
  loading: boolean;
  getConsent: (id: string) => Consent | null;
  addConsent: (data: Omit<Consent, 'id' | 'createdAt'>) => Consent;
  refreshConsents: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const ConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [consents, setConsents] = useState<Consent[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const shopId = settings.shopId;

  const refreshConsents = useCallback(() => {
    const data = getAll<Consent>(STORAGE_KEYS.CONSENTS);
    setConsents(data);
    setLoading(false);
  }, []);

  // 1. 초기 Supabase 데이터 로드 & 병합
  useEffect(() => {
    if (!shopId) {
      refreshConsents();
      return;
    }

    const syncFromSupabase = async () => {
      setLoading(true);
      const { data, error } = await supabaseService.getConsents(shopId);
      if (!error && data) {
        const localData = getAll<Consent>(STORAGE_KEYS.CONSENTS);
        const map = new Map<string, Consent>();
        localData.forEach(c => map.set(c.id, c));
        data.forEach(c => map.set(c.id, c));
        
        const merged = Array.from(map.values());
        setAll(STORAGE_KEYS.CONSENTS, merged);
        refreshConsents();
      } else {
        refreshConsents();
      }
      setLoading(false);
    };

    syncFromSupabase();
  }, [shopId, refreshConsents]);

  // 2. 실시간 구독
  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel('consents_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'consents', filter: `shop_id=eq.${shopId}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newItem = payload.new as Consent;
            const existing = getAll<Consent>(STORAGE_KEYS.CONSENTS);
            const index = existing.findIndex(i => i.id === newItem.id);
            if (index !== -1) existing[index] = newItem;
            else existing.push(newItem);
            setAll(STORAGE_KEYS.CONSENTS, existing);
          } else if (payload.eventType === 'DELETE') {
            const existing = getAll<Consent>(STORAGE_KEYS.CONSENTS);
            const filtered = existing.filter(i => i.id !== payload.old.id);
            setAll(STORAGE_KEYS.CONSENTS, filtered);
          }
          refreshConsents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, refreshConsents]);

  const getConsent = useCallback((id: string): Consent | null => {
    return getById<Consent>(STORAGE_KEYS.CONSENTS, id);
  }, []);

  const addConsent = useCallback((data: Omit<Consent, 'id' | 'createdAt'>): Consent => {
    const newConsent: Consent = {
      ...data,
      id: generateId(),
      shopId: shopId,
      createdAt: new Date().toISOString(),
    };
    create(STORAGE_KEYS.CONSENTS, newConsent);
    
    if (shopId) {
      supabaseService.upsertConsent(newConsent, shopId);
    }
    
    refreshConsents();
    return newConsent;
  }, [refreshConsents, shopId]);

  return (
    <ConsentContext.Provider
      value={{
        consents,
        loading,
        getConsent,
        addConsent,
        refreshConsents,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsents = () => {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error('useConsents must be used within a ConsentProvider');
  }
  return context;
};
