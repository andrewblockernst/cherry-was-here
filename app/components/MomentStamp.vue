<script setup lang="ts">
import type { Moment } from '../../shared/types/app'

const props = defineProps<{
  moment: Moment
  countryName?: string
  color?: string | null
  active?: boolean
  editable?: boolean
}>()
const emit = defineEmits<{ hover: [moment: Moment | null], pick: [moment: Moment], delete: [id: number] }>()

const mark = computed(() => postmark(props.moment.date))
</script>

<template>
  <li class="stamp-item stamp-shadow relative">
    <button
      class="stamp block w-full py-3.5 pl-4 pr-14 text-left transition-transform duration-300 ease-out-quart hover:-translate-y-0.5"
      :class="active ? 'bg-accent-50 -translate-y-0.5' : ''"
      :style="{ borderLeft: `5px solid ${color || 'var(--color-accent-700)'}` }"
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

    <button
      v-if="editable"
      class="absolute right-1 top-1 z-10 rounded-sm p-1 text-sm text-ink-500 opacity-0 transition-opacity hover:text-accent-700 focus:opacity-100 [li:hover_&]:opacity-100 [li:focus-within_&]:opacity-100"
      aria-label="Eliminar"
      @click="emit('delete', moment.id)"
    >
      🗑
    </button>
  </li>
</template>
