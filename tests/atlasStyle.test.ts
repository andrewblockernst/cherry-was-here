import { describe, expect, it } from 'vitest'
import { PALETTE, restyleLayer, restyleLayers } from '../app/utils/atlasStyle'

const layer = (over: Record<string, unknown>) => ({ source: 'openmaptiles', ...over }) as never

describe('restyleLayer', () => {
  it('paints the background as paper and water as faded sea', () => {
    expect(restyleLayer(layer({ id: 'background', type: 'background', paint: { 'background-color': '#fff' } }))).toMatchObject({ paint: { 'background-color': PALETTE.land } })
    expect(restyleLayer(layer({ id: 'water', type: 'fill', 'source-layer': 'water', paint: { 'fill-color': '#ccc', 'fill-antialias': true } }))).toMatchObject({ paint: { 'fill-color': PALETTE.water, 'fill-antialias': true } })
  })

  it('drops noisy layers', () => {
    for (const [id, sl] of [['poi_r20', 'poi'], ['highway-name-minor', 'transportation_name'], ['airport', 'aerodrome_label'], ['label_village', 'place'], ['label_state', 'place'], ['building', 'building']]) {
      expect(restyleLayer(layer({ id, type: id === 'building' ? 'fill' : 'symbol', 'source-layer': sl }))).toBeNull()
    }
  })

  it('draws country borders as dashed ink', () => {
    const l = restyleLayer(layer({ id: 'boundary_2', type: 'line', paint: { 'line-color': '#999', 'line-width': 1 } })) as { paint: Record<string, unknown> }
    expect(l.paint['line-color']).toBe(PALETTE.ink)
    expect(l.paint['line-dasharray']).toEqual([3, 2])
    expect(l.paint['line-width']).toBe(1)
  })

  it('inks labels with a paper halo, in Spanish, and letterspaces country names in capitals', () => {
    const l = restyleLayer(layer({ id: 'label_country_1', type: 'symbol', 'source-layer': 'place', layout: { 'text-size': 12 }, paint: { 'text-color': '#000', 'text-halo-color': '#fff' } })) as { layout: Record<string, unknown>, paint: Record<string, unknown> }
    expect(l.paint['text-color']).toBe(PALETTE.ink)
    expect(l.paint['text-halo-color']).toBe(PALETTE.halo)
    expect(l.layout['text-transform']).toBe('uppercase')
    expect(l.layout['text-letter-spacing']).toBeGreaterThan(0)
    expect(l.layout['text-size']).toBe(12)
    expect(JSON.stringify(l.layout['text-field'])).toContain('name:es')
  })

  it('keeps ocean names in italic sea tones', () => {
    const l = restyleLayer(layer({ id: 'water_name_point_label', type: 'symbol', 'source-layer': 'water_name', layout: {}, paint: {} })) as { paint: Record<string, unknown> }
    expect(l.paint['text-color']).toBe(PALETTE.seaInk)
  })

  it('does not mutate its input', () => {
    const input = layer({ id: 'water', type: 'fill', paint: { 'fill-color': '#ccc' } }) as { paint: Record<string, string> }
    restyleLayer(input as never)
    expect(input.paint['fill-color']).toBe('#ccc')
  })
})

describe('restyleLayers', () => {
  it('removes dropped layers and keeps the order of the rest', () => {
    const out = restyleLayers([
      layer({ id: 'background', type: 'background' }),
      layer({ id: 'poi_r1', type: 'symbol', 'source-layer': 'poi' }),
      layer({ id: 'water', type: 'fill', 'source-layer': 'water' }),
    ])
    expect(out.map(l => l.id)).toEqual(['background', 'water'])
  })
})
