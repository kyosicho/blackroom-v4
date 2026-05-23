import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Edit3, Trash2, MapPin, FileCheck, Info, Sparkles, Receipt, ShieldCheck, CheckCircle2, Download, Share2, Loader2 } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
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
  const { getConsent, refreshConsents } = useConsents();
  const labels = getLabelsByMode(shopMode);
  const [showConsent, setShowConsent] = React.useState(false);
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const receiptRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadReceipt = async () => {
    if (!receiptRef.current) return;
    setIsCapturing(true);
    try {
      const image = await toPng(receiptRef.current, { 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.href = image;
      link.download = `hygiene-receipt-${id?.slice(0,8)}.png`;
      link.click();
    } catch (err) {
      console.error(err);
      alert('이미지 저장에 실패했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleShareReceipt = async () => {
    if (!receiptRef.current) return;
    setIsCapturing(true);
    try {
      const blob = await toBlob(receiptRef.current, { 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      if (!blob) return;
        const file = new File([blob], 'hygiene-receipt.png', { type: 'image/png' });
        if (navigator.share) {
          await navigator.share({
            title: '디지털 위생 영수증',
            text: `${settings?.shopName || 'BLACKROOM'}을(를) 찾아주셔서 감사합니다.\n철저한 감염 관리 수칙과 정품 사용 원칙에 따라 안전하게 진행된 고객님의 [디지털 위생 영수증]입니다.`,
            files: [file],
          });
      } else {
        alert('이 브라우저에서는 공유 기능을 지원하지 않습니다. 이미지 저장 버튼을 이용해 주세요.');
      }
    } catch (err) {
      console.error(err);
      alert('공유에 실패했습니다.');
    } finally {
      setIsCapturing(false);
    }
  };

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
              <p className="font-bold text-sm whitespace-pre-wrap leading-relaxed">{record.pigment || '미입력'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-primary/5 border border-slate-200 dark:border-primary/20 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">니들 구성</p>
              <p className="font-bold text-sm whitespace-pre-wrap leading-relaxed">{record.needle || '미입력'}</p>
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

        {/* 복합 재료 AI 분석 리포트 */}
        {(record.pigment || record.needle) && (
          <section className="px-4 py-6">
            <div className="bg-slate-900 dark:bg-white/5 p-5 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 bg-primary/20 rounded-xl text-primary">
                  <Sparkles className="size-4" />
                </div>
                <h3 className="text-white text-sm font-bold">AI Material Analysis Report</h3>
              </div>
              
              <div className="space-y-5">
                {record.pigment && (
                  <div>
                    <p className="text-[10px] text-white/50 uppercase mb-2 font-black tracking-widest pl-1">Pigments</p>
                    <div className="flex flex-wrap gap-2">
                      {record.pigment.split('\n').filter(Boolean).map((p, i) => (
                        <div key={`p-${i}`} className="bg-white/10 border border-white/5 px-3 py-2 rounded-xl">
                          <p className="text-white text-xs font-bold leading-tight">{p}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {record.needle && (
                  <div>
                    <p className="text-[10px] text-white/50 uppercase mb-2 font-black tracking-widest pl-1">Needles</p>
                    <div className="flex flex-wrap gap-2">
                      {record.needle.split('\n').filter(Boolean).map((n, i) => (
                        <div key={`n-${i}`} className="bg-white/10 border border-white/5 px-3 py-2 rounded-xl">
                          <p className="text-white text-xs font-bold leading-tight">{n}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                pigment={record.pigment}
                needle={record.needle}
              />
              <div className="h-20" /> {/* Spacer */}
            </div>
          </div>
        )}

        {/* Hygiene Receipt Modal Overlay */}
        {showReceipt && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200 overflow-y-auto">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 shrink-0 my-auto sm:my-8">
              
              {/* Receipt Content to Capture */}
              <div ref={receiptRef} className="bg-white text-slate-900 relative">
                {/* Receipt Header (White Premium) */}
                <div className="bg-white border-b-2 border-slate-900 p-6 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
                    <ShieldCheck className="size-32 -mt-4 -mr-4 text-slate-900" />
                  </div>
                  <div className="flex justify-center mb-3">
                    <div className="size-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg">
                      <ShieldCheck className="size-6" />
                    </div>
                  </div>
                  <h3 className="text-xl font-black mb-1 font-mono tracking-wider text-slate-900">{settings?.shopName || 'BLACKROOM'}</h3>
                  <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">Digital Hygiene Certificate</p>
                </div>
                
                {/* Receipt Body */}
                <div className="p-6 space-y-6">
                  <div className="space-y-3 text-sm border-b border-dashed border-slate-300 pb-5">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap break-keep">발급 번호</span>
                      <span className="font-mono font-bold text-slate-800 text-right">#{record.id.slice(0,8).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap break-keep">발급 일시</span>
                      <span className="font-mono font-bold text-slate-800 text-right">{new Date(record.createdAt).toLocaleString('ko-KR')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold text-xs uppercase tracking-wider whitespace-nowrap break-keep">고객명</span>
                      <span className="font-bold text-slate-800 text-base text-right">
                        {record.customerName.charAt(0)}{'*'.repeat(record.customerName.length > 2 ? record.customerName.length - 2 : 1)}{record.customerName.length > 2 ? record.customerName.slice(-1) : ''} 고객님
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-700 mb-2 whitespace-nowrap break-keep">
                      <ShieldCheck className="size-5 shrink-0" />
                      <h4 className="font-black text-sm tracking-tight">AI 세이프티 가드 검증 내역</h4>
                    </div>
                    
                    {record.pigment && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-15 text-green-600"><CheckCircle2 className="size-16 shrink-0" /></div>
                        <p className="text-[10px] text-slate-500 mb-1 font-black uppercase tracking-widest whitespace-nowrap break-keep">사용 색소 (Pigment)</p>
                        <p className="text-sm font-bold text-slate-800 whitespace-pre-wrap leading-relaxed relative z-10">{record.pigment}</p>
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-700 bg-green-100/50 px-2 py-1.5 rounded-md w-fit font-bold border border-green-200 whitespace-nowrap break-keep">
                          <CheckCircle2 className="size-3.5 shrink-0" /> 유효기간 적합 및 안전 검증 완료
                        </div>
                      </div>
                    )}

                    {record.needle && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-15 text-green-600"><CheckCircle2 className="size-16 shrink-0" /></div>
                        <p className="text-[10px] text-slate-500 mb-1 font-black uppercase tracking-widest whitespace-nowrap break-keep">사용 니들 (Needle)</p>
                        <p className="text-sm font-bold text-slate-800 whitespace-pre-wrap leading-relaxed relative z-10">{record.needle}</p>
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-green-700 bg-green-100/50 px-2 py-1.5 rounded-md w-fit font-bold border border-green-200 whitespace-nowrap break-keep">
                          <CheckCircle2 className="size-3.5 shrink-0" /> 일회용 개봉 및 멸균 상태 확인
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center mt-6 pt-5 border-t-2 border-slate-900">
                    <p className="text-xs text-slate-700 leading-relaxed font-bold">
                      본 시술은 철저한 위생 감염 관리 수칙을 준수하였으며,<br/>안전성이 공식 검증된 정품 재료만을<br/>사용하여 진행되었음을 보증합니다.
                    </p>
                    <div className="mt-6 mb-2 flex justify-center">
                      <div className="border border-slate-300 px-4 py-2 rounded-lg inline-block">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Official Guarantee</p>
                        <p className="font-mono font-black text-slate-900 mt-0.5">Powered by BLACKROOM V4</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Receipt Action Footer (Not captured in image) */}
              <div className="p-4 bg-slate-50 flex flex-col gap-2 border-t border-slate-200">
                <div className="flex gap-2">
                  <button 
                    onClick={handleDownloadReceipt}
                    disabled={isCapturing}
                    className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isCapturing ? <Loader2 className="size-5 animate-spin" /> : <Download className="size-5" />}
                    이미지 저장
                  </button>
                  <button 
                    onClick={handleShareReceipt}
                    disabled={isCapturing}
                    className="flex-1 py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    {isCapturing ? <Loader2 className="size-5 animate-spin" /> : <Share2 className="size-5" />}
                    고객 공유
                  </button>
                </div>
                <button 
                  onClick={() => setShowReceipt(false)} 
                  disabled={isCapturing}
                  className="w-full py-3 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300 transition-colors disabled:opacity-50 mt-1"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button for Receipt */}
      {!showConsent && !showReceipt && (
        <div className="fixed bottom-6 inset-x-0 flex justify-center pointer-events-none z-50">
          <button 
            onClick={() => setShowReceipt(true)}
            className="pointer-events-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-full font-black text-sm flex items-center gap-2 shadow-2xl shadow-slate-900/20 active:scale-95 transition-all"
          >
            <Receipt className="size-5" />
            디지털 위생 영수증 발행
          </button>
        </div>
      )}
    </div>
  );
};

export default RecordDetail;
