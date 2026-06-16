/**
 * Bilingual display helpers for rows that store `*_name` + `ar_name` in Postgres.
 * Avoids hardcoded Arabic maps in the client.
 */

/**
 * @param englishName - Canonical / English column from DB
 * @param arName - Arabic column; falls back to English when empty
 * @param language - Active UI language (`ar` | `en`)
 */
export function pickLocalizedName(
  englishName: string,
  arName: string | null | undefined,
  language: string,
): string {
  if (language && language.startsWith('ar')) {
    return arName?.trim() || englishName;
  }
  return englishName;
}

/** Converts DB snake_case symptom keys to readable English labels */
export function formatSymptomName(symptomName: string): string {
  return symptomName.replace(/_/g, ' ');
}
