
export type TabType = 'home' | 'zakat' | 'fitr' | 'mahr' | 'contact';

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
  details: string;
}

export interface EnabledCategoriesState {
  [key: string]: boolean;
}
