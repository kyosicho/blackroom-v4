import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Calendar, User, FileText, ChevronRight, Edit3 } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';
import { useCustomers } from '../context/CustomerContext';
import Header from '../components/Header';

const AppointmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAppointment, updateAppointment } = useAppointments();
  const { getCustomer } = useCustomers();

  const appointment = getAppointment(id || '');
  const customer = appointment ? getCustomer(appointment.customerId) : null;

  if (!appointment) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center">
        <p className="text-slate-500 mb-4">예약을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-6 py-2 rounded-xl font-bold">홈으로 돌아가기</button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: any) => {
    updateAppointment(appointment.id, { status: newStatus });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Header 
        title="예약 상세 정보" 
        rightElement={
          <button className="p-2 hover:bg-primary/10 rounded-full transition-colors">
            <Edit3 className="size-5 text-slate-900 dark:text-slate-100" />
          </button>
        }
      />

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
        <section className="bg-white dark:bg-primary/5 rounded-2xl p-6 border border-slate-200 dark:border-primary/20 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
              appointment.status === 'in-progress' ? 'bg-yellow-100 text-yellow-600' :
              'bg-primary/10 text-primary'
            }`}>
              {appointment.status}
            </div>
            <p className="text-xs text-slate-400">등록일: {new Date(appointment.createdAt).toLocaleDateString()}</p>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{appointment.procedureType}</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-primary/10 rounded-xl">
              <Calendar className="size-5 text-primary" />
              <div>
                <p className="text-xs text-slate-400">날짜</p>
                <p className="font-bold">{appointment.date}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-primary/10 rounded-xl">
              <Clock className="size-5 text-primary" />
              <div>
                <p className="text-xs text-slate-400">시간</p>
                <p className="font-bold">{appointment.time}</p>
              </div>
            </div>

            {customer && (
              <button 
                onClick={() => navigate(`/customer/${customer.id}`)}
                className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-primary/10 rounded-xl hover:bg-primary/5 transition-colors group"
              >
                <User className="size-5 text-primary" />
                <div className="flex-1 text-left">
                  <p className="text-xs text-slate-400">고객</p>
                  <p className="font-bold">{customer.name}</p>
                </div>
                <ChevronRight className="size-5 text-slate-300 group-hover:text-primary transition-colors" />
              </button>
            )}

            {appointment.notes && (
              <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-primary/10 rounded-xl">
                <FileText className="size-5 text-primary mt-1" />
                <div>
                  <p className="text-xs text-slate-400">메모</p>
                  <p className="text-sm mt-1">{appointment.notes}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest px-1">상태 변경</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleStatusChange('in-progress')}
              className={`py-3 rounded-xl font-bold border transition-all ${
                appointment.status === 'in-progress' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              진행 중
            </button>
            <button 
              onClick={() => handleStatusChange('completed')}
              className={`py-3 rounded-xl font-bold border transition-all ${
                appointment.status === 'completed' ? 'bg-green-500 text-white border-green-500' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              완료
            </button>
          </div>
          {appointment.status !== 'completed' && (
            <button 
              onClick={() => navigate('/guide')}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 mt-4 active:scale-95 transition-transform"
            >
              시술 시작하기 (동의서 작성)
            </button>
          )}
        </section>
      </main>
    </div>
  );
};

export default AppointmentDetail;
