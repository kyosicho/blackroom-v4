export const translations = {
  ko: {
    nav: {
      home: '홈',
      calendar: '일정',
      customers: '고객',
      guide: '시술 시작',
      records: '시술 내역',
      settings: '설정',
    },
    settings: {
      title: '설정',
      profile: '프로필',
      artistName: '원장 이름',
      shopName: '매장 이름',
      goals: '목표 설정',
      weeklyGoal: '주간 목표 건수',
      appearance: '외관',
      theme: '테마',
      darkMode: '다크 모드',
      lightMode: '라이트 모드',
      system: '시스템',
      language: '언어',
      dataStats: '데이터 현황',
      dataManagement: '데이터 관리',
      exportData: '데이터 백업 (JSON)',
      resetData: '전체 데이터 초기화',
      confirmReset: '⚠️ 모든 데이터를 초기화하시겠습니까?\n고객, 예약, 시술 기록이 모두 삭제됩니다.',
    },
    home: {
      greeting: '안녕하세요, {name} 원장님',
      searchPlaceholder: '고객 이름 또는 연락처 검색...',
      weeklyGoal: '이번 주 목표',
      cases: '건',
      todaySchedule: '오늘의 일정',
      newRecord: '새 시술 기록',
      noSchedule: '오늘 예정된 일정이 없습니다.',
    }
  },
  en: {
    nav: {
      home: 'Home',
      calendar: 'Calendar',
      customers: 'Customers',
      guide: 'Start Session',
      records: 'History',
      settings: 'Settings',
    },
    settings: {
      title: 'Settings',
      profile: 'Profile',
      artistName: 'Artist Name',
      shopName: 'Shop Name',
      goals: 'Goals',
      weeklyGoal: 'Weekly Goal',
      appearance: 'Appearance',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      system: 'System',
      language: 'Language',
      dataStats: 'Data Stats',
      dataManagement: 'Data Management',
      exportData: 'Export Backup (JSON)',
      resetData: 'Reset All Data',
      confirmReset: '⚠️ Are you sure you want to reset all data?\nAll customers, appointments, and records will be deleted.',
    },
    home: {
      greeting: 'Hello, {name}',
      searchPlaceholder: 'Search customer name or phone...',
      weeklyGoal: 'Weekly Goal',
      cases: 'cases',
      todaySchedule: "Today's Schedule",
      newRecord: 'New Record',
      noSchedule: 'No appointments scheduled for today.',
    }
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.ko;
