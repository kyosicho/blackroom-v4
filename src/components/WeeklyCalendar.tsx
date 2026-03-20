import React, { useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface WeeklyCalendarProps {
  onDateSelect?: (date: string) => void;
  selectedDate?: string;
  appointments?: { date: string; procedureType: string }[];
  onViewAll?: () => void;
  hideHeader?: boolean;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ 
  onDateSelect, 
  selectedDate = new Date().toISOString().split('T')[0],
  appointments = [],
  onViewAll,
  hideHeader = false
}) => {
  const days = useMemo(() => {
    const baseDate = new Date(selectedDate);
    const result = [];
    
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAppointments = appointments.filter(a => a.date === dateStr);
      
      result.push({
        date: dateStr,
        dayNum: date.getDate(),
        dayName: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()],
        isToday: dateStr === new Date().toISOString().split('T')[0],
        appointments: dayAppointments
      });
    }
    return result;
  }, [appointments, selectedDate]);

  return (
    <div className={`${hideHeader ? '' : 'bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-2xl p-4 mb-8 shadow-sm'}`}>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            주간 일정
          </h3>
          <button 
            onClick={onViewAll}
            className="text-xs font-bold text-primary hover:underline bg-primary/10 px-3 py-1 rounded-full transition-colors"
          >
            더보기
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const isSelected = day.date === selectedDate;
          return (
            <button
              key={day.date}
              onClick={() => onDateSelect?.(day.date)}
              className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all min-h-[100px] border ${
                isSelected
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-slate-50 dark:bg-primary/5 border-transparent hover:border-primary/30'
              }`}
            >
              <span className={`text-[10px] font-bold ${
                isSelected ? 'text-white/80' : 'text-slate-400'
              }`}>
                {day.dayName}
              </span>
              <span className="text-base font-black">{day.dayNum}</span>
              
              <div className="flex flex-col gap-1 w-full mt-1">
                {day.appointments.slice(0, 2).map((apt, idx) => (
                  <div 
                    key={idx} 
                    className={`text-[8px] leading-tight px-1 py-0.5 rounded truncate w-full text-center ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary font-bold'
                    }`}
                  >
                    {apt.procedureType.split(' ')[0]}
                  </div>
                ))}
                {day.appointments.length > 2 && (
                  <div className={`text-[7px] text-center ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                    +{day.appointments.length - 2}
                  </div>
                )}
                {day.appointments.length === 0 && <div className="h-4" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
