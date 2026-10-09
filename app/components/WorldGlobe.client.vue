<script setup lang="ts">
import * as maplibregl from 'maplibre-gl'
import type { ExpressionSpecification, GeoJSONSource, Map as MlMap, StyleSpecification } from 'maplibre-gl'
// maplibre resolves its worker relative to the bundled chunk; let Vite bundle and serve it instead.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { FeatureCollection, Point } from 'geojson'
import { atlasStyle, PALETTE, SKY } from '../utils/atlasStyle'
import { postmark } from '../utils/format'
import { countryFillExpression, focusFor, momentFeatures, type LngLat } from '../utils/globe'

const { state, highlighted, selectOnGlobe } = useAtlas()
const { names } = useCountries()

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const GLOW = '#E11D48'
const POINT_LAYERS = ['outer_points', 'mid_points', 'inner_points']
const DRAWER_PX = 380

const el = ref<HTMLDivElement>()
let map: MlMap | undefined
let labels: Record<string, LngLat> = {}
let popup: maplibregl.Popup | undefined
const ready = ref(false)

const visitedOpacity = () => countryFillExpression(state.value.countryCounts, n => Math.min(0.32 + 0.12 * n, 0.8)) as ExpressionSpecification
const lineOpacity = () => countryFillExpression(state.value.countryCounts, () => 0.9) as ExpressionSpecification
const pointsData = () => momentFeatures(state.value.moments, labels)
const highlightFilter = (): ExpressionSpecification => ['==', ['get', 'iso2'], highlighted.value ?? '']
const nameOf = (iso2: string, fallback: string) => names.value[iso2] || fallback

/** Left padding that keeps the globe centered in the space the open drawer leaves free (desktop only). */
const cameraPadding = () => ({ top: 0, bottom: 0, right: 0, left: state.value.drawerOpen && window.innerWidth >= 768 ? DRAWER_PX : 0 })

function addCountryLayers(m: MlMap, geojson: FeatureCollection) {
  // Placed under the basemap's place labels so country names stay readable.
  const before = m.getStyle().layers.find(l => l.type === 'symbol')?.id
  m.addSource('countries', { type: 'geojson', data: geojson })
  m.addLayer({ id: 'countries-hit', type: 'fill', source: 'countries', paint: { 'fill-opacity': 0 } }, before)
  m.addLayer({ id: 'visited-fill', type: 'fill', source: 'countries', paint: { 'fill-color': PALETTE.cherry, 'fill-opacity': visitedOpacity() } }, before)
  m.addLayer({ id: 'visited-line', type: 'line', source: 'countries', paint: { 'line-color': PALETTE.cherryDeep, 'line-width': 1, 'line-opacity': lineOpacity() } }, before)
  m.addLayer({ id: 'highlight-fill', type: 'fill', source: 'countries', filter: highlightFilter(), paint: { 'fill-color': PALETTE.cherryDeep, 'fill-opacity': 0.55 } }, before)
  m.addLayer({ id: 'highlight-line', type: 'line', source: 'countries', filter: highlightFilter(), paint: { 'line-color': PALETTE.ink, 'line-width': 1.6 } }, before)
}

/** Rezi-style glow: three stacked cherry circles, softest outside, a paper-rimmed dot inside. */
function addPointLayers(m: MlMap) {
  const radius = (extra: number): ExpressionSpecification =>
    ['interpolate', ['linear'], ['zoom'], 0, 4 + extra, 5, 4 + extra, 8, 6 + extra, 12, 6 + extra]
  m.addSource('moments', { type: 'geojson', data: pointsData() })
  const circle = (id: string, extra: number, opacity: number, blur: number, stroke = 0) => m.addLayer({
    id, type: 'circle', source: 'moments',
    paint: {
      'circle-color': id === 'inner_points' ? PALETTE.cherry : GLOW,
      'circle-opacity': opacity,
      'circle-radius': radius(extra),
      'circle-blur': blur,
      'circle-pitch-alignment': 'map',
      'circle-stroke-width': stroke,
      'circle-stroke-color': PALETTE.halo,
    },
  })
  circle('outer_points', 14, 0.34, 0.8)
  circle('mid_points', 7, 0.55, 0.35)
  circle('inner_points', 1, 1, 0, 1.5)
}

/** Moment popup rendered as a small postage stamp (DOM API only, titles are user text). */
function stampPopup(p: { title: string, date: string }) {
  const el = (cls: string, text: string) => Object.assign(document.createElement('div'), { className: cls, textContent: text })
  const mark = postmark(p.date)
  const stamp = document.createElement('div')
  stamp.className = 'stamp popup-stamp'
  stamp.append(el('popup-title', p.title), el('popup-date', `${mark.day} ${mark.month} ${mark.year}`.trim()))
  const wrap = document.createElement('div')
  wrap.className = 'stamp-shadow'
  wrap.append(stamp)
  return wrap
}

function bindInteractions(m: MlMap) {
  popup = new maplibregl.Popup({ closeButton: false, offset: 16, maxWidth: '240px' })
  const hit = (pt: maplibregl.PointLike, layers: string[]) => m.queryRenderedFeatures(pt, { layers })[0]
  const showPopup = (f: NonNullable<ReturnType<typeof hit>>) =>
    popup!.setLngLat((f.geometry as Point).coordinates as LngLat).setDOMContent(stampPopup(f.properties as { title: string, date: string })).addTo(m)

  m.on('mousemove', (e) => {
    const point = hit(e.point, POINT_LAYERS)
    m.getCanvas().style.cursor = point || hit(e.point, ['countries-hit']) ? 'pointer' : ''
    if (point) showPopup(point)
    else popup?.remove()
  })

  m.on('click', (e) => {
    const point = hit(e.point, POINT_LAYERS)
    if (!point) popup?.remove()
    if (point) {
      showPopup(point) // touch devices never get mousemove
      const p = point.properties as { id: number, country_code: string | null }
      if (p.country_code) selectOnGlobe({ iso2: p.country_code, name: nameOf(p.country_code, p.country_code), momentId: p.id })
      return
    }
    const country = hit(e.point, ['countries-hit'])?.properties as { iso2: string, name: string } | undefined
    if (country && country.iso2 !== '-99') selectOnGlobe({ iso2: country.iso2, name: nameOf(country.iso2, country.name) })
  })
}

/** Zoom offset so a whole globe fills ~86% of the shorter viewport side (a zoom-2 globe is ~563px wide). */
const zoomOffset = () => Math.log2((0.86 * Math.min(window.innerWidth, window.innerHeight)) / 563)

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

  const style = atlasStyle(await $fetch<StyleSpecification>(STYLE_URL))
  map = new maplibregl.Map({
    container: el.value!,
    style,
    center: [-20, 20],
    zoom: 2 + zoomOffset(),
    minZoom: 0.8,
    maxZoom: 20,
    attributionControl: { compact: true },
  })
  map.on('load', () => {
    addCountryLayers(map!, geojson)
    addPointLayers(map!)
    bindInteractions(map!)
    map!.setSky(SKY)
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
watch(highlighted, () => {
  if (!ready.value) return
  map!.setFilter('highlight-fill', highlightFilter())
  map!.setFilter('highlight-line', highlightFilter())
})
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
  <div class="space absolute inset-0">
    <div ref="el" class="h-full w-full" />
  </div>
</template>
