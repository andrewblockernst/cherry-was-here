import type { LayerSpecification, SkySpecification, StyleSpecification } from 'maplibre-gl'

/** Vintage-atlas palette shared by the basemap recolor and the globe's own layers. */
export const PALETTE = {
  land: '#F3E9D2',
  landAlt: '#EADFC1',
  ice: '#FBF5E6',
  water: '#9FB4AD',
  seaInk: '#41605F',
  ink: '#523D2C',
  inkSoft: '#7A624D',
  halo: '#F7EEDB',
  road: '#DCCDA7',
  accent: '#BE123C',
  accentDeep: '#881337',
} as const

/** Warm atmosphere around the globe; the space behind it is the page background. */
export const SKY: SkySpecification = {
  'sky-color': '#E0A872',
  'horizon-color': '#F2CC94',
  'fog-color': '#F6E3BC',
  'sky-horizon-blend': 0.6,
  'horizon-fog-blend': 0.5,
  'fog-ground-blend': 0.2,
  'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
}

const DROPPED_SOURCE_LAYERS = new Set(['poi', 'waterway', 'transportation_name', 'aerodrome_label', 'housenumber', 'building'])
const DROPPED_IDS = new Set(['label_other', 'label_village', 'label_town', 'label_state'])
const SPANISH_NAME = ['coalesce', ['get', 'name:es'], ['get', 'name_en'], ['get', 'name']]
const LAND_FILLS = new Set(['park', 'landcover_wood', 'landuse_residential'])

type Patch = { paint?: Record<string, unknown>, layout?: Record<string, unknown> }

function patchFor(layer: LayerSpecification): Patch | null {
  const id = layer.id
  const sourceLayer = (layer as { 'source-layer'?: string })['source-layer'] ?? ''

  if (layer.type === 'background') return { paint: { 'background-color': PALETTE.land } }
  if (id === 'water') return { paint: { 'fill-color': PALETTE.water } }
  if (layer.type === 'fill') {
    if (id.startsWith('landcover_ice') || id.startsWith('landcover_glacier')) return { paint: { 'fill-color': PALETTE.ice } }
    if (LAND_FILLS.has(id) || id.startsWith('aeroway')) return { paint: { 'fill-color': PALETTE.landAlt } }
  }
  if (layer.type === 'line') {
    if (id === 'boundary_2') return { paint: { 'line-color': PALETTE.ink, 'line-dasharray': [3, 2] } }
    if (id === 'boundary_3') return { paint: { 'line-color': PALETTE.inkSoft, 'line-dasharray': [2, 2] } }
    if (id === 'boundary_disputed') return { paint: { 'line-color': PALETTE.ink, 'line-dasharray': [1, 2] } }
    if (['transportation', 'aeroway'].includes(sourceLayer) || id.startsWith('railway')) return { paint: { 'line-color': PALETTE.road } }
  }
  if (layer.type === 'symbol') {
    if (sourceLayer === 'water_name') {
      return { layout: { 'text-field': SPANISH_NAME }, paint: { 'text-color': PALETTE.seaInk, 'text-halo-color': 'rgba(159,180,173,0.75)', 'text-halo-width': 1.5 } }
    }
    if (sourceLayer === 'place') {
      const country = id.startsWith('label_country')
      return {
        layout: { 'text-field': SPANISH_NAME, ...(country ? { 'text-transform': 'uppercase', 'text-letter-spacing': 0.12 } : {}) },
        paint: { 'text-color': country ? PALETTE.ink : PALETTE.inkSoft, 'text-halo-color': PALETTE.halo, 'text-halo-width': 1.5, 'text-halo-blur': 0.5 },
      }
    }
  }
  return null
}

/** One basemap layer in atlas colors, or `null` when it is noise we drop. Never mutates its input. */
export function restyleLayer(layer: LayerSpecification): LayerSpecification | null {
  const sourceLayer = (layer as { 'source-layer'?: string })['source-layer'] ?? ''
  const isShield = layer.type === 'symbol' && /shield/.test(layer.id)
  if (DROPPED_SOURCE_LAYERS.has(sourceLayer) || DROPPED_IDS.has(layer.id) || isShield) return null

  const patch = patchFor(layer)
  if (!patch) return layer
  return {
    ...layer,
    layout: { ...(layer as { layout?: object }).layout, ...patch.layout },
    paint: { ...(layer as { paint?: object }).paint, ...patch.paint },
  } as LayerSpecification
}

export const restyleLayers = (layers: LayerSpecification[]) => layers.flatMap((l) => {
  const out = restyleLayer(l)
  return out ? [out] : []
})

/** The OpenFreeMap style turned into the atlas: recolored layers, globe projection and warm sky. */
export const atlasStyle = (style: StyleSpecification): StyleSpecification => ({
  ...style,
  layers: restyleLayers(style.layers),
  projection: { type: 'globe' },
  sky: SKY,
})
