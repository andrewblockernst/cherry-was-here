<script setup lang="ts">
import type { Country, Era, Moment, Visibility } from '../../shared/types/app'

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

const dialog = ref<HTMLElement>()

watch(() => props.open, async (open) => {
  if (!open) return
  title.value = ''
  date.value = today()
  countryCode.value = props.defaultCountryCode || ''
  location.value = ''
  body.value = ''
  eraId.value = props.eras[0] ? String(props.eras[0].id) : ''
  visibility.value = 'private'
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
          <h2 id="add-moment-title" class="font-display text-2xl font-semibold text-ink-900">Nuevo moment{{ defaultCountryName ? ` · ${defaultCountryName}` : '' }}</h2>
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
