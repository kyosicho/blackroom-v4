import { Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Guide from './pages/Guide'
import GPSAuth from './pages/GPSAuth'
import Consent from './pages/Consent'
import ScanLoading from './pages/ScanLoading'
import ScanResult from './pages/ScanResult'
import RecordAIScan from './pages/RecordAIScan'
import Records from './pages/Records'
import RecordDetail from './pages/RecordDetail'
import AppointmentDetail from './pages/AppointmentDetail'
import Customers from './pages/Customers'
import CustomerDetail from './pages/CustomerDetail'
import Calendar from './pages/Calendar'
import NewAppointment from './pages/NewAppointment'
import Settings from './pages/Settings'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { RecordProvider } from './context/RecordContext'
import { CustomerProvider } from './context/CustomerContext'
import { AppointmentProvider } from './context/AppointmentContext'
import { SettingsProvider } from './context/SettingsContext' // 추가
import { ConsentProvider } from './context/ConsentContext'; // 추가
import { Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // MVP: 인증 건너뛰기
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <LanguageProvider>
          <AuthProvider>
            <CustomerProvider>
              <AppointmentProvider>
                <RecordProvider>
                  <ConsentProvider>
                    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display flex flex-col max-w-screen-md mx-auto relative shadow-2xl shadow-primary/5">
                      <main className="flex-1">
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Protected Routes */}
                        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                        <Route path="/guide" element={<ProtectedRoute><Guide /></ProtectedRoute>} />
                        <Route path="/gps-auth" element={<ProtectedRoute><GPSAuth /></ProtectedRoute>} />
                        <Route path="/consent" element={<ProtectedRoute><Consent /></ProtectedRoute>} />
                        <Route path="/scan-loading" element={<ProtectedRoute><ScanLoading /></ProtectedRoute>} />
                        <Route path="/scan-result" element={<ProtectedRoute><ScanResult /></ProtectedRoute>} />
                        <Route path="/record-ai_scan" element={<ProtectedRoute><RecordAIScan /></ProtectedRoute>} />
                        <Route path="/records" element={<ProtectedRoute><Records /></ProtectedRoute>} />
                        <Route path="/record/:id" element={<ProtectedRoute><RecordDetail /></ProtectedRoute>} />
                        <Route path="/appointment/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
                        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
                        <Route path="/customer/:id" element={<ProtectedRoute><CustomerDetail /></ProtectedRoute>} />
                        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
                        <Route path="/new-appointment" element={<ProtectedRoute><NewAppointment /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                        <Route path="/home" element={<Navigate to="/" replace />} />
                      </Routes>
                    </main>
                    
                    {/* Bottom navigation is hidden on login/register pages */}
                    <Routes>
                      <Route path="/login" element={null} />
                      <Route path="/register" element={null} />
                      <Route path="*" element={<BottomNav />} />
                    </Routes>
                    
                    </div>
                  </ConsentProvider>
                </RecordProvider>
              </AppointmentProvider>
            </CustomerProvider>
          </AuthProvider>
        </LanguageProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}

export default App
