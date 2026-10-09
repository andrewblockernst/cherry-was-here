<script setup lang="ts">
import type { Country, Era, Moment, Visibility } from '../../shared/types/cherry'

const props = defineProps<{
  open: boolean
  eras: Era[]
  countries: Country[]
  defaultCountryCode?: string | null
  defaultCountryName?: string | null
}>()
const emit = defineEmits<{ close: [], save: [moment: Partial<Moment>] }>()

const today = () => new Date().toISOString().slice(0, 10)
const title = ref('')
const date = ref(today())
const countryCode = ref('')
const location = ref('')
const body = ref('')
const eraId = ref('')
const visibility = ref<Visibility>('private')
const saving = ref(false)
const error = ref<string | null>(null)

watch(() => props.open, (open) => {
  if (!open) return
  title.value = ''
  date.value = today()
  countryCode.value = props.defaultCountryCode || ''
  location.value = ''
  body.value = ''
  eraId.value = props.eras[0] ? String(props.eras[0].id) : ''
  visibility.value = 'private'
  error.value = null
})

const input = 'mt-1 w-full rounded-md border border-stone-300 px-3 py-1.5 text-sm focus:border-cherry-500 focus:outline-none focus:ring-1 focus:ring-cherry-500'

async function submit() {
  saving.value = true
  error.value = null
  try {
    await $fetch('/api/moments', {
      method: 'POST',
      body: {
        title: title.value,
        date: date.value,
        country_code: countryCode.value || null,
        location: location.value || null,
        body: body.value || null,
        era_id: eraId.value ? Number(eraId.value) : null,
        visibility: visibility.value,
      },
    })
    emit('save', {})
    emit('close')
  } catch (e) {
    error.value = apiError(e)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4" @click="emit('close')">
    <div class="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl" @click.stop>
      <header class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-semibold">Nuevo moment{{ defaultCountryName ? ` · ${defaultCountryName}` : '' }}</h2>
        <button class="rounded p-1 text-stone-500 hover:bg-stone-100" aria-label="Cerrar" @click="emit('close')">✕</button>
      </header>

      <form class="space-y-3" @submit.prevent="submit">
        <label class="block">
          <span class="text-xs font-medium text-stone-600">Título</span>
          <input v-model="title" required :class="input">
        </label>

        <div class="grid grid-cols-2 gap-3">
          <label class="block">
            <span class="text-xs font-medium text-stone-600">Fecha</span>
            <input v-model="date" required type="date" :class="input">
          </label>
          <label class="block">
            <span class="text-xs font-medium text-stone-600">País</span>
            <select v-model="countryCode" :class="input">
              <option value="">— sin país —</option>
              <option v-for="c in countries" :key="c.iso2" :value="c.iso2">{{ c.name_es || c.name }}</option>
            </select>
          </label>
        </div>

        <label class="block">
          <span class="text-xs font-medium text-stone-600">Lugar (ciudad, barrio, etc.)</span>
          <input v-model="location" :class="input">
        </label>

        <label class="block">
          <span class="text-xs font-medium text-stone-600">Notas</span>
          <textarea v-model="body" rows="3" :class="input" />
        </label>

        <div class="grid grid-cols-2 gap-3">
          <label class="block">
            <span class="text-xs font-medium text-stone-600">Era</span>
            <select v-model="eraId" :class="input">
              <option value="">— sin era —</option>
              <option v-for="era in eras" :key="era.id" :value="String(era.id)">{{ era.emoji }} {{ era.title }}</option>
            </select>
          </label>
          <label class="block">
            <span class="text-xs font-medium text-stone-600">Visibilidad</span>
            <select v-model="visibility" :class="input">
              <option value="private">Privado</option>
              <option value="public">Público</option>
            </select>
          </label>
        </div>

        <p v-if="error" class="text-sm text-cherry-600">{{ error }}</p>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="rounded-md px-4 py-1.5 text-sm text-stone-600 hover:bg-stone-100" @click="emit('close')">Cancelar</button>
          <button type="submit" :disabled="saving" class="rounded-md bg-cherry-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-cherry-700 disabled:opacity-50">
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
