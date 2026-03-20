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
  createdAt: string;
  updatedAt: string;
}

export type RecordStatus = 'in-progress' | 'completed' | 'touch-up' | 'consulting';

// AI 스캔 결과
export interface AIScanResult {
  skinType: string;
  hydration: number;
  sensitivity: string;
  recommendedPigment: string;
  recommendedNeedle: string;
  notes: string;
  scannedAt: string;
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
  enableGpsAuth?: boolean;
  shopLatitude?: number;
  shopLongitude?: number;
}

// 유틸 타입
export interface WithTimestamps {
  createdAt: string;
  updatedAt: string;
}
