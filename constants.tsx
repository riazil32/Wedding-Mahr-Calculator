
import React from 'react';
import { MahrType } from './types';

export const ZAKAT_NISAB_SILVER_GRAMS = 612.36;
export const ZAKAT_NISAB_GOLD_GRAMS = 87.48;
export const ZAKAT_RATE = 0.025;

export const MAHR_TYPES: MahrType[] = [
  { 
    id: 'minimum', 
    name: 'Minimum Mahr', 
    arabicName: 'المهر الأدنى', 
    grams: 30.618, 
    description: 'Absolute minimum mahr according to Hanafi Fiqh (10 Dirhams)', 
    color: 'from-slate-400 to-slate-500', 
    bgColor: 'bg-slate-50/50 dark:bg-slate-900/50', 
    textColor: 'text-slate-700 dark:text-slate-300', 
    borderColor: 'border-slate-200 dark:border-slate-800',
    details: 'According to the Hanafi madhab, the minimum mahr is 10 dirhams, which equals 30.618 grams of silver. The mahr must not be below this amount for a valid contract in this school of thought.' 
  },
  { 
    id: 'azwaj', 
    name: 'Mahr al-Azwaj', 
    arabicName: 'مهر أزواج النبي', 
    grams: 1530.9, 
    description: 'Highly Recommended: The Sunnah of the Prophet ﷺ', 
    color: 'from-emerald-700/90 to-emerald-800/90', 
    bgColor: 'bg-emerald-50/30 dark:bg-emerald-950/10', 
    textColor: 'text-emerald-800 dark:text-emerald-400', 
    borderColor: 'border-emerald-100/50 dark:border-emerald-900/20',
    details: 'This is the MOST PREFERABLE mahr amount. The Prophet ﷺ gave 500 dirhams (1530.9g silver) to his wives. This is established in Sahih Muslim and is recommended for those who can afford it to follow the most authentic Sunnah.' 
  },
  { 
    id: 'fatimi', 
    name: 'Mahr Fatimi', 
    arabicName: 'مهر فاطمة', 
    grams: 1749.6, 
    description: 'The mahr given by Ali (RA) to Fatima (RA)', 
    color: 'from-rose-700/80 to-rose-800/80', 
    bgColor: 'bg-rose-50/30 dark:bg-rose-950/10', 
    textColor: 'text-rose-800 dark:text-rose-400', 
    borderColor: 'border-rose-100/50 dark:border-rose-900/20',
    details: 'While widely cited, there are varied scholarly opinions on the exact gram weight of Mahr Fatimi (estimates range from 1224g to 1749.6g). Mahr al-Azwaj is often considered more certain in authentic Hadith literature.' 
  }
];

export const SILVER_NISAB_DIVISOR = 612.36;
export const FITRANA_RATE = 5.00;
