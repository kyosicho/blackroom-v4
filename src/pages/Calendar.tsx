import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';

const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const { appointments } = useAppointments();
  
  const today = new Date();
  const [currentDate, setCurrentDate] = React.useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = React.useState(today.toISOString().split('T')[0]);

  const monthName = currentDate.toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' });

  const selectedAppointments = useMemo(() => {
    return appointments.filter(a => a.date === selectedDate);
  }, [appointments, selectedDate]);

  const scheduleTitle = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0];
    if (selectedDate === todayStr) return '오늘의 일정';
    const d = new Date(selectedDate);
    return `${d.getMonth() + 1}월 ${d.getDate()}일 일정`;
  }, [selectedDate, today]);

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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark border-b border-primary/10 p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-primary/10 rounded-full transition-colors text-slate-900 dark:text-slate-100">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold">전체 일정</h1>
        <div className="size-9" />
      </header>

      <main className="flex-1 p-4 pb-24">
        <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary">{monthName}</h2>
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

          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((dayData, i) => {
              if (!dayData) return <div key={`empty-${i}`} className="aspect-square" />;
              
              const { day, date, isToday, appointments: dayApts } = dayData;
              const isSelected = date === selectedDate;
              return (
                <div 
                  key={day} 
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[70px] flex flex-col items-center p-1 rounded-lg border transition-colors cursor-pointer group ${
                    isSelected ? 'bg-primary border-primary/20 shadow-sm' : 
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
          </div>
        </div>

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{scheduleTitle}</h3>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">{selectedAppointments.length}건</span>
          </div>
          <div className="space-y-3">
            {selectedAppointments.length > 0 ? (
              selectedAppointments.map(apt => (
                <div 
                  key={apt.id} 
                  onClick={() => navigate(`/appointment/${apt.id}`)}
                  className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/20 flex justify-between items-center hover:border-primary/40 transition-all cursor-pointer group"
                >
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{apt.procedureType}</p>
                    <p className="text-xs text-slate-500">{apt.date} {apt.time}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase`}>
                    {apt.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-100/50 dark:bg-primary/5 rounded-2xl border border-dashed border-slate-200 dark:border-primary/20">
                <p className="text-slate-500 text-sm">해당 날짜에 예정된 일정이 없습니다.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <button className="fixed right-6 bottom-24 size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-20">
        <Plus className="size-7" />
      </button>
    </div>
  );
};

export default Calendar;
