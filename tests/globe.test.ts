import { describe, expect, it } from 'vitest'
import { countryFillExpression, focusFor, groupByEra, momentFeatures } from '../app/utils/globe'
import type { Era, Moment } from '../shared/types/cherry'

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

describe('groupByEra', () => {
  const era = (id: number, over: Partial<Era> = {}): Era => ({
    id, title: `Era ${id}`, slug: `e${id}`, start_year: 2000 + id, end_year: null, color: null, emoji: null, order_index: id, ...over,
  })

  it('groups moments under their era, oldest first', () => {
    const groups = groupByEra([era(1)], [moment({ id: 1, era_id: 1, date: '2021-05-01' }), moment({ id: 2, era_id: 1, date: '2020-01-01' })])
    expect(groups).toHaveLength(1)
    expect(groups[0]!.moments.map(m => m.id)).toEqual([2, 1])
  })

  it('keeps eras without moments', () => {
    expect(groupByEra([era(1), era(2)], [moment({ era_id: 2 })]).map(g => g.moments.length)).toEqual([0, 1])
  })

  it('collects moments without a known era in a trailing group', () => {
    const groups = groupByEra([era(1)], [moment({ id: 1, era_id: null }), moment({ id: 2, era_id: 99 })])
    expect(groups.at(-1)).toMatchObject({ id: 0, title: 'Sin era' })
    expect(groups.at(-1)!.moments.map(m => m.id)).toEqual([1, 2])
  })

  it('adds no trailing group when every moment has an era', () => {
    expect(groupByEra([era(1)], [moment({ era_id: 1 })])).toHaveLength(1)
  })
})

describe('focusFor', () => {
  it('falls back to the whole world without points', () => {
    expect(focusFor([])).toEqual({ center: [-20, 20], zoom: 2 })
  })

  it('centers on a single point at country zoom', () => {
    const f = focusFor([[10, 40]])
    expect(f.center[0]).toBeCloseTo(10)
    expect(f.center[1]).toBeCloseTo(40)
    expect(f.zoom).toBe(4.6)
  })

  it('centers across the antimeridian instead of averaging to zero', () => {
    const f = focusFor([[170, 0], [-170, 0]])
    expect(Math.abs(f.center[0])).toBeCloseTo(180)
  })

  it('zooms out as points spread apart', () => {
    const near = focusFor([[0, 0], [10, 0]]).zoom
    const far = focusFor([[-80, 0], [80, 0]]).zoom
    expect(far).toBeLessThan(near)
    expect(far).toBeGreaterThanOrEqual(1.8)
  })

  it('falls back to the world when points cancel out', () => {
    expect(focusFor([[0, 0], [180, 0]]).zoom).toBe(2)
  })
})
