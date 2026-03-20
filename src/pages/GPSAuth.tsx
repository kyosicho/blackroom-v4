import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle, Loader2, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import Header from '../components/Header';
import gpsAuthImg from '../assets/images/gps_auth.png';

const GPSAuth: React.FC = () => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [address, setAddress] = useState<string>('위치 파악 중...');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorStatus, setErrorStatus] = useState<'none' | 'permission' | 'error'>('none');
  const [errorMessage, setErrorMessage] = useState('');

  // 매장 설정 가져오기
  const shopSettings = useMemo(() => {
    try {
      const data = localStorage.getItem('blackroom_settings');
      if (data) return JSON.parse(data);
    } catch { return {}; }
    return {};
  }, []);

  // 거리 계산 (Haversine 공식)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // m 단위
  };

  const distanceFromShop = useMemo(() => {
    if (!coords || !shopSettings.shopLatitude || !shopSettings.shopLongitude) return null;
    return getDistance(
      coords.lat, coords.lng, 
      shopSettings.shopLatitude, shopSettings.shopLongitude
    );
  }, [coords, shopSettings]);

  const isAtShop = useMemo(() => {
    if (distanceFromShop === null) return true; // 매장 위치 미설정 시 통과
    return distanceFromShop <= 500; // 500m 이내
  }, [distanceFromShop]);

  useEffect(() => {
    const getPosition = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCoords({ lat: latitude, lng: longitude });
            setErrorStatus('none');
            
            try {
              const kakaoKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
              if (kakaoKey) {
                const res = await fetch(`https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`, {
                  headers: { Authorization: `KakaoAK ${kakaoKey}` }
                });
                const data = await res.json();
                if (data.documents && data.documents.length > 0) {
                  const addr = data.documents[0].address;
                  const roadAddr = data.documents[0].road_address;
                  setAddress(roadAddr ? roadAddr.address_name : addr.address_name);
                  return;
                }
              }
              setAddress(`위도: ${latitude.toFixed(4)}, 경도: ${longitude.toFixed(4)}`);
            } catch {
              setAddress(`위도: ${latitude.toFixed(4)}, 경도: ${longitude.toFixed(4)}`);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setErrorStatus(error.code === 1 ? 'permission' : 'error');
            let msg = '위치 정보를 가져올 수 없습니다.';
            if (error.code === 1) msg = '브라우저 설정에서 위치 권한을 허용해주세요.';
            else if (error.code === 2) msg = 'GPS 신호를 찾을 수 없습니다.';
            else if (error.code === 3) msg = '시간이 초과되었습니다. 다시 시도해주세요.';
            setErrorMessage(msg);
            setAddress(msg);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        setAddress('GPS를 지원하지 않는 기기입니다.');
        setErrorStatus('error');
      }
    };

    getPosition();
  }, []);

  const handleVerify = () => {
    if (errorStatus !== 'none') {
      alert('위치 정보를 허용해야 인증이 가능합니다.');
      return;
    }

    if (!isAtShop) {
      alert(`매장과 너무 멀리 떨어져 있습니다. (약 ${Math.round(distanceFromShop || 0)}m)\n매장 근처에서 다시 시도해 주세요.`);
      return;
    }
    
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      navigate('/consent');
    }, 1200);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display">
      <Header title="위치 인증" />
      
      <main className="flex-grow flex flex-col p-6 space-y-6">
        <section className="space-y-3 pt-4">
          <div className="flex items-center gap-2">
            <span className="size-2 bg-primary rounded-full" />
            <p className="text-primary font-bold text-[10px] tracking-widest uppercase">Safe Procedure Check</p>
          </div>
          <h2 className="text-2xl font-black leading-tight">
            매장 도착 여부를<br/>확인합니다.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            원장님이 등록하신 매장 위치 반경 500m 이내에서만 시술 동의서 작성이 활성화됩니다.
          </p>
        </section>

        {errorStatus === 'permission' ? (
          <section className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <XCircle className="size-8" />
              <h3 className="font-bold text-lg">위치 권한이 거부됨</h3>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-3">
              <p>브라우저 상단 주소창 옆의 **자물쇠 아이콘**을 눌러 '위치' 권한을 **허용**으로 바꿔주세요.</p>
              <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-red-100 dark:border-red-900/20">
                <p className="font-bold mb-1 ml-1 text-xs">아이폰/사파리 해결법:</p>
                <p className="text-xs opacity-80 ml-1">설정 &gt; 개인정보 보호 &gt; 위치 서비스 &gt; Safari 웹 사이트 '사용하는 동안' 체크</p>
              </div>
              {errorMessage && <p className="text-[11px] mt-2 opacity-70">* {errorMessage}</p>}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="size-4" /> 다시 시도하기
            </button>
          </section>
        ) : (
          <section className="relative flex-grow min-h-[340px] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-primary/20 shadow-2xl">
            <div 
              className="absolute inset-0 bg-cover bg-center grayscale opacity-60" 
              style={{ backgroundImage: `url(${gpsAuthImg})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-background-dark via-transparent to-transparent"></div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-primary/20 bg-primary/5 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 border-2 border-primary/10 rounded-full animate-ping opacity-20"></div>
              <div className="relative w-5 h-5 bg-primary rounded-full shadow-[0_0_20px_rgba(238,43,91,0.6)]"></div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 space-y-3">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-primary/20 p-5 rounded-3xl flex items-center justify-between shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 p-2.5 rounded-2xl text-primary">
                    <MapPin className="size-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Device Location</p>
                    <p className="text-sm font-bold truncate max-w-[150px]">{address}</p>
                  </div>
                </div>
                <div className="text-right">
                  {coords ? (
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mb-1 ${isAtShop ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                        {distanceFromShop === null ? '매장 미등록' : isAtShop ? '매장 내 확인' : '범위 이탈'}
                      </span>
                      {distanceFromShop !== null && (
                        <p className="text-[10px] font-bold text-slate-400">약 {Math.round(distanceFromShop)}m</p>
                      )}
                    </div>
                  ) : (
                    <Loader2 className="size-5 text-primary animate-spin" />
                  )}
                </div>
              </div>
              
              {!isAtShop && distanceFromShop !== null && (
                <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 p-3 rounded-2xl flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="size-4 shrink-0" />
                  <p className="text-[10px] font-bold">인증을 위해 매장과의 거리를 500m 이내로 유지해주세요.</p>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="p-6 pb-12">
        <button 
          onClick={handleVerify}
          disabled={!coords || isVerifying || errorStatus !== 'none' || (!isAtShop && distanceFromShop !== null)}
          className={`w-full transition-all text-white py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center space-x-2
            ${(coords && isAtShop && !isVerifying)
              ? 'bg-primary hover:bg-primary/90 active:scale-[0.98] shadow-primary/20' 
              : 'bg-slate-300 dark:bg-slate-700 opacity-50 cursor-not-allowed shadow-none'}`}
        >
          {isVerifying ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <CheckCircle className="size-6" />
          )}
          <span>{isVerifying ? '위치 인증 중...' : '현재 위치로 인증하기'}</span>
        </button>
        {distanceFromShop === null && errorStatus === 'none' && (
          <p className="mt-4 text-center text-[11px] text-slate-500">
            * 아직 매장 위치가 등록되지 않았습니다. [설정]에서 등록을 권장합니다.
          </p>
        )}
      </footer>
    </div>
  );
};

export default GPSAuth;
