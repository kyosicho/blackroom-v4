import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Mail, KeyRound, ArrowRight } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleOAuthLogin = async (provider: 'google' | 'kakao' | 'notion') => {
    // For Naver, Supabase doesn't have a direct native provider without custom config, 
    // so we might need a workaround. Kakao and Google are supported.
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 p-6">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-10">
          <div className="size-16 rounded-full bg-primary/20 flex flex-col items-center justify-center mx-auto mb-4 border border-primary/30 text-primary font-bold text-xl">
            BR
          </div>
          <h1 className="text-2xl font-bold tracking-widest uppercase text-slate-900 dark:text-slate-100 mb-2">BLACKROOM</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">전문가를 위한 PMU 관리 솔루션</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 text-center border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4 mb-8">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호" 
                className="w-full h-14 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? '로그인 중...' : '이메일로 로그인'}
            {!loading && <ArrowRight className="size-5" />}
          </button>
        </form>

        <div className="flex items-center gap-4 mb-8 opacity-60">
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">간편 로그인</span>
          <div className="flex-1 h-px bg-slate-300 dark:bg-slate-700"></div>
        </div>

        <div className="space-y-3">
          <button onClick={() => handleOAuthLogin('kakao')} type="button" className="w-full h-14 bg-[#FEE500] text-[#000000] font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#FEE500]/90 transition-colors">
            카카오로 로그인
          </button>
          <button onClick={() => alert('네이버 로그인은 추가 설정이 필요합니다.')} type="button" className="w-full h-14 bg-[#03C75A] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#03C75A]/90 transition-colors">
            네이버로 로그인
          </button>
          <button onClick={() => handleOAuthLogin('google')} type="button" className="w-full h-14 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            구글로 로그인
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            아직 계정이 없으신가요?{' '}
            <button onClick={() => navigate('/register')} className="text-primary font-bold hover:underline">
              회원가입
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
