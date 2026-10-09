<script setup lang="ts">
import type { Country, Era, Moment, Visibility } from '../../shared/types/app'
import { PALETTE } from '../utils/atlasStyle'
import { PHOTON_URL, placesFromPhoton, type Place } from '../utils/geocode'

const props = defineProps<{
  open: boolean
  eras: Era[]
  countries: Country[]
  defaultCountryCode?: string | null
  defaultCountryName?: string | null
  /** When set, the form edits this moment instead of creating one. */
  moment?: Moment | null
}>()
const emit = defineEmits<{ close: [], save: [moment: Partial<Moment>] }>()

const today = () => new Date().toISOString().slice(0, 10)
const title = ref('')
const date = ref(today())
const countryCode = ref('')
const location = ref('')
const latitude = ref<number | null>(null)
const longitude = ref<number | null>(null)
const body = ref('')
const eraId = ref('')
const visibility = ref<Visibility>('private')
const ownColor = ref(false)
const color = ref<string>(PALETTE.accent)
const saving = ref(false)
const error = ref<string | null>(null)

const dialog = ref<HTMLElement>()

// Place search (Photon). Photon's public instance rejects `lang=es` (HTTP 400), so it uses `default`.
const placeQuery = ref('')
const places = ref<Place[]>([])
const searching = ref(false)
const searchError = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | undefined
let searchAbort: AbortController | undefined

function cancelSearch() {
  clearTimeout(searchTimer)
  searchAbort?.abort()
  searching.value = false
}

async function searchPlaces(q: string) {
  searchAbort?.abort()
  searchAbort = new AbortController()
  searching.value = true
  searchError.value = false
  try {
    const data = await $fetch(PHOTON_URL, { query: { q, limit: 6, lang: 'default' }, signal: searchAbort.signal })
    places.value = placesFromPhoton(data, countryCode.value)
    searching.value = false
  } catch (e) {
    if ((e as { name?: string }).name === 'AbortError') return
    places.value = []
    searchError.value = true
    searching.value = false
  }
}

function onPlaceInput() {
  clearTimeout(searchTimer)
  const q = placeQuery.value.trim()
  if (q.length < 3) { cancelSearch(); places.value = []; searchError.value = false; return }
  searching.value = true
  searchTimer = setTimeout(() => searchPlaces(q), 300)
}

function pickPlace(p: Place) {
  cancelSearch()
  location.value = p.label
  latitude.value = p.lat
  longitude.value = p.lng
  placeQuery.value = ''
  places.value = []
}

function clearPlace() {
  latitude.value = null
  longitude.value = null
}

onBeforeUnmount(cancelSearch)

/** Color the moment gets without an override: its era's, else the atlas accent. */
const inherited = computed(() => props.eras.find(e => String(e.id) === eraId.value)?.color || PALETTE.accent)
const shown = computed(() => (ownColor.value ? color.value : inherited.value))

watch(() => props.open, async (open) => {
  if (!open) return
  const m = props.moment
  title.value = m?.title ?? ''
  date.value = m?.date ?? today()
  countryCode.value = m ? m.country_code ?? '' : props.defaultCountryCode || ''
  location.value = m?.location ?? ''
  latitude.value = m?.latitude ?? null
  longitude.value = m?.longitude ?? null
  placeQuery.value = ''
  places.value = []
  searchError.value = false
  cancelSearch()
  body.value = m?.body ?? ''
  eraId.value = m ? (m.era_id != null ? String(m.era_id) : '') : props.eras[0] ? String(props.eras[0].id) : ''
  visibility.value = m?.visibility ?? 'private'
  ownColor.value = !!m?.color
  color.value = m?.color ?? PALETTE.accent
  error.value = null
  await nextTick()
  dialog.value?.querySelector<HTMLElement>('input')?.focus()
})

// Keep Tab inside the dialog while it is open.
function trapTab(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !dialog.value) return
  const items = [...dialog.value.querySelectorAll<HTMLElement>('input, select, textarea, button:not([disabled])')]
  const first = items[0]
  const last = items.at(-1)
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
}

