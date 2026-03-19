import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Mail, FileText, Calendar, Edit3, ChevronRight } from 'lucide-react';
import { useCustomers } from '../context/CustomerContext';
import { useRecords } from '../context/RecordContext';
import Header from '../components/Header';

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCustomer } = useCustomers();
  const { getRecordsByCustomer } = useRecords();

  const customer = getCustomer(id || '');
  const records = getRecordsByCustomer(id || '');

  if (!customer) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>고객 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/customers')} className="mt-4 text-primary font-bold">목록으로 돌아가기</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      <Header 
        title="고객 상세 정보" 
        rightElement={
          <button className="p-2 hover:bg-primary/10 rounded-full transition-colors">
            <Edit3 className="size-5 text-slate-900 dark:text-slate-100" />
          </button>
        }
      />

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
        {/* Profile Card */}
        <section className="bg-white dark:bg-primary/5 rounded-2xl p-6 border border-slate-200 dark:border-primary/20 shadow-sm mb-6 flex flex-col items-center">
          <div className="size-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold mb-4 border-4 border-primary/10">
            {customer.name.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold mb-1">{customer.name}</h2>
          <div className="flex flex-col gap-2 w-full mt-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-primary/10 rounded-xl">
              <Phone className="size-4 text-primary" />
              <span className="text-sm font-medium">{customer.phone}</span>
            </div>
            {customer.email && (
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-primary/10 rounded-xl">
                <Mail className="size-4 text-primary" />
                <span className="text-sm font-medium">{customer.email}</span>
              </div>
            )}
          </div>
          {customer.notes && (
            <div className="w-full mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl">
              <p className="text-xs font-bold text-yellow-700 dark:text-yellow-500 uppercase mb-1">고객 메모</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">{customer.notes}</p>
            </div>
          )}
        </section>

        {/* History Tabs / Sections */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              시술 히스토리
            </h3>
            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">{records.length}건</span>
          </div>

          <div className="space-y-3">
            {records.length > 0 ? (
              records.map(record => (
                <div 
                  key={record.id}
                  onClick={() => navigate(`/record/${record.id}`)}
                  className="bg-white dark:bg-primary/5 p-4 rounded-xl border border-slate-200 dark:border-primary/20 flex gap-4 hover:border-primary/40 transition-all cursor-pointer group"
                >
                  <div className="size-16 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                    {record.beforeImage ? (
                      <img src={record.beforeImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Calendar className="size-8 text-primary/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold truncate text-base">{record.procedureType}</p>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{new Date(record.createdAt).toLocaleDateString()}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/20 text-green-600 uppercase">{record.status}</span>
                      {record.aiScanResult && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/20 text-blue-600 uppercase">AI Scanned</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-slate-300 group-hover:text-primary transition-colors">
                    <ChevronRight className="size-5" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 dark:bg-primary/5 rounded-2xl border-2 border-dashed border-slate-200 dark:border-primary/20">
                <p className="text-slate-500 text-sm">시술 기록이 없습니다.</p>
                <button 
                  onClick={() => navigate('/guide')}
                  className="mt-2 text-primary text-sm font-bold hover:underline"
                >
                  새 시술 시작하기
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default CustomerDetail;
