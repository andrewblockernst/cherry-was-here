import { describe, expect, it } from 'vitest'
import { placesFromPhoton } from '../app/utils/geocode'

const feature = (properties: Record<string, unknown>, coordinates: [number, number] = [-58.38, -34.6]) => ({
  type: 'Feature', geometry: { type: 'Point', coordinates }, properties,
})

describe('placesFromPhoton', () => {
  it('maps a feature to label, lat, lng and country code', () => {
    const [p] = placesFromPhoton({ features: [feature({ name: 'Palermo', state: 'Buenos Aires', country: 'Argentina', countrycode: 'ar' })] })
    expect(p).toEqual({ label: 'Palermo, Buenos Aires, Argentina', lat: -34.6, lng: -58.38, countryCode: 'AR' })
  })

  it('includes county and drops empty or duplicate parts', () => {
    const [p] = placesFromPhoton({ features: [feature({ name: 'Cordoba', county: 'Capital', state: 'Cordoba', country: 'Argentina', countrycode: 'AR' })] })
    expect(p!.label).toBe('Cordoba, Capital, Argentina')
  })

  it('filters by country when one is given', () => {
    const data = { features: [feature({ name: 'A', countrycode: 'AR' }), feature({ name: 'B', countrycode: 'UY' })] }
    expect(placesFromPhoton(data, 'uy').map(p => p.label)).toEqual(['B'])
  })

  it('skips features without a name or valid coordinates', () => {
    const data = { features: [feature({ countrycode: 'AR' }), { type: 'Feature', properties: { name: 'X' } }, feature({ name: 'Ok' })] }
    expect(placesFromPhoton(data).map(p => p.label)).toEqual(['Ok'])
  })

  it('tolerates malformed input', () => {
    expect(placesFromPhoton(null)).toEqual([])
    expect(placesFromPhoton({})).toEqual([])
  })
})
