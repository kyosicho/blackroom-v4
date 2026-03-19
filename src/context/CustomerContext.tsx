import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Customer } from '../types/types';
import { STORAGE_KEYS, getAll, getById, create, update, remove, generateId, now } from '../services/storageService';

interface CustomerContextType {
  customers: Customer[];
  loading: boolean;
  getCustomer: (id: string) => Customer | null;
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => Customer | null;
  deleteCustomer: (id: string) => boolean;
  searchCustomers: (query: string) => Customer[];
  refreshCustomers: () => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCustomers = useCallback(() => {
    const data = getAll<Customer>(STORAGE_KEYS.CUSTOMERS);
    setCustomers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshCustomers();
  }, [refreshCustomers]);

  const getCustomer = useCallback((id: string): Customer | null => {
    return getById<Customer>(STORAGE_KEYS.CUSTOMERS, id);
  }, []);

  const addCustomer = useCallback((data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const newCustomer: Customer = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    create(STORAGE_KEYS.CUSTOMERS, newCustomer);
    refreshCustomers();
    return newCustomer;
  }, [refreshCustomers]);

  const updateCustomer = useCallback((id: string, data: Partial<Customer>): Customer | null => {
    const result = update<Customer>(STORAGE_KEYS.CUSTOMERS, id, { ...data, updatedAt: now() });
    if (result) refreshCustomers();
    return result;
  }, [refreshCustomers]);

  const deleteCustomer = useCallback((id: string): boolean => {
    const result = remove(STORAGE_KEYS.CUSTOMERS, id);
    if (result) refreshCustomers();
    return result;
  }, [refreshCustomers]);

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
