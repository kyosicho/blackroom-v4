import { createClient } from '@supabase/supabase-js';
import type { Customer, Appointment, ProcedureRecord, AppSettings } from '../types/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabaseService = {
  // Customers
  async getCustomers(shopId: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('shop_id', shopId);
    return { data: data as Customer[] | null, error };
  },

  async upsertCustomer(customer: Customer, shopId: string) {
    const { data, error } = await supabase
      .from('customers')
      .upsert({ ...customer, shop_id: shopId })
      .select();
    return { data, error };
  },

  // Appointments
  async getAppointments(shopId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('shop_id', shopId);
    return { data: data as Appointment[] | null, error };
  },

  async upsertAppointment(appointment: Appointment, shopId: string) {
    const { data, error } = await supabase
      .from('appointments')
      .upsert({ ...appointment, shop_id: shopId })
      .select();
    return { data, error };
  },

  // Records
  async getRecords(shopId: string) {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('shop_id', shopId);
    return { data: data as ProcedureRecord[] | null, error };
  },

  async upsertRecord(record: ProcedureRecord, shopId: string) {
    const { data, error } = await supabase
      .from('records')
      .upsert({ ...record, shop_id: shopId })
      .select();
    return { data, error };
  },

  // Consents
  async getConsents(shopId: string) {
    const { data, error } = await supabase
      .from('consents')
      .select('*')
      .eq('shop_id', shopId);
    return { data: data as any[] | null, error };
  },

  async upsertConsent(consent: any, shopId: string) {
    const { data, error } = await supabase
      .from('consents')
      .upsert({ ...consent, shop_id: shopId })
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
    return { data: data as AppSettings | null, error };
  },

  async upsertSettings(settings: AppSettings, shopId: string) {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ ...settings, shop_id: shopId })
      .select();
    return { data, error };
  }
};
