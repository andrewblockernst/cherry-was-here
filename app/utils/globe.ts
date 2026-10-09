import type { CountryCounts, Era, EraWithMoments, Moment } from '../../shared/types/cherry'

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

/** Eras with their moments (oldest first); moments without a known era trail in a synthetic "Sin era" group. */
export function groupByEra(eras: Era[], moments: Moment[]): EraWithMoments[] {
  const byDate = (a: Moment, b: Moment) => a.date.localeCompare(b.date)
  const known = new Set(eras.map(e => e.id))
  const groups: EraWithMoments[] = eras.map(e => ({ ...e, moments: moments.filter(m => m.era_id === e.id).sort(byDate) }))
  const loose = moments.filter(m => m.era_id == null || !known.has(m.era_id)).sort(byDate)
  if (loose.length) {
    groups.push({ id: 0, title: 'Sin era', slug: 'sin-era', start_year: 0, end_year: null, color: null, emoji: '✉️', order_index: null, moments: loose })
  }
  return groups
}

export interface CameraFocus { center: LngLat, zoom: number }
const WORLD: CameraFocus = { center: [-20, 20], zoom: 2 }
const rad = (d: number) => (d * Math.PI) / 180
const deg = (r: number) => (r * 180) / Math.PI

/** Camera that frames a set of points on a globe: spherical mean as center, zoom from the widest angular spread. */
export function focusFor(points: LngLat[]): CameraFocus {
  if (!points.length) return WORLD
  const vecs = points.map(([lng, lat]) => [Math.cos(rad(lat)) * Math.cos(rad(lng)), Math.cos(rad(lat)) * Math.sin(rad(lng)), Math.sin(rad(lat))] as const)
  const sum = vecs.reduce((a, v) => [a[0] + v[0], a[1] + v[1], a[2] + v[2]], [0, 0, 0])
  const norm = Math.hypot(sum[0], sum[1], sum[2])
  if (norm < 1e-6) return WORLD
  const [x, y, z] = sum.map(c => c / norm) as [number, number, number]
  const center: LngLat = [deg(Math.atan2(y, x)), deg(Math.asin(Math.min(1, Math.max(-1, z))))]
  const widest = Math.max(...vecs.map(v => deg(Math.acos(Math.min(1, Math.max(-1, v[0] * x + v[1] * y + v[2] * z))))))
  const zoom = 2.3 + Math.log2(90 / Math.max(widest, 8)) * 0.9
  return { center, zoom: Math.min(4.6, Math.max(1.8, zoom)) }
}
