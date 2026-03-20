import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import Header from '../components/Header';
import { useRecords } from '../context/RecordContext';
import { useConsents } from '../context/ConsentContext';
import { now } from '../services/storageService';

const Consent: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const { currentDraft, updateDraft } = useRecords();
  const [agreements, setAgreements] = useState({
    term1: false,
    term2: false,
    term3: false,
  });

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setAgreements(prev => ({ ...prev, [id]: checked }));
  };

  const isAllAgreed = agreements.term1 && agreements.term2 && agreements.term3;

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
      ctx.strokeStyle = '#ee2b5b';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
    }
  };

  const { addConsent } = useConsents();

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (isSaving || !hasSigned) return;
    
    setIsSaving(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 서명 데이터를 base64로 저장
      const signatureData = canvas.toDataURL('image/png');

      // 동의서 레코드 저장 (Context 사용) - await 추가!
      const consentRecord = await addConsent({
        customerId: currentDraft?.customerId || '',
        appointmentId: currentDraft?.appointmentId,
        terms: [agreements.term1, agreements.term2, agreements.term3],
        signatureData,
        signedAt: now(),
      });

      // 드래프트에 동의서 ID 추가
      updateDraft({ consentId: consentRecord.id });

      // 잠시 지연하여 상태 반영 보장
      setTimeout(() => {
        setIsSaving(false);
        navigate('/scan-loading');
      }, 300);
    } catch (err) {
      console.error('Consent Submit Error:', err);
      alert('서명 저장 중 오류가 발생했습니다. 다시 시도해 주세요.');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Header title="시술 동의서" />
      
      <main className="flex-1 overflow-y-auto pb-48">
        <div className="p-4">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-primary">2단계 / 전체 4단계</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">약관 및 조건</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: '50%' }}></div>
            </div>
          </div>

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-3">시술 동의 안내</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                아래 내용을 주의 깊게 읽어주시기 바랍니다. 서명함으로써 귀하는 PMU/타투 시술과 관련된 알레르기 반응, 감염 및 영구적인 피부 변화 가능성을 포함한 위험 요소를 인지하였음을 동의합니다.
              </p>
            </div>

            {/* Agreement List */}
            <div className="space-y-4">
              {[
                { id: 'term1', label: '만 18세 이상이며 약물이나 알코올의 영향을 받지 않은 상태임을 확인합니다.' },
                { id: 'term2', label: '시술 결과는 피부 타입, 생활 습관 및 사후 관리에 따라 달라질 수 있음을 이해합니다.' },
                { id: 'term3', label: '질환, 알레르기, 금속 및 색소 민감도 등 모든 의료 정보를 사실대로 고지하였습니다.' },
              ].map(term => (
                <div key={term.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5">
                  <div className="flex items-center h-5">
                    <input 
                      id={term.id}
                      type="checkbox"
                      checked={agreements[term.id as keyof typeof agreements]}
                      onChange={handleCheckboxChange}
                      className="w-5 h-5 rounded border-slate-300 dark:border-primary/40 text-primary focus:ring-primary bg-transparent"
                    />
                  </div>
                  <label className="text-sm text-slate-600 dark:text-slate-300 cursor-pointer" htmlFor={term.id}>
                    {term.label}
                  </label>
                </div>
              ))}
            </div>

            {/* Signature Pad */}
            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">전자 서명</h3>
              <div className="relative h-48 w-full rounded-xl border-2 border-dashed border-slate-300 dark:border-primary/30 bg-slate-50 dark:bg-primary/10 flex items-center justify-center overflow-hidden">
                {!hasSigned && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                    <Edit2 className="size-12 text-primary" />
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
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                />
                <button 
                  onClick={clearCanvas}
                  className="absolute bottom-2 right-2 text-xs font-medium px-3 py-1 bg-slate-200 dark:bg-primary/20 rounded-full text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
                >
                  지우기
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center italic">
                위 서명을 통해 법적 효력이 있는 전자 서명을 제공합니다.
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="fixed bottom-0 w-full max-w-screen-md mx-auto bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-primary/20 p-4 pb-12">
        <div className="flex gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 py-4 px-6 rounded-xl font-semibold border border-slate-300 dark:border-primary/40 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors"
          >
            이전
          </button>
          <button 
            disabled={!isAllAgreed || !hasSigned}
            onClick={handleSubmit}
            className={`flex-[2] py-4 px-6 rounded-xl font-semibold text-white shadow-lg transition-all ${
              isAllAgreed && hasSigned
                ? 'bg-primary shadow-primary/20 hover:bg-primary/90' 
                : 'bg-slate-300 dark:bg-slate-700 shadow-none cursor-not-allowed'
            }`}
          >
            서명 완료
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Consent;
