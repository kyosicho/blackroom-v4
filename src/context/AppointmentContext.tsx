import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Appointment } from '../types/types';
import { STORAGE_KEYS, getAll, getById, create, update, remove, generateId, now, today, setAll } from '../services/storageService';
import { supabaseService, supabase } from '../services/supabaseService';
import { useSettings } from './SettingsContext';

interface AppointmentContextType {
  appointments: Appointment[];
  loading: boolean;
  getAppointment: (id: string) => Appointment | null;
  addAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Appointment;
  updateAppointment: (id: string, data: Partial<Appointment>) => Appointment | null;
  deleteAppointment: (id: string) => boolean;
  getTodayAppointments: () => Appointment[];
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByCustomer: (customerId: string) => Appointment[];
  refreshAppointments: () => void;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

export const AppointmentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const shopId = settings.shopId;

  const refreshAppointments = useCallback(() => {
    const data = getAll<Appointment>(STORAGE_KEYS.APPOINTMENTS);
    // 날짜 + 시간 순으로 정렬
    data.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
    setAppointments(data);
    setLoading(false);
  }, []);

  // 1. 초기 Supabase 데이터 로드 & 병합
  useEffect(() => {
    if (!shopId) {
      refreshAppointments();
      return;
    }

    const syncFromSupabase = async () => {
      setLoading(true);
      const { data, error } = await supabaseService.getAppointments(shopId);
      if (!error && data) {
        // 로컬 데이터와 병합 (ID가 겹치면 Supabase 데이터 우선)
        const localData = getAll<Appointment>(STORAGE_KEYS.APPOINTMENTS);
        const map = new Map<string, Appointment>();
        localData.forEach(a => map.set(a.id, a));
        data.forEach(a => map.set(a.id, a));
        
        const merged = Array.from(map.values());
        setAll(STORAGE_KEYS.APPOINTMENTS, merged);
        refreshAppointments();
      } else {
        refreshAppointments();
      }
      setLoading(false);
    };

    syncFromSupabase();
  }, [shopId, refreshAppointments]);

  // 2. 실시간 구독 (Realtime)
  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `shop_id=eq.${shopId}` },
        (payload) => {
          console.log('Realtime Appointment Change:', payload);
          // 변경 사항이 감지되면 로컬 저장소 업데이트 후 리프레시
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newItem = payload.new as Appointment;
            const existingItems = getAll<Appointment>(STORAGE_KEYS.APPOINTMENTS);
            const index = existingItems.findIndex(i => i.id === newItem.id);
            if (index !== -1) {
                existingItems[index] = newItem;
            } else {
                existingItems.push(newItem);
            }
            setAll(STORAGE_KEYS.APPOINTMENTS, existingItems);
          } else if (payload.eventType === 'DELETE') {
            const existingItems = getAll<Appointment>(STORAGE_KEYS.APPOINTMENTS);
            const filtered = existingItems.filter(i => i.id !== payload.old.id);
            setAll(STORAGE_KEYS.APPOINTMENTS, filtered);
          }
          refreshAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, refreshAppointments]);

  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  const getAppointment = useCallback((id: string): Appointment | null => {
    return getById<Appointment>(STORAGE_KEYS.APPOINTMENTS, id);
  }, []);

  const addAppointment = useCallback((data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Appointment => {
    const newAppointment: Appointment = {
      ...data,
      id: generateId(),
      shopId: shopId,
      createdAt: now(),
      updatedAt: now(),
    };
    create(STORAGE_KEYS.APPOINTMENTS, newAppointment);
    
    // Supabase 백그라운드 싱크
    if (shopId) {
      supabaseService.upsertAppointment(newAppointment, shopId);
    }
    
    refreshAppointments();
    return newAppointment;
  }, [refreshAppointments, shopId]);

  const updateAppointment = useCallback((id: string, data: Partial<Appointment>): Appointment | null => {
    const result = update<Appointment>(STORAGE_KEYS.APPOINTMENTS, id, { ...data, updatedAt: now() });
    if (result) {
      if (shopId) {
        supabaseService.upsertAppointment(result, shopId);
      }
      refreshAppointments();
    }
    return result;
  }, [refreshAppointments, shopId]);

  const deleteAppointment = useCallback((id: string): boolean => {
    const result = remove(STORAGE_KEYS.APPOINTMENTS, id);
    if (result) {
      if (shopId) {
        supabase.from('appointments').delete().eq('id', id).eq('shop_id', shopId).then();
      }
      refreshAppointments();
    }
    return result;
  }, [refreshAppointments, shopId]);

  const getTodayAppointments = useCallback((): Appointment[] => {
    const todayStr = today();
    return appointments.filter((a) => a.date === todayStr && a.status !== 'cancelled');
  }, [appointments]);

  const getAppointmentsByDate = useCallback((date: string): Appointment[] => {
    return appointments.filter((a) => a.date === date);
  }, [appointments]);

  const getAppointmentsByCustomer = useCallback((customerId: string): Appointment[] => {
    return appointments.filter((a) => a.customerId === customerId);
  }, [appointments]);

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        loading,
        getAppointment,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        getTodayAppointments,
        getAppointmentsByDate,
        getAppointmentsByCustomer,
        refreshAppointments,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
