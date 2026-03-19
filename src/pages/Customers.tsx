import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, ChevronRight, Phone, Mail, Edit3, Trash2, X } from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';
import { useRecords } from '../context/RecordContext';

const Customers: React.FC = () => {
  const navigate = useNavigate();
  const { customers, addCustomer, deleteCustomer } = useCustomers();
  const { getRecordsByCustomer } = useRecords();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredCustomers = searchQuery.trim() 
    ? customers.filter(c => {
        const lowerQuery = searchQuery.toLowerCase();
        // 기본 정보 검색
        const matchesBasic = 
          c.name.toLowerCase().includes(lowerQuery) || 
          c.phone.includes(searchQuery) || 
          (c.email && c.email.toLowerCase().includes(lowerQuery));
          
        if (matchesBasic) return true;
        
        // 시술명 검색 추가
        const customerRecords = getRecordsByCustomer(c.id);
        return customerRecords.some(r => r.procedureType.toLowerCase().includes(lowerQuery));
      })
    : customers;

  const handleAdd = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    addCustomer({ name: newName, phone: newPhone, email: newEmail || undefined, notes: newNotes || undefined });
    setShowAdd(false);
    setNewName(''); setNewPhone(''); setNewEmail(''); setNewNotes('');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`"${name}" 고객을 삭제하시겠습니까?`)) {
      deleteCustomer(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-background-light dark:bg-background-dark border-b border-primary/10">
        <div className="flex items-center p-4 justify-between">
          <button onClick={() => navigate('/')} className="flex size-10 items-center justify-center hover:bg-primary/10 rounded-full transition-colors">
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center pr-10">고객 관리</h1>
        </div>
        <div className="px-4 py-3">
          <div className="flex w-full items-stretch rounded-xl h-12 bg-slate-200 dark:bg-[#48232c] overflow-hidden ring-1 ring-inset ring-transparent focus-within:ring-primary/50 transition-all">
            <div className="flex items-center justify-center pl-4 text-slate-500 dark:text-[#c992a0]">
              <Search className="size-5" />
            </div>
            <input
              className="flex w-full border-none bg-transparent focus:ring-0 text-base font-normal placeholder:text-slate-500 dark:placeholder:text-[#c992a0]/60 outline-none px-3"
              placeholder="이름, 전화번호, 이메일 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {/* Customer Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">전체 {filteredCustomers.length}명</p>
        </div>

        {/* Customer List */}
        {filteredCustomers.map((customer) => {
          const recordCount = getRecordsByCustomer(customer.id).length;
          return (
            <div
              key={customer.id}
              className="group bg-white dark:bg-[#331920] border border-slate-200 dark:border-primary/10 rounded-xl p-4 hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg font-bold shrink-0">
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-base truncate">{customer.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Phone className="size-3" /> {customer.phone}
                    </span>
                    {customer.email && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Mail className="size-3" /> {customer.email}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      시술 {recordCount}건
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate(`/customer/${customer.id}`)} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                    <Edit3 className="size-4 text-slate-500" />
                  </button>
                  <button onClick={() => handleDelete(customer.id, customer.name)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors">
                    <Trash2 className="size-4 text-red-500" />
                  </button>
                  <ChevronRight className="size-5 text-primary/40" />
                </div>
              </div>
              {customer.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 ml-16 truncate">{customer.notes}</p>
              )}
            </div>
          );
        })}

        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <p className="text-lg font-semibold mb-2">고객이 없습니다</p>
            <p className="text-sm">새 고객을 추가하세요</p>
          </div>
        )}
      </main>

      {/* Add Customer Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="w-full max-w-lg bg-background-light dark:bg-background-dark rounded-t-2xl p-6 space-y-4 animate-slide-up">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">새 고객 추가</h2>
              <button onClick={() => setShowAdd(false)} className="p-2"><X className="size-5" /></button>
            </div>
            <input className="w-full border border-slate-200 dark:border-primary/20 rounded-xl p-3 bg-transparent outline-none focus:ring-2 focus:ring-primary" placeholder="이름 *" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <input className="w-full border border-slate-200 dark:border-primary/20 rounded-xl p-3 bg-transparent outline-none focus:ring-2 focus:ring-primary" placeholder="전화번호 *" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
            <input className="w-full border border-slate-200 dark:border-primary/20 rounded-xl p-3 bg-transparent outline-none focus:ring-2 focus:ring-primary" placeholder="이메일" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
            <textarea className="w-full border border-slate-200 dark:border-primary/20 rounded-xl p-3 bg-transparent outline-none focus:ring-2 focus:ring-primary" placeholder="메모" rows={2} value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
            <button onClick={handleAdd} disabled={!newName.trim() || !newPhone.trim()} className="w-full py-3 bg-primary text-white font-bold rounded-xl disabled:bg-slate-300 disabled:cursor-not-allowed">추가하기</button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed right-6 bottom-24 size-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-20"
      >
        <Plus className="size-7" />
      </button>
    </div>
  );
};

export default Customers;
