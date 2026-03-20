import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WineOff, Pill, Utensils, Shirt, Info, AlertTriangle, ChevronRight, Share2 } from 'lucide-react';
import Header from '../components/Header';
import WeeklyCalendar from '../components/WeeklyCalendar';
import { useCustomers } from '../context/CustomerContext';
import { useRecords } from '../context/RecordContext';
import { useAppointments } from '../context/AppointmentContext';

const Guide: React.FC = () => {
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { appointments } = useAppointments();
  const { setDraft } = useRecords();
  const [activeTab, setActiveTab] = useState<'appointments' | 'before' | 'after'>('appointments');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const dailyAppointments = appointments.filter(a => a.date === selectedDate);

  const instructions = [
    { icon: <WineOff className="size-6" />, title: '금주', desc: '과도한 출혈을 방지하기 위해 시술 최소 24시간 전에는 음주를 피해주세요.' },
    { icon: <Pill className="size-6" />, title: '약물 복용 주의', desc: '의학적으로 필요한 경우가 아니면 아스피린이나 이부프로펜 복용을 삼가주세요.' },
    { icon: <Utensils className="size-6" />, title: '식사 권장', desc: '혈당 조절을 위해 시술 1~2시간 전에 든든한 식사를 해주세요.' },
    { icon: <Shirt className="size-6" />, title: '편안한 복장', desc: '시술 부위 노출이 쉽고 오염 우려가 없는 옷을 입어주세요.' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Header 
        title="시술 시작" 
        rightElement={
          <button 
            onClick={() => alert('공유 기능은 준비 중입니다.')}
            className="flex items-center justify-center size-10 rounded-full hover:bg-primary/10 transition-colors"
          >
            <Share2 className="size-5 text-slate-900 dark:text-slate-100" />
          </button>
        }
      />

      {/* Tabs */}
      <div className="max-w-2xl mx-auto w-full px-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex gap-4">
          {[
            { key: 'appointments' as const, label: '1. 예약 확인' },
            { key: 'before' as const, label: '2. 시술 전 가이드' },
            { key: 'after' as const, label: '3. 시술 후 가이드' },
          ].map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 font-bold text-xs transition-colors ${
                activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto w-full p-4 space-y-6 pb-32 flex-1">
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <WeeklyCalendar 
              selectedDate={selectedDate} 
              onDateSelect={setSelectedDate}
              appointments={appointments}
              hideHeader
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="size-2 bg-primary rounded-full animate-pulse" />
                  오늘의 예약 손님
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase">{dailyAppointments.length} 대기</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {dailyAppointments.length > 0 ? (
                  dailyAppointments.map((apt) => {
                    const customer = customers.find(c => c.id === apt.customerId);
                    return (
                      <button
                        key={apt.id}
                        onClick={() => {
                          setDraft({
                            customerId: apt.customerId,
                            customerName: customer?.name || '',
                            procedureType: apt.procedureType,
                          });
                          
                          let enableGpsAuth = true;
                          try {
                            const data = localStorage.getItem('blackroom_settings');
                            if (data) {
                              const settings = JSON.parse(data);
                              if (settings.enableGpsAuth === false) enableGpsAuth = false;
                            }
                          } catch { /* ignore */ }
                          
                          if (enableGpsAuth) {
                            navigate('/gps-auth');
                          } else {
                            navigate('/consent');
                          }
                        }}
                        className="w-full flex items-center gap-4 p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-2xl hover:border-primary/40 transition-all text-left group shadow-sm active:scale-[0.98]"
                      >
                        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg group-hover:bg-primary group-hover:text-white transition-colors">
                          {customer?.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900 dark:text-white">{customer?.name}</p>
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{apt.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{apt.procedureType}</p>
                        </div>
                        <ChevronRight className="size-5 text-slate-300 group-hover:text-primary transition-colors" />
                      </button>
                    );
                  })
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-primary/5 rounded-2xl border border-dashed border-slate-200 dark:border-primary/20">
                    <p className="text-sm text-slate-400 font-medium">해당 날짜에 예정된 시술이 없습니다.</p>
                    <button 
                      onClick={() => navigate('/new-appointment')}
                      className="mt-3 text-xs font-bold text-primary hover:underline"
                    >
                      새 예약 등록하러 가기
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'before' || activeTab === 'after') && (
          <div className="space-y-6">
            <section>
              <h3 className="text-primary text-xs font-bold uppercase tracking-widest mb-4">
                {activeTab === 'before' ? '시술 전 필수 가이드라인' : '시술 후 관리 안내'}
              </h3>
              <div className="space-y-3">
                {instructions.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 shadow-sm">
                    <div className="flex items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20 text-primary shrink-0 size-12">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-base">{item.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    <Info className="size-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </section>

            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="size-6 text-primary shrink-0" />
              <div>
                <p className="font-bold text-primary text-sm uppercase">의료 관련 참고</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">임신, 수유 중이거나 만성 질환이 있는 경우 반드시 아티스트에게 즉시 알려주세요.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Guide;
