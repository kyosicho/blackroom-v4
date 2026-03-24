import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Info, CheckCircle2, RotateCcw, Save, Activity, Shield, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import { useRecords } from '../context/RecordContext';
import type { AIScanResult } from '../types/types';

const ScanResult: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAIScanResult } = useRecords();

  // state에서 분석 결과 가져오기 (없으면 에러 처리)
  const scanResult: AIScanResult | null = location.state?.result;

  const handleApply = () => {
    if (scanResult) {
      setAIScanResult(scanResult);
      navigate('/record-ai_scan');
    }
  };

  if (!scanResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background-light dark:bg-background-dark text-center">
        <AlertCircle className="size-16 text-primary mb-4" />
        <h2 className="text-xl font-bold mb-2">분석 결과를 찾을 수 없습니다</h2>
        <p className="text-slate-500 mb-8">다시 시도해 주세요.</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-primary text-white font-bold rounded-xl">돌아가기</button>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden font-display">
      <Header title="AI 재료 판독 결과" />

      {/* Analysis Result Cards - 복수 재료 지원 */}
      {((scanResult.pigments && scanResult.pigments.length > 0) || scanResult.pigmentBrand || scanResult.pigmentColor) && (
        <div className="px-4 py-4">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5 mb-4 shadow-sm shadow-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="size-5 text-primary" />
              <h3 className="text-lg font-bold">인식된 색소 정보</h3>
              {scanResult.pigments && scanResult.pigments.length > 1 && (
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{scanResult.pigments.length}개 인식</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {scanResult.pigments && scanResult.pigments.length > 0 ? (
                scanResult.pigments.map((p, i) => (
                  <div key={`p-${i}`} className="bg-white dark:bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl shadow-sm">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{p}</p>
                  </div>
                ))
              ) : (
                <div className="w-full space-y-3">
                  {scanResult.pigmentBrand && (
                    <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                      <span className="text-sm text-slate-500 font-medium">색소 브랜드</span>
                      <span className="text-sm font-bold">{scanResult.pigmentBrand}</span>
                    </div>
                  )}
                  {scanResult.pigmentColor && (
                    <div className="flex justify-between items-center border-b border-primary/5 pb-2">
                      <span className="text-sm text-slate-500 font-medium">컬러명</span>
                      <span className="text-sm font-bold text-primary">{scanResult.pigmentColor}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            {scanResult.lotNumber && (
              <div className="mt-3 pt-3 border-t border-primary/10 flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">제조번호 (Lot No.)</span>
                <span className="text-[11px] font-mono font-bold bg-slate-100 dark:bg-white/5 px-2 py-1 rounded">{scanResult.lotNumber}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Needle Info - 복수 지원 */}
      {((scanResult.needles && scanResult.needles.length > 0) || scanResult.needleType || scanResult.needleSize) && (
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 mb-4 ml-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">니들 시스템 정보</h3>
            {scanResult.needles && scanResult.needles.length > 1 && (
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{scanResult.needles.length}개 인식</span>
            )}
          </div>
          
          <div className="space-y-3">
            {scanResult.needles && scanResult.needles.length > 0 ? (
              scanResult.needles.map((n, i) => (
                <div key={`n-${i}`} className="flex items-center gap-4 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-2xl px-4 min-h-[60px] py-3 justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="text-primary flex items-center justify-center rounded-xl bg-primary/10 shrink-0 size-10">
                      <Shield className="size-5" />
                    </div>
                    <p className="text-base font-bold leading-normal">{n}</p>
                  </div>
                  <div className="shrink-0 text-primary">
                    <CheckCircle2 className="size-6" />
                  </div>
                </div>
              ))
            ) : (
              <>
                {scanResult.needleType && (
                  <div className="flex items-center gap-4 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-2xl px-4 min-h-[60px] py-3 justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="text-primary flex items-center justify-center rounded-xl bg-primary/10 shrink-0 size-10">
                        <Shield className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Needle Type</p>
                        <p className="text-base font-bold">{scanResult.needleType}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="size-6 text-primary" />
                  </div>
                )}
                {scanResult.needleSize && (
                  <div className="flex items-center gap-4 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-2xl px-4 min-h-[60px] py-3 justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="text-primary flex items-center justify-center rounded-xl bg-primary/10 shrink-0 size-10">
                        <Info className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">Specifications</p>
                        <p className="text-base font-bold">{scanResult.needleSize}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="size-6 text-primary" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* 둘 다 없을 때 안내 메시지 표시 */}
      {!scanResult.pigmentBrand && !scanResult.pigmentColor && !scanResult.needleType && !scanResult.needleSize && (!scanResult.pigments || scanResult.pigments.length === 0) && (!scanResult.needles || scanResult.needles.length === 0) && (
        <div className="px-4 py-8 flex flex-col items-center justify-center text-center">
          <div className="size-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
            <AlertCircle className="size-8 text-slate-400" />
          </div>
          <p className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">인식된 재료 정보가 없습니다.</p>
          <p className="text-sm text-slate-500">사진이 흔들렸거나 조명이 어두울 수 있습니다.<br/>라벨이 잘 보이도록 다시 촬영해 보세요.</p>
        </div>
      )}

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
          onClick={() => navigate('/record-ai_scan', { replace: true })}
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
