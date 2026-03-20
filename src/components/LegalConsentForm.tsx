import React from 'react';
import { Check, Printer } from 'lucide-react';
import type { Customer, Consent } from '../types/types';

interface LegalConsentFormProps {
  customer?: Customer;
  consent: Consent;
  shopName: string;
  artistName: string;
  beforeImage?: string;
  afterImage?: string;
}

const LegalConsentForm: React.FC<LegalConsentFormProps> = ({ customer, consent, shopName, artistName, beforeImage, afterImage }) => {
  return (
    <div className="bg-white text-slate-900 p-8 max-w-2xl mx-auto shadow-xl border border-slate-200 font-serif leading-relaxed relative">
      {/* Print Button - Only visible on screen */}
      <button 
        onClick={() => window.print()}
        className="absolute top-4 right-4 p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-all no-print flex items-center gap-2 shadow-sm"
        title="PDF로 저장 / 인쇄"
      >
        <Printer className="size-5" />
        <span className="text-xs font-bold">PDF/인쇄</span>
      </button>

      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
        <h1 className="text-2xl font-bold tracking-widest mb-2 italic underline underline-offset-8">시술 동의 및 개인정보 제공 동의서</h1>
        <p className="text-sm text-slate-600">INFormed CONSENT AND RELEASE FORM</p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4 mb-8 text-sm border-b border-slate-200 pb-6">
        <div>
          <p className="font-bold mb-2">[고객 정보]</p>
          <div className="space-y-1">
            <p>성 명: <span className="underline px-2">{customer?.name || '________________'}</span></p>
            <p>연락처: <span className="underline px-2">{customer?.phone || '________________'}</span></p>
            <p>일 자: <span className="underline px-2">{new Date(consent.signedAt).toLocaleDateString()}</span></p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold mb-2">[시술 처 정보]</p>
          <div className="space-y-1">
            <p>샵 명: <span className="font-semibold">{shopName}</span></p>
            <p>담당자: <span className="font-semibold">{artistName}</span></p>
          </div>
        </div>
      </div>

      {/* Clauses */}
      <div className="space-y-6 text-xs mb-8">
        <section>
          <h3 className="font-bold mb-2">1. 시술 전 확인 사항 (건강 상태 동의)</h3>
          <div className="grid grid-cols-1 gap-2 border p-3 rounded-md bg-slate-50">
            <div className="flex items-center gap-2">
              <Check className="size-3 text-primary" />
              <span>본인은 만 19세 이상의 성인임을 확인합니다.</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-3 text-primary" />
              <span>켈로이드 피부, 당뇨, 고혈압, 간염 및 전염성 질환이 없음을 고지합니다.</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="size-3 text-primary" />
              <span>현재 임신 중이거나 수유 중이 아니며, 관련 약물을 복용하고 있지 않습니다.</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-bold mb-2">2. 시술 결과 및 부작용 고지</h3>
          <p className="mb-2">본인은 반영구 화장/타투 시술이 피부에 색소를 주입하는 반영구적/영구적 과정임을 이해하며, 다음과 같은 위험 요소가 발생할 수 있음을 충분히 설명 들었습니다.</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>개인의 피부 타입 및 생활 습관에 따라 색소의 정착 정도와 유지 기간이 달라질 수 있습니다.</li>
            <li>시술 직후 며칠간 붓기, 가려움증, 각질 탈락 현상이 발생할 수 있습니다.</li>
            <li>드물게 알레르기 반응이나 감염이 발생할 수 있으나, 이는 시술자의 과실보다는 개인의 체질과 사후 관리에 기인하는 경우가 많음을 인정합니다.</li>
          </ul>
        </section>

        <section>
          <h3 className="font-bold mb-2">3. 사후 관리 및 리터치 규정</h3>
          <p>시술 후 제공되는 주의사항을 엄격히 준수할 것을 약속합니다. 리터치는 시술 후 4주~8주 이내에 진행하는 것을 권장하며, 이 기간을 경과할 경우 추가 비용이 발생할 수 있음에 동의합니다.</p>
        </section>
        
        <section className="border-t pt-4">
          <p className="font-bold mb-2">4. 개인정보 수집 및 활용 동의</p>
          <p>수집된 개인정보 및 시술 전/후 사진은 시술 관리 및 포트폴리오(마케팅 포함) 목적으로 활용될 수 있음에 동의합니다. (식별 가능한 얼굴 부위는 제외 요청 가능)</p>
        </section>
      </div>

      {/* Procedure Photos (v4.3 Added) */}
      {(beforeImage || afterImage) && (
        <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 text-center">[시술 기록 사진 증명]</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-[9px] text-center text-slate-500 font-bold uppercase">Before</p>
              <div className="aspect-square border border-slate-200 bg-white rounded overflow-hidden">
                {beforeImage ? (
                  <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-300">사진 없음</div>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] text-center text-primary font-bold uppercase">After</p>
              <div className="aspect-square border border-primary/30 bg-white rounded overflow-hidden shadow-sm">
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
      <div className="border-2 border-slate-900 p-6 rounded-lg bg-slate-50 relative overflow-hidden">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <p className="text-sm font-bold">본인은 위 조항을 모두 읽고 이해하였으며, <br/> 자유 의사에 따라 시술을 결정하였음을 서명합니다.</p>
            <p className="text-xs text-slate-500 mt-4 underline underline-offset-4">제출 일시: {new Date(consent.signedAt).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs mb-1 font-bold">동의자 서명</p>
            <div className="size-32 border border-slate-300 rounded bg-white flex items-center justify-center p-1">
              {consent.signatureData ? (
                <img src={consent.signatureData} alt="Signature" className="w-full h-full object-contain" />
              ) : (
                <span className="text-slate-300 text-[10px]">서명 정보 없음</span>
              )}
            </div>
            <p className="text-sm mt-2 font-bold">{customer?.name}</p>
          </div>
        </div>
        
        {/* Abstract Stamp UI */}
        <div className="absolute -bottom-4 -right-4 size-24 border-4 border-primary/20 rounded-full flex items-center justify-center -rotate-12 translate-x-4 translate-y-4">
            <span className="text-primary/20 font-black text-xl">OFFICIAL</span>
        </div>
      </div>
      
      <div className="text-center mt-8 text-[10px] text-slate-400">
        <p>© {new Date().getFullYear()} {shopName}. All rights reserved. </p>
        <p>이 문서는 전자적으로 서명되었으며 법적 효력을 가집니다.</p>
      </div>
    </div>
  );
};

export default LegalConsentForm;
