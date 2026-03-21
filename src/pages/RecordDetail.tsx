import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Edit3, Trash2, MapPin, FileCheck, Info, Sparkles } from 'lucide-react';
import { useRecords } from '../context/RecordContext';
import { useSettings } from '../context/SettingsContext';
import { useCustomers } from '../context/CustomerContext';
import { useConsents } from '../context/ConsentContext';
import { getLabelsByMode } from '../utils/constants';
import LegalConsentForm from '../components/LegalConsentForm';
import { ChevronRight } from 'lucide-react';


const RecordDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
   const { getRecord, deleteRecord } = useRecords();
  const { settings, shopMode } = useSettings();
  const { getCustomer } = useCustomers();
  const { getConsent } = useConsents();
  const labels = getLabelsByMode(shopMode);
  const [showConsent, setShowConsent] = React.useState(false);

  const record = id ? getRecord(id) : null;
  const customer = record ? getCustomer(record.customerId) : null;
  const consent = record?.consentId ? getConsent(record.consentId) : null;

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-xl font-bold mb-4">기록을 찾을 수 없습니다</p>
        <button onClick={() => navigate('/records')} className="text-primary font-semibold hover:underline">
          기록 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('이 시술 기록을 삭제하시겠습니까?')) {
      deleteRecord(record.id);
      navigate('/records');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-4 sticky top-0 bg-background-light dark:bg-background-dark z-10 border-b border-slate-200 dark:border-primary/20">
        <button onClick={() => navigate('/records')} className="p-2 hover:bg-slate-100 dark:hover:bg-primary/10 rounded-full transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold tracking-tight">{labels.procedure} 기록 상세</h1>
        <div className="flex gap-2">
          <button onClick={() => navigate(`/record/${record.id}/edit`)} className="p-2 hover:bg-slate-100 dark:hover:bg-primary/10 rounded-full transition-colors">
            <Edit3 className="size-5 text-slate-600 dark:text-slate-300" />
          </button>
          <button onClick={handleDelete} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
            <Trash2 className="size-5 text-red-500" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {/* 고객 정보 카드 */}
        <section className="px-4 py-4">
          <div className="flex items-center gap-4 bg-white dark:bg-[#331920] p-4 rounded-2xl border border-slate-200 dark:border-primary/10 shadow-sm">
            <div className="relative size-16 shrink-0 rounded-xl overflow-hidden border border-slate-100 dark:border-primary/20 bg-primary/10 flex items-center justify-center shadow-inner">
              {record.afterImage ? (
                <img className="w-full h-full object-cover" src={record.afterImage} alt="After" />
              ) : record.beforeImage ? (
                <img className="w-full h-full object-cover" src={record.beforeImage} alt="Before" />
              ) : (
                <span className="text-primary text-xl font-bold">{record.customerName.charAt(0)}</span>
              )}
              {record.afterImage && (
                <div className="absolute top-0 left-0 bg-primary text-[8px] text-white px-1 font-bold uppercase">After</div>
              )}
            </div>
            <div className="flex flex-col justify-center flex-1">
              <p className="text-xl font-bold leading-tight mb-1">{record.customerName}</p>
              <p className="text-primary text-sm font-semibold">{record.procedureType}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-[10px] text-slate-400 font-medium">{new Date(record.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </section>

        {/* 핵심 절차 체크리스트 */}
        <section className="px-4 py-2">
          <div className="grid grid-cols-3 gap-3">
            <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${record.gpsVerified ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
              <MapPin className={`size-5 mb-1 ${record.gpsVerified ? 'text-green-600' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold ${record.gpsVerified ? 'text-green-700' : 'text-slate-500'}`}>GPS 인증</span>
            </div>
            <div 
              onClick={() => consent && setShowConsent(true)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${record.consentId ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
              <FileCheck className={`size-5 mb-1 ${record.consentId ? 'text-green-600' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold ${record.consentId ? 'text-green-700' : 'text-slate-500'}`}>동의서 서명</span>
              {record.consentId && <span className="text-[8px] text-green-600 opacity-70 mt-0.5 underline">원본 보기</span>}
            </div>
            <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${record.postGuideConfirmed ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
              <Info className={`size-5 mb-1 ${record.postGuideConfirmed ? 'text-green-600' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold ${record.postGuideConfirmed ? 'text-green-700' : 'text-slate-500'}`}>{labels.guide?.replace(' 후 관리', '')} 안내</span>
            </div>
          </div>
        </section>

        {/* 사진 기록 */}
        <section className="px-4 py-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">{labels.procedure} 사진 기록</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold text-slate-500 uppercase">{labels.procedure} 전 (Before)</p>
              </div>
              {record.beforeImage ? (
                <div className="aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-primary/20 shadow-sm">
                  <img src={record.beforeImage} alt="Before" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-primary/10 bg-slate-50 dark:bg-primary/5 flex flex-col items-center justify-center">
                  <Camera className="size-8 text-slate-300 dark:text-primary/20 mb-1" />
                  <span className="text-[10px] text-slate-300 font-medium">사진 없음</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <p className="text-xs font-bold text-primary uppercase">{labels.procedure} 후 (After)</p>
              </div>
              {record.afterImage ? (
                <div className="aspect-square rounded-2xl overflow-hidden border-2 border-primary shadow-md">
                  <img src={record.afterImage} alt="After" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center">
                  <Camera className="size-8 text-primary/30 mb-1" />
                  <span className="text-[10px] text-primary/30 font-medium">사진 없음</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 상세 정보 */}
        <section className="px-4 py-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">사용 {labels.pigment}</p>
              <p className="font-bold text-sm">{record.pigment || '미입력'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">니들 구성</p>
              <p className="font-bold text-sm">{record.needle || '미입력'}</p>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{labels.procedure} 메모</p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{record.notes || '작성된 메모가 없습니다.'}</p>
          </div>
        </section>

        {/* 법적 동의서 섹션 (v4.2 Enhanced) */}
        <section className="px-4 py-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">보안 및 법적 서류</h3>
          <div 
            onClick={() => {
              if (record.consentId) {
                if (consent) {
                  setShowConsent(true);
                } else {
                  alert('동의서 데이터를 불러오는 중이거나 찾을 수 없습니다.');
                  refreshConsents(); // Re-attempt to load
                }
              }
            }}
            className={`group relative overflow-hidden bg-white dark:bg-primary/5 border transition-all rounded-3xl p-6 cursor-pointer shadow-sm ${
              record.consentId 
                ? 'border-green-200 dark:border-green-900/40' 
                : 'border-slate-200 dark:border-primary/10'
            }`}
          >
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${record.consentId ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <FileCheck className="size-8" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg mb-1">{labels.procedure} 동의서</h4>
                {record.consentId ? (
                  <div className="space-y-1">
                    <p className="text-sm text-green-600 font-bold flex items-center gap-1">
                      <span className="size-1.5 bg-green-500 rounded-full animate-pulse" />
                      법적 서명 완료
                    </p>
                    <p className="text-[11px] text-slate-400">원본 문서를 보려면 여기를 터치하세요.</p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 font-medium">작성된 동의서가 없습니다.</p>
                )}
              </div>
              <ChevronRight className={`size-6 transition-transform group-hover:translate-x-1 ${record.consentId ? 'text-green-300' : 'text-slate-300'}`} />
            </div>
            
            {/* 배경 문양 (전문성 강조) */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <FileCheck className="size-32 rotate-12" />
            </div>
          </div>
        </section>

        {/* AI 분석 요약 리포트 */}
        {record.aiScanResult && (
          <section className="px-4 py-6">
            <div className="bg-slate-900 dark:bg-white/5 p-5 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-primary/20 rounded-xl text-primary">
                  <Sparkles className="size-4" />
                </div>
                <h3 className="text-white text-sm font-bold">AI Material Analysis Report</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 p-3 rounded-2xl text-center">
                  <p className="text-[9px] text-white/40 uppercase mb-1">Pigment Brand</p>
                  <p className="text-white text-xs font-bold">{record.aiScanResult.pigmentBrand}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl text-center">
                  <p className="text-[9px] text-white/40 uppercase mb-1">Pigment Color</p>
                  <p className="text-white text-xs font-bold">{record.aiScanResult.pigmentColor}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl text-center">
                  <p className="text-[9px] text-white/40 uppercase mb-1">Needle Type</p>
                  <p className="text-white text-xs font-bold">{record.aiScanResult.needleType}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl text-center">
                  <p className="text-[9px] text-white/40 uppercase mb-1">Needle Size</p>
                  <p className="text-white text-xs font-bold">{record.aiScanResult.needleSize}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="px-4 py-8 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            {labels.procedure} 기록 ID: {record.id.slice(0, 8).toUpperCase()} • {labels.procedure} 일시: {new Date(record.createdAt).toLocaleString('ko-KR')}
          </p>
        </section>

        {/* Consent Modal Overlay */}
        {showConsent && consent && (
          <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex justify-between items-center p-4 bg-background-light dark:bg-background-dark border-b border-primary/10">
              <h3 className="font-bold">동의서 원본 확인</h3>
              <button onClick={() => setShowConsent(false)} className="text-sm font-bold text-primary">닫기</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-900/40">
              <LegalConsentForm 
                consent={consent}
                customer={customer || undefined}
                shopName={settings.shopName || 'Blackroom Studio'}
                artistName={settings.artistName || '원장님'}
                beforeImage={record.beforeImage}
                afterImage={record.afterImage}
              />
              <div className="h-20" /> {/* Spacer */}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default RecordDetail;
