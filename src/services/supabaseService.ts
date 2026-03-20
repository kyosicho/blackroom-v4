import { createClient } from '@supabase/supabase-js';
import type { Customer, Appointment, ProcedureRecord, AppSettings } from '../types/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 헬퍼: 객체 키 변환 (DB snake_case -> App camelCase)
const toCamel = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  const n: any = {};
  Object.keys(obj).forEach(k => {
    const camelK = k.replace(/(_\w)/g, m => m[1].toUpperCase());
    n[camelK] = toCamel(obj[k]);
  });
  return n;
};

// 헬퍼: 객체 키 변환 (App camelCase -> DB snake_case) 
const toSnake = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toSnake);
  const n: any = {};
  Object.keys(obj).forEach(k => {
    const snakeK = k.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`);
    n[snakeK] = toSnake(obj[k]);
  });
  return n;
};

export const supabaseService = {
  // Customers
  async getCustomers(shopId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('shop_id', shopId);
    return { data: (data ? toCamel(data) : null) as Customer[] | null, error };
  },

  async upsertCustomer(customer: Customer, shopId: string) {
    const dbData = toSnake({ ...customer, shopId });
    const { data, error } = await supabase
      .from('customers')
      .upsert(dbData)
      .select();
    return { data, error };
  },

  // Appointments
  async getAppointments(shopId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('shop_id', shopId);
    return { data: (data ? toCamel(data) : null) as Appointment[] | null, error };
  },

  async upsertAppointment(appointment: Appointment, shopId: string) {
    const dbData = toSnake({ ...appointment, shopId });
    const { data, error } = await supabase
      .from('appointments')
      .upsert(dbData)
      .select();
    return { data, error };
  },

  // Records
  async getRecords(shopId: string) {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('shop_id', shopId);
    return { data: (data ? toCamel(data) : null) as ProcedureRecord[] | null, error };
  },

  async upsertRecord(record: ProcedureRecord, shopId: string) {
    const dbRecord = toSnake({ ...record, shopId });
    const { data, error } = await supabase
      .from('records')
      .upsert(dbRecord)
      .select();
    return { data, error };
  },

  // Consents
  async getConsents(shopId: string) {
    const { data, error } = await supabase
      .from('consents')
      .select('*')
      .eq('shop_id', shopId);
    return { data: (data ? toCamel(data) : null) as any[] | null, error };
  },

  async upsertConsent(consent: any, shopId: string) {
    const dbConsent = toSnake({ ...consent, shopId });
    const { data, error } = await supabase
      .from('consents')
      .upsert(dbConsent)
      .select();
    return { data, error };
  },

  // Settings
  async getSettings(shopId: string) {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('shop_id', shopId)
      .single();
    return { data: (data ? toCamel(data) : null) as AppSettings | null, error };
  },

  async upsertSettings(settings: AppSettings, shopId: string) {
    const dbData = toSnake({ ...settings, shopId });
    const { data, error } = await supabase
      .from('settings')
      .upsert(dbData)
      .select();
    return { data, error };
  }
};
