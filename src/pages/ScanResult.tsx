import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, Info, CheckCircle2, RotateCcw, Save, Activity, Shield } from 'lucide-react';
import Header from '../components/Header';
import { useRecords } from '../context/RecordContext';
import { now } from '../services/storageService';
import type { AIScanResult } from '../types/types';

const ScanResult: React.FC = () => {
  const navigate = useNavigate();
  const { setAIScanResult } = useRecords();

  // 시뮬레이션된 AI 스캔 결과 (추후 실제 AI API로 교체)
  const scanResult: AIScanResult = {
    skinType: '건성 (Dry Skin)',
    hydration: 42,
    sensitivity: '보통 (Medium)',
    recommendedPigment: 'EB22 다크 브라운',
    recommendedNeedle: '1RL 0.25mm',
    notes: '피부 수분도가 평균 이하. 시술 전 충분한 보습 권장. 색소 정착률 양호할 것으로 예상.',
    scannedAt: now(),
  };

  const handleApply = () => {
    setAIScanResult(scanResult);
    navigate('/record-ai_scan');
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display">
      <Header title="AI 판독 결과" />

      {/* Analysis Result Cards */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="size-5 text-primary" />
            <h3 className="text-lg font-bold">피부 분석 결과</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">피부 타입</span>
              <span className="text-sm font-semibold">{scanResult.skinType}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">수분도</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-slate-200 dark:bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${scanResult.hydration}%` }}></div>
                </div>
                <span className="text-sm font-semibold">{scanResult.hydration}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">민감도</span>
              <span className="text-sm font-semibold">{scanResult.sensitivity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="px-4 py-2">
        <h3 className="text-lg font-bold leading-tight tracking-tight pb-4 pt-2 border-l-4 border-primary pl-3">
          AI 추천 구성
        </h3>
        
        <div className="space-y-3">
          {/* Pigment */}
          <div className="flex items-center gap-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl px-4 min-h-[80px] py-2 justify-between">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-12">
                <Droplet className="size-6" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-base font-bold leading-normal">Pigment: {scanResult.recommendedPigment}</p>
                <p className="text-primary/70 dark:text-primary/50 text-sm font-medium leading-normal">Dark Brown</p>
              </div>
            </div>
            <div className="shrink-0 text-primary">
              <CheckCircle2 className="size-7 fill-primary/20" />
            </div>
          </div>

          {/* Needle */}
          <div className="flex items-center gap-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl px-4 min-h-[80px] py-2 justify-between">
            <div className="flex items-center gap-4">
              <div className="text-primary flex items-center justify-center rounded-lg bg-primary/20 shrink-0 size-12">
                <Info className="size-6" />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-base font-bold leading-normal">Needle: {scanResult.recommendedNeedle}</p>
                <p className="text-primary/70 dark:text-primary/50 text-sm font-medium leading-normal">Precision Cartridge</p>
              </div>
            </div>
            <div className="shrink-0 text-primary">
              <CheckCircle2 className="size-7 fill-primary/20" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Notes */}
      <div className="px-4 py-4">
        <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="size-4 text-primary" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">AI 참고 사항</p>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{scanResult.notes}</p>
        </div>
      </div>

      {/* Confirmation */}
      <div className="mt-4 px-4 text-center">
        <p className="text-base font-medium opacity-80">
          판독된 정보가 정확한가요?
        </p>
      </div>

      {/* Actions */}
      <div className="p-4 mt-auto mb-8 flex flex-col gap-3">
        <button 
          onClick={() => navigate('/scan-loading')}
          className="w-full h-14 bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-colors hover:bg-primary/20 active:bg-primary/30"
        >
          <RotateCcw className="size-5" />
          다시 촬영
        </button>
        <button 
          onClick={handleApply}
          className="w-full h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:opacity-90"
        >
          <Save className="size-5" />
          기록에 적용하기
        </button>
      </div>
    </div>
  );
};

export default ScanResult;
