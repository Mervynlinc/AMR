export const COLORS = {
  primary: '#047857',
  primaryLight: '#10b981',
  primaryDark: '#065f46',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  red50: '#fef2f2',
  red100: '#fee2e2',
  red200: '#fecaca',
  red500: '#ef4444',
  red600: '#dc2626',
  red700: '#b91c1c',
  amber50: '#fffbeb',
  amber100: '#fef3c7',
  amber200: '#fde68a',
  amber500: '#f59e0b',
  amber600: '#d97706',
  amber700: '#b45309',
  green50: '#f0fdf4',
  green100: '#dcfce7',
  green200: '#bbf7d0',
  green500: '#22c55e',
  green600: '#16a34a',
  green700: '#15803d',
  blue50: '#eff6ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  purple50: '#faf5ff',
  purple100: '#f3e8ff',
  purple200: '#e9d5ff',
  purple500: '#a855f7',
  purple600: '#9333ea',
  purple700: '#7c3aed',
};

export const ANTIBIOTICS = [
  { name: 'Penicillin G', code: 'PEN' },
  { name: 'Ampicillin', code: 'AMP' },
  { name: 'Ceftriaxone', code: 'CRO' },
  { name: 'Erythromycin', code: 'ERY' },
  { name: 'Gentamicin', code: 'GEN' },
  { name: 'Ciprofloxacin', code: 'CIP' },
  { name: 'Vancomycin', code: 'VAN' },
  { name: 'Linezolid', code: 'LNZ' },
];

export const RESISTANCE_DATA = [
  { antibiotic: 'Tetracycline', code: 'TCY', resistanceRate: 97.4 },
  { antibiotic: 'Erythromycin', code: 'ERY', resistanceRate: 64.0 },
  { antibiotic: 'Gentamicin', code: 'GEN', resistanceRate: 62.9 },
  { antibiotic: 'Ceftriaxone', code: 'CRO', resistanceRate: 58.8 },
  { antibiotic: 'Ciprofloxacin', code: 'CIP', resistanceRate: 48.2 },
  { antibiotic: 'Ampicillin', code: 'AMP', resistanceRate: 16.6 },
  { antibiotic: 'Linezolid', code: 'LNZ', resistanceRate: 0 },
  { antibiotic: 'Vancomycin', code: 'VAN', resistanceRate: 0 },
];

export const PREDICTIONS = [
  { antibiotic: 'Ceftriaxone', currentRate: 59, predictedRate: 72, change: 13 },
  { antibiotic: 'Erythromycin', currentRate: 64, predictedRate: 68, change: 4 },
  { antibiotic: 'Linezolid', currentRate: 0, predictedRate: 1.2, change: 1.2 },
];

export const MOCK_SAMPLES = [
  {
    id: 'SMP-0488',
    specimenType: 'Blood',
    organism: 'S. aureus',
    facility: 'MRRH',
    status: 'ast' as const,
    astDone: 4,
    astTotal: 25,
  },
  {
    id: 'SMP-0487',
    specimenType: 'Blood',
    organism: 'S. aureus (MDR)',
    facility: 'MRRH',
    status: 'done' as const,
    isMRSA: true,
    isMDR: true,
  },
  {
    id: 'SMP-0486',
    specimenType: 'Wound',
    organism: 'S. aureus',
    facility: 'MRRH',
    status: 'done' as const,
    isMRSA: false,
  },
];

export const SPECIMEN_TYPES = [
  'Blood Culture',
  'Urine',
  'Wound Swab',
  'Sputum',
  'CSF',
];

export const AGE_GROUPS = [
  'Neonate (0-28d)',
  'Infant (1-12m)',
  'Child (1-14y)',
  'Adult (15-64y)',
  'Elderly (65+y)',
];

export const FACILITIES = [
  'Mbarara Regional Referral Hospital',
  'MUST Teaching Hospital',
];

export const IDENTIFICATION_METHODS = [
  'Culture Characteristics',
  'Biochemical Tests',
  'MALDI-TOF',
  'VITEK 2',
];

export const TEST_METHODS = [
  'Disc Diffusion (Kirby-Bauer)',
  'Broth Microdilution (MIC)',
  'VITEK 2',
];
