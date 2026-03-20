import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, UserPlus, Check, Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';
import { useAppointments } from '../context/AppointmentContext';

import { useSettings } from '../context/SettingsContext';
import { getProceduresByMode } from '../utils/constants';

const NewAppointment: React.FC = () => {
  const navigate = useNavigate();
  const { customers, searchCustomers, addCustomer } = useCustomers();
  const { addAppointment } = useAppointments();
  const { shopMode } = useSettings(); // 추가
  const procedureTypes = getProceduresByMode(shopMode); // 동적 목록 생성
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Step 1: Customer
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  
  // Step 2: Procedure
  const [selectedProcedure, setSelectedProcedure] = useState('');
  const [notes, setNotes] = useState('');
  const [depositPaid, setDepositPaid] = useState(false);
  
  // Step 3: Date/Time
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');

  const filteredCustomers = searchQuery.trim() ? searchCustomers(searchQuery) : customers;
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleAddCustomer = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const customer = addCustomer({ name: newName, phone: newPhone });
    setSelectedCustomerId(customer.id);
    setShowAddCustomer(false);
    setNewName('');
    setNewPhone('');
    setStep(2);
  };

  const handleSave = () => {
    if (!selectedCustomerId || !selectedProcedure || !date || !time) return;
    
    addAppointment({
      customerId: selectedCustomerId,
      date,
      time,
      procedureType: selectedProcedure,
      notes,
      depositPaid,
      status: 'scheduled'
    });
    
    navigate('/calendar');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark border-b border-primary/10 p-4 flex items-center justify-between">
        <button onClick={() => step > 1 ? setStep((step - 1) as any) : navigate(-1)} className="p-2 hover:bg-primary/10 rounded-full transition-colors text-slate-900 dark:text-slate-100">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {step === 1 ? '고객 선택' : step === 2 ? '시술 선택' : '일시 선택'}
        </h1>
        <div className="size-9" />
      </header>

      <main className="flex-1 p-4 space-y-6 pb-32 max-w-2xl mx-auto w-full">
        {/* Step Indicator */}
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-slate-200 dark:bg-primary/10'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            {selectedCustomer ? (
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{selectedCustomer.name}</p>
                  <p className="text-sm text-slate-500">{selectedCustomer.phone}</p>
                </div>
                <button onClick={() => setSelectedCustomerId(null)} className="text-xs text-primary font-semibold">변경</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                  <input
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                    placeholder="고객 이름 또는 전화번호 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCustomerId(c.id); setStep(2); }}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl hover:border-primary/40 transition-colors text-left"
                    >
                      <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                        {c.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.phone}</p>
                      </div>
                      <ChevronRight className="size-4 text-slate-400" />
                    </button>
                  ))}
                  {filteredCustomers.length === 0 && searchQuery && (
                    <div className="text-center py-6 text-slate-500 text-sm">
                      고객이 없습니다. 
                    </div>
                  )}
                </div>
                {!showAddCustomer ? (
                  <button
                    onClick={() => setShowAddCustomer(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary/30 rounded-xl text-primary font-bold hover:bg-primary/5 transition-colors"
                  >
                    <UserPlus className="size-5" />
                    신규 고객 등록
                  </button>
                ) : (
                  <div className="bg-white dark:bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                    <input className="w-full border border-slate-200 dark:border-primary/20 rounded-lg p-3 bg-transparent text-slate-900 dark:text-slate-100" placeholder="이름" value={newName} onChange={e => setNewName(e.target.value)} />
                    <input className="w-full border border-slate-200 dark:border-primary/20 rounded-lg p-3 bg-transparent text-slate-900 dark:text-slate-100" placeholder="전화번호" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddCustomer(false)} className="flex-1 py-2 border border-slate-300 rounded-lg">취소</button>
                      <button onClick={handleAddCustomer} className="flex-1 py-2 bg-primary text-white rounded-lg font-bold">확인</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-500 text-sm uppercase">시술 종류 선택</h3>
            <div className="grid grid-cols-1 gap-2">
              {procedureTypes.map(type => (
                <button
                  key={type}
                  onClick={() => { setSelectedProcedure(type); }}
                  className={`p-4 rounded-xl text-left border transition-all ${
                    selectedProcedure === type 
                      ? 'bg-primary/10 border-primary text-primary font-bold' 
                      : 'bg-white dark:bg-primary/5 border-slate-200 dark:border-primary/20 hover:border-primary/40'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="mt-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500">특이사항 (메모)</label>
                <textarea 
                  className="w-full p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-2xl outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  placeholder="환자의 특징이나 주의사항을 적어주세요. (생략 가능)"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-2xl">
                <div>
                  <p className="font-bold text-green-800 dark:text-green-500 text-sm">예약금 입금 확인</p>
                  <p className="text-[10px] text-green-600 dark:text-green-500/70">예약금이 입금되었나요?</p>
                </div>
                <button 
                  onClick={() => setDepositPaid(!depositPaid)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${depositPaid ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${depositPaid ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {selectedProcedure && (
              <button 
                onClick={() => setStep(3)}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg mt-4"
              >
                다음 단계로 (일시 선택)
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <CalendarIcon className="size-4" /> 날짜 선택
              </label>
              <input 
                type="date" 
                className="w-full p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                <Clock className="size-4" /> 시간 선택
              </label>
              <input 
                type="time" 
                className="w-full p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-slate-100"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
            
            <div className="pt-4">
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-6 space-y-4 shadow-sm shadow-primary/10">
                <h4 className="font-bold text-center border-b border-primary/10 pb-4 text-primary">예약 정보 확인</h4>
                <div className="flex justify-between items-center py-2 border-b border-primary/5">
                  <span className="text-slate-500 text-sm">고객명</span>
                  <span className="font-bold">{selectedCustomer?.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-primary/5">
                  <span className="text-slate-500 text-sm">시술 종류</span>
                  <span className="font-bold">{selectedProcedure}</span>
                </div>
                {notes && (
                  <div className="py-2 border-b border-primary/5">
                    <span className="text-slate-500 text-sm block mb-1">특이사항</span>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{notes}</p>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-primary/5">
                  <span className="text-slate-500 text-sm">예약 일시</span>
                  <span className="font-bold text-primary">{date} {time}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 text-sm">예약금 확인</span>
                  <span className={`font-bold ${depositPaid ? 'text-green-600' : 'text-slate-400'}`}>
                    {depositPaid ? '입금 완료' : '미입금'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full bg-primary text-white font-bold py-5 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
            >
              <Check className="size-6" />
              예약 확정 및 달력 저장
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewAppointment;