async function submit() {
  saving.value = true
  error.value = null
  try {
    const payload = {
      title: title.value,
      date: date.value,
      country_code: countryCode.value || null,
      location: location.value || null,
      latitude: latitude.value,
      longitude: longitude.value,
      body: body.value || null,
      era_id: eraId.value ? Number(eraId.value) : null,
      visibility: visibility.value,
      color: ownColor.value ? color.value : null,
    }
    if (props.moment) await $fetch(`/api/moments/${props.moment.id}`, { method: 'PATCH', body: payload })
    else await $fetch('/api/moments', { method: 'POST', body: payload })
    emit('save', { country_code: countryCode.value || null })
    emit('close')
  } catch (e) {
    error.value = apiError(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-space-900/70 p-4 backdrop-blur-[2px]" @click="emit('close')">
      <div
        ref="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-moment-title"
        class="paper modal-card max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto border border-ink-700/50 p-6 shadow-2xl outline outline-1 -outline-offset-[6px] outline-ink-700/30"
        @click.stop
        @keydown="trapTab"
      >
        <header class="mb-4 flex items-center justify-between">
          <h2 id="add-moment-title" class="font-display text-2xl font-semibold text-ink-900">{{ moment ? 'Editar moment' : 'Nuevo moment' }}{{ !moment && defaultCountryName ? ` · ${defaultCountryName}` : '' }}</h2>
          <button class="btn-ghost" aria-label="Cerrar" @click="emit('close')">✕</button>
        </header>

        <form class="space-y-3" @submit.prevent="submit">
          <label class="block">
            <span class="label">Título</span>
            <input v-model="title" required class="field">
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <span class="label">Fecha</span>
              <input v-model="date" required type="date" class="field">
            </label>
            <label class="block">
              <span class="label">País</span>
              <select v-model="countryCode" class="field">
                <option value="">— sin país —</option>
                <option v-for="c in countries" :key="c.iso2" :value="c.iso2">{{ c.name_es || c.name }}</option>
              </select>
            </label>
          </div>

          <label class="block">
            <span class="label">Lugar (ciudad, barrio, etc.)</span>
            <input v-model="location" class="field">
          </label>

          <div class="relative">
            <label class="block">
              <span class="label">Buscar lugar en el mapa</span>
              <input
                v-model="placeQuery"
                type="search"
                class="field"
                autocomplete="off"
                role="combobox"
                aria-autocomplete="list"
                aria-controls="place-results"
                :aria-expanded="places.length > 0"
                placeholder="Escribí al menos 3 letras"
                @input="onPlaceInput"
                @keydown.enter.prevent="places[0] && pickPlace(places[0])"
              >
            </label>
            <ul
              v-if="places.length"
              id="place-results"
              role="listbox"
              aria-label="Resultados de lugares"
              class="paper absolute inset-x-0 z-10 mt-1 max-h-48 overflow-y-auto border border-ink-700/50 shadow-lg"
            >
              <li v-for="p in places" :key="`${p.lat},${p.lng},${p.label}`" role="option" aria-selected="false">
                <button type="button" class="w-full px-3 py-1.5 text-left text-sm text-ink-900 hover:bg-ink-700/10 focus-visible:bg-ink-700/10" @click="pickPlace(p)">{{ p.label }}</button>
              </li>
            </ul>
            <p v-else-if="searching" class="mt-1 text-xs italic text-ink-600" role="status">Buscando…</p>
            <p v-else-if="searchError" class="mt-1 text-xs italic text-ink-600" role="status">No se pudo buscar. Probá de nuevo.</p>
            <p v-else-if="placeQuery.trim().length >= 3" class="mt-1 text-xs italic text-ink-600" role="status">Sin resultados{{ countryCode ? ' en este país' : '' }}.</p>
            <p v-if="latitude != null && longitude != null" class="mt-1 flex items-center gap-2 text-xs text-ink-700">
              <span>Punto fijado en el mapa ({{ latitude.toFixed(3) }}, {{ longitude.toFixed(3) }})</span>
              <button type="button" class="btn-ghost px-2 py-0.5 text-xs" @click="clearPlace">Quitar punto</button>
            </p>
          </div>

          <label class="block">
            <span class="label">Notas</span>
            <textarea v-model="body" rows="3" class="field" />
          </label>

          <div class="grid grid-cols-2 gap-3">
            <label class="block">
              <span class="label">Era</span>
              <select v-model="eraId" class="field">
                <option value="">— sin era —</option>
                <option v-for="era in eras" :key="era.id" :value="String(era.id)">{{ era.emoji }} {{ era.title }}</option>
              </select>
            </label>
            <label class="block">
              <span class="label">Visibilidad</span>
              <select v-model="visibility" class="field">
                <option value="private">Privado</option>
                <option value="public">Público</option>
              </select>
            </label>
          </div>

          <div class="space-y-1.5">
            <label class="flex items-center gap-2">
              <input v-model="ownColor" type="checkbox">
              <span class="label">Color propio</span>
            </label>
            <div class="flex flex-wrap items-center gap-3">
              <ColorPicker v-if="ownColor" v-model="color" label="Color del moment" />
              <span class="stamp inline-block py-1.5 pl-3 pr-4 text-sm text-ink-900" :style="{ borderLeft: `5px solid ${shown}` }">
                {{ title || 'Vista previa' }}
              </span>
              <span v-if="!ownColor" class="text-xs italic text-ink-600">Usa el color de su era.</span>
            </div>
          </div>

          <p v-if="error" role="alert" class="text-sm text-accent-700">{{ error }}</p>

          <div class="flex justify-end gap-2 pt-2">
            <button type="button" class="btn-ghost" @click="emit('close')">Cancelar</button>
            <button type="submit" :disabled="saving" class="btn-accent">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
