import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Sparkles, Camera, Plus, ShieldCheck, X } from 'lucide-react';
import { useRecords } from '../context/RecordContext';

const RecordAIScan: React.FC = () => {
  const navigate = useNavigate();
  const { currentDraft, updateDraft, saveDraft } = useRecords();
  const beforeImageRef = useRef<HTMLInputElement>(null);
  const afterImageRef = useRef<HTMLInputElement>(null);
  const additionalImageRef = useRef<HTMLInputElement>(null);

  const [pigment, setPigment] = useState(currentDraft?.pigment || '');
  const [needle, setNeedle] = useState(currentDraft?.needle || '');
  const [notes, setNotes] = useState(currentDraft?.notes || '');
  const [beforeImage, setBeforeImage] = useState<string | undefined>(currentDraft?.beforeImage);
  const [afterImage, setAfterImage] = useState<string | undefined>(currentDraft?.afterImage);
  const [additionalImages, setAdditionalImages] = useState<string[]>(currentDraft?.additionalImages || []);
  const [postGuideConfirmed, setPostGuideConfirmed] = useState(currentDraft?.postGuideConfirmed || false);

  const handleImageUpload = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBeforeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, (dataUrl) => setBeforeImage(dataUrl));
  };

  const handleAfterImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, (dataUrl) => setAfterImage(dataUrl));
  };

  const handleAdditionalImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file, (dataUrl) => setAdditionalImages((prev) => [...prev, dataUrl]));
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const finalData = {
      pigment,
      needle,
      notes,
      beforeImage,
      afterImage,
      additionalImages,
      postGuideConfirmed,
      status: 'completed' as const,
    };

    // 로컬 상태를 드래프트에 먼저 반영 (후속 작업을 위해)
    updateDraft(finalData);

    // 최신 데이터를 직접 넘겨서 즉시 저장 (비동기 유실 방지)
    const saved = saveDraft(finalData);
    if (saved) {
      navigate('/records');
    } else {
      alert('시술 기록이 저장되었습니다.');
      navigate('/records');
    }
  };

  const handleQuickSave = () => {
    const finalData = {
      pigment,
      needle,
      notes,
      beforeImage,
      afterImage,
      additionalImages,
      postGuideConfirmed,
    };
    updateDraft(finalData);
    const saved = saveDraft(finalData);
    if (saved) {
      navigate('/records');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
        <button 
          onClick={() => navigate(-1)} 
          className="text-primary flex size-12 shrink-0 items-center justify-start cursor-pointer hover:bg-primary/10 rounded-full transition-colors"
        >
          <ArrowLeft className="size-6" />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1">새 시술 기록</h2>
        <div className="flex w-12 items-center justify-end">
          <button 
            onClick={handleQuickSave} 
            className="flex items-center justify-center rounded-lg size-10 bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            <Check className="size-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto pb-32">
        {/* Customer Info */}
        <section className="px-4 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">고객 정보</h3>
          <div className="flex items-center gap-4 bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10">
            <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold border-2 border-primary shrink-0">
              {currentDraft?.customerName?.charAt(0) || '?'}
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-lg font-bold leading-none mb-1">{currentDraft?.customerName || '고객 미선택'}</p>
              <p className="text-primary text-sm font-medium">{currentDraft?.procedureType || '시술 미선택'}</p>
            </div>
          </div>
        </section>

        {/* Procedure Details */}
        <section className="px-4 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">시술 상세 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">사용 색소</span>
                <button 
                  onClick={() => navigate('/scan-loading')}
                  className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-0.5 rounded-full"
                >
                  <Sparkles className="size-3" />
                  <span className="text-[10px] font-bold uppercase">AI 스캔</span>
                </button>
              </div>
              <input 
                className="block w-full rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary h-12 px-4 outline-none transition-all" 
                value={pigment}
                onChange={(e) => setPigment(e.target.value)}
                placeholder="예: EB22 다크 브라운"
                type="text"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">니들 구성</span>
                <button 
                  onClick={() => navigate('/scan-loading')}
                  className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-0.5 rounded-full"
                >
                  <Sparkles className="size-3" />
                  <span className="text-[10px] font-bold uppercase">AI 스캔</span>
                </button>
              </div>
              <input 
                className="block w-full rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary h-12 px-4 outline-none transition-all" 
                value={needle}
                onChange={(e) => setNeedle(e.target.value)}
                placeholder="예: 1RL 0.25mm"
                type="text"
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <span className="text-slate-700 dark:text-slate-300 text-sm font-medium mb-1.5 ml-1">시술 메모</span>
              <textarea 
                className="block w-full rounded-xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-primary/5 text-slate-900 dark:text-slate-100 focus:ring-primary focus:border-primary p-4 outline-none transition-all" 
                placeholder="피부 반응, 머신 속도 등을 기록하세요." 
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Photo Section */}
        <section className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider opacity-70">사진 기록</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Before Image */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">시술 전</p>
              <div 
                onClick={() => beforeImageRef.current?.click()}
                className="relative group aspect-square rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-primary/20 bg-slate-100 dark:bg-primary/5 flex flex-col items-center justify-center cursor-pointer"
              >
                {beforeImage ? (
                  <>
                    <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="size-8 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="size-8 text-slate-400 dark:text-primary/40 mb-1" />
                    <span className="text-[10px] text-slate-400 dark:text-primary/40 font-bold uppercase">비포 등록</span>
                  </>
                )}
              </div>
              <input ref={beforeImageRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleBeforeImage} />
            </div>

            {/* After Image */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-primary uppercase ml-1">시술 후</p>
              <div 
                onClick={() => afterImageRef.current?.click()}
                className="aspect-square rounded-xl overflow-hidden border-2 border-primary bg-primary/10 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform relative group"
              >
                {afterImage ? (
                  <>
                    <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="size-8 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <Camera className="size-8 text-primary mb-1" />
                    <span className="text-primary text-[10px] font-bold uppercase">애프터 등록</span>
                  </>
                )}
              </div>
              <input ref={afterImageRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAfterImage} />
            </div>
          </div>

          {/* Additional Images */}
          <div className="grid grid-cols-4 gap-2">
            {additionalImages.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-primary/10 group">
                <img src={img} alt={`추가 ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeAdditionalImage(i)}
                  className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <div 
              onClick={() => additionalImageRef.current?.click()}
              className="aspect-square rounded-lg overflow-hidden bg-slate-200 dark:bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors"
            >
              <Plus className="size-6 text-primary/40" />
            </div>
            <input ref={additionalImageRef} type="file" accept="image/*" className="hidden" onChange={handleAdditionalImage} />
          </div>
        </section>

        {/* Complete Section */}
        <section className="px-4 py-4 mb-4">
          <div className="bg-primary p-6 rounded-3xl shadow-xl shadow-primary/20 flex flex-col items-center text-center">
            <ShieldCheck className="size-10 text-white mb-2" />
            <h4 className="text-white font-bold text-lg">기록 저장 및 서명</h4>
            <p className="text-white/80 text-sm mb-6">시술을 마무리하기 위해 기록을 완료해 주세요.</p>
            
            <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 flex items-center gap-3 border border-white/20">
              <input 
                id="guideConfirm"
                type="checkbox" 
                checked={postGuideConfirmed}
                onChange={(e) => setPostGuideConfirmed(e.target.checked)}
                className="size-6 rounded-lg border-white/30 bg-transparent text-white focus:ring-white transition-all"
              />
              <label htmlFor="guideConfirm" className="text-white font-bold text-sm cursor-pointer">
                시술 후 주의사항 안내 완료
              </label>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-white text-primary font-bold py-4 rounded-xl hover:bg-slate-100 transition-colors shadow-lg active:scale-[0.98]"
            >
              시술 완료하기
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RecordAIScan;
