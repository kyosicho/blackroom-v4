import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, CheckCircle2, RotateCcw, Save, Activity, Shield } from 'lucide-react';
import Header from '../components/Header';
import { useRecords } from '../context/RecordContext';
import { now } from '../services/storageService';
import type { AIScanResult } from '../types/types';

const ScanResult: React.FC = () => {
  const navigate = useNavigate();
  const { setAIScanResult } = useRecords();

  // 시뮬레이션된 AI 재료 판독 결과 (실제 AI 연동 시 이 객체가 API로부터 채워짐)
  const scanResult: AIScanResult = {
    pigmentBrand: 'Perma Blend',
    pigmentColor: 'Espresso',
    lotNumber: 'PB-2024-03-X',
    needleType: 'Precision 1RL',
    needleSize: '0.25mm',
    notes: '정품 색소 및 멸균 니들 확인 완료. 유효기간 2026-12-31까지.',
    scannedAt: now(),
  };

  const handleApply = () => {
    setAIScanResult(scanResult);
    navigate('/record-ai_scan');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display">
      <Header title="AI 재료 판독 결과" />

      {/* Analysis Result Cards */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 mb-4 shadow-sm shadow-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="size-5 text-primary" />
            <h3 className="text-lg font-bold">인식된 재료 정보</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-primary/5 pb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">색소 브랜드</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{scanResult.pigmentBrand}</span>
            </div>
            <div className="flex justify-between items-center border-b border-primary/5 pb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">컬러명</span>
              <span className="text-sm font-bold text-primary">{scanResult.pigmentColor}</span>
            </div>
            <div className="flex justify-between items-center border-b border-primary/5 pb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">제조번호 (Lot No.)</span>
              <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">{scanResult.lotNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="px-4 py-2">
        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-4 ml-1">
          니들 시스템 정보
        </h3>
        
        <div className="space-y-3">
          {/* Needle Type */}
          <div className="flex items-center gap-4 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-2xl px-4 min-h-[80px] py-3 justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-xl bg-primary/10 shrink-0 size-12">
                <Shield className="size-6" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Needle Type</p>
                <p className="text-base font-bold leading-normal">{scanResult.needleType}</p>
              </div>
            </div>
            <div className="shrink-0 text-primary">
              <CheckCircle2 className="size-7" />
            </div>
          </div>

          {/* Needle Size */}
          <div className="flex items-center gap-4 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-2xl px-4 min-h-[80px] py-3 justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-xl bg-primary/10 shrink-0 size-12">
                <Info className="size-6" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Specifications</p>
                <p className="text-base font-bold leading-normal">{scanResult.needleSize}</p>
              </div>
            </div>
            <div className="shrink-0 text-primary">
              <CheckCircle2 className="size-7" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Notes */}
      <div className="px-4 py-4">
        <div className="bg-slate-50 dark:bg-primary/5 border border-dashed border-slate-300 dark:border-primary/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Info className="size-4 text-primary" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI 시술 가이드 참고</p>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{scanResult.notes}</p>
        </div>
      </div>

      {/* Confirmation */}
      <div className="mt-4 px-4 text-center">
        <p className="text-sm font-bold text-slate-400">
          판독된 재료 정보를 시술 기록에 적용할까요?
        </p>
      </div>

      {/* Actions */}
      <div className="p-6 mt-auto mb-8 flex flex-col gap-3">
        <button 
          onClick={() => navigate('/scan-loading')}
          className="w-full h-14 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
        >
          <RotateCcw className="size-5" />
          다시 촬영하기
        </button>
        <button 
          onClick={handleApply}
          className="w-full h-14 bg-primary text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-primary/30 active:scale-[0.98] transition-all"
        >
          <Save className="size-6" />
          기록에 즉시 적용
        </button>
      </div>
    </div>
  );
};

export default ScanResult;
