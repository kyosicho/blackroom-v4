import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ProcedureRecord, AIScanResult } from '../types/types';
import { STORAGE_KEYS, getAll, getById, create, update, remove, generateId, now, setAll } from '../services/storageService';
import { supabaseService, supabase } from '../services/supabaseService';
import { useSettings } from './SettingsContext';

interface RecordContextType {
  records: ProcedureRecord[];
  loading: boolean;
  currentDraft: Partial<ProcedureRecord> | null;
  getRecord: (id: string) => ProcedureRecord | null;
  addRecord: (data: Omit<ProcedureRecord, 'id' | 'createdAt' | 'updatedAt'>) => ProcedureRecord | null;
  updateRecord: (id: string, data: Partial<ProcedureRecord>) => ProcedureRecord | null;
  deleteRecord: (id: string) => boolean;
  getRecordsByCustomer: (customerId: string) => ProcedureRecord[];
  searchRecords: (query: string) => ProcedureRecord[];
  getCompletedCount: () => number;
  // Draft management for multi-step creation flow
  setDraft: (data: Partial<ProcedureRecord>) => void;
  updateDraft: (data: Partial<ProcedureRecord>) => void;
  clearDraft: () => void;
  saveDraft: (overrides?: Partial<ProcedureRecord>) => ProcedureRecord | null;
  // AI scan result
  setAIScanResult: (result: AIScanResult) => void;
  refreshRecords: () => void;
}

const RecordContext = createContext<RecordContextType | undefined>(undefined);

