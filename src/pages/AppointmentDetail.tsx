import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Calendar, User, FileText, ChevronRight, Edit3, X, Check, CreditCard } from 'lucide-react';
import { useAppointments } from '../context/AppointmentContext';
import { useCustomers } from '../context/CustomerContext';
import { useRecords } from '../context/RecordContext';
import Header from '../components/Header';

const PROCEDURE_TYPES = [
  '눈썹 문신 (Microblading)',
  '입술 반영구 (Lip Blush)',
  '점막 아이라인 (Eyeliner)',
  '파우더 브로우 (Powder Brows)',
  '헤어라인 교정 (Hairline)',
  'SMP (Scalp Micropigmentation)',
  '상담만',
  '기타',
];

const AppointmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAppointment, updateAppointment } = useAppointments();
  const { getCustomer } = useCustomers();
  const { setDraft } = useRecords();

  const appointment = getAppointment(id || '');
  const customer = appointment ? getCustomer(appointment.customerId) : null;

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editProcedure, setEditProcedure] = useState(appointment?.procedureType || '');
  const [editDate, setEditDate] = useState(appointment?.date || '');
  const [editTime, setEditTime] = useState(appointment?.time || '');
  const [editNotes, setEditNotes] = useState(appointment?.notes || '');
  const [editDeposit, setEditDeposit] = useState(appointment?.depositPaid || false);

  if (!appointment) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4 text-center">
        <p className="text-slate-500 mb-4">예약을 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/')} className="bg-primary text-white px-6 py-2 rounded-xl font-bold">홈으로 돌아가기</button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: 'scheduled' | 'in-progress' | 'completed' | 'cancelled') => {
    updateAppointment(appointment.id, { status: newStatus });
  };

  const handleSave = () => {
    updateAppointment(appointment.id, {
      procedureType: editProcedure,
      date: editDate,
      time: editTime,
      notes: editNotes,
      depositPaid: editDeposit,
    });
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Header 
        title={isEditing ? "예약 정보 수정" : "예약 상세 정보"} 
        rightElement={
          isEditing ? (
            <div className="flex gap-1">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-red-500"
              >
                <X className="size-5" />
              </button>
              <button 
                onClick={handleSave}
                className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary"
              >
                <Check className="size-5" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-primary/10 rounded-full transition-colors"
            >
              <Edit3 className="size-5 text-slate-900 dark:text-slate-100" />
            </button>
          )
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

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">시술 종류</label>
                <select 
                  className="w-full p-4 bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                  value={editProcedure}
                  onChange={(e) => setEditProcedure(e.target.value)}
                >
                  {PROCEDURE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">시술 날짜</label>
                  <input 
                    type="date"
                    className="w-full p-4 bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">시술 시간</label>
                  <input 
                    type="time"
                    className="w-full p-4 bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">메모</label>
                <textarea 
                  className="w-full p-4 bg-slate-50 dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white min-h-[100px]"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="메모를 입력하세요..."
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <CreditCard className="size-5 text-green-600" />
                  <p className="font-bold text-green-800 dark:text-green-500 text-sm">예약금 입금 확인</p>
                </div>
                <button 
                  onClick={() => setEditDeposit(!editDeposit)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${editDeposit ? 'bg-green-500' : 'bg-slate-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${editDeposit ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">{appointment.procedureType}</h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-primary/10 rounded-xl">
                  <Calendar className="size-5 text-primary" />
                  <div>
                    <p className="text-xs text-slate-400">날짜</p>
                    <p className="font-bold text-slate-900 dark:text-white">{appointment.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-primary/10 rounded-xl">
                  <Clock className="size-5 text-primary" />
                  <div>
                    <p className="text-xs text-slate-400">시간</p>
                    <p className="font-bold text-slate-900 dark:text-white">{appointment.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-primary/10 rounded-xl">
                  <CreditCard className={`size-5 ${appointment.depositPaid ? 'text-green-500' : 'text-slate-300'}`} />
                  <div>
                    <p className="text-xs text-slate-400">예약금</p>
                    <p className={`font-bold ${appointment.depositPaid ? 'text-green-600 dark:text-green-500' : 'text-slate-600'}`}>
                      {appointment.depositPaid ? '입금 완료' : '미확인'}
                    </p>
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
                      <p className="font-bold text-slate-900 dark:text-white">{customer.name}</p>
                    </div>
                    <ChevronRight className="size-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                )}

                {appointment.notes && (
                  <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-primary/10 rounded-xl">
                    <FileText className="size-5 text-primary mt-1" />
                    <div>
                      <p className="text-xs text-slate-400">메모</p>
                      <p className="text-sm mt-1 text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{appointment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>

        {!isEditing && (
          <section className="space-y-3">
            <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest px-1">상태 변경</h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleStatusChange('in-progress')}
                className={`py-3 rounded-xl font-bold border transition-all ${
                  appointment.status === 'in-progress' ? 'bg-yellow-500 text-white border-yellow-500 shadow-md transform active:scale-95' : 'bg-white dark:bg-primary/5 border-slate-200 dark:border-primary/20 text-slate-600 dark:text-slate-400 hover:border-primary/40'
                }`}
              >
                진행 중
              </button>
              <button 
                onClick={() => handleStatusChange('completed')}
                className={`py-3 rounded-xl font-bold border transition-all ${
                  appointment.status === 'completed' ? 'bg-green-500 text-white border-green-500 shadow-md transform active:scale-95' : 'bg-white dark:bg-primary/5 border-slate-200 dark:border-primary/20 text-slate-600 dark:text-slate-400 hover:border-primary/40'
                }`}
              >
                완료
              </button>
            </div>
            {appointment.status !== 'completed' && (
              <button 
                onClick={() => {
                  if (customer) {
                    setDraft({ 
                      customerId: customer.id, 
                      customerName: customer.name, 
                      procedureType: appointment.procedureType, 
                      appointmentId: appointment.id 
                    });
                    navigate('/consent');
                  }
                }}
                className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 mt-4 active:scale-95 transition-transform"
              >
                시술 시작하기 (동의서 작성)
              </button>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default AppointmentDetail;

