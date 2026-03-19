import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Appointment } from '../types/types';
import { STORAGE_KEYS, getAll, getById, create, update, remove, generateId, now, today } from '../services/storageService';

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
      createdAt: now(),
      updatedAt: now(),
    };
    create(STORAGE_KEYS.APPOINTMENTS, newAppointment);
    refreshAppointments();
    return newAppointment;
  }, [refreshAppointments]);

  const updateAppointment = useCallback((id: string, data: Partial<Appointment>): Appointment | null => {
    const result = update<Appointment>(STORAGE_KEYS.APPOINTMENTS, id, { ...data, updatedAt: now() });
    if (result) refreshAppointments();
    return result;
  }, [refreshAppointments]);

  const deleteAppointment = useCallback((id: string): boolean => {
    const result = remove(STORAGE_KEYS.APPOINTMENTS, id);
    if (result) refreshAppointments();
    return result;
  }, [refreshAppointments]);

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
