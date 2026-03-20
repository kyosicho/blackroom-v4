import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ProcedureRecord, AIScanResult } from '../types/types';
import { STORAGE_KEYS, getAll, getById, create, update, remove, generateId, now } from '../services/storageService';

interface RecordContextType {
  records: ProcedureRecord[];
  loading: boolean;
  currentDraft: Partial<ProcedureRecord> | null;
  getRecord: (id: string) => ProcedureRecord | null;
  addRecord: (data: Omit<ProcedureRecord, 'id' | 'createdAt' | 'updatedAt'>) => ProcedureRecord;
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

  const refreshRecords = useCallback(() => {
    const data = getAll<ProcedureRecord>(STORAGE_KEYS.RECORDS);
    // 최신 순 정렬
    data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshRecords();
  }, [refreshRecords]);

  const getRecord = useCallback((id: string): ProcedureRecord | null => {
    return getById<ProcedureRecord>(STORAGE_KEYS.RECORDS, id);
  }, []);

  const addRecord = useCallback((data: Omit<ProcedureRecord, 'id' | 'createdAt' | 'updatedAt'>): ProcedureRecord => {
    const newRecord: ProcedureRecord = {
      ...data,
      id: generateId(),
      createdAt: now(),
      updatedAt: now(),
    };
    create(STORAGE_KEYS.RECORDS, newRecord);
    refreshRecords();
    return newRecord;
  }, [refreshRecords]);

  const updateRecord = useCallback((id: string, data: Partial<ProcedureRecord>): ProcedureRecord | null => {
    const result = update<ProcedureRecord>(STORAGE_KEYS.RECORDS, id, { ...data, updatedAt: now() });
    if (result) refreshRecords();
    return result;
  }, [refreshRecords]);

  const deleteRecord = useCallback((id: string): boolean => {
    const result = remove(STORAGE_KEYS.RECORDS, id);
    if (result) refreshRecords();
    return result;
  }, [refreshRecords]);

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
  const setDraft = useCallback((data: Partial<ProcedureRecord>) => {
    setCurrentDraft(data);
  }, []);

  const updateDraft = useCallback((data: Partial<ProcedureRecord>) => {
    setCurrentDraft((prev) => (prev ? { ...prev, ...data } : data));
  }, []);

  const clearDraft = useCallback(() => {
    setCurrentDraft(null);
  }, []);

  const saveDraft = useCallback((overrides?: Partial<ProcedureRecord>): ProcedureRecord | null => {
    if (!currentDraft && !overrides) return null;
    
    // 현재 드래프트와 전달받은 overrides를 합쳐서 최종 데이터 생성
    const finalData = { ...currentDraft, ...overrides };
    
    const record = addRecord({
      customerId: finalData.customerId || '',
      customerName: finalData.customerName || '',
      procedureType: finalData.procedureType || '',
      pigment: finalData.pigment || '',
      needle: finalData.needle || '',
      notes: finalData.notes || '',
      additionalImages: finalData.additionalImages || [],
      status: finalData.status || 'in-progress',
      beforeImage: finalData.beforeImage,
      afterImage: finalData.afterImage,
      aiScanResult: finalData.aiScanResult,
      appointmentId: finalData.appointmentId,
      consentId: finalData.consentId,
      gpsVerified: finalData.gpsVerified,
      postGuideConfirmed: finalData.postGuideConfirmed,
    });
    setCurrentDraft(null);
    return record;
  }, [currentDraft, addRecord]);

  const setAIScanResult = useCallback((result: AIScanResult) => {
    setCurrentDraft((prev) => ({
      ...prev,
      aiScanResult: result,
      pigment: result.recommendedPigment,
      needle: result.recommendedNeedle,
    }));
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
