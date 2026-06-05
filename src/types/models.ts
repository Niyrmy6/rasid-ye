/**
 * Domain types for UI layers — derived from generated `database.ts` where possible.
 * Keeps Supabase nested selects (`disease:disease_id(...)`) typed at call sites.
 */
import type { Tables } from './database';

export type UserRow = Tables<'user'>;
export type NewsRow = Tables<'news'>;
export type ReportRow = Tables<'report'>;
export type ReportHistoryRow = Tables<'report_history'>;
export type DiseaseRow = Tables<'disease'>;
export type DiseaseListItem = Pick<DiseaseRow, 'disease_id' | 'disease_name' | 'ar_name' | 'description'>;
export type GovernorateRow = Tables<'governorate'>;
export type SymptomRow = Tables<'symptom'>;

/** User object stored in localStorage after login */
export type StoredUser = UserRow;

export type ReportHistoryEntry = Pick<ReportHistoryRow, 'report_status' | 'created_at'>;

export type ReportListItem = Pick<ReportRow, 'report_id' | 'tracking_number' | 'report_date'> & {
  disease: Pick<DiseaseRow, 'disease_name' | 'ar_name'> | null;
  report_history: ReportHistoryEntry[];
};

export type ReportDetailsItem = Pick<
  ReportRow,
  'report_id' | 'tracking_number' | 'report_date' | 'location' | 'user_id'
> & {
  disease: Pick<DiseaseRow, 'disease_name' | 'ar_name'> | null;
  report_history: ReportHistoryEntry[];
};

export type SymptomListItem = Pick<SymptomRow, 'symptom_id' | 'symptom_name' | 'ar_name'>;

export type NotificationReportRow = Pick<ReportRow, 'report_id' | 'tracking_number'> & {
  report_history: ReportHistoryEntry[];
};

/** Shape returned by `get_confirmed_reports` RPC for the epidemic map */
export type ConfirmedReport = {
  report_id: number;
  disease_name: string;
  governorate_name: string;
  report_date: string;
  lat: number;
  lng: number;
};

export type GlobalNewsItem = {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  thumbnail: string;
};
