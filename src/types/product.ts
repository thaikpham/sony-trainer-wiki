/**
 * Shared product types (app + MCP). Align with Supabase products table and admin form.
 */
export interface ProductRecord {
  id: string;
  name: string;
  category?: string;
  line?: string;
  model?: string;
  /** Category slug for display */
  productType?: string;
  categories?: string[];
  tags?: string[];
  imageUrl?: string;
  specUrl?: string;
  price?: number | null;
  year?: number | null;
  isAvailable?: boolean;
  highlights?: string;
  quickSettingGuide?: string;
  kataban?: string;
  color?: string;
  /** Camera / lens / etc. specs */
  sensor?: string;
  chip?: string;
  battery?: string;
  aiUnit?: string;
  focal_min?: string;
  focal_max?: string;
  aperture?: string;
  minFocus?: string;
  filterSize?: string;
  panel?: string;
  processor?: string;
  refreshRate?: string;
  os?: string;
  driver?: string;
  anc?: string;
  audioTech?: string;
  batteryLife?: string;
  channels?: string;
  power?: string;
  wireless?: string;
  display?: string;
  chipset?: string;
  camera?: string;
  storage?: string;
  connectivity?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

/** Form state shape in ProductFormModal (matches EMPTY_PRODUCT + product fields) */
export type ProductFormState = Omit<Partial<ProductRecord>, 'tags'> & {
  categories?: string[];
  tags?: string[] | string;
};
