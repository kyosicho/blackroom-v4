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
  DRAFT: 'blackroom_draft',
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

// ---- Bulk Operations ----

export function setAll<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn('LocalStorage Quota Exceeded. Attempting to purge old records...');
      // 기록 데이터인 경우 오래된 것부터 삭제 시도
      if (key === STORAGE_KEYS.RECORDS) {
        const reduced = items.slice(0, Math.max(1, Math.floor(items.length * 0.7))); // 30% 삭제
        try {
          localStorage.setItem(key, JSON.stringify(reduced));
          return;
        } catch {
          // 그래도 안되면 더 많이 삭제
          localStorage.setItem(key, JSON.stringify(reduced.slice(0, 5)));
          return;
        }
      }
    }
    console.error(`Failed to setAll for ${key}:`, e);
    throw e;
  }
}

export function create<T extends { id: string }>(key: string, item: T): T {
  try {
    const items = getAll<T>(key);
    items.unshift(item); // 최신 데이터가 앞으로 오게
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn('Quota Exceeded during create. Purging old data and retrying...');
      const items = getAll<T>(key);
      const reduced = [item, ...items.slice(0, Math.max(0, items.length - 5))]; // 기존 데이터 중 일부 삭제
      try {
        localStorage.setItem(key, JSON.stringify(reduced));
        return item;
      } catch {
        // 극한 상황: 현재 데이터만이라도 저장 시도
        try {
          localStorage.setItem(key, JSON.stringify([item]));
          return item;
        } catch (innerErr) {
          throw innerErr;
        }
      }
    }
    console.error(`Failed to create item in ${key}:`, e);
    throw e;
  }
  return item;
}

export function update<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
  try {
    const items = getAll<T>(key);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    
    items[index] = { ...items[index], ...updates };
    localStorage.setItem(key, JSON.stringify(items));
    return items[index];
  } catch (e) {
    console.error(`Failed to update item ${id} in ${key}:`, e);
    return null;
  }
}

export function remove(key: string, id: string): boolean {
  try {
    const items = getAll<any>(key);
    const filtered = items.filter((item) => item.id !== id);
    if (items.length === filtered.length) return false;
    localStorage.setItem(key, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error(`Failed to remove item ${id} from ${key}:`, e);
    return false;
  }
}

export function clearAll(key: string): void {
  localStorage.removeItem(key);
}
