// ============================================
// Blackroom PMU - LocalStorage Service
// ============================================
// 제네릭 CRUD 서비스. 추후 API 서버로 교체 시 이 파일만 수정하면 됨.

export const STORAGE_KEYS = {
  CUSTOMERS: 'blackroom_customers',
  APPOINTMENTS: 'blackroom_appointments',
  CONSENTS: 'blackroom_consents',
  RECORDS: 'blackroom_records',
  SETTINGS: 'blackroom_settings',
  INITIALIZED: 'blackroom_initialized',
} as const;

// UUID 생성
export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
}

// 현재 시간 ISO 문자열
export function now(): string {
  return new Date().toISOString();
}

// 오늘 날짜 YYYY-MM-DD
export function today(): string {
  return new Date().toISOString().split('T')[0];
}

// ---- CRUD Operations ----

export function getAll<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    console.error(`Failed to read ${key} from localStorage`);
    return [];
  }
}

export function getById<T extends { id: string }>(key: string, id: string): T | null {
  const items = getAll<T>(key);
  return items.find((item) => item.id === id) ?? null;
}

export function create<T extends { id: string }>(key: string, item: T): T {
  const items = getAll<T>(key);
  items.push(item);
  localStorage.setItem(key, JSON.stringify(items));
  return item;
}

export function update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
  const items = getAll<T>(key);
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...updates };
  localStorage.setItem(key, JSON.stringify(items));
  return items[index];
}

export function remove(key: string, id: string): boolean {
  const items = getAll<{ id: string }>(key);
  const filtered = items.filter((item) => item.id !== id);
  if (filtered.length === items.length) return false;
  
  localStorage.setItem(key, JSON.stringify(filtered));
  return true;
}

// ---- Query Helpers ----

export function query<T>(key: string, predicate: (item: T) => boolean): T[] {
  return getAll<T>(key).filter(predicate);
}

export function count(key: string): number {
  return getAll(key).length;
}

// ---- Bulk Operations ----

export function setAll<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

export function clearAll(key: string): void {
  localStorage.removeItem(key);
}
