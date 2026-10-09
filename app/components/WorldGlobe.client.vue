<script setup lang="ts">
import * as maplibregl from 'maplibre-gl'
import type { ExpressionSpecification, GeoJSONSource, Map as MlMap, StyleSpecification } from 'maplibre-gl'
// maplibre resolves its worker relative to the bundled chunk; let Vite bundle and serve it instead.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import type { FeatureCollection, Point } from 'geojson'
import { atlasStyle, PALETTE, SKY } from '../utils/atlasStyle'
import { postmark } from '../utils/format'
import { countryColorExpression, countryFillExpression, focusFor, momentFeatures, rotateLng, type LngLat } from '../utils/globe'

const { state, highlighted, selectOnGlobe } = useAtlas()
const { names } = useCountries()
const { enabled: motion } = useMotion()

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
const POINT_LAYERS = ['outer_points', 'mid_points', 'inner_points']
const DRAWER_PX = 380
const SPIN_DEG_PER_SEC = 4
const IDLE_MS = 4500
const PULSE_MS = 2800
const easeOutQuart = (t: number) => 1 - (1 - t) ** 4

const el = ref<HTMLDivElement>()
let map: MlMap | undefined
let labels: Record<string, LngLat> = {}
let popup: maplibregl.Popup | undefined
let raf = 0
let lastInteraction = 0
const ready = ref(false)

const visitedOpacity = () => countryFillExpression(state.value.countryCounts, n => Math.min(0.32 + 0.12 * n, 0.8)) as ExpressionSpecification
const lineOpacity = () => countryFillExpression(state.value.countryCounts, () => 0.9) as ExpressionSpecification
const fillColor = () => countryColorExpression(state.value.moments, state.value.eras) as ExpressionSpecification
const pointsData = () => momentFeatures(state.value.moments, labels, state.value.eras)
const highlightFilter = (): ExpressionSpecification => ['==', ['get', 'iso2'], highlighted.value ?? '']
const nameOf = (iso2: string, fallback: string) => names.value[iso2] || fallback

/** Left padding that keeps the globe centered in the space the open drawer leaves free (desktop only). */
const cameraPadding = () => ({ top: 0, bottom: 0, right: 0, left: state.value.drawerOpen && window.innerWidth >= 768 ? DRAWER_PX : 0 })

function addCountryLayers(m: MlMap, geojson: FeatureCollection) {
  // Placed under the basemap's place labels so country names stay readable.
  const before = m.getStyle().layers.find(l => l.type === 'symbol')?.id
  m.addSource('countries', { type: 'geojson', data: geojson })
  m.addLayer({ id: 'countries-hit', type: 'fill', source: 'countries', paint: { 'fill-opacity': 0 } }, before)
  m.addLayer({ id: 'visited-fill', type: 'fill', source: 'countries', paint: { 'fill-color': fillColor(), 'fill-opacity': visitedOpacity() } }, before)
  m.addLayer({ id: 'visited-line', type: 'line', source: 'countries', paint: { 'line-color': fillColor(), 'line-width': 1, 'line-opacity': lineOpacity() } }, before)
  m.addLayer({ id: 'highlight-fill', type: 'fill', source: 'countries', filter: highlightFilter(), paint: { 'fill-color': PALETTE.accentDeep, 'fill-opacity': 0.55 } }, before)
  m.addLayer({ id: 'highlight-line', type: 'line', source: 'countries', filter: highlightFilter(), paint: { 'line-color': PALETTE.ink, 'line-width': 1.6 } }, before)
}

/** Rezi-style glow: three stacked accent circles, softest outside, a paper-rimmed dot inside. */
const pointRadius = (extra: number, scale = 1): ExpressionSpecification =>
  ['interpolate', ['linear'], ['zoom'], 0, (4 + extra) * scale, 5, (4 + extra) * scale, 8, (6 + extra) * scale, 12, (6 + extra) * scale]

