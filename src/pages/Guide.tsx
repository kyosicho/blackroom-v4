import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, WineOff, Pill, Utensils, Shirt, Info, AlertTriangle, Search, UserPlus } from 'lucide-react';
import Header from '../components/Header';
import { useCustomers } from '../context/CustomerContext';
import { useRecords } from '../context/RecordContext';

const PROCEDURE_TYPES = [
  '눈썹 문신 (Microblading)',
  '입술 반영구 (Lip Blush)',
  '점막 아이라인 (Eyeliner)',
  '파우더 브로우 (Powder Brows)',
  '헤어라인 교정 (Hairline)',
  'SMP (Scalp Micropigmentation)',
  '기타',
];

const Guide: React.FC = () => {
  const navigate = useNavigate();
  const { customers, searchCustomers, addCustomer } = useCustomers();
  const { setDraft } = useRecords();
  const [activeTab, setActiveTab] = useState<'select' | 'before' | 'after'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState('');
  
  // Quick add customer
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const filteredCustomers = searchQuery.trim() ? searchCustomers(searchQuery) : customers;
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const instructions = [
    { icon: <WineOff className="size-6" />, title: '금주', desc: '과도한 출혈을 방지하기 위해 시술 최소 24시간 전에는 음주를 피해주세요.' },
    { icon: <Pill className="size-6" />, title: '약물 복용 주의', desc: '의학적으로 필요한 경우가 아니면 아스피린이나 이부프로펜 복용을 삼가주세요.' },
    { icon: <Utensils className="size-6" />, title: '식사 권장', desc: '혈당 조절을 위해 시술 1~2시간 전에 든든한 식사를 해주세요.' },
    { icon: <Shirt className="size-6" />, title: '편안한 복장', desc: '시술 부위 노출이 쉽고 오염 우려가 없는 옷을 입어주세요.' },
  ];

  const handleAddCustomer = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const customer = addCustomer({ name: newName, phone: newPhone });
    setSelectedCustomerId(customer.id);
    setShowAddCustomer(false);
    setNewName('');
    setNewPhone('');
  };

  const handleProceed = () => {
    if (!selectedCustomerId || !selectedProcedure) return;
    // 드래프트 시작
    setDraft({
      customerId: selectedCustomerId,
      customerName: selectedCustomer?.name || '',
      procedureType: selectedProcedure,
    });
    
    // Check GPS setting
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
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Header 
        title="새 시술 시작" 
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
            { key: 'select' as const, label: '1. 고객 선택' },
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
        {activeTab === 'select' && (
          <>
            {/* Selected Customer Card */}
            {selectedCustomer && (
              <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg border-2 border-primary">
                  {selectedCustomer.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{selectedCustomer.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedCustomer.phone}</p>
                </div>
                <button onClick={() => setSelectedCustomerId(null)} className="text-xs text-primary font-semibold">변경</button>
              </div>
            )}

            {/* Customer Search */}
            {!selectedCustomerId && (
              <>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="size-5 text-slate-400" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/30 rounded-xl outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400 dark:placeholder:text-primary/40"
                    placeholder="고객 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => { setSelectedCustomerId(customer.id); setSearchQuery(''); }}
                      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl hover:border-primary/40 transition-colors text-left"
                    >
                      <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{customer.name}</p>
                        <p className="text-xs text-slate-500">{customer.phone}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Add New Customer */}
                {!showAddCustomer ? (
                  <button
                    onClick={() => setShowAddCustomer(true)}
                    className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-primary/30 rounded-xl text-primary font-semibold hover:bg-primary/5 transition-colors"
                  >
                    <UserPlus className="size-5" />
                    새 고객 추가
                  </button>
                ) : (
                  <div className="bg-white dark:bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                    <input
                      className="w-full border border-slate-200 dark:border-primary/20 rounded-lg p-3 bg-transparent outline-none focus:ring-2 focus:ring-primary"
                      placeholder="이름"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <input
                      className="w-full border border-slate-200 dark:border-primary/20 rounded-lg p-3 bg-transparent outline-none focus:ring-2 focus:ring-primary"
                      placeholder="전화번호"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowAddCustomer(false)} className="flex-1 py-2 border border-slate-300 dark:border-primary/40 rounded-lg font-semibold">취소</button>
                      <button onClick={handleAddCustomer} className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold">추가</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Procedure Type Selection */}
            {selectedCustomerId && (
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">시술 종류 선택</h3>
                <div className="grid grid-cols-2 gap-2">
                  {PROCEDURE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedProcedure(type)}
                      className={`p-3 rounded-xl text-sm font-medium border transition-all text-left ${
                        selectedProcedure === type
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-white dark:bg-primary/5 border-slate-200 dark:border-primary/20 hover:border-primary/40'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {(activeTab === 'before' || activeTab === 'after') && (
          <>
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
          </>
        )}
      </main>

      {/* CTA Button */}
      <div className="fixed bottom-24 left-0 right-0 px-4 max-w-2xl mx-auto z-40">
        <button 
          disabled={!selectedCustomerId || !selectedProcedure}
          onClick={handleProceed}
          className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] ${
            selectedCustomerId && selectedProcedure
              ? 'bg-primary hover:bg-primary/90 text-white shadow-primary/20'
              : 'bg-slate-300 dark:bg-slate-700 text-slate-500 shadow-none cursor-not-allowed'
          }`}
        >
          {selectedCustomerId && selectedProcedure ? 'GPS 위치 인증하기' : '고객과 시술을 먼저 선택하세요'}
        </button>
      </div>
    </div>
  );
};

export default Guide;
