import type { ShopMode } from '../types/types';

export const PMU_PROCEDURES = [
  '눈썹 문신 (Microblading)',
  '입술 반영구 (Lip Blush)',
  '점막 아이라인 (Eyeliner)',
  '파우더 브로우 (Powder Brows)',
  '헤어라인 교정 (Hairline)',
  'SMP (Scalp Micropigmentation)',
  '상담만',
  '기타',
];

export const TATTOO_PROCEDURES = [
  '레터링 (Lettering)',
  '미니 타투 (Small Tattoo)',
  '감성 타투 (Fine Line)',
  '블랙워크 (Blackwork)',
  '올드스쿨 (Old School)',
  '이레즈미 (Irezumi)',
  '커버업 (Cover-up)',
  '상담/커스텀 도안',
  '기타',
];

export const getProceduresByMode = (mode: ShopMode) => {
  return mode === 'tattoo' ? TATTOO_PROCEDURES : PMU_PROCEDURES;
};

export const getLabelsByMode = (mode: ShopMode) => {
  if (mode === 'tattoo') {
    return {
      procedure: '작업',
      pigment: '잉크',
      artist: '타투이스트',
      guide: '작업 후 관리',
    };
  }
  return {
    procedure: '시술',
    pigment: '색소',
    artist: '원장님',
    guide: '시술 후 관리',
  };
};
