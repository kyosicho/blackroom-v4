import { createClient } from '@supabase/supabase-js';
import type { Customer, Appointment, ProcedureRecord, AppSettings } from '../types/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 헬퍼: 객체 키 변환 (DB snake_case -> App camelCase)
const toCamel = (obj: any): any => {
  try {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toCamel);
    const n: any = {};
    Object.keys(obj).forEach(k => {
      const camelK = k.replace(/(_\w)/g, m => m[1].toUpperCase());
      n[camelK] = toCamel(obj[k]);
    });
    return n;
  } catch (e) {
    console.error('toCamel error:', e);
    return obj;
  }
};

// 헬퍼: 객체 키 변환 (App camelCase -> DB snake_case) 
const toSnake = (obj: any): any => {
  try {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(toSnake);
    const n: any = {};
    Object.keys(obj).forEach(k => {
      const snakeK = k.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
      n[snakeK] = toSnake(obj[k]);
    });
    return n;
  } catch (e) {
    console.error('toSnake error:', e);
    return obj;
  }
};

export const supabaseService = {
  // Customers
  async getCustomers(shopId: string) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('shop_id', shopId);
      return { data: (data ? toCamel(data) : null) as Customer[] | null, error };
    } catch (error) {
      console.error('getCustomers Error:', error);
      return { data: null, error };
    }
  },

  async upsertCustomer(customer: Customer, shopId: string) {
    try {
      const dbData = toSnake({ ...customer, shopId });
      const { data, error } = await supabase
        .from('customers')
        .upsert(dbData)
        .select();
      return { data, error };
    } catch (error) {
      console.error('upsertCustomer Error:', error);
      return { data: null, error };
    }
  },

  // Appointments
  async getAppointments(shopId: string) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('shop_id', shopId);
      return { data: (data ? toCamel(data) : null) as Appointment[] | null, error };
    } catch (error) {
      console.error('getAppointments Error:', error);
      return { data: null, error };
    }
  },

  async upsertAppointment(appointment: Appointment, shopId: string) {
    try {
      const dbData = toSnake({ ...appointment, shopId });
      const { data, error } = await supabase
        .from('appointments')
        .upsert(dbData)
        .select();
      return { data, error };
    } catch (error) {
      console.error('upsertAppointment Error:', error);
      return { data: null, error };
    }
  },

  // Records
  async getRecords(shopId: string) {
    try {
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('shop_id', shopId);
      return { data: (data ? toCamel(data) : null) as ProcedureRecord[] | null, error };
    } catch (error) {
      console.error('getRecords Error:', error);
      return { data: null, error };
    }
  },

  async upsertRecord(record: ProcedureRecord, shopId: string) {
    try {
      const dbRecord = toSnake({ ...record, shopId });
      const { data, error } = await supabase
        .from('records')
        .upsert(dbRecord)
        .select();
      return { data, error };
    } catch (error) {
      console.error('upsertRecord Error:', error);
      return { data: null, error };
    }
  },

  // Consents
  async getConsents(shopId: string) {
    try {
      const { data, error } = await supabase
        .from('consents')
        .select('*')
        .eq('shop_id', shopId);
      return { data: (data ? toCamel(data) : null) as any[] | null, error };
    } catch (error) {
      console.error('getConsents Error:', error);
      return { data: null, error };
    }
  },

  async upsertConsent(consent: any, shopId: string) {
    try {
      const dbConsent = toSnake({ ...consent, shopId });
      const { data, error } = await supabase
        .from('consents')
        .upsert(dbConsent)
        .select();
      return { data, error };
    } catch (error) {
      console.error('upsertConsent Error:', error);
      return { data: null, error };
    }
  },

  // Settings
  async getSettings(shopId: string) {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('shop_id', shopId)
        .single();
      return { data: (data ? toCamel(data) : null) as AppSettings | null, error };
    } catch (error) {
      console.error('getSettings Error:', error);
      return { data: null, error };
    }
  },

  async upsertSettings(settings: AppSettings, shopId: string) {
    try {
      const dbData = toSnake({ ...settings, shopId });
      const { data, error } = await supabase
        .from('settings')
        .upsert(dbData)
        .select();
      return { data, error };
    } catch (error) {
      console.error('upsertSettings Error:', error);
      return { data: null, error };
    }
  }
};
