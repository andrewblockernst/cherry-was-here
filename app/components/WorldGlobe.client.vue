<script setup lang="ts">
import * as maplibregl from 'maplibre-gl'
import type { ExpressionSpecification, GeoJSONSource, Map as MlMap } from 'maplibre-gl'
// maplibre resolves its worker relative to the bundled chunk; let Vite bundle and serve it instead.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { FeatureCollection, Point } from 'geojson'
import { countryFillExpression, focusFor, momentFeatures, type LngLat } from '../utils/globe'

const { state, highlighted, selectOnGlobe } = useAtlas()
const { names } = useCountries()

const STYLE = 'https://tiles.openfreemap.org/styles/positron'
const ACCENT = '#e11d48'
const WATER = '#CBD5E1'
const LAND = '#FAFAFA'
const POINT_LAYERS = ['outer_points', 'mid_points', 'inner_points']
// Noisy basemap layers hidden to get the minimal Rezi look.
const HIDDEN_SOURCE_LAYERS = new Set(['poi', 'water_name', 'waterway', 'transportation_name', 'aerodrome_label', 'housenumber'])
const HIDDEN_LABELS = new Set(['label_other', 'label_village', 'label_town', 'label_state'])
const DRAWER_PX = 380

const el = ref<HTMLDivElement>()
let map: MlMap | undefined
let labels: Record<string, LngLat> = {}
let popup: maplibregl.Popup | undefined
const ready = ref(false)

const visitedOpacity = () => countryFillExpression(state.value.countryCounts, n => Math.min(0.25 + 0.12 * n, 0.75)) as ExpressionSpecification
const lineOpacity = () => countryFillExpression(state.value.countryCounts, () => 0.9) as ExpressionSpecification
const pointsData = () => momentFeatures(state.value.moments, labels)
const highlightFilter = (): ExpressionSpecification => ['==', ['get', 'iso2'], highlighted.value ?? '']
const nameOf = (iso2: string, fallback: string) => names.value[iso2] || fallback

/** Left padding that keeps the globe centered in the space the open drawer leaves free (desktop only). */
const cameraPadding = () => ({ top: 0, bottom: 0, right: 0, left: state.value.drawerOpen && window.innerWidth >= 768 ? DRAWER_PX : 0 })

function simplifyBasemap(m: MlMap) {
  for (const layer of m.getStyle().layers) {
    try {
      const sourceLayer = (layer as { 'source-layer'?: string })['source-layer'] ?? ''
      if (layer.type === 'symbol' && (HIDDEN_SOURCE_LAYERS.has(sourceLayer) || HIDDEN_LABELS.has(layer.id))) {
        m.setLayoutProperty(layer.id, 'visibility', 'none')
      } else if (layer.type === 'background') {
        m.setPaintProperty(layer.id, 'background-color', LAND)
      } else if (layer.id === 'water') {
        m.setPaintProperty(layer.id, 'fill-color', WATER)
      } else if (layer.type === 'fill' && ['park', 'landcover_wood', 'landuse_residential', 'building'].includes(layer.id)) {
        m.setPaintProperty(layer.id, 'fill-color', LAND)
      }
    } catch { /* a layer that rejects the change keeps the stock style */ }
  }
}

function addCountryLayers(m: MlMap, geojson: FeatureCollection) {
  // Placed under the basemap's place labels so country names stay readable.
  const before = m.getStyle().layers.find(l => l.type === 'symbol' && l.layout?.visibility !== 'none')?.id
  m.addSource('countries', { type: 'geojson', data: geojson })
  m.addLayer({ id: 'countries-hit', type: 'fill', source: 'countries', paint: { 'fill-opacity': 0 } }, before)
  m.addLayer({ id: 'visited-fill', type: 'fill', source: 'countries', paint: { 'fill-color': ACCENT, 'fill-opacity': visitedOpacity() } }, before)
  m.addLayer({ id: 'visited-line', type: 'line', source: 'countries', paint: { 'line-color': ACCENT, 'line-width': 0.6, 'line-opacity': lineOpacity() } }, before)
  m.addLayer({ id: 'highlight-fill', type: 'fill', source: 'countries', filter: highlightFilter(), paint: { 'fill-color': '#9f1239', 'fill-opacity': 0.85 } }, before)
}

function addPointLayers(m: MlMap) {
  const radius = (base: number, extra: number): ExpressionSpecification =>
    ['interpolate', ['linear'], ['zoom'], 0, base + extra, 5, base + extra, 8, base + extra + 2, 12, base + extra + 2]
  m.addSource('moments', { type: 'geojson', data: pointsData() })
  const layers: [string, number, number][] = [['outer_points', 8, 0.45], ['mid_points', 4, 0.55], ['inner_points', 0, 0.6]]
  for (const [id, extra, opacity] of layers) {
    m.addLayer({ id, type: 'circle', source: 'moments', paint: { 'circle-color': ACCENT, 'circle-opacity': opacity, 'circle-radius': radius(4, extra), 'circle-pitch-alignment': 'map' } })
  }
}

