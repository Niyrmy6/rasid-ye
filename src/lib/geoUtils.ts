/** GeoJSON Point as returned by PostGIS / Supabase for report locations */
export type GeoPoint = {
  type: 'Point';
  coordinates: [number, number];
};

/**
 * Validates Supabase `location` JSON before map/geocode use.
 * @returns Parsed point or null when the column is empty or malformed
 */
export function parseGeoPoint(location: unknown): GeoPoint | null {
  if (!location || typeof location !== 'object') return null;
  const point = location as GeoPoint;
  if (point.type === 'Point' && Array.isArray(point.coordinates) && point.coordinates.length >= 2) {
    return point;
  }
  return null;
}

/**
 * Human-readable coordinates for display (lat, lng).
 * GeoJSON stores [longitude, latitude] — order is swapped for user-facing labels.
 */
export function formatGeoPointLabel(point: GeoPoint): string {
  const [lng, lat] = point.coordinates;
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/**
 * Resolves a friendly place name via Nominatim (OpenStreetMap).
 * @param language - Passed as `accept-language` for Arabic/English labels
 * @returns Short neighbourhood/city string or null when lookup fails
 */
export async function reverseGeocodeLabel(
  lat: number,
  lng: number,
  language: string,
): Promise<string | null> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&accept-language=${language}`,
  );
  const locData = await res.json();
  if (!locData?.address) return null;

  const placeNames = [
    locData.address.neighbourhood,
    locData.address.suburb,
    locData.address.city,
    locData.address.state,
  ].filter(Boolean);

  if (placeNames.length > 0) return placeNames.join('، ');
  if (locData.display_name) {
    return locData.display_name.split(',').slice(0, 3).join('، ');
  }
  return null;
}
