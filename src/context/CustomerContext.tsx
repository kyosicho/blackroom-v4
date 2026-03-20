import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Customer } from '../types/types';
import { STORAGE_KEYS, getAll, getById, create, update, remove, generateId, now, setAll } from '../services/storageService';
import { supabaseService, supabase } from '../services/supabaseService';
import { useSettings } from './SettingsContext';

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  getCustomer: (id: string) => Customer | null;
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Customer | null;
  deleteCustomer: (id: string) => boolean;
  searchCustomers: (query: string) => Customer[];
  refreshCustomers: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSettings();
  const shopId = settings.shopId;

  const refreshCustomers = useCallback(() => {
    const data = getAll<Customer>(STORAGE_KEYS.CUSTOMERS);
    setCustomers(data);
    setLoading(false);
  }, []);

  // 1. 초기 Supabase 데이터 로드 & 병합
  useEffect(() => {
    if (!shopId) {
      refreshCustomers();
      return;
    }

    const syncFromSupabase = async () => {
      setLoading(true);
      const { data, error } = await supabaseService.getCustomers(shopId);
      if (!error && data) {
        const localData = getAll<Customer>(STORAGE_KEYS.CUSTOMERS);
        const map = new Map<string, Customer>();
        localData.forEach(c => map.set(c.id, c));
        data.forEach(c => map.set(c.id, c));
        
        const merged = Array.from(map.values());
        setAll(STORAGE_KEYS.CUSTOMERS, merged);
        refreshCustomers();
      } else {
        refreshCustomers();
      }
      setLoading(false);
    };

    syncFromSupabase();
  }, [shopId, refreshCustomers]);

  // 2. 실시간 구독
  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel('customers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers', filter: `shop_id=eq.${shopId}` },
        (payload) => {
          console.log('Realtime Customer Change:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newItem = payload.new as Customer;
            const existing = getAll<Customer>(STORAGE_KEYS.CUSTOMERS);
            const index = existing.findIndex(i => i.id === newItem.id);
            if (index !== -1) existing[index] = newItem;
            else existing.push(newItem);
            setAll(STORAGE_KEYS.CUSTOMERS, existing);
          } else if (payload.eventType === 'DELETE') {
            const existing = getAll<Customer>(STORAGE_KEYS.CUSTOMERS);
            const filtered = existing.filter(i => i.id !== payload.old.id);
            setAll(STORAGE_KEYS.CUSTOMERS, filtered);
          }
          refreshCustomers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, refreshCustomers]);

  useEffect(() => {
    refreshCustomers();
  }, [refreshCustomers]);

  const getCustomer = useCallback((id: string): Customer | null => {
    return getById<Customer>(STORAGE_KEYS.CUSTOMERS, id);
  }, []);

  const addCustomer = useCallback(async (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    const newCustomer: Customer = {
      ...data,
      id: generateId(),
      shopId: shopId,
      createdAt: now(),
      updatedAt: now(),
    };
    
    // 로컬 저장 (즉각성 보장)
    create(STORAGE_KEYS.CUSTOMERS, newCustomer);
    
    // Supabase 동기화 (비동기 대기)
    if (shopId) {
      try {
        await supabaseService.upsertCustomer(newCustomer, shopId);
      } catch (err) {
        console.error('Supabase Sync Error:', err);
      }
    }
    
    refreshCustomers();
    return newCustomer;
  }, [refreshCustomers, shopId]);

  const updateCustomer = useCallback((id: string, data: Partial<Customer>): Customer | null => {
    const result = update<Customer>(STORAGE_KEYS.CUSTOMERS, id, { ...data, updatedAt: now() });
    if (result) {
      if (shopId) {
        supabaseService.upsertCustomer(result, shopId);
      }
      refreshCustomers();
    }
    return result;
  }, [refreshCustomers, shopId]);

  const deleteCustomer = useCallback((id: string): boolean => {
    const result = remove(STORAGE_KEYS.CUSTOMERS, id);
    if (result) {
      if (shopId) {
        supabase.from('customers').delete().eq('id', id).eq('shop_id', shopId).then();
      }
      refreshCustomers();
    }
    return result;
  }, [refreshCustomers, shopId]);

  const searchCustomers = useCallback((query: string): Customer[] => {
    if (!query.trim()) return customers;
    const lower = query.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.phone.includes(query) ||
        (c.email && c.email.toLowerCase().includes(lower))
    );
  }, [customers]);

  return (
    <CustomerContext.Provider
      value={{
        customers,
        loading,
        getCustomer,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        searchCustomers,
        refreshCustomers,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomers = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
};
