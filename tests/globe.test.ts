import { describe, expect, it } from 'vitest'
import { countryFillExpression, momentFeatures } from '../app/utils/globe'
import type { Moment } from '../shared/types/cherry'

const moment = (over: Partial<Moment>): Moment => ({
  id: 1, title: 'Trip', body: null, date: '2020-01-02', location: null, country_code: null,
  visibility: 'public', latitude: null, longitude: null, photo_url: null, era_id: null, ...over,
})

describe('momentFeatures', () => {
  const labels = { AR: [-64.5, -34.5] as [number, number] }

  it('prefers the moment coordinates', () => {
    const fc = momentFeatures([moment({ latitude: 48.85, longitude: 2.35, country_code: 'AR' })], labels)
    expect(fc.features[0]!.geometry.coordinates).toEqual([2.35, 48.85])
  })

  it('falls back to the country label point', () => {
    const fc = momentFeatures([moment({ country_code: 'AR' })], labels)
    expect(fc.features[0]!.geometry.coordinates).toEqual([-64.5, -34.5])
  })

  it('skips moments that cannot be placed', () => {
    expect(momentFeatures([moment({}), moment({ country_code: 'ZZ' })], labels).features).toHaveLength(0)
  })

  it('carries id, title, date and country_code as properties', () => {
    const f = momentFeatures([moment({ id: 7, country_code: 'AR' })], labels).features[0]!
    expect(f.properties).toEqual({ id: 7, title: 'Trip', date: '2020-01-02', country_code: 'AR' })
  })
})

describe('countryFillExpression', () => {
  it('returns the default when nothing is visited', () => {
    expect(countryFillExpression({}, (n) => n)).toBe(0)
  })

  it('builds a match on iso2 with a value per visited country', () => {
    const expr = countryFillExpression({ AR: 1, FR: 5 }, (n) => n * 10) as unknown[]
    expect(expr).toEqual(['match', ['get', 'iso2'], 'AR', 10, 'FR', 50, 0])
  })
})
