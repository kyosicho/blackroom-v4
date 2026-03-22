import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';
import { useCustomers } from '../context/CustomerContext';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { motion, AnimatePresence } from 'framer-motion';

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { appointments } = useAppointments();
  const { customers } = useCustomers();
  
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = React.useState(today.toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showSearch, setShowSearch] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'month' | 'week'>('month');
  const [direction, setDirection] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  
  // Swipe Logic
  const touchStart = React.useRef<number | null>(null);
  const touchEnd = React.useRef<number | null>(null);
  const MIN_SWIPE_DISTANCE = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe) {
      changeMonth(1);
    } else if (isRightSwipe) {
      changeMonth(-1);
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    touchEnd.current = null;
    touchStart.current = e.clientX;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (touchStart.current !== null) {
      touchEnd.current = e.clientX;
    }
  };

  const onMouseUp = () => {
    onTouchEnd(); // 기존 터치 엔드 로직 재사용
    touchStart.current = null;
    touchEnd.current = null;
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Add empty slots for the first week
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= lastDate; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayAppointments = appointments.filter(a => a.date === dateStr);
      days.push({
        day: i,
        date: dateStr,
        isToday: i === today.getDate() && month === today.getMonth() && year === today.getFullYear(),
        appointments: dayAppointments
      });
    }
    return days;
  }, [currentDate, appointments, today]);

  const changeMonth = (offset: number) => {
    setDirection(offset);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
  };

  const handleMonthChange = (month: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
  };

  const years = Array.from({ length: 10 }, (_, i) => today.getFullYear() - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  // 통합 검색 결과 (이름, 번호, 시술, 메모)
  const filteredAppointmentsBySearch = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return appointments.filter(apt => {
      const customer = customers.find(c => c.id === apt.customerId);
      return (
        customer?.name.toLowerCase().includes(q) ||
        customer?.phone.includes(q) ||
        apt.procedureType.toLowerCase().includes(q) ||
        (apt.notes && apt.notes.toLowerCase().includes(q))
      );
    });
  }, [appointments, customers, searchQuery]);

  // 선택된 날짜의 일정 필터링
  const selectedAppointments = useMemo(() => {
    return appointments
      .filter(apt => apt.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  const scheduleTitle = useMemo(() => {
    const d = new Date(selectedDate);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 상세 일정`;
  }, [selectedDate]);

  const [showDayDetail, setShowDayDetail] = React.useState(false);

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setShowDayDetail(true);
  };

  // 모션 설정
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark overflow-hidden font-display antialiased">
      <header className="sticky top-0 z-10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-primary/10 p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-primary/10 rounded-full transition-colors text-slate-900 dark:text-slate-100">
          <ArrowLeft className="size-5" />
        </button>
        
        {/* 통합 날짜 선택기 UI */}
        <div className="relative">
          <button 
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
          >
            <CalendarIcon className="size-4 text-primary" />
            <span className="font-bold text-lg text-slate-900 dark:text-white">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </span>
            <ChevronRight className={`size-4 text-slate-400 transition-transform ${showPicker ? 'rotate-90' : 'rotate-270'}`} />
          </button>

          <AnimatePresence>
            {showPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPicker(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-4 z-50 flex gap-4"
                >
                  <div className="flex-1 overflow-y-auto max-h-48 custom-scrollbar">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Year</p>
                    {years.map(y => (
                      <button 
                        key={y} 
                        onClick={() => { handleYearChange(y); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${currentDate.getFullYear() === y ? 'bg-primary text-white' : 'hover:bg-primary/10'}`}
                      >
                        {y}년
                      </button>
                    ))}
                  </div>
                  <div className="w-[1px] bg-slate-100 dark:bg-white/5 my-2" />
                  <div className="flex-1 overflow-y-auto max-h-48 custom-scrollbar">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">Month</p>
                    {months.map(m => (
                      <button 
                        key={m} 
                        onClick={() => { handleMonthChange(m); setShowPicker(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${currentDate.getMonth() === m ? 'bg-primary text-white' : 'hover:bg-primary/10'}`}
                      >
                        {m + 1}월
                      </button>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setShowSearch(!showSearch)}
          className="p-2 hover:bg-primary/10 rounded-full transition-colors text-slate-900 dark:text-slate-100"
        >
          <Search className="size-5" />
        </button>
      </header>

      {showSearch && (
        <div className="bg-background-light dark:bg-background-dark p-4 border-b border-primary/10 animate-in fade-in slide-in-from-top-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="이름, 번호, 시술, 메모 검색..."
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-primary/10 rounded-xl border-none outline-none focus:ring-1 focus:ring-primary text-slate-900 dark:text-slate-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
          {searchQuery && (
            <div className="mt-2 max-h-60 overflow-y-auto bg-white dark:bg-primary/20 rounded-xl border border-primary/10 shadow-xl z-30">
              {filteredAppointmentsBySearch.length > 0 ? (
                filteredAppointmentsBySearch.map(apt => {
                  const customer = customers.find(c => c.id === apt.customerId);
                  return (
                    <button
                      key={apt.id}
                      onClick={() => {
                        handleDateClick(apt.date);
                        setCurrentDate(new Date(apt.date));
                        setSearchQuery('');
                        setShowSearch(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-primary/10 border-b border-primary/5 last:border-none flex justify-between items-center"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{customer?.name} - {apt.procedureType}</p>
                        <p className="text-xs text-slate-500">{apt.date} {apt.time}</p>
                      </div>
                      <ChevronRight className="size-4 text-slate-300" />
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">검색 결과가 없습니다.</div>
              )}
            </div>
          )}
        </div>
      )}

      <main 
        className="flex-1 p-4 pb-24 touch-pan-y select-none relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-2xl p-4 shadow-sm h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <div className="flex bg-slate-100 dark:bg-primary/10 p-1 rounded-lg w-fit">
                <button 
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'month' ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                  월간
                </button>
                <button 
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === 'week' ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                  주간
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-primary/10 rounded-full border border-slate-200 dark:border-primary/20"
              >
                <ChevronLeft className="size-5 text-slate-600 dark:text-slate-400" />
              </button>
              <button 
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-primary/10 rounded-full border border-slate-200 dark:border-primary/20"
              >
                <ChevronRight className="size-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
              <span key={d} className="text-xs font-bold text-slate-400 py-2">{d}</span>
            ))}
          </div>

          <div className="relative overflow-hidden flex-1 min-h-[400px]">
            <AnimatePresence initial={false} custom={direction}>
              {viewMode === 'month' ? (
                <motion.div 
                  key={currentDate.toISOString()}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="absolute inset-0 grid grid-cols-7 gap-1 h-full max-h-[60vh] overflow-y-auto pr-1"
                >
                  {daysInMonth.map((dayData, i) => {
                    if (!dayData) return <div key={`empty-${i}`} className="aspect-square" />;
                    
                    const { day, date, isToday, appointments: dayApts } = dayData;
                    const isSelected = date === selectedDate;
                    return (
                      <div 
                        key={day} 
                        onClick={() => handleDateClick(date)}
                        className={`min-h-[70px] flex flex-col items-center p-1 rounded-lg border transition-all cursor-pointer group ${
                          isSelected ? 'bg-primary border-primary/20 shadow-lg scale-[1.02]' : 
                          isToday ? 'bg-primary/5 border-primary/20' : 'hover:bg-primary/10 border-transparent'
                        }`}
                      >
                        <span className={`text-sm ${
                          isSelected ? 'bg-white text-primary size-6 flex items-center justify-center rounded-full font-bold' :
                          isToday ? 'bg-primary text-white size-6 flex items-center justify-center rounded-full font-bold' : 
                          'text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors'
                        }`}>
                          {day}
                        </span>
                        
                        <div className="flex flex-col gap-0.5 w-full mt-1 overflow-hidden">
                          {dayApts.slice(0, 2).map((apt, idx) => (
                            <div 
                              key={idx} 
                              className={`text-[7px] leading-tight px-1 py-0.5 rounded truncate font-bold text-center ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                              }`}
                            >
                              {apt.procedureType.split(' ')[0]}
                            </div>
                          ))}
                          {dayApts.length > 2 && (
                            <div className={`text-[6px] text-center ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                              +{dayApts.length - 2}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div
                  key="weekly"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0"
                >
                  <WeeklyCalendar 
                    selectedDate={selectedDate} 
                    onDateSelect={(date: string) => handleDateClick(date)} 
                    appointments={appointments}
                    hideHeader
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* 일일 일정 상세 모달 (Slide-up) */}
      {showDayDetail && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowDayDetail(false)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 ease-out-expo h-[85vh] flex flex-col">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />
            
            <div className="p-6 flex flex-col h-full overflow-hidden">
              <div className="flex items-center justify-between mb-6 shrink-0">
                <div>
                  <h3 className="font-bold text-2xl text-slate-900 dark:text-white">{scheduleTitle}</h3>
                  <p className="text-sm text-slate-500 mt-1">{selectedAppointments.length}개의 일정이 있습니다.</p>
                </div>
                <button 
                  onClick={() => setShowDayDetail(false)}
                  className="size-10 flex items-center justify-center bg-slate-100 dark:bg-white/10 rounded-full text-slate-500 hover:text-primary transition-colors"
                >
                  <Plus className="size-6 rotate-45" />
                </button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar pb-6">
                {selectedAppointments.length > 0 ? (
                  selectedAppointments.map(apt => {
                    const customer = customers.find(c => c.id === apt.customerId);
                    return (
                      <div 
                        key={apt.id} 
                        onClick={() => navigate(`/appointment/${apt.id}`)}
                        className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center hover:border-primary/40 transition-all cursor-pointer group"
                      >
                        {/* 시간을 좌측에 독립적으로 배치 (v4.22) */}
                        <div className="w-20 shrink-0 border-r border-slate-200 dark:border-white/10 mr-4 pr-4 text-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Time</p>
                          <p className="text-lg font-black text-primary dark:text-primary leading-tight">
                            {apt.time.split(':')[0]}<span className="text-xs">:</span>{apt.time.split(':')[1]}
                          </p>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-base mb-1 truncate">
                            {apt.procedureType}
                          </p>
                          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs">
                            <span className="font-bold text-slate-500 dark:text-slate-400">{customer?.name} 고객님</span>
                            {apt.depositPaid ? (
                              <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                                <span className="size-1 bg-green-500 rounded-full animate-pulse" />
                                입금완료
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full">미확인</span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="size-5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-16 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                    <p className="text-slate-400 text-sm">등록된 일정이 없습니다.</p>
                    <button 
                      onClick={() => navigate('/new-appointment')}
                      className="mt-4 px-6 py-2 bg-primary/10 text-primary text-xs font-bold rounded-full hover:bg-primary hover:text-white transition-all"
                    >
                      새 예약 만들기
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-white/5 shrink-0 flex gap-3">
                <button 
                  onClick={() => navigate('/new-appointment')}
                  className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Plus className="size-5" />
                  새 예약 추가
                </button>
                <button 
                  onClick={() => setShowDayDetail(false)}
                  className="px-6 py-4 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 rounded-2xl font-bold"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => navigate('/new-appointment')}
        className="fixed right-6 bottom-24 size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-20"
      >
        <Plus className="size-7" />
      </button>
    </div>
  );
};

export default Calendar;
