import { useRecords } from '../context/RecordContext';
import { useSettings } from '../context/SettingsContext';
import { getLabelsByMode } from '../utils/constants';

type FilterType = 'all' | 'week' | 'month' | '3months';

const Records: React.FC = () => {
  const navigate = useNavigate();
  const { records, searchRecords } = useRecords();
  const { shopMode } = useSettings();
  const labels = getLabelsByMode(shopMode);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // 필터링
  const filteredRecords = (() => {
    let result = searchQuery.trim() ? searchRecords(searchQuery) : records;

    if (activeFilter !== 'all') {
      const now = new Date();
      let daysBack = 7;
      if (activeFilter === 'month') daysBack = 30;
      if (activeFilter === '3months') daysBack = 90;
      const cutoff = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
      result = result.filter((r) => new Date(r.createdAt) >= cutoff);
    }

    return result;
  })();

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'week', label: '이번 주' },
    { key: 'month', label: '이번 달' },
    { key: '3months', label: '3개월' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-slate-900 dark:text-slate-100 flex size-10 items-center justify-center hover:bg-primary/10 rounded-full transition-colors"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">{labels.procedure} 기록 목록</h1>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="flex w-full items-stretch rounded-xl h-12 bg-slate-200 dark:bg-[#48232c] overflow-hidden ring-1 ring-inset ring-transparent focus-within:ring-primary/50 transition-all">
            <div className="text-slate-500 dark:text-[#c992a0] flex items-center justify-center pl-4">
              <Search className="size-5" />
            </div>
            <input
              className="flex w-full border-none bg-transparent focus:ring-0 text-base font-normal placeholder:text-slate-500 dark:placeholder:text-[#c992a0]/60 outline-none px-3"
              placeholder={`고객명 또는 ${labels.procedure}명 검색`}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-3 px-4 pb-4 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex h-9 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold transition-all active:scale-95 ${
                activeFilter === f.key
                  ? 'bg-primary text-white'
                  : 'bg-slate-200 dark:bg-[#48232c] text-slate-700 dark:text-slate-200 hover:bg-primary/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      {/* Record List */}
      <main className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              onClick={() => navigate(`/record/${record.id}`)}
              className="group flex items-center gap-4 bg-white dark:bg-[#331920] p-3.5 rounded-2xl border border-slate-200 dark:border-primary/10 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              {/* Thumbnail: After -> Before -> Initial */}
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

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-slate-900 dark:text-slate-100 text-base font-bold truncate">{record.customerName}</p>
                </div>
                
                <div className="flex items-center gap-2 mb-1.5">
                  <p className="text-slate-500 dark:text-[#c992a0] text-xs font-medium">
                    {new Date(record.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                  <span className="size-1 bg-slate-300 dark:bg-primary/20 rounded-full"></span>
                  <p className="text-primary/80 dark:text-primary/60 text-xs font-bold truncate">{record.procedureType}</p>
                </div>

                {/* Checklists */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <div className={`p-1 rounded-full ${record.gpsVerified ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <MapPin className="size-3" />
                    </div>
                    <span className={`text-[10px] font-bold ${record.gpsVerified ? 'text-green-600' : 'text-slate-400'}`}>GPS</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <div className={`p-1 rounded-full ${record.consentId ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <FileCheck className="size-3" />
                    </div>
                    <span className={`text-[10px] font-bold ${record.consentId ? 'text-green-600' : 'text-slate-400'}`}>동의서</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className={`p-1 rounded-full ${record.postGuideConfirmed ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Info className="size-3" />
                    </div>
                    <span className={`text-[10px] font-bold ${record.postGuideConfirmed ? 'text-green-600' : 'text-slate-400'}`}>안내</span>
                  </div>
                </div>
              </div>

              <div className="text-slate-400 group-hover:text-primary transition-colors">
                <ChevronRight className="size-5" />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
            <p className="text-lg font-semibold mb-2">기록이 없습니다</p>
            <p className="text-sm">새 {labels.procedure}을 시작하여 기록을 추가하세요</p>
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        onClick={() => navigate('/guide')}
        className="fixed right-6 bottom-24 size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20"
      >
        <Plus className="size-7" />
      </button>
    </div>
  );
};

export default Records;
