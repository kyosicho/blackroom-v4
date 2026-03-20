import React, { useMemo } from 'react';
import { 
  Palette, 
  Globe, 
  Layout,
  Settings as SettingsIcon,
  ArrowLeft,
  Target,
  MapPin,
  Download,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { STORAGE_KEYS } from '../services/storageService';
import type { AppSettings } from '../types/types';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
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
    const getCount = (key: string) => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data).length : 0;
      } catch {
        return 0;
      }
    };
    return {
      customers: getCount(STORAGE_KEYS.CUSTOMERS),
      appointments: getCount(STORAGE_KEYS.APPOINTMENTS),
      records: getCount(STORAGE_KEYS.RECORDS),
      consents: getCount(STORAGE_KEYS.CONSENTS),
    };
  }, []);

  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

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
                {settings.themeControlMode === 'background' ? <Layout className="size-5 text-primary" /> : settings.themeControlMode === 'point' ? <Palette className="size-5 text-primary" /> : <SettingsIcon className="size-5 text-primary" />}
                <span className="text-sm font-medium flex-1">테마 제어 모드</span>
                <select 
                  className="border border-slate-200 dark:border-primary/20 rounded-lg p-2 bg-transparent dark:bg-card-dark outline-none text-sm" 
                  value={settings.themeControlMode || 'background'} 
                  onChange={(e) => updateSettings({ themeControlMode: e.target.value as any })}
                >
                  <option value="background">1. 바탕색 제어</option>
                  <option value="point">2. 포인트 컬러 제어</option>
                  <option value="system">3. 시스템 설정 (자동)</option>
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

            {/* Color Personalization (v4.2 Optimized) */}
            <div className="pt-4 border-t border-slate-100 dark:border-primary/10">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 block">포인트 컬러 & 정교 조절</label>
              
              {/* Slider Enhancements (v4.3 Reactive Control) */}
              <div className="space-y-6 p-4 bg-slate-50 dark:bg-primary/10 rounded-2xl border border-slate-100 dark:border-primary/5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-slate-500">
                      {settings.themeControlMode === 'background' ? '바탕색 농도' : '포인트 농도'} (Grayscale)
                    </label>
                    <span className="text-[10px] text-primary font-mono">
                      {settings.themeControlMode === 'background' ? (settings.backgroundColor?.toUpperCase()) : (settings.primaryColor?.toUpperCase())}
                    </span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="255"
                    step="1"
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer grayscale-slider"
                    style={{ background: 'linear-gradient(to right, #000, #fff)' }}
                    value={(() => {
                        const color = settings.themeControlMode === 'background' ? settings.backgroundColor : settings.primaryColor;
                        return parseInt((color || '#000000').substring(1,3), 16);
                    })()}
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const hex = `#${val.toString(16).padStart(2, '0').repeat(3)}`;
                        if (settings.themeControlMode === 'background') updateSettings({ backgroundColor: hex });
                        else updateSettings({ primaryColor: hex });
                    }}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11px] font-bold text-slate-500">
                      {settings.themeControlMode === 'background' ? '바탕색 색상' : '포인트 색상'} (Rainbow Hue)
                    </label>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="360"
                    step="1"
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer hue-slider"
                    style={{ background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}
                    onChange={(e) => {
                        const hue = parseInt(e.target.value);
                        const hex = hslToHex(hue, 70, 55);
                        if (settings.themeControlMode === 'background') updateSettings({ backgroundColor: hex });
                        else updateSettings({ primaryColor: hex });
                    }}
                  />
                </div>

                {/* Custom Color Picker (Mini) */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">직접 보정:</span>
                  <div className="relative size-6 rounded-full overflow-hidden border border-slate-200 dark:border-primary/30 active:scale-90 transition-transform">
                    <input 
                      type="color" 
                      className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                      value={(settings.themeControlMode === 'background' ? settings.backgroundColor : settings.primaryColor) || '#ee2b5b'}
                      onChange={(e) => {
                          if (settings.themeControlMode === 'background') updateSettings({ backgroundColor: e.target.value });
                          else updateSettings({ primaryColor: e.target.value });
                      }}
                    />
                  </div>
                </div>
              </div>

              <p className="mt-3 text-[10px] text-slate-400 leading-relaxed">
                {settings.themeControlMode === 'background' 
                  ? '현재 슬라이더는 앱의 전체 바탕색을 조절합니다.' 
                  : settings.themeControlMode === 'point' 
                  ? '현재 슬라이더는 앱의 포인트 강조 색상을 조절합니다.' 
                  : '시스템 설정 모드에서는 기기 설정에 따라 자동으로 최적화됩니다.'}
              </p>
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
