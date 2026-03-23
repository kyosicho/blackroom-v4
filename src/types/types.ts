// ============================================
// Blackroom PMU - Core Data Types
// ============================================

// 고객 정보
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  profileImage?: string;
  shopId?: string;
  createdAt: string;
  updatedAt: string;
}

// 예약/일정
export interface Appointment {
  id: string;
  customerId: string;
  date: string;           // YYYY-MM-DD
  time: string;           // HH:mm
  procedureType: string;
  status: AppointmentStatus;
  notes?: string;
  depositPaid?: boolean;
  shopId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

// 시술 동의서
export interface Consent {
  id: string;
  customerId: string;
  appointmentId?: string;
  terms: boolean[];
  signatureData: string;   // base64 Canvas 이미지
  shopId?: string;
  signedAt: string;
  createdAt: string;
}

// 시술 기록
export interface ProcedureRecord {
  id: string;
  customerId: string;
  customerName: string;
  appointmentId?: string;
  consentId?: string;
  procedureType: string;
  pigment: string;
  needle: string;
  notes: string;
  beforeImage?: string;
  afterImage?: string;
  additionalImages: string[];
  aiScanResult?: AIScanResult;
  status: RecordStatus;
  gpsVerified?: boolean;
  postGuideConfirmed?: boolean;
  shopId?: string;
  createdAt: string;
  updatedAt: string;
}

export type RecordStatus = 'in-progress' | 'completed' | 'touch-up' | 'consulting';

// AI 스캔 결과
export interface AIScanResult {
  pigmentBrand: string;
  pigmentColor: string;
  lotNumber?: string;
  needleType: string;
  needleSize: string;
  notes: string;
  scannedAt: string;
  // 복수 재료 지원 (v1.2)
  pigments?: string[];   // 인식된 모든 색소 목록
  needles?: string[];    // 인식된 모든 니들 목록
}

export type ShopMode = 'pmu' | 'tattoo';

// 앱 세팅
export interface AppSettings {
  artistName: string;
  shopName: string;
  weeklyGoal: number;
  theme: 'light' | 'dark' | 'system';
  language: 'ko' | 'en';
  shopMode: ShopMode; // 추가
  primaryColor?: string; // 추가 (v4)
  backgroundColor?: string; // 추가 (v4.3)
  themeControlMode?: 'background' | 'point' | 'system'; // 추가 (v4.3)
  shopId: string; // 추가 (v4)
  enableGpsAuth?: boolean;
  shopLatitude?: number;
  shopLongitude?: number;
}

// 유틸 타입
export interface WithTimestamps {
  createdAt: string;
  updatedAt: string;
}
