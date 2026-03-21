import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useRecords } from '../context/RecordContext';
import { useConsents } from '../context/ConsentContext';
import { useSettings } from '../context/SettingsContext';
import { useCustomers } from '../context/CustomerContext';
import { now } from '../services/storageService';
import LegalConsentForm from '../components/LegalConsentForm';
import SignaturePad from '../components/SignaturePad';

const Consent: React.FC = () => {
  const navigate = useNavigate();
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const { currentDraft, updateDraft } = useRecords();
  const { settings } = useSettings();
  const { getCustomer } = useCustomers();
  const { addConsent } = useConsents();

  const [terms, setTerms] = useState<boolean[]>([false, false, false]);
  const [isSaving, setIsSaving] = useState(false);

  const customer = currentDraft?.customerId ? getCustomer(currentDraft.customerId) : null;
  const isAllAgreed = terms.every(t => t);
  const hasSigned = !!signatureData;

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newTerms = [...terms];
    newTerms[index] = checked;
    setTerms(newTerms);
  };

  const handleSubmit = async () => {
    if (isSaving || !hasSigned || !isAllAgreed || !signatureData) return;
    
    setIsSaving(true);
    try {
      const consentRecord = await addConsent({
        customerId: currentDraft?.customerId || '',
        appointmentId: currentDraft?.appointmentId,
        terms: terms,
        signatureData: signatureData,
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

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header title="시술 동의서 작성" />
      
      {/* 바닥 여백을 pb-48에서 pb-32로 줄여 불필요한 공백 제거 */}
      <main className="flex-1 overflow-y-auto pb-32 pt-4">
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
              signatureNode={
                <SignaturePad 
                  onSign={setSignatureData} 
                  onClear={() => setSignatureData(null)} 
                  height="h-56" 
                />
              }
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
      {/* z-index와 배경 블러를 강화하고 버튼 흔들림 방지를 위해 min-h 설정 */}
      <footer className="fixed bottom-0 left-0 right-0 w-full max-w-screen-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 p-6 pb-10 z-40">
        <div className="flex gap-4 items-stretch">
          <button 
            onClick={() => navigate(-1)}
            className="flex-1 py-4 px-6 rounded-2xl font-bold border-2 border-slate-100 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all active:scale-95"
          >
            이전 단계
          </button>
          <button 
            disabled={!isAllAgreed || !hasSigned || isSaving}
            onClick={handleSubmit}
            className={`flex-[2] py-4 px-6 rounded-2xl font-black text-white shadow-xl transition-all relative flex items-center justify-center min-h-[56px] ${
              isAllAgreed && hasSigned && !isSaving
                ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20 active:scale-95' 
                : 'bg-slate-200 dark:bg-white/5 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>저장 중...</span>
              </div>
            ) : '동의 및 서명 완료'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Consent;
