import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Fingerprint, Image, Ban } from 'lucide-react';
import scanImg from '../assets/images/ai_scan_loading.png';
import { scanMaterialImage } from '../services/aiService';

const ScanLoading: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const scannedImage = location.state?.image;

  useEffect(() => {
    if (!scannedImage) {
      alert('판독할 이미지가 없습니다.');
      navigate(-1);
      return;
    }

    let progressInterval: any;

    const performScan = async () => {
      try {
        // 가짜 프로그레스 바 시작
        progressInterval = setInterval(() => {
          setProgress((prev) => (prev < 90 ? prev + 1 : prev));
        }, 30);

        // 실제 AI 스캔 요청
        const result = await scanMaterialImage(scannedImage);
        
        // 성공 시 100% 채우고 결과 페이지로 이동
        clearInterval(progressInterval);
        setProgress(100);
        
        setTimeout(() => {
          navigate('/scan-result', { state: { result } });
        }, 500);
      } catch (err: any) {
        clearInterval(progressInterval);
        setError(err.message || '분석 중 오류가 발생했습니다.');
        console.error(err);
      }
    };

    performScan();

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [navigate, scannedImage]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background-light dark:bg-background-dark p-6 text-center">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
          <Ban className="size-10" />
        </div>
        <h2 className="text-xl font-bold mb-2">판독 실패</h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="w-full max-w-xs h-14 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20"
        >
          다시 시도하기
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-hidden font-display antialiased">
      {/* Header */}
      <div className="flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 pb-2 justify-between z-20">
        <button 
          onClick={() => navigate(-1)}
          className="text-slate-900 dark:text-slate-100 flex size-12 shrink-0 items-center justify-start hover:opacity-70 transition-opacity"
        >
          <X className="size-6" />
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center font-display">AI 재료 판독 중</h2>
        <div className="size-12"></div>
      </div>

      {/* Viewfinder Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Mock Camera Background */}
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-slate-900">
          <img alt="AI Scanning" className="w-full max-w-[280px] opacity-60" src={scanImg} />
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark/60 via-transparent to-background-dark/80"></div>
        </div>

        {/* Viewfinder Corners */}
        <div className="absolute top-12 left-8 w-8 h-8 border-t-4 border-l-4 border-primary/50 rounded-tl-lg"></div>
        <div className="absolute top-12 right-8 w-8 h-8 border-t-4 border-r-4 border-primary/50 rounded-tr-lg"></div>
        <div className="absolute bottom-12 left-8 w-8 h-8 border-b-4 border-l-4 border-primary/50 rounded-bl-lg"></div>
        <div className="absolute bottom-12 right-8 w-8 h-8 border-b-4 border-r-4 border-primary/50 rounded-br-lg"></div>

        {/* Scanning Line */}
        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_#ee2b5b] z-10 animate-scan"></div>

        {/* Central UI */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative flex items-center justify-center">
            {/* Outer Ring */}
            <div className="size-48 rounded-full border-4 border-primary/20 flex items-center justify-center">
              <div className="absolute size-40 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
            {/* Icon */}
            <div className="absolute text-primary">
              <Fingerprint className="size-12" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h3 className="text-white tracking-tight text-2xl font-bold leading-tight">AI 판독 진행 중...</h3>
            <div className="flex flex-col gap-2 items-center">
              <p className="text-white text-base font-medium leading-normal">사진에서 색소 및 니들 정보를 추출하고 있습니다.</p>
              <p className="text-primary/70 text-sm font-normal leading-normal tracking-wide">분석이 완료될 때까지 잠시만 기다려 주세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Area */}
      <div className="relative z-20 bg-background-light dark:bg-background-dark p-6 space-y-6">
        {/* Progress Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-end">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">분석 진행률</span>
            <span className="text-slate-900 dark:text-white text-sm font-bold">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-primary/20 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="flex h-14 flex-1 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
            <Image className="size-5 mr-2" />
            <span className="font-bold">갤러리</span>
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="flex h-14 flex-[2] items-center justify-center rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
          >
            <Ban className="size-5 mr-2" />
            <span className="truncate">분석 취소</span>
          </button>
        </div>
      </div>
      <div className="h-6 bg-background-light dark:bg-background-dark"></div>
    </div>
  );
};

export default ScanLoading;