export const RecordProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<ProcedureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDraft, setCurrentDraft] = useState<Partial<ProcedureRecord> | null>(null);
  const { settings } = useSettings();
  const shopId = settings.shopId;

  const refreshRecords = useCallback(() => {
    const data = getAll<ProcedureRecord>(STORAGE_KEYS.RECORDS);
    // 최신 순 정렬
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecords(data);
    setLoading(false);
  }, []);

  // 0. 드래프트 복구 및 자동 저장
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && Object.keys(parsed).length > 0) {
          console.log('Restoring draft from localStorage:', parsed);
          setCurrentDraft(parsed);
        }
      } catch (e) {
        console.error('Failed to parse saved draft:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (currentDraft && Object.keys(currentDraft).length > 0) {
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(currentDraft));
    }
  }, [currentDraft]);

  // 1. 초기 Supabase 데이터 로드 & 병합
  useEffect(() => {
    if (!shopId) {
      refreshRecords();
      return;
    }

    const syncFromSupabase = async () => {
      setLoading(true);
      const { data, error } = await supabaseService.getRecords(shopId);
      if (!error && data) {
        const localData = getAll<ProcedureRecord>(STORAGE_KEYS.RECORDS);
        const map = new Map<string, ProcedureRecord>();
        localData.forEach(r => map.set(r.id, r));
        data.forEach(r => map.set(r.id, r));
        
        const merged = Array.from(map.values());
        setAll(STORAGE_KEYS.RECORDS, merged);
        refreshRecords();
      } else {
        refreshRecords();
      }
      setLoading(false);
    };

    syncFromSupabase();
  }, [shopId, refreshRecords]);

  // 2. 실시간 구독
  useEffect(() => {
    if (!shopId) return;

    const channel = supabase
      .channel('records_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'records', filter: `shop_id=eq.${shopId}` },
        (payload) => {
          console.log('Realtime Record Change:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newItem = payload.new as ProcedureRecord;
            const existing = getAll<ProcedureRecord>(STORAGE_KEYS.RECORDS);
            const index = existing.findIndex(i => i.id === newItem.id);
            if (index !== -1) existing[index] = newItem;
            else existing.push(newItem);
            setAll(STORAGE_KEYS.RECORDS, existing);
          } else if (payload.eventType === 'DELETE') {
            const existing = getAll<ProcedureRecord>(STORAGE_KEYS.RECORDS);
            const filtered = existing.filter(i => i.id !== payload.old.id);
            setAll(STORAGE_KEYS.RECORDS, filtered);
          }
          refreshRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shopId, refreshRecords]);

  useEffect(() => {
    refreshRecords();
  }, [refreshRecords]);

  const getRecord = useCallback((id: string): ProcedureRecord | null => {
    return getById<ProcedureRecord>(STORAGE_KEYS.RECORDS, id);
  }, []);

  const addRecord = useCallback((recordData: Omit<ProcedureRecord, 'id' | 'createdAt' | 'updatedAt'>): ProcedureRecord | null => {
    if (!shopId) return null;
    const newRecord: ProcedureRecord = {
      ...recordData,
      id: generateId(),
      shopId: shopId,
      createdAt: now(),
      updatedAt: now(),
    };
    
    create(STORAGE_KEYS.RECORDS, newRecord);
    
    // Background sync
    supabaseService.upsertRecord(newRecord, shopId);
    
    refreshRecords();
    return newRecord;
  }, [shopId, refreshRecords]);

  const updateRecord = useCallback((id: string, data: Partial<ProcedureRecord>): ProcedureRecord | null => {
    const result = update<ProcedureRecord>(STORAGE_KEYS.RECORDS, id, { ...data, updatedAt: now() });
    if (result) {
      if (shopId) {
        supabaseService.upsertRecord(result, shopId);
      }
      refreshRecords();
    }
    return result;
  }, [refreshRecords, shopId]);

  const deleteRecord = useCallback((id: string): boolean => {
    const result = remove(STORAGE_KEYS.RECORDS, id);
    if (result) {
      if (shopId) {
        supabase.from('records').delete().eq('id', id).eq('shop_id', shopId).then();
      }
      refreshRecords();
    }
    return result;
  }, [refreshRecords, shopId]);

  const getRecordsByCustomer = useCallback((customerId: string): ProcedureRecord[] => {
    return records.filter((r) => r.customerId === customerId);
  }, [records]);

  const searchRecords = useCallback((query: string): ProcedureRecord[] => {
    if (!query.trim()) return records;
    const lower = query.toLowerCase();
    return records.filter(
      (r) =>
        r.customerName.toLowerCase().includes(lower) ||
        r.procedureType.toLowerCase().includes(lower) ||
        r.pigment.toLowerCase().includes(lower)
    );
  }, [records]);

  const getCompletedCount = useCallback((): number => {
    // 이번 주 완료 건수
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return records.filter(
      (r) => r.status === 'completed' && new Date(r.createdAt) >= weekStart
    ).length;
  }, [records]);

  // Draft management
  const setDraft = useCallback((data: Partial<ProcedureRecord> | null) => {
    setCurrentDraft(data);
    if (data === null) {
      localStorage.removeItem(STORAGE_KEYS.DRAFT);
    }
  }, []);

  const updateDraft = useCallback((updates: Partial<ProcedureRecord>) => {
    setCurrentDraft((prev) => (prev ? { ...prev, ...updates } : updates));
  }, []);

  const clearDraft = useCallback(() => {
    setCurrentDraft(null);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  }, []);

  const saveDraft = useCallback((overrides?: Partial<ProcedureRecord>): ProcedureRecord | null => {
    if (!currentDraft && !overrides) return null;
    
    // 현재 드래프트와 전달받은 overrides를 합쳐서 최종 데이터 생성
    // overrides에 값이 없는 경우 기존 드래프트의 중요 데이터(id, aiScanResult 등)를 보존합니다.
    const finalData: Partial<ProcedureRecord> = { ...currentDraft };
    
    if (overrides) {
      Object.keys(overrides).forEach(key => {
        const k = key as keyof ProcedureRecord;
        if (overrides[k] !== undefined && (overrides[k] as any) !== '') {
          (finalData as any)[k] = overrides[k];
        }
      });
    }

    const record = addRecord({
      customerId: finalData.customerId || '',
      customerName: finalData.customerName || '',
      procedureType: finalData.procedureType || '',
      pigment: finalData.pigment || '',
      needle: finalData.needle || '',
      notes: finalData.notes || '',
      beforeImage: finalData.beforeImage,
      afterImage: finalData.afterImage,
      additionalImages: finalData.additionalImages || [],
      postGuideConfirmed: finalData.postGuideConfirmed || false,
      status: 'completed',
      consentId: finalData.consentId,
      appointmentId: finalData.appointmentId,
      aiScanResult: finalData.aiScanResult
    });
    setCurrentDraft(null);
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
    return record;
  }, [currentDraft, addRecord]);

  const setAIScanResult = useCallback((result: AIScanResult) => {
    setCurrentDraft((prev) => {
      if (!prev) return prev;
      return { 
        ...prev, 
        aiScanResult: result,
        pigment: `${result.pigmentBrand} ${result.pigmentColor}`.trim(),
        needle: `${result.needleType} ${result.needleSize}`.trim()
      };
    });
  }, []);

  return (
    <RecordContext.Provider
      value={{
        records,
        loading,
        currentDraft,
        getRecord,
        addRecord,
        updateRecord,
        deleteRecord,
        getRecordsByCustomer,
        searchRecords,
        getCompletedCount,
        setDraft,
        updateDraft,
        clearDraft,
        saveDraft,
        setAIScanResult,
        refreshRecords,
      }}
    >
      {children}
    </RecordContext.Provider>
  );
};

export const useRecords = () => {
  const context = useContext(RecordContext);
  if (context === undefined) {
    throw new Error('useRecords must be used within a RecordProvider');
  }
  return context;
};
