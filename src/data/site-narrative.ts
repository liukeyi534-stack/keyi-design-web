export type NarrativeSectionId = 'statement' | 'practice' | 'about' | 'contact';

export interface NarrativeSection {
  id: NarrativeSectionId;
  index: string;
  labelEn: string;
  labelZh: string;
  titleEn: string;
  titleZh: string;
  noteEn: string;
  noteZh: string;
}

export const NARRATIVE_SECTIONS: readonly NarrativeSection[] = [
  { id: 'statement', index: '01', labelEn: 'STATEMENT', labelZh: '创作立场', titleEn: 'Each frame is a complete unit.', titleZh: '每一帧都是一个完整单元。', noteEn: 'A personal archive of design units.', noteZh: '一份关于设计的个人档案。' },
  { id: 'practice', index: '02', labelEn: 'PRACTICE', labelZh: '创作实践', titleEn: 'Direction, colour, framing.', titleZh: '方向、颜色、取景。', noteEn: 'Selected units from current work.', noteZh: '从最近参与中挑选出来的单元。' },
  { id: 'about', index: '03', labelEn: 'ABOUT', labelZh: '关于作者', titleEn: 'The work is the introduction.', titleZh: '作品就是介绍。', noteEn: 'Context for the archive.', noteZh: '档案的创作背景。' },
  { id: 'contact', index: '04', labelEn: 'CONTACT', labelZh: '联系与合作', titleEn: 'It starts with a frame.', titleZh: '从一帧画面开始。', noteEn: 'Open to thoughtful collaborations.', noteZh: '欢迎真诚的合作交流。' },
];

export const PRACTICE_STEPS = [
  ['01', 'LANTERN CAT',  '灯笼'],
  ['02', 'CIDER',        'CIDER'],
  ['03', 'LVMH',         'LVMH'],
  ['04', 'LIULI',        '琉璃'],
  ['05', 'PAULOWNIA',    '桐心'],
  ['06', 'YOUR PUPPY',   'Your Puppy'],
  ['07', 'KOL RAIN',     'KOL运营'],
] as const;
