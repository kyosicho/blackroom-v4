import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, PlusCircle, ChevronRight, TrendingUp } from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';
import { useAppointments } from '../context/AppointmentContext';
import { useRecords } from '../context/RecordContext';
import { STORAGE_KEYS } from '../services/storageService';
import { useLanguage } from '../context/LanguageContext';
import WeeklyCalendar from '../components/WeeklyCalendar';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { searchCustomers } = useCustomers();
  const { appointments } = useAppointments();
  const { getCompletedCount } = useRecords();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { t, language } = useLanguage();

  const settings = useMemo(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { artistName: '원장님', weeklyGoal: 15 };
    } catch {
      return { artistName: '원장님', weeklyGoal: 15 };
    }
  }, []);

  const isSelectedToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return selectedDate === todayStr;
  }, [selectedDate]);

  const selectedAppointments = useMemo(() => {
    return appointments.filter(apt => apt.date === selectedDate);
  }, [appointments, selectedDate]);

  const todayCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === todayStr).length;
  }, [appointments]);

  const completedThisWeek = getCompletedCount();
  const weeklyGoal = settings.weeklyGoal || 15;
  const progressPercent = Math.min(100, Math.round((completedThisWeek / weeklyGoal) * 100));

  // 날짜 표시 이름 (오늘이면 '오늘의 일정', 아니면 'M월 D일 일정')
  const scheduleTitle = useMemo(() => {
    if (isSelectedToday) return t.home.todaySchedule;
    const d = new Date(selectedDate);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 일정`;
  }, [selectedDate, isSelectedToday, t.home.todaySchedule]);

  // 검색 결과
  const searchResults = searchQuery.trim() ? searchCustomers(searchQuery) : [];

  // 시간 포맷
  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    return {
      time: `${h > 12 ? String(h - 12).padStart(2, '0') : hour}:${minute}`,
      period: h >= 12 ? 'PM' : 'AM',
    };
  };

  return (
    <div className="flex flex-col min-h-screen font-display">
      {/* Home Header */}
      <header className="flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-primary/20 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 text-primary font-bold text-sm">
            BR
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100 uppercase tracking-widest mt-1">BLACKROOM</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('알림이 없습니다.')}
            className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-primary/10 transition-colors"
          >
            <Bell className="size-5 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full pb-24">
        <section className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t.home.greeting.replace('{name}', settings.artistName)}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {language === 'en' ? `You have ` : `오늘 예정된 시술이 `} 
            <span className="text-primary font-semibold">{todayCount}{language === 'en' ? ' appointments' : '건'}</span>
            {language === 'en' ? ` today.` : ` 있습니다.`}
          </p>
        </section>

        {/* 주간 목표 - 실제 데이터 (맨 위로 이동) */}
        <section className="mb-8">
          <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-5 rounded-2xl relative overflow-hidden shadow-sm shadow-primary/5">
            <div className="relative z-10">
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">{t.home.weeklyGoal}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{completedThisWeek} / {weeklyGoal} {language === 'en' ? 'Completed' : '건 완료'}</p>
              <div className="w-full bg-slate-200 dark:bg-primary/20 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <TrendingUp className="size-20" />
            </div>
          </div>
        </section>

        {/* 검색 */}
        <section className="mb-8 relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="size-5 text-slate-400 dark:text-primary/60" />
            </div>
            <input
              className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/30 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-slate-400 dark:placeholder:text-primary/40 text-slate-900 dark:text-slate-100 transition-all outline-none"
              placeholder={t.home.searchPlaceholder}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* 검색 결과 드롭다운 */}
          {searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#331920] border border-slate-200 dark:border-primary/20 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      navigate(`/customer/${customer.id}`);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors border-b border-slate-100 dark:border-primary/10 last:border-0 text-left"
                  >
                    <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{customer.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{customer.phone}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </section>

        {/* 새 동의서 작성 (새 시술기록 빨간 버튼) */}
        <section className="mb-10">
          <button
            onClick={() => navigate('/guide')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-5 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
          >
            <PlusCircle className="size-6" />
            <span className="text-lg">{t.home.newRecord}</span>
          </button>
        </section>

        {/* 주간 달력 (사용자 피드백에 따라 버튼 아래로 이동) */}
        <WeeklyCalendar 
          selectedDate={selectedDate} 
          onDateSelect={(date) => setSelectedDate(date)} 
          appointments={appointments}
          onViewAll={() => navigate('/calendar')}
        />

        {/* 오늘의 일정 - 실제 데이터 */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">{scheduleTitle}</h3>
            <button
              onClick={() => navigate('/calendar')}
              className="text-sm font-medium text-primary hover:underline bg-transparent"
            >
              {language === 'en' ? 'View all' : '전체보기'}
            </button>
          </div>
          <div className="space-y-4">
            {selectedAppointments.length > 0 ? (
              selectedAppointments.map((apt) => {
                const { time, period } = formatTime(apt.time);
                return (
                  <div
                    key={apt.id}
                    onClick={() => navigate(`/appointment/${apt.id}`)}
                    className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 p-4 rounded-xl flex items-center gap-4 hover:border-primary/40 transition-colors cursor-pointer"
                  >
                    <div className="text-center min-w-[60px] border-r border-slate-200 dark:border-primary/20 pr-4">
                      <p className="text-xs uppercase font-bold text-slate-500 dark:text-primary/60">{time}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic uppercase">{period}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{apt.procedureType.split(' - ')[0] || apt.procedureType}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{apt.procedureType}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        apt.status === 'completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                        apt.status === 'in-progress' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {apt.status === 'scheduled' ? '예정' : apt.status === 'in-progress' ? '진행중' : apt.status === 'completed' ? '완료' : '취소'}
                      </span>
                      <ChevronRight className="size-5 text-primary/40" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 p-8 rounded-xl text-center">
                <p className="text-slate-500 dark:text-slate-400">{t.home.noSchedule}</p>
                <button
                  onClick={() => navigate('/calendar')}
                  className="mt-3 text-primary text-sm font-semibold hover:underline"
                >
                  {language === 'en' ? 'Add a new appointment' : '새 예약 추가하기'}
                </button>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
};

export default Home;
