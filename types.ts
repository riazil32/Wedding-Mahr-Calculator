
export type TabType = 'home' | 'zakat' | 'fitr' | 'mahr' | 'masjid' | 'contact' | 'saved' | 'dashboard';

export interface ZakatAsset {
  id: string;
  name: string;
  value: number;
  description: string;
}

export interface MahrType {
  id: string;
  name: string;
  arabicName: string;
  grams: number;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  details: string;
}

export interface EnabledCategoriesState {
  [key: string]: boolean;
}

export interface UserFinancialProfile {
  uid: string;
  total_assets_last_year?: number;
  zakat_anniversary_date?: string;
  mahr_total?: number;
  mahr_paid?: number;
  household_size?: number;
  nisab_adjustment?: number; // Percentage adjustment for "Real-World" prices (e.g. 5)
  updatedAt?: string;
}
