import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, RotateCcw } from 'lucide-react';
import Header from '../components/Header';
import { useRecords } from '../context/RecordContext';
import { useConsents } from '../context/ConsentContext';
import { useSettings } from '../context/SettingsContext';
import { useCustomers } from '../context/CustomerContext';
import { now } from '../services/storageService';
import LegalConsentForm from '../components/LegalConsentForm';

const Consent: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const { currentDraft, updateDraft } = useRecords();
  const { settings } = useSettings();
  const { getCustomer } = useCustomers();
  const { addConsent } = useConsents();

  const [terms, setTerms] = useState<boolean[]>([false, false, false]);
  const [isSaving, setIsSaving] = useState(false);

  const customer = currentDraft?.customerId ? getCustomer(currentDraft.customerId) : null;
  const isAllAgreed = terms.every(t => t);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newTerms = [...terms];
    newTerms[index] = checked;
    setTerms(newTerms);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#ee2b5b'; // 서명 시에는 빨간색으로 시인성 확보
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
      setHasSigned(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = (e: React.MouseEvent) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
    }
  };

  const handleSubmit = async () => {
    if (isSaving || !hasSigned || !isAllAgreed) return;
    
    setIsSaving(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const signatureData = canvas.toDataURL('image/png');

      const consentRecord = await addConsent({
        customerId: currentDraft?.customerId || '',
        appointmentId: currentDraft?.appointmentId,
        terms: terms,
        signatureData,
        signedAt: now(),
      });

      updateDraft({ consentId: consentRecord.id });

      setTimeout(() => {
        setIsSaving(false);
        navigate('/scan-loading');
      }, 300);
    } catch (err) {
      console.error('Consent Submit Error:', err);
      setIsSaving(false);
    }
  };

  // 서명 패드 노드 정의
  const signatureNode = (
    <div className="relative h-40 sm:h-48 w-full rounded-2xl border-2 border-dashed border-primary/30 bg-white shadow-inner overflow-hidden cursor-crosshair">
      {!hasSigned && (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 pointer-events-none">
          <Edit2 className="size-10 text-primary mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Sign Here</span>
        </div>
      )}
      <canvas 
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="absolute inset-0 w-full h-full touch-none"
      />
      {hasSigned && (
        <button 
          onClick={clearCanvas}
          className="absolute bottom-2 right-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 hover:text-primary transition-colors shadow-sm active:scale-95"
          title="서명 지우기"
        >
          <RotateCcw className="size-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950">
      <Header title="시술 동의서 작성" />
      
      <main className="flex-1 overflow-y-auto pb-48 pt-4">
        <div className="max-w-screen-md mx-auto px-4">
          {/* Progress Indicator */}
          <div className="mb-6 px-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Step 02 / 04</span>
              <span className="text-xs font-bold text-slate-400">정식 동의서 작성 및 서명</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-primary transition-all duration-700 ease-out-expo" style={{ width: '50%' }}></div>
            </div>
          </div>

          {/* Legal Consent Form (Interactive Mode) */}
          <div className="shadow-2xl rounded-3xl overflow-hidden mb-8">
            <LegalConsentForm 
              customer={customer || undefined}
              consent={{
                id: '',
                customerId: '',
                terms: terms,
                signatureData: '',
                signedAt: now(),
                createdAt: now()
              }}
              shopName={settings.shopName || 'Blackroom Studio'}
              artistName={settings.artistName || '원장님'}
              isInteractive={true}
              onCheckboxChange={handleCheckboxChange}
              signatureNode={signatureNode}
            />
          </div>
          
          <div className="px-6 py-4 bg-primary/5 rounded-2xl border border-primary/10 mb-8">
            <p className="text-xs text-primary/70 leading-relaxed font-medium text-center">
              문서를 끝까지 읽으신 후 모든 항목에 동의하시고 서명해 주시기 바랍니다. <br/>
              서명 완료 시 법적 효력을 갖는 전자 문서로 보관됩니다.
            </p>
          </div>
        </div>
      </main>

      {/* Action Footer */}
      <footer className="fixed bottom-0 w-full max-w-screen-md mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-white/5 p-6 pb-12 z-20">
        <div className="flex gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 py-4 px-6 rounded-2xl font-bold border-2 border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
          >
            이전 단계
          </button>
          <button 
            disabled={!isAllAgreed || !hasSigned || isSaving}
            onClick={handleSubmit}
            className={`flex-[2] py-4 px-6 rounded-2xl font-black text-white shadow-xl transition-all ${
              isAllAgreed && hasSigned && !isSaving
                ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 active:scale-95' 
                : 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? '저장 중...' : '동의 및 서명 완료'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Consent;
