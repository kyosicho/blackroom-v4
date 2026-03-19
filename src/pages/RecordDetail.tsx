import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Edit3, Trash2 } from 'lucide-react';
import { useRecords } from '../context/RecordContext';

const statusLabel: Record<string, string> = {
  'completed': '시술 완료',
  'touch-up': '리터치 필요',
  'consulting': '상담 진행',
  'in-progress': '시술 진행중',
};

const statusColor: Record<string, string> = {
  'completed': 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  'touch-up': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  'consulting': 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  'in-progress': 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
};

const RecordDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getRecord, deleteRecord } = useRecords();

  const record = id ? getRecord(id) : null;

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
        <h1 className="text-lg font-bold tracking-tight">시술 기록 상세</h1>
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
          <div className="flex items-center gap-4 bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10">
            <div className="size-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold border-2 border-primary shrink-0">
              {record.customerName.charAt(0)}
            </div>
            <div className="flex flex-col justify-center flex-1">
              <p className="text-lg font-bold leading-none mb-1">{record.customerName}</p>
              <p className="text-primary text-sm font-medium">{record.procedureType}</p>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor[record.status] || statusColor['in-progress']}`}>
              {statusLabel[record.status] || record.status}
            </span>
          </div>
        </section>

        {/* 시술 정보 */}
        <section className="px-4 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">시술 상세 정보</h3>
          <div className="space-y-4">
            <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 p-4 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">사용 색소</p>
              <p className="font-medium">{record.pigment || '미입력'}</p>
            </div>
            <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 p-4 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">니들 구성</p>
              <p className="font-medium">{record.needle || '미입력'}</p>
            </div>
            <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 p-4 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">시술 메모</p>
              <p className="font-medium text-sm leading-relaxed">{record.notes || '메모 없음'}</p>
            </div>
          </div>
        </section>

        {/* AI 스캔 결과 */}
        {record.aiScanResult && (
          <section className="px-4 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">AI 분석 결과</h3>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4 rounded-xl space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">피부 타입</span>
                <span className="text-sm font-semibold">{record.aiScanResult.skinType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">수분도</span>
                <span className="text-sm font-semibold">{record.aiScanResult.hydration}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">민감도</span>
                <span className="text-sm font-semibold">{record.aiScanResult.sensitivity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">추천 색소</span>
                <span className="text-sm font-semibold text-primary">{record.aiScanResult.recommendedPigment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">추천 니들</span>
                <span className="text-sm font-semibold text-primary">{record.aiScanResult.recommendedNeedle}</span>
              </div>
            </div>
          </section>
        )}

        {/* 사진 기록 */}
        <section className="px-4 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-70">사진 기록</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">시술 전</p>
              {record.beforeImage ? (
                <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-primary/20">
                  <img src={record.beforeImage} alt="Before" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-primary/20 bg-slate-100 dark:bg-primary/5 flex flex-col items-center justify-center">
                  <Camera className="size-8 text-slate-400 dark:text-primary/40 mb-1" />
                  <span className="text-[10px] text-slate-400 dark:text-primary/40 font-medium">사진 없음</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-primary uppercase ml-1">시술 후</p>
              {record.afterImage ? (
                <div className="aspect-square rounded-xl overflow-hidden border border-primary">
                  <img src={record.afterImage} alt="After" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-square rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center">
                  <Camera className="size-8 text-primary/40 mb-1" />
                  <span className="text-[10px] text-primary/40 font-medium">사진 없음</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 메타 정보 */}
        <section className="px-4 py-4 mb-10">
          <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
            <p>생성: {new Date(record.createdAt).toLocaleString('ko-KR')}</p>
            <p>수정: {new Date(record.updatedAt).toLocaleString('ko-KR')}</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default RecordDetail;
