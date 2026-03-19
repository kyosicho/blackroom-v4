import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CheckCircle, Loader2 } from 'lucide-react';
import Header from '../components/Header';
import gpsAuthImg from '../assets/images/gps_auth.png';

const GPSAuth: React.FC = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState<string>('위치 파악 중...');
  const [isVerifying, setIsVerifying] = useState(false);
  const [locationPermitted, setLocationPermitted] = useState(false);

  useEffect(() => {
    const getPosition = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocationPermitted(true);
            
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
            let msg = '위치 정보를 가져올 수 없습니다.';
            if (error.code === 1) msg = '위치 권한을 허용해주세요.';
            else if (error.code === 2) msg = 'GPS 신호를 찾을 수 없습니다.';
            else if (error.code === 3) msg = '시간이 초과되었습니다. 다시 시도해주세요.';
            
            setAddress(msg);
            setLocationPermitted(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      } else {
        setAddress('GPS를 지원하지 않는 기기입니다.');
      }
    };

    getPosition();
  }, []);

  const handleRetry = () => {
    setAddress('위치 파악 중...');
    window.location.reload(); // 간단하게 페이지 새로고침으로 재시도 유도
  };

  const handleVerify = () => {
    if (!locationPermitted) {
      alert('위치 정보를 허용해야 인증이 가능합니다.');
      return;
    }
    
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      navigate('/consent');
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-blackroom text-white">
      <Header title="위치 인증" />
      
      <main className="flex-grow flex flex-col p-6 space-y-8">
        <section className="space-y-3">
          <p className="text-primary font-medium text-sm tracking-widest uppercase">Location Verification</p>
          <h2 className="text-xl font-bold leading-tight">
            법적 규제 준수를 위해<br/>현재 시술 위치를 확인합니다.
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            지정된 사업장 내에서만 시술 기록 및 동의서 작성이 가능합니다. GPS 정보를 기반으로 현재 위치를 확인해 주세요.
          </p>
        </section>

        <section className="relative flex-grow min-h-[300px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          {/* Map Placeholder */}
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url(${gpsAuthImg})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* GPS Marker */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-primary/30 bg-primary/10 rounded-full flex items-center justify-center">
            <div className="relative w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_rgba(238,43,91,0.8)] location-pulse"></div>
          </div>

          {/* Location Info Badge */}
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-sm border border-white/10 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/20 p-2 rounded-lg text-primary">
                <MapPin className="size-5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Area</p>
                <p className="text-sm font-semibold">{address}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {locationPermitted && address !== '위치 파악 중...' ? (
                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-bold">확인됨</span>
              ) : (
                <button 
                  onClick={handleRetry}
                  className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-full font-bold hover:bg-primary/30 transition-colors"
                >
                  재시도
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="p-6 pb-12">
        <button 
          onClick={handleVerify}
          disabled={!locationPermitted || isVerifying || address === '위치 파악 중...'}
          className={`w-full transition-all text-white py-5 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center space-x-2
            ${locationPermitted && address !== '위치 파악 중...' 
              ? 'bg-primary hover:bg-primary/90 active:scale-[0.98] shadow-primary/20' 
              : 'bg-gray-600 opacity-70 cursor-not-allowed shadow-none'}`}
        >
          {isVerifying ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <CheckCircle className="size-5" />
          )}
          <span>{isVerifying ? '위치 인증 중...' : '현재 위치로 인증하기'}</span>
        </button>
      </footer>
    </div>
  );
};

export default GPSAuth;
