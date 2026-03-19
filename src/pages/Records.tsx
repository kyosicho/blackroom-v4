import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, ChevronRight } from 'lucide-react';
import { useRecords } from '../context/RecordContext';
import type { RecordStatus } from '../types/types';

const statusLabel: Record<RecordStatus, string> = {
  'completed': 'Completed',
  'touch-up': 'Touch-up',
  'consulting': 'Consulting',
  'in-progress': 'In Progress',
};

const statusColor: Record<RecordStatus, string> = {
  'completed': 'bg-primary/10 text-primary',
  'touch-up': 'bg-primary/10 text-primary',
  'consulting': 'bg-slate-100 dark:bg-slate-700 text-slate-500',
  'in-progress': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600',
};

type FilterType = 'all' | 'week' | 'month' | '3months';

const Records: React.FC = () => {
  const navigate = useNavigate();
  const { records, searchRecords } = useRecords();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // 필터링
  const filteredRecords = (() => {
    let result = searchQuery.trim() ? searchRecords(searchQuery) : records;

    if (activeFilter !== 'all') {
      const now = new Date();
      let daysBack = 7;
      if (activeFilter === 'month') daysBack = 30;
      if (activeFilter === '3months') daysBack = 90;
      const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      result = result.filter((r) => new Date(r.createdAt) >= cutoff);
    }

    return result;
  })();

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'week', label: '이번 주' },
    { key: 'month', label: '이번 달' },
    { key: '3months', label: '3개월' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-slate-900 dark:text-slate-100 flex size-10 items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">시술 기록 목록</h1>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="flex w-full items-stretch rounded-xl h-12 bg-slate-200 dark:bg-[#48232c] overflow-hidden ring-1 ring-inset ring-transparent focus-within:ring-primary/50 transition-all">
            <div className="text-slate-500 dark:text-[#c992a0] flex items-center justify-center pl-4">
              <Search className="size-5" />
            </div>
            <input
              className="flex w-full border-none bg-transparent focus:ring-0 text-base font-normal placeholder:text-slate-500 dark:placeholder:text-[#c992a0]/60 outline-none px-3"
              placeholder="고객명 또는 시술명 검색"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all active:scale-95 ${
                activeFilter === f.key
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 dark:bg-[#48232c] text-slate-700 dark:text-slate-200 hover:bg-primary/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* Record List */}
      <main className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              onClick={() => navigate(`/record/${record.id}`)}
              className="group flex items-center gap-4 bg-white dark:bg-[#331920] p-3 rounded-xl border border-slate-200 dark:border-primary/10 hover:border-primary/30 transition-all cursor-pointer"
            >
              <div className="relative size-16 shrink-0 rounded-lg overflow-hidden border border-slate-100 dark:border-primary/20 bg-primary/10 flex items-center justify-center">
                {record.beforeImage ? (
                  <img className="w-full h-full object-cover" src={record.beforeImage} alt="" />
                ) : (
                  <span className="text-primary text-xl font-bold">{record.customerName.charAt(0)}</span>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-slate-900 dark:text-slate-100 text-base font-bold truncate">{record.customerName}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${statusColor[record.status]}`}>
                    {statusLabel[record.status]}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-[#c992a0] text-xs font-medium mt-0.5">
                  {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                </p>
                <p className="text-slate-700 dark:text-slate-300 text-sm font-normal mt-1 truncate">{record.procedureType}</p>
              </div>
              <div className="text-slate-400 group-hover:text-primary transition-colors">
                <ChevronRight className="size-5" />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
            <p className="text-lg font-semibold mb-2">기록이 없습니다</p>
            <p className="text-sm">새 시술을 시작하여 기록을 추가하세요</p>
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/guide')}
        className="fixed right-6 bottom-24 size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20"
      >
        <Plus className="size-7" />
      </button>
    </div>
  );
};

export default Records;
