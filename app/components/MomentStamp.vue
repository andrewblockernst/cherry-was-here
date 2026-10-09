<script setup lang="ts">
import type { Moment } from '../../shared/types/app'

const props = defineProps<{
  moment: Moment
  countryName?: string
  color?: string | null
  active?: boolean
  editable?: boolean
}>()
const emit = defineEmits<{ hover: [moment: Moment | null], pick: [moment: Moment], edit: [moment: Moment], delete: [id: number] }>()

/** The moment's own color, else the one inherited from its era. */
const accent = computed(() => props.moment.color || props.color || 'var(--color-accent-700)')
const mark = computed(() => postmark(props.moment.date))
</script>

<template>
  <li class="stamp-item stamp-shadow relative">
    <button
      class="stamp block min-h-[6.5rem] w-full py-3.5 pl-4 pr-16 text-left transition-transform duration-300 ease-out-quart hover:-translate-y-0.5"
      :class="active ? 'bg-accent-50 -translate-y-0.5' : ''"
      :style="{ borderLeft: `5px solid ${accent}` }"
      @click="emit('pick', moment)"
      @mouseenter="emit('hover', moment)"
      @mouseleave="emit('hover', null)"
      @focus="emit('hover', moment)"
      @blur="emit('hover', null)"
    >
      <span class="flex items-center gap-2 font-type text-[0.65rem] uppercase tracking-widest text-ink-500">
        <span v-if="moment.country_code" class="rounded-sm border border-ink-400/60 px-1 py-px">{{ moment.country_code }}</span>
        <span v-if="editable">{{ moment.visibility === 'public' ? 'público' : 'privado' }}</span>
      </span>
      <span class="mt-1.5 block font-display text-[1.05rem] font-semibold leading-tight text-ink-900">{{ moment.title }}</span>
      <span v-if="countryName || moment.location" class="mt-0.5 block text-xs italic text-ink-600">
        {{ [moment.location, countryName].filter(Boolean).join(' · ') }}
      </span>
      <span v-if="moment.body" class="mt-2 line-clamp-2 block text-xs leading-snug text-ink-700">{{ moment.body }}</span>
    </button>

    <span class="postmark" aria-hidden="true">
      <span>{{ mark.day }} {{ mark.month }}<br>{{ mark.year }}</span>
    </span>
    <span class="sr-only">{{ moment.date }}</span>

    <span v-if="editable" class="absolute bottom-1.5 right-1.5 z-10 flex gap-1">
      <button class="stamp-action hover:text-accent-700" aria-label="Editar" title="Editar" @click="emit('edit', moment)">
        <AppIcon name="pencil" />
      </button>
      <button class="stamp-action hover:text-red-700" aria-label="Eliminar" title="Eliminar" @click="emit('delete', moment.id)">
        <AppIcon name="trash" />
      </button>
    </span>
  </li>
</template>
