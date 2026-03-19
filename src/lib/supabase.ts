import { createClient } from '@supabase/supabase-js';

// VITE_ 로 시작하는 환경변수를 .env.local 파일에 설정해야 합니다.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('[Blackroom] Supabase 환경 변수가 설정되지 않았습니다. .env.local 또는 Vercel 설정을 확인해주세요.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co', 
  supabaseKey || 'placeholder-key'
);