function bindInteractions(m: MlMap) {
  popup = new maplibregl.Popup({ closeButton: false, offset: 12 })
  const hit = (pt: maplibregl.PointLike, layers: string[]) => m.queryRenderedFeatures(pt, { layers })[0]

  m.on('mousemove', (e) => {
    const point = hit(e.point, POINT_LAYERS)
    m.getCanvas().style.cursor = point || hit(e.point, ['countries-hit']) ? 'pointer' : ''
    if (!point) return void popup?.remove()
    const p = point.properties as { title: string, date: string }
    const box = document.createElement('div')
    box.className = 'text-xs'
    box.append(Object.assign(document.createElement('strong'), { textContent: p.title }), document.createElement('br'), p.date)
    popup!.setLngLat((point.geometry as Point).coordinates as LngLat).setDOMContent(box).addTo(m)
  })

  m.on('click', (e) => {
    const point = hit(e.point, POINT_LAYERS)
    if (point) {
      const p = point.properties as { id: number, country_code: string | null }
      if (p.country_code) selectOnGlobe({ iso2: p.country_code, name: nameOf(p.country_code, p.country_code), momentId: p.id })
      return
    }
    const country = hit(e.point, ['countries-hit'])?.properties as { iso2: string, name: string } | undefined
    if (country && country.iso2 !== '-99') selectOnGlobe({ iso2: country.iso2, name: nameOf(country.iso2, country.name) })
  })
}

/** Zoom offset so a whole globe fills ~92% of the shorter viewport side (a zoom-2 globe is ~563px wide). */
const zoomOffset = () => Math.log2((0.92 * Math.min(window.innerWidth, window.innerHeight)) / 563)

/** Frame everything the current view shows (moment points and visited countries). */
function frameView(animate: boolean) {
  const pts = [
    ...pointsData().features.map(f => f.geometry.coordinates as LngLat),
    ...Object.keys(state.value.countryCounts).flatMap(iso => (labels[iso] ? [labels[iso]] : [])),
  ]
  const focus = focusFor(pts)
  const camera = { center: focus.center, zoom: focus.zoom + zoomOffset(), padding: cameraPadding() }
  if (animate) map?.flyTo({ ...camera, duration: 2200, essential: true })
  else map?.jumpTo(camera)
}

onMounted(async () => {
  maplibregl.setWorkerUrl(workerUrl)
  const geojson = await $fetch<FeatureCollection>('/geo/countries.geojson')
  labels = Object.fromEntries(geojson.features.map(f => [f.properties!.iso2, f.properties!.label as LngLat]))

  map = new maplibregl.Map({
    container: el.value!,
    style: STYLE,
    center: [-20, 20],
    zoom: 2 + zoomOffset(),
    minZoom: 0.8,
    maxZoom: 20,
    attributionControl: { compact: true },
  })
  map.on('style.load', () => map!.setProjection({ type: 'globe' }))
  map.on('load', () => {
    simplifyBasemap(map!)
    addCountryLayers(map!, geojson)
    addPointLayers(map!)
    bindInteractions(map!)
    frameView(false)
    ready.value = true
  })
})

onBeforeUnmount(() => map?.remove())

watch(() => state.value.countryCounts, () => {
  if (!ready.value) return
  map!.setPaintProperty('visited-fill', 'fill-opacity', visitedOpacity())
  map!.setPaintProperty('visited-line', 'line-opacity', lineOpacity())
})
watch(() => state.value.moments, () => ready.value && (map!.getSource('moments') as GeoJSONSource).setData(pointsData()))
watch(highlighted, () => ready.value && map!.setFilter('highlight-fill', highlightFilter()))
watch(() => state.value.viewKey, () => ready.value && frameView(true), { flush: 'post' })
watch(() => state.value.drawerOpen, () => ready.value && map!.easeTo({ padding: cameraPadding(), duration: 500 }))

watch(() => state.value.focus, (f) => {
  if (!ready.value || !f) return
  const moment = f.momentId != null ? pointsData().features.find(x => x.properties.id === f.momentId) : undefined
  const center = (moment?.geometry.coordinates ?? (f.iso2 ? labels[f.iso2] : undefined)) as LngLat | undefined
  if (center) map!.flyTo({ center, zoom: Math.max(map!.getZoom(), moment ? 4.6 : 3.8), padding: cameraPadding(), duration: 1600, essential: true })
})
</script>

<template>
  <div class="absolute inset-0 bg-space-900">
    <div ref="el" class="h-full w-full" />
  </div>
</template>
