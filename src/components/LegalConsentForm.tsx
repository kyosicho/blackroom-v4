import React, { useRef, useState } from 'react';
import { Check, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { Customer, Consent } from '../types/types';

interface LegalConsentFormProps {
  customer?: Customer;
  consent: Consent;
  shopName: string;
  artistName: string;
  beforeImage?: string;
  afterImage?: string;
  pigment?: string;
  needle?: string;
  isInteractive?: boolean;
  onCheckboxChange?: (index: number, checked: boolean) => void;
  signatureNode?: React.ReactNode;
}

const LegalConsentForm: React.FC<LegalConsentFormProps> = ({ 
  customer, 
  consent, 
  shopName, 
  artistName, 
  beforeImage, 
  afterImage, 
  pigment,
  needle,
  isInteractive = false,
  onCheckboxChange,
  signatureNode
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleDownloadImage = async () => {
    if (!formRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(formRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `동의서_${customer?.name || '고객'}_${new Date().toISOString().slice(0,10)}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to capture consent form:', err);
      alert('이미지 저장 중 오류가 발생했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div ref={formRef} className={`bg-white text-slate-900 p-6 sm:p-10 max-w-2xl mx-auto font-serif leading-relaxed relative ${isInteractive ? 'shadow-none border-b-0 rounded-t-3xl' : 'shadow-xl border border-slate-200 rounded-lg'}`}>
      {/* Print Button - Only visible on screen and not in interactive mode */}
      {!isInteractive && (
        <button 
          onClick={handleDownloadImage}
          disabled={isCapturing}
          className="absolute top-4 right-4 p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all flex items-center gap-2 shadow-sm z-10"
          title="이미지로 저장"
          data-html2canvas-ignore="true"
        >
          {isCapturing ? <Loader2 className="size-5 animate-spin" /> : <Download className="size-5" />}
          <span className="text-xs font-bold">{isCapturing ? '저장 중...' : '이미지 저장'}</span>
        </button>
      )}

      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-6 mb-8 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-widest mb-2 italic underline underline-offset-8">시술 동의 및 개인정보 제공 동의서</h1>
        <p className="text-[10px] sm:text-xs text-slate-600">INFormed CONSENT AND RELEASE FORM</p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 mb-8 text-[11px] sm:text-sm border-b border-slate-200 pb-6">
        <div>
          <p className="font-bold mb-2 text-primary">[고객 정보]</p>
          <div className="space-y-1">
            <p>성 명: <span className="underline underline-offset-4 px-2 font-bold">{customer?.name || '________________'}</span></p>
            <p>연락처: <span className="underline underline-offset-4 px-2">{customer?.phone || '________________'}</span></p>
            <p>일 자: <span className="underline underline-offset-4 px-2">{new Date(consent.signedAt).toLocaleDateString()}</span></p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold mb-2 text-primary">[시술 처 정보]</p>
          <div className="space-y-1">
            <p>샵 명: <span className="font-bold">{shopName}</span></p>
            <p>담당자: <span className="font-bold">{artistName}</span></p>
          </div>
        </div>
      </div>

      {/* Procedure Material Info */}
      {(pigment || needle) && (
        <div className="mb-8 text-[11px] sm:text-sm border border-slate-200 bg-slate-50 p-4 rounded-xl">
          <p className="font-bold mb-3 text-slate-700 underline underline-offset-4">[사용 재료 내역]</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-1">■ 사용 색소</p>
              <p className="whitespace-pre-wrap font-medium text-slate-800 leading-relaxed">{pigment || '해당 없음'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold mb-1">■ 니들 구성</p>
              <p className="whitespace-pre-wrap font-medium text-slate-800 leading-relaxed">{needle || '해당 없음'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Clauses */}
      <div className="space-y-8 text-xs mb-8">
        <section>
          <h3 className="font-bold mb-4 border-l-4 border-slate-900 pl-3 text-sm uppercase">시술 항목 동의 및 위험 고지</h3>
          <div className="grid grid-cols-1 gap-4 border-2 border-slate-100 p-5 rounded-2xl bg-slate-50/50">
            {[
              "본인은 만 19세 이상의 성인이며 현재 신체적, 정신적으로 시술에 적합한 상태임을 확인합니다.",
              "피부 타입 및 사후 관리에 따라 시술 결과(발색, 유지력)에 차이가 발생할 수 있음을 인지하였습니다.",
              "알레르기, 질환, 복용 약물 등 모든 의료 정보를 성실히 고지하였으며 이로 인한 책임은 본인에게 있음을 동의합니다."
            ].map((text, idx) => (
              <div 
                key={idx} 
                className={`flex gap-4 p-3 rounded-xl transition-all ${isInteractive ? 'cursor-pointer hover:bg-white hover:shadow-sm active:scale-[0.98]' : ''}`}
                onClick={() => isInteractive && onCheckboxChange?.(idx, !consent.terms[idx])}
              >
                <div className="flex items-center h-5">
                  <div className={`size-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all ${consent.terms[idx] ? 'bg-slate-900 border-slate-900 shadow-md transform scale-110' : 'border-slate-300 bg-white'}`}>
                    {consent.terms[idx] && <Check className="size-4 text-white stroke-[3]" />}
                  </div>
                </div>
                <span className={`text-[13px] leading-relaxed ${consent.terms[idx] ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>{text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="px-1">
          <h3 className="font-bold mb-2 text-sm uppercase">2. 시술 결과 및 사후 관리</h3>
          <div className="space-y-3 text-slate-600 leading-normal bg-white p-4 rounded-xl border border-slate-100">
            <p>● 시술 후 제공되는 주의사항을 엄격히 준수할 것을 약속하며, 미준수로 인한 시술 결과 저하에 대해 개인의 책임을 인정합니다.</p>
            <p>● 리터치는 시술 후 4~8주 이내 권장하며, 기간 경과 시 추가 비용이 발생할 수 있음에 동의합니다.</p>
          </div>
        </section>
        
        <section className="border-t border-slate-200 pt-6 px-1">
          <p className="font-bold mb-2 text-sm uppercase">3. 개인정보 및 초상권 활용 동의</p>
          <p className="text-slate-500 leading-relaxed italic">
            수집된 개인정보 및 시술 전/후 사진은 시술 관리 및 포트폴리오 활용 목적으로 사용될 수 있으며, 식별 가능한 얼굴 부위 제외 요청이 가능함을 안내받았습니다.
          </p>
        </section>
      </div>

      {/* Procedure Photos */}
      {!isInteractive && (beforeImage || afterImage) && (
        <div className="mb-10 p-5 bg-slate-50/80 border border-slate-200 rounded-2xl shadow-inner">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-4 text-center tracking-widest bg-white py-1 inline-block px-4 rounded-full mx-auto block w-fit shadow-subtle">[ 시술 기록 증명 전/후 사진 ]</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-[10px] text-center text-slate-400 font-black uppercase">Before</p>
              <div className="aspect-square border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                {beforeImage ? (
                  <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">사진 없음</div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-center text-primary font-black uppercase">After</p>
              <div className="aspect-square border-2 border-primary/20 bg-white rounded-2xl overflow-hidden shadow-md">
                {afterImage ? (
                  <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">사진 없음</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Area */}
      <div className={`p-8 rounded-3xl bg-slate-50 border-2 relative overflow-hidden transition-all duration-500 ${isInteractive ? 'border-primary/20 bg-primary/5 shadow-2xl scale-[1.01]' : 'border-slate-900'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 text-center sm:text-left">
          <div className="space-y-3 flex-1">
            <p className="text-sm sm:text-base font-black leading-tight text-slate-900">
              본인은 위 본문의 모든 내용을 충분히 읽고 이해하였으며, <br className="hidden sm:block"/> 자신의 자유 의사에 따라 본 시술을 결정하였음을 서명합니다.
            </p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-200 pb-1 w-fit">
              제출 일시: {new Date(consent.signedAt).toLocaleString()}
            </p>
          </div>
          
          {isInteractive && signatureNode ? (
            <div className="w-full sm:w-48 shrink-0">
              <p className="text-[10px] mb-2 font-black text-primary uppercase tracking-widest text-center">여기에 서명해 주세요</p>
              {signatureNode}
            </div>
          ) : !isInteractive && (
            <div className="text-center w-32 shrink-0">
              <p className="text-[10px] mb-2 font-black text-slate-400 uppercase tracking-widest">동의자 서명</p>
              <div className="size-32 border border-slate-300 rounded-3xl bg-white flex items-center justify-center p-2 shadow-inner transform -rotate-3 hover:rotate-0 transition-transform">
                {consent.signatureData ? (
                  <img 
                    src={consent.signatureData} 
                    alt="Signature" 
                    className="w-full h-full object-contain" 
                    style={{ filter: 'grayscale(1) brightness(0) contrast(1.2)' }}
                  />
                ) : (
                  <span className="text-slate-300 text-[10px]">서명 정보 없음</span>
                )}
              </div>
              <p className="text-lg mt-3 font-black text-slate-900 font-serif italic border-b-2 border-slate-900 inline-block px-2">{customer?.name}</p>
            </div>
          )}
        </div>
        
        {/* Abstract Stamp UI */}
        <div className="absolute -bottom-6 -right-6 size-32 border-8 border-primary/10 rounded-full flex items-center justify-center -rotate-12 pointer-events-none">
            <span className="text-primary/10 font-black text-2xl uppercase tracking-tighter">OFFICIAL RECORD</span>
        </div>
      </div>
      
      <div className="text-center mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-widest pb-4">
        <p>© {new Date().getFullYear()} {shopName}. DESIGNATED LEGAL DOCUMENT </p>
        <p className="mt-1 opacity-50">이 문서는 본 앱을 통해 전자적으로 서명되었으며 법적 효력을 가집니다.</p>
      </div>
    </div>
  );
};

export default LegalConsentForm;
