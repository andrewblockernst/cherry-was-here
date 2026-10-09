<script setup lang="ts">
import type { Era } from '../../shared/types/app'
import { PALETTE } from '../utils/atlasStyle'

const props = defineProps<{ open: boolean, startNew?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const atlas = useAtlas()

const eras = computed(() => atlas.state.value.eras.filter(e => e.id > 0))
const editing = ref<Era | 'new' | null>(null)
const title = ref('')
const startYear = ref<number | null>(null)
const endYear = ref<number | null>(null)
const emoji = ref('')
const color = ref<string>(PALETTE.accent)
const saving = ref(false)
const error = ref<string | null>(null)
const dialog = ref<HTMLElement>()

const focusFirst = async () => {
  await nextTick()
  dialog.value?.querySelector<HTMLElement>('input, button')?.focus()
}

function edit(era: Era | 'new') {
  editing.value = era
  const e = era === 'new' ? null : era
  title.value = e?.title ?? ''
  startYear.value = e?.start_year ?? new Date().getFullYear()
  endYear.value = e?.end_year ?? null
  emoji.value = e?.emoji ?? ''
  color.value = e?.color ?? PALETTE.accent
  error.value = null
  focusFirst()
}

const list = () => { editing.value = null; error.value = null; focusFirst() }

watch(() => props.open, (open) => {
  if (!open) return
  if (props.startNew) edit('new')
  else list()
})

function onEsc() {
  if (editing.value) list()
  else emit('close')
}

function trapTab(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !dialog.value) return
  const items = [...dialog.value.querySelectorAll<HTMLElement>('input, select, button:not([disabled])')]
  const first = items[0]
  const last = items.at(-1)
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
}

/** Runs an API call, then refreshes the timeline; failures show inline. */
async function run(fn: () => Promise<unknown>) {
  saving.value = true
  error.value = null
  try {
    await fn()
    await atlas.refreshTimeline()
    return true
  } catch (e) {
    error.value = apiError(e)
    return false
  } finally {
    saving.value = false
  }
}

async function submit() {
  const era = editing.value
  const body = {
    title: title.value,
    start_year: startYear.value,
    end_year: endYear.value || null,
    emoji: emoji.value || null,
    color: color.value,
  }
  const done = await run(async () => {
    if (era === 'new') await $fetch('/api/eras', { method: 'POST', body })
    else await $fetch(`/api/eras/${(era as Era).id}`, { method: 'PATCH', body })
  })
  if (done) list()
}

async function remove(era: Era) {
  if (!confirm(`¿Eliminar la era "${era.title}"? Sus moments se quedan, pero sin era.`)) return
  await run(async () => { await $fetch(`/api/eras/${era.id}`, { method: 'DELETE' }) })
}

/** Moves an era one slot and renumbers the list so equal or empty order_index values cannot block a swap. */
async function move(index: number, by: -1 | 1) {
  const next = [...eras.value]
  const [era] = next.splice(index, 1)
  next.splice(index + by, 0, era!)
  await run(() => Promise.all(next.flatMap((e, i) => e.order_index === i
    ? []
    : [$fetch(`/api/eras/${e.id}`, { method: 'PATCH', body: { order_index: i } })])))
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-space-900/70 p-4 backdrop-blur-[2px]" @click="emit('close')">
        <div
          ref="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="era-editor-title"
          class="paper modal-card max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto border border-ink-700/50 p-6 shadow-2xl outline outline-1 -outline-offset-[6px] outline-ink-700/30"
          @click.stop
          @keydown.esc.stop="onEsc"
          @keydown="trapTab"
        >
          <header class="mb-4 flex items-center justify-between">
            <h2 id="era-editor-title" class="font-display text-2xl font-semibold text-ink-900">
              {{ editing === 'new' ? 'Nueva era' : editing ? 'Editar era' : 'Tus eras' }}
            </h2>
            <button class="btn-ghost" aria-label="Cerrar" @click="emit('close')">✕</button>
          </header>

          <form v-if="editing" class="space-y-3" @submit.prevent="submit">
            <label class="block">
              <span class="label">Título</span>
              <input v-model="title" required class="field">
            </label>
            <div class="grid grid-cols-3 gap-3">
              <label class="block">
                <span class="label">Desde (año)</span>
                <input v-model.number="startYear" required type="number" class="field">
              </label>
              <label class="block">
                <span class="label">Hasta (opcional)</span>
                <input v-model.number="endYear" type="number" :min="startYear ?? undefined" class="field">
              </label>
              <label class="block">
                <span class="label">Emoji</span>
                <input v-model="emoji" maxlength="8" class="field">
              </label>
            </div>
            <div>
              <span class="label">Color</span>
              <div class="mt-1.5"><ColorPicker v-model="color" label="Color de la era" /></div>
            </div>
            <div class="flex items-center gap-3 border border-dashed border-ink-400 p-3">
              <span class="label">Vista previa</span>
              <span class="stamp inline-block py-2 pl-3 pr-4 font-display font-semibold text-ink-900" :style="{ borderLeft: `5px solid ${color}` }">
                {{ emoji }} {{ title || 'Título de la era' }}
              </span>
            </div>

            <p v-if="error" role="alert" class="text-sm text-accent-700">{{ error }}</p>

            <div class="flex justify-end gap-2 pt-2">
              <button type="button" class="btn-ghost" @click="list">Volver</button>
              <button type="submit" :disabled="saving" class="btn-accent">{{ saving ? 'Guardando…' : 'Guardar' }}</button>
            </div>
          </form>

          <div v-else>
            <p v-if="!eras.length" class="border border-dashed border-ink-400 p-4 text-center text-sm italic text-ink-600">Todavía no tenés eras.</p>
            <ul v-else class="space-y-2">
              <li v-for="(era, i) in eras" :key="era.id" class="flex items-center gap-2 border border-ink-700/25 bg-paper-50/70 p-2" :style="{ borderLeft: `5px solid ${era.color || PALETTE.accent}` }">
                <span class="min-w-0 flex-1">
                  <span class="block truncate font-display font-semibold text-ink-900">{{ era.emoji }} {{ era.title }}</span>
                  <span class="font-type text-[0.65rem] uppercase tracking-widest text-ink-500">{{ era.start_year }}{{ era.end_year ? `–${era.end_year}` : ' – presente' }}</span>
                </span>
                <button class="btn-ghost" :disabled="saving || i === 0" :aria-label="`Subir ${era.title}`" @click="move(i, -1)">↑</button>
                <button class="btn-ghost" :disabled="saving || i === eras.length - 1" :aria-label="`Bajar ${era.title}`" @click="move(i, 1)">↓</button>
                <button class="btn-ghost" :aria-label="`Editar ${era.title}`" @click="edit(era)"><AppIcon name="pencil" /></button>
                <button class="btn-ghost" :disabled="saving" :aria-label="`Eliminar ${era.title}`" @click="remove(era)"><AppIcon name="trash" /></button>
              </li>
            </ul>
            <p v-if="error" role="alert" class="mt-3 text-sm text-accent-700">{{ error }}</p>
            <div class="flex justify-end gap-2 pt-4">
              <button class="btn-ghost" @click="emit('close')">Cerrar</button>
              <button class="btn-accent" @click="edit('new')">+ Nueva era</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
