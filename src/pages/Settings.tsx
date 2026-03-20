import React, { useMemo } from 'react';
import { ArrowLeft, Moon, Sun, Globe, Target, Trash2, Download, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../services/storageService';
import type { AppSettings } from '../types/types';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { settings, updateSettings } = useSettings();
  
  const save = (updates: Partial<AppSettings>) => {
    updateSettings(updates);
  };

  const handleResetData = () => {
    if (window.confirm(t.settings.confirmReset)) {
      Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const exportData: Record<string, unknown> = {};
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      if (data) exportData[name] = JSON.parse(data);
    });
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blackroom_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dataStats = useMemo(() => {
    const get = (key: string) => { try { return JSON.parse(localStorage.getItem(key) || '[]').length; } catch { return 0; } };
    return {
      customers: get(STORAGE_KEYS.CUSTOMERS),
      appointments: get(STORAGE_KEYS.APPOINTMENTS),
      records: get(STORAGE_KEYS.RECORDS),
      consents: get(STORAGE_KEYS.CONSENTS),
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center p-4 sticky top-0 bg-background-light dark:bg-background-dark z-10 border-b border-primary/10">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-primary/10 rounded-full transition-colors">
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="text-lg font-bold flex-1 text-center pr-10">{t.settings.title}</h1>
      </header>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-6 pb-32">
        {/* Shop Sharing (New v4) */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">샵 협업 및 공유 설정</h3>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-primary uppercase mb-1">내 샵 공유 코드</p>
                <p className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">{settings.shopId}</p>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(settings.shopId);
                  alert('샵 코드가 복사되었습니다. 직원들과 공유하세요!');
                }}
                className="bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                코드 복사
              </button>
            </div>
            <div className="pt-4 border-t border-primary/10">
              <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                다른 직원의 기기에서 위 코드를 입력하면 이 샵의 모든 스케줄과 기록을 실시간으로 함께 관리할 수 있습니다.
              </p>
              <div className="flex gap-2">
                <input 
                  id="targetShopId"
                  placeholder="공유받은 코드 입력" 
                  className="flex-1 bg-white dark:bg-primary/10 border border-slate-200 dark:border-primary/20 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                <button 
                  onClick={() => {
                    const code = (document.getElementById('targetShopId') as HTMLInputElement).value;
                    if (code && confirm(`'${code}' 샵으로 전환하시겠습니까? 기존 데이터가 해당 샵의 데이터로 교체됩니다.`)) {
                      save({ shopId: code.toUpperCase() });
                      window.location.reload();
                    }
                  }}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-4 py-2 rounded-lg active:scale-95 transition-transform"
                >
                  샵 전환
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Profile */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{t.settings.profile}</h3>
          <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl p-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">{t.settings.artistName}</label>
              <input className="w-full border border-slate-200 dark:border-primary/20 rounded-lg p-3 bg-transparent outline-none focus:ring-2 focus:ring-primary" value={settings.artistName} onChange={(e) => save({ artistName: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">{t.settings.shopName}</label>
              <input className="w-full border border-slate-200 dark:border-primary/20 rounded-lg p-3 bg-transparent outline-none focus:ring-2 focus:ring-primary" value={settings.shopName} onChange={(e) => save({ shopName: e.target.value })} />
            </div>
          </div>
        </section>

        {/* Shop Mode / 샵 유형 설정 (New) */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">샵 유형 설정</h3>
          <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-2xl p-1.5 flex gap-1.5">
            <button
              onClick={() => save({ shopMode: 'pmu' })}
              className={`flex-1 py-3.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                settings.shopMode === 'pmu'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-primary/5'
              }`}
            >
              <span className="text-sm">반영구 센터</span>
              <span className="text-[10px] opacity-60 font-medium">Eyebrow & Lip</span>
            </button>
            <button
              onClick={() => save({ shopMode: 'tattoo' })}
              className={`flex-1 py-3.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                settings.shopMode === 'tattoo'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-primary/5'
              }`}
            >
              <span className="text-sm">타투 스튜디오</span>
              <span className="text-[10px] opacity-60 font-medium">Fine Line & Work</span>
            </button>
          </div>
          <p className="mt-2.5 px-1 text-[11px] text-slate-400 font-medium leading-relaxed">
            유형에 따라 시술 항목과 용어(색소/잉크 등)가 자동으로 최적화됩니다.
          </p>
        </section>

        {/* Goals */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{t.settings.goals}</h3>
          <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Target className="size-5 text-primary" />
              <label className="text-sm font-medium flex-1">{t.settings.weeklyGoal}</label>
              <input type="number" min={1} max={50} className="w-20 border border-slate-200 dark:border-primary/20 rounded-lg p-2 text-center bg-transparent outline-none focus:ring-2 focus:ring-primary" value={settings.weeklyGoal} onChange={(e) => save({ weeklyGoal: parseInt(e.target.value) || 15 })} />
            </div>
          </div>
        </section>

        {/* Appearance & Themes */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{t.settings.appearance}</h3>
          <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl p-4 space-y-5">
            {/* Theme & Language */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="size-5 text-primary" /> : <Sun className="size-5 text-primary" />}
                <span className="text-sm font-medium flex-1">{t.settings.theme}</span>
                <select className="border border-slate-200 dark:border-primary/20 rounded-lg p-2 bg-transparent dark:bg-card-dark outline-none text-sm" value={theme} onChange={(e) => setTheme(e.target.value as AppSettings['theme'])}>
                  <option value="dark">{t.settings.darkMode}</option>
                  <option value="light">{t.settings.lightMode}</option>
                  <option value="system">{t.settings.system}</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="size-5 text-primary" />
                <span className="text-sm font-medium flex-1">{t.settings.language}</span>
                <select className="border border-slate-200 dark:border-primary/20 rounded-lg p-2 bg-transparent dark:bg-card-dark outline-none text-sm" value={language} onChange={(e) => {
                  const newLang = e.target.value as typeof language;
                  setLanguage(newLang);
                  save({ language: newLang });
                }}>
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* Color Personalization (New v4) */}
            <div className="pt-4 border-t border-slate-100 dark:border-primary/10">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block">포인트 컬러 (Theme Color)</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Rose', color: '#ee2b5b' },
                  { name: 'Blue', color: '#2b67ee' },
                  { name: 'Gold', color: '#eead2b' },
                  { name: 'Green', color: '#2bee7c' },
                  { name: 'Purple', color: '#9d2bee' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => {
                        save({ primaryColor: c.color });
                        // ThemeContext 업데이트를 위해 강제 리로드 또는 다른 방식 필요할 수 있으나 
                        // 현재 ThemeContext가 settings를 바라보지 않고 localStorage를 직접 보거나 
                        // state가 상위에 있으면 즉시 반영됨. 
                        // (우리는 window.location.reload() 없이 Context 연동 확인)
                        window.location.reload(); // Context 연동 안될 경우를 위해 안전빵
                    }}
                    className={`size-8 rounded-full border-2 transition-transform active:scale-90 ${
                      (settings.primaryColor || '#ee2b5b') === c.color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
                
                {/* Custom Color Picker */}
                <div className="relative size-8 rounded-full overflow-hidden border border-slate-200 dark:border-primary/30 active:scale-90 transition-transform">
                  <input 
                    type="color" 
                    className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                    value={settings.primaryColor || '#ee2b5b'}
                    onChange={(e) => save({ primaryColor: e.target.value })}
                    onBlur={() => window.location.reload()}
                  />
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">샵의 분위기에 맞는 컬러를 선택해보세요.</p>
            </div>
          </div>
        </section>

        {/* Features / 기능 설정 */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{language === 'en' ? 'Features' : '기능 설정'}</h3>
          <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-primary" />
                <span className="text-sm font-medium flex-1">{language === 'en' ? 'Enable GPS Authentication' : '시술 위치(GPS) 인증 필수 적용'}</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.enableGpsAuth ?? true}
                  onChange={(e) => save({ enableGpsAuth: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-primary/40 peer-checked:bg-primary"></div>
              </label>
            </div>

            {settings.enableGpsAuth !== false && (
              <div className="pt-3 border-t border-slate-100 dark:border-primary/10">
                <p className="text-[11px] text-slate-500 mb-2">
                  {language === 'en' 
                    ? 'Register your shop location to verify artist presence.' 
                    : '현재 위치를 매장 위치로 등록하여 본인 인증 보안을 강화하세요.'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!navigator.geolocation) {
                        alert('GPS를 지원하지 않는 브라우저입니다.');
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          save({
                            shopLatitude: pos.coords.latitude,
                            shopLongitude: pos.coords.longitude
                          });
                          alert('현재 위치가 매장 위치로 등록되었습니다.');
                        },
                        (err) => {
                          alert('위치 정보를 가져오는데 실패했습니다: ' + err.message);
                        }
                      );
                    }}
                    className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary py-2.5 rounded-lg text-xs font-bold transition-colors"
                  >
                    {language === 'en' ? 'Set Current as Shop Location' : '현재 위치를 매장으로 등록'}
                  </button>
                  {settings.shopLatitude && (
                    <span className="bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded">
                      {language === 'en' ? 'Registered' : '등록됨'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Data Stats */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{t.settings.dataStats}</h3>
          <div className="bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="text-2xl font-bold text-primary">{dataStats.customers}</p>
                <p className="text-xs text-slate-500">{t.nav.customers}</p>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="text-2xl font-bold text-primary">{dataStats.appointments}</p>
                <p className="text-xs text-slate-500">{language === 'en' ? 'Appointments' : '예약'}</p>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="text-2xl font-bold text-primary">{dataStats.records}</p>
                <p className="text-xs text-slate-500">{t.nav.records}</p>
              </div>
              <div className="text-center p-3 bg-primary/5 rounded-lg">
                <p className="text-2xl font-bold text-primary">{dataStats.consents}</p>
                <p className="text-xs text-slate-500">{language === 'en' ? 'Consents' : '동의서'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{t.settings.dataManagement}</h3>
          <div className="space-y-3">
            <button onClick={handleExportData} className="w-full flex items-center gap-3 p-4 bg-white dark:bg-primary/5 border border-slate-200 dark:border-primary/20 rounded-xl hover:border-primary/40 transition-colors">
              <Download className="size-5 text-primary" />
              <span className="font-medium">{t.settings.exportData}</span>
            </button>
            <button onClick={handleResetData} className="w-full flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl hover:border-red-400 transition-colors">
              <Trash2 className="size-5 text-red-500" />
              <span className="font-medium text-red-600 dark:text-red-400">{t.settings.resetData}</span>
            </button>
          </div>
        </section>

        <div className="text-center text-xs text-slate-400 pt-4">
          <p>BLACKROOM v1.0.0</p>
          <p className="mt-1">© 2026 BLACKROOM Studio</p>
        </div>
      </main>
    </div>
  );
};

export default Settings;
