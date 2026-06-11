/**
 * Central Supabase access layer for the Rasid client.
 * Keeps select shapes and post-processing (e.g. history sort order) in one place
 * so pages stay thin and consistent with `types/models`.
 */
import { supabase } from "./supabase";
import { formatSymptomName } from "./localization";
import type {
  ConfirmedReport,
  DiseaseListItem,
  GovernorateRow,
  NewsRow,
  NotificationReportRow,
  ReportDetailsItem,
  ReportHistoryEntry,
  ReportListItem,
  SymptomListItem,
} from "../types/models";

/** Nested select for list views — latest status comes from `report_history`. */
const REPORT_LIST_SELECT = `
  report_id,
  tracking_number,
  report_date,
  disease:disease_id(disease_name, ar_name),
  report_history(report_status, created_at)
`;

const REPORT_DETAILS_SELECT = `
  report_id,
  tracking_number,
  report_date,
  location,
  user_id,
  disease:disease_id(disease_name, ar_name),
  report_history(report_status, created_at)
`;

const NOTIFICATION_SELECT = `
  report_id,
  tracking_number,
  report_history(report_status, created_at)
`;

/**
 * Sorts history newest-first for cards that show current status at a glance.
 */
export function sortReportHistoryDesc(
  history: ReportHistoryEntry[],
): ReportHistoryEntry[] {
  return [...history].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/**
 * Sorts history oldest-first for timelines that read chronologically top-to-bottom.
 */
export function sortReportHistoryAsc(
  history: ReportHistoryEntry[],
): ReportHistoryEntry[] {
  return [...history].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

/**
 * @param userId - Logged-in `user.user_id`
 * @returns Reports owned by the user with disease labels and sorted history
 */
export async function fetchUserReports(userId: number) {
  return supabase
    .from("report")
    .select(REPORT_LIST_SELECT)
    .eq("user_id", userId)
    .order("report_date", { ascending: false })
    .then(({ data, error }) => ({
      error,
      data: (data ?? []).map((rep) => ({
        ...rep,
        report_history: sortReportHistoryDesc(rep.report_history ?? []),
      })) as ReportListItem[],
    }));
}

/**
 * @param reportId - Route param or numeric id
 * @returns Single report with ascending history for the details timeline
 */
export async function fetchReportDetails(reportId: string | number) {
  const id =
    typeof reportId === "string" ? Number.parseInt(reportId, 10) : reportId;
  return supabase
    .from("report")
    .select(REPORT_DETAILS_SELECT)
    .eq("report_id", id)
    .single()
    .then(({ data, error }) => ({
      error,
      data: data
        ? ({
            ...data,
            report_history: sortReportHistoryAsc(data.report_history ?? []),
          } as ReportDetailsItem)
        : null,
    }));
}

/** @param userId - Used on profile stats */
export async function fetchUserReportCount(userId: number) {
  return supabase
    .from("report")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);
}

/**
 * @param userId - Notifications are derived from the user's reports + history rows
 */
export async function fetchUserNotifications(userId: number) {
  return supabase
    .from("report")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", userId)
    .then(({ data, error }) => ({
      error,
      data: (data ?? []) as NotificationReportRow[],
    }));
}

/** @param reportId - Post-submit redirect */
export async function fetchTrackingNumber(reportId: number) {
  return supabase
    .from("report")
    .select("tracking_number")
    .eq("report_id", reportId)
    .single();
}

export async function fetchLatestUserReport(userId: number) {
  return supabase
    .from("report")
    .select("report_id, tracking_number")
    .eq("user_id", userId)
    .order("report_id", { ascending: false })
    .limit(1)
    .single();
}

/** Reference data for disease picker (bilingual columns from DB). */
export async function fetchDiseases() {
  return supabase
    .from("disease")
    .select("disease_id, disease_name, ar_name, description")
    .then(({ data, error }) => ({
      error,
      data: (data ?? []) as DiseaseListItem[],
    }));
}

/**
 * Symptoms are stored with snake_case `symptom_name`; UI shows spaced labels.
 */
export async function fetchSymptoms() {
  return supabase
    .from("symptom")
    .select("symptom_id, symptom_name, ar_name")
    .order("symptom_id", { ascending: true })
    .then(({ data, error }) => ({
      error,
      data: (data ?? []).map((s) => ({
        ...s,
        symptom_name: s.symptom_name ? formatSymptomName(s.symptom_name) : "",
      })) as SymptomListItem[],
    }));
}

/**
 * Parallel metadata load for map filters.
 * Governorates named `Unknown` are excluded so the filter list stays meaningful.
 */
export async function fetchMapMetadata() {
  const [diseasesResult, governoratesResult] = await Promise.all([
    supabase.from("disease").select("disease_id, disease_name, ar_name"),
    supabase
      .from("governorate")
      .select("governorate_id, governorate_name, ar_name")
      .neq("governorate_name", "Unknown"),
  ]);
  return {
    diseasesError: diseasesResult.error,
    governoratesError: governoratesResult.error,
    diseases: (diseasesResult.data ?? []) as Pick<
      DiseaseListItem,
      "disease_id" | "disease_name" | "ar_name"
    >[],
    governorates: (governoratesResult.data ?? []) as Pick<
      GovernorateRow,
      "governorate_id" | "governorate_name" | "ar_name"
    >[],
  };
}

/**
 * Confirmed outbreak points — backed by DB RPC `get_confirmed_reports` (lat/lng per report).
 */
export async function fetchConfirmedReports() {
  return supabase.rpc("get_confirmed_reports").then(({ data, error }) => ({
    error,
    data: (data ?? []) as ConfirmedReport[],
  }));
}

/** @param limit - Home/news carousel size */
export async function fetchLocalNews(limit = 5) {
  return supabase
    .from("news")
    .select("*")
    .order("publish_date", { ascending: false })
    .limit(limit)
    .then(({ data, error }) => ({
      error,
      data: (data ?? []) as NewsRow[],
    }));
}

export async function fetchNewsById(itemId: number) {
  return supabase.from("news").select("*").eq("item_id", itemId).single();
}

export type SubmitReportPayload = {
  patient_name: string;
  age: number | null;
  gender: string;
  phone: string | null;
  onset_date: string | null;
  notes: string | null;
  user_id: number;
  disease_id: number | null;
  /** PostGIS WKT, e.g. `POINT(lng lat)` — order matches DB storage convention */
  location: string | null;
};

/**
 * Creates a report row; `classification_id: 1` is the default citizen submission type in this schema.
 */
export async function submitReport(payload: SubmitReportPayload) {
  return supabase
    .from("report")
    .insert([
      {
        ...payload,
        report_date: new Date().toISOString(),
        classification_id: 1,
      },
    ])
    .select()
    .single();
}

/**
 * @param reportId - Parent report from `submitReport`
 * @param symptomIds - Many-to-many via `symptom_report` junction table
 */
export async function fetchExistingReports(
  patientName: string,
  diseaseId: number | null,
) {
  let query = supabase
    .from("report")
    .select("report_id")
    .eq("patient_name", patientName);

  if (diseaseId) {
    query = query.eq("disease_id", diseaseId);
  }

  return query;
}

export async function submitReportSymptoms(
  reportId: number,
  symptomIds: number[],
) {
  const rows = symptomIds.map((symptom_id) => ({
    report_id: reportId,
    symptom_id,
  }));
  return supabase.from("symptom_report").insert(rows);
}
