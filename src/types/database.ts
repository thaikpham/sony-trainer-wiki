/**
 * Supabase row / doc shapes. mapDataToDoc returns { id, ...data, created_at, updated_at }.
 */
export type SupabaseDoc<T = Record<string, unknown>> = {
  id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
} & T;

export interface ColorProfileDoc {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface TutorialDoc {
  id: string;
  title?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
