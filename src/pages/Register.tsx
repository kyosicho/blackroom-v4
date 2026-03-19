import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, KeyRound, User, ArrowLeft } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMsg('회원가입이 완료되었습니다! 이메일을 확인하여 인증을 완료해주세요.');
      // 인증이 필요없는 설정이라면 바로 로그인 처리됨
      if (data.session) {
        navigate('/');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 p-6 relative">
      <button 
        onClick={() => navigate('/login')}
        className="absolute top-6 left-6 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-card-dark transition-colors"
      >
        <ArrowLeft className="size-6 text-slate-500" />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full pt-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-2">회원가입</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">기본 정보를 입력하고 블랙룸을 시작하세요.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 text-center border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg text-sm mb-6 text-center border border-green-200 dark:border-green-900/50 font-medium">
            {successMsg}
            <button
              onClick={() => navigate('/login')}
              className="block mt-3 w-full border border-green-600 text-green-600 dark:border-green-400 dark:text-green-400 rounded-lg py-2 font-bold hover:bg-green-100 dark:hover:bg-green-900/30"
            >
              로그인 화면으로
            </button>
          </div>
        )}

        {!successMsg && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름 (원장님 닉네임)" 
                  className="w-full h-14 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일 주소" 
                  className="w-full h-14 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 (6자리 이상)" 
                  className="w-full h-14 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center mt-6 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? '가입 처리 중...' : '계정 만들기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
