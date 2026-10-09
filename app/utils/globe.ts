import type { CountryCounts, Moment } from '../../shared/types/cherry'

export type LngLat = [number, number]

/** Moments as GeoJSON points: own coordinates first, else the country's label point. */
export function momentFeatures(moments: Moment[], labels: Record<string, LngLat>) {
  const features = moments.flatMap((m) => {
    const coordinates: LngLat | undefined = m.latitude != null && m.longitude != null
      ? [m.longitude, m.latitude]
      : m.country_code ? labels[m.country_code] : undefined
    if (!coordinates) return []
    return [{
      type: 'Feature' as const,
      properties: { id: m.id, title: m.title, date: m.date, country_code: m.country_code },
      geometry: { type: 'Point' as const, coordinates },
    }]
  })
  return { type: 'FeatureCollection' as const, features }
}

/** MapLibre `match` on the `iso2` property, one value per visited country. */
export function countryFillExpression<T>(counts: CountryCounts, valueFor: (count: number) => T, fallback = 0) {
  const entries = Object.entries(counts).filter(([, n]) => n > 0)
  if (!entries.length) return fallback
  return ['match', ['get', 'iso2'], ...entries.flatMap(([iso, n]) => [iso, valueFor(n)]), fallback]
}
