export interface Place { label: string, lat: number, lng: number, countryCode: string | null }

/** Photon (Komoot) search endpoint; no API key needed. */
export const PHOTON_URL = 'https://photon.komoot.io/api/'

/** Maps a Photon GeoJSON response to places, optionally keeping only one country (ISO2). */
export function placesFromPhoton(data: unknown, countryCode?: string | null): Place[] {
  const features = (data as { features?: unknown })?.features
  if (!Array.isArray(features)) return []
  const wanted = countryCode?.toUpperCase()
  const places: Place[] = []
  for (const f of features) {
    const props = f?.properties ?? {}
    const coords = f?.geometry?.coordinates
    if (!props.name || !Array.isArray(coords) || typeof coords[0] !== 'number' || typeof coords[1] !== 'number') continue
    const code = typeof props.countrycode === 'string' ? props.countrycode.toUpperCase() : null
    if (wanted && code !== wanted) continue
    const parts = [props.name, props.county, props.state, props.country]
      .filter((p, i, all): p is string => typeof p === 'string' && p !== '' && all.indexOf(p) === i)
    places.push({ label: parts.join(', '), lat: coords[1], lng: coords[0], countryCode: code })
  }
  return places
}
