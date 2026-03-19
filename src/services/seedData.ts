// ============================================
// Blackroom PMU - Seed Data
// ============================================
// 앱 첫 실행 시 로드되는 샘플 데이터

import type { Customer, Appointment, ProcedureRecord, AppSettings } from '../types/types';
import { STORAGE_KEYS, generateId, setAll } from './storageService';

const CUSTOMER_IDS = {
  sarah: generateId(),
  michael: generateId(),
  emma: generateId(),
  minji: generateId(),
  seoyeon: generateId(),
  jisung: generateId(),
  yujin: generateId(),
};

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function getISOStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const seedCustomers: Customer[] = [
  {
    id: CUSTOMER_IDS.sarah,
    name: 'Sarah Jenkins',
    phone: '010-1234-5678',
    email: 'sarah.j@email.com',
    notes: '엠보 눈썹 연간 고객. 피부가 얇은 편.',
    createdAt: getISOStr(90),
    updatedAt: getISOStr(1),
  },
  {
    id: CUSTOMER_IDS.michael,
    name: 'Michael Chen',
    phone: '010-2345-6789',
    email: 'michael.c@email.com',
    notes: 'Forearm sleeve 진행 중. 3차 세션.',
    createdAt: getISOStr(60),
    updatedAt: getISOStr(7),
  },
  {
    id: CUSTOMER_IDS.emma,
    name: 'Emma Wilson',
    phone: '010-3456-7890',
    notes: '파우더 브로우 첫 시술 고객.',
    createdAt: getISOStr(30),
    updatedAt: getISOStr(14),
  },
  {
    id: CUSTOMER_IDS.minji,
    name: '김민지',
    phone: '010-4567-8901',
    email: 'minji.kim@email.com',
    notes: '눈썹 마이크로블레이딩 리터치 예정.',
    createdAt: getISOStr(120),
    updatedAt: getISOStr(3),
  },
  {
    id: CUSTOMER_IDS.seoyeon,
    name: '이서연',
    phone: '010-5678-9012',
    notes: '입술 반영구 진행 중.',
    createdAt: getISOStr(45),
    updatedAt: getISOStr(5),
  },
  {
    id: CUSTOMER_IDS.jisung,
    name: '박지성',
    phone: '010-6789-0123',
    email: 'jisung.park@email.com',
    notes: '점막 아이라인 상담 진행.',
    createdAt: getISOStr(20),
    updatedAt: getISOStr(10),
  },
  {
    id: CUSTOMER_IDS.yujin,
    name: '최유진',
    phone: '010-7890-1234',
    notes: '헤어라인 교정 완료 고객.',
    createdAt: getISOStr(150),
    updatedAt: getISOStr(30),
  },
];

const seedAppointments: Appointment[] = [
  {
    id: generateId(),
    customerId: CUSTOMER_IDS.sarah,
    date: getTodayStr(),
    time: '10:00',
    procedureType: 'Microblading - Touch up',
    status: 'scheduled',
    notes: '연간 리터치',
    createdAt: getISOStr(7),
    updatedAt: getISOStr(7),
  },
  {
    id: generateId(),
    customerId: CUSTOMER_IDS.michael,
    date: getTodayStr(),
    time: '13:30',
    procedureType: 'Forearm Sleeve - Line work',
    status: 'scheduled',
    notes: '3차 세션 라인워크',
    createdAt: getISOStr(5),
    updatedAt: getISOStr(5),
  },
  {
    id: generateId(),
    customerId: CUSTOMER_IDS.emma,
    date: getTodayStr(),
    time: '16:00',
    procedureType: 'Powder Brows - Full set',
    status: 'scheduled',
    notes: '첫 시술',
    createdAt: getISOStr(3),
    updatedAt: getISOStr(3),
  },
  // 내일 예약
  {
    id: generateId(),
    customerId: CUSTOMER_IDS.minji,
    date: getDateStr(-1), // 내일
    time: '11:00',
    procedureType: '눈썹 문신 (Microblading)',
    status: 'scheduled',
    createdAt: getISOStr(2),
    updatedAt: getISOStr(2),
  },
];

const seedRecords: ProcedureRecord[] = [
  {
    id: generateId(),
    customerId: CUSTOMER_IDS.minji,
    customerName: '김민지',
    procedureType: '눈썹 문신 (Microblading)',
    pigment: 'EB22 다크 브라운',
    needle: '1RL 0.25mm',
    notes: '피부 반응 양호. 색상 정착 잘 됨.',
    additionalImages: [],
    status: 'completed',
    createdAt: getISOStr(5),
    updatedAt: getISOStr(5),
  },
  {
    id: generateId(),
    customerId: CUSTOMER_IDS.seoyeon,
    customerName: '이서연',
    procedureType: '입술 반영구 (Lip Blush)',
    pigment: 'LB08 코랄 핑크',
    needle: '3RL 0.30mm',
    notes: '리터치 필요. 2주 후 재방문 예정.',
    additionalImages: [],
    status: 'touch-up',
    createdAt: getISOStr(7),
    updatedAt: getISOStr(7),
  },
  {
    id: generateId(),
    customerId: CUSTOMER_IDS.jisung,
    customerName: '박지성',
    procedureType: '점막 아이라인 (Eyeliner)',
    pigment: '',
    needle: '',
    notes: '상담 진행. 시술 날짜 미정.',
    additionalImages: [],
    status: 'consulting',
    createdAt: getISOStr(10),
    updatedAt: getISOStr(10),
  },
  {
    id: generateId(),
    customerId: CUSTOMER_IDS.yujin,
    customerName: '최유진',
    procedureType: '헤어라인 교정 (Hairline)',
    pigment: 'SMP01 내추럴 블랙',
    needle: '1RL 0.20mm',
    notes: '시술 완료. 결과 만족.',
    additionalImages: [],
    status: 'completed',
    createdAt: getISOStr(30),
    updatedAt: getISOStr(30),
  },
];

const defaultSettings: AppSettings = {
  artistName: '원장님',
  shopName: 'Blackroom PMU',
  weeklyGoal: 15,
  theme: 'dark',
  language: 'ko',
};

export function initializeSeedData(): void {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (isInitialized) return;

  setAll(STORAGE_KEYS.CUSTOMERS, seedCustomers);
  setAll(STORAGE_KEYS.APPOINTMENTS, seedAppointments);
  setAll(STORAGE_KEYS.RECORDS, seedRecords);
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

  console.log('[Blackroom] 시드 데이터 초기화 완료');
}