function addPointLayers(m: MlMap) {
  const radius = pointRadius
  m.addSource('moments', { type: 'geojson', data: pointsData() })
  const circle = (id: string, extra: number, opacity: number, blur: number, stroke = 0) => m.addLayer({
    id, type: 'circle', source: 'moments',
    paint: {
      'circle-color': ['get', 'color'],
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

/** Camera that frames everything the current view shows (moment points and visited countries). */
function viewCamera() {
  const pts = [
    ...pointsData().features.map(f => f.geometry.coordinates as LngLat),
    ...Object.keys(state.value.countryCounts).flatMap(iso => (labels[iso] ? [labels[iso]] : [])),
  ]
  const focus = focusFor(pts)
  return { center: focus.center, zoom: focus.zoom + zoomOffset(), padding: cameraPadding() }
}

/** Animated camera change, or an instant one when motion is off. */
function moveTo(camera: Partial<ReturnType<typeof viewCamera>>, duration: number, fly = false) {
  if (!map) return
  if (!motion.value) return void map.jumpTo(camera)
  if (fly) map.flyTo({ ...camera, duration, essential: true })
  else map.easeTo({ ...camera, duration, easing: easeOutQuart, essential: true })
}

const markInteraction = () => { lastInteraction = performance.now() }

/** One rAF loop for both ambient effects: idle spin of the world view and the pulsing outer glow ring. */
function tick(now: number) {
  raf = requestAnimationFrame(tick)
  if (!map || !ready.value || document.hidden) return

  const idle = now - lastInteraction > IDLE_MS
  if (state.value.owner === 'world' && idle && !map.isMoving() && map.getZoom() < 3.6) {
    const c = map.getCenter()
    map.setCenter([rotateLng(c.lng, now - lastFrame, SPIN_DEG_PER_SEC), c.lat])
  }
  lastFrame = now

  if (state.value.moments.length && now - lastPulse > 48) {
    lastPulse = now
    const phase = (now % PULSE_MS) / PULSE_MS
    map.setPaintProperty('outer_points', 'circle-radius', pointRadius(14, 1 + 0.65 * (1 - (1 - phase) ** 2)))
    map.setPaintProperty('outer_points', 'circle-opacity', 0.4 * (1 - phase))
  }
}
let lastFrame = 0
let lastPulse = 0

function syncLoop() {
  cancelAnimationFrame(raf)
  if (motion.value) {
    lastFrame = performance.now()
    raf = requestAnimationFrame(tick)
    return
  }
  if (ready.value) { // back to the calm, static glow
    map!.setPaintProperty('outer_points', 'circle-radius', pointRadius(14))
    map!.setPaintProperty('outer_points', 'circle-opacity', 0.34)
  }
}

onMounted(async () => {
  maplibregl.setWorkerUrl(workerUrl)
  const geojson = await $fetch<FeatureCollection>('/geo/countries.geojson')
  labels = Object.fromEntries(geojson.features.map(f => [f.properties!.iso2, f.properties!.label as LngLat]))

  const style = atlasStyle(await $fetch<StyleSpecification>(STYLE_URL))
  // Intro: start far out and turned away, then ease into the framed view once the style is ready.
  const target = viewCamera()
  const intro = motion.value
  map = new maplibregl.Map({
    container: el.value!,
    style,
    center: intro ? [target.center[0] - 80, target.center[1] * 0.4] : target.center,
    zoom: intro ? Math.max(0.6, target.zoom - 1.4) : target.zoom,
    minZoom: 0.8,
    maxZoom: 20,
    attributionControl: { compact: true },
  })
  map.on('load', () => {
    addCountryLayers(map!, geojson)
    addPointLayers(map!)
    bindInteractions(map!)
    map!.setSky(SKY)
    // Start with the attribution collapsed behind its (i) button; it stays one tap away.
    el.value?.querySelector('.maplibregl-ctrl-attrib')?.removeAttribute('open')
    map!.jumpTo({ padding: target.padding })
    ready.value = true
    moveTo(viewCamera(), 3800)
    markInteraction()
    map!.on('movestart', (e) => { if ((e as { originalEvent?: unknown }).originalEvent) markInteraction() })
    map!.on('wheel', markInteraction)
    syncLoop()
  })
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  map?.remove()
})

watch(() => state.value.countryCounts, () => {
  if (!ready.value) return
  map!.setPaintProperty('visited-fill', 'fill-opacity', visitedOpacity())
  map!.setPaintProperty('visited-line', 'line-opacity', lineOpacity())
})
function syncMoments() {
  if (!ready.value) return
  ;(map!.getSource('moments') as GeoJSONSource).setData(pointsData())
  map!.setPaintProperty('visited-fill', 'fill-color', fillColor())
  map!.setPaintProperty('visited-line', 'line-color', fillColor())
}
watch(() => [state.value.moments, state.value.eras], syncMoments)
watch(highlighted, () => {
  if (!ready.value) return
  map!.setFilter('highlight-fill', highlightFilter())
  map!.setFilter('highlight-line', highlightFilter())
})
watch(() => state.value.viewKey, () => { if (ready.value) { markInteraction(); moveTo(viewCamera(), 2400, true) } }, { flush: 'post' })
watch(() => state.value.drawerOpen, () => ready.value && moveTo({ padding: cameraPadding() }, 600))
watch(motion, syncLoop)

watch(() => state.value.focus, (f) => {
  if (!ready.value || !f) return
  const moment = f.momentId != null ? pointsData().features.find(x => x.properties.id === f.momentId) : undefined
  const center = (moment?.geometry.coordinates ?? (f.iso2 ? labels[f.iso2] : undefined)) as LngLat | undefined
  if (!center) return
  markInteraction()
  moveTo({ center, zoom: Math.max(map!.getZoom(), moment ? 4.6 : 3.8), padding: cameraPadding() }, 1800, true)
})
</script>

<template>
  <div class="space absolute inset-0">
    <div ref="el" class="globe h-full w-full" :class="{ 'is-ready': ready }" />
  </div>
</template>
