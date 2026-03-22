import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { initializeSeedData } from './services/seedData'

// 앱 첫 실행 시 시드 데이터 초기화
initializeSeedData();

// Debug: AI Key Check
console.log("VITE_GEMINI_API_KEY is defined:", !!import.meta.env.VITE_GEMINI_API_KEY);
if (import.meta.env.VITE_GEMINI_API_KEY) {
  console.log("VITE_GEMINI_API_KEY Length:", import.meta.env.VITE_GEMINI_API_KEY.length);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
