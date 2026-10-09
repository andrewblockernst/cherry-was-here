<script setup lang="ts">
import type { EraWithMoments, Moment } from '../../shared/types/cherry'

defineProps<{ eras: EraWithMoments[], highlightedCountry?: string | null }>()
const emit = defineEmits<{ hover: [moment: Moment | null], select: [moment: Moment] }>()
</script>

<template>
  <div v-if="!eras.length" class="flex h-64 items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white text-stone-500">
    <div class="text-center">
      <div class="mb-2 text-4xl">🌱</div>
      <p>Todavía no hay eras.</p>
    </div>
  </div>

  <div v-else class="relative">
    <div class="pointer-events-none absolute left-0 right-0 top-12 h-0.5 bg-stone-200" />
    <div class="flex gap-6 overflow-x-auto pb-6">
      <article v-for="era in eras" :key="era.id" class="relative flex w-72 shrink-0 flex-col">
        <header class="mb-3">
          <div class="mb-1 text-2xl">{{ era.emoji }}</div>
          <h2 class="text-lg font-semibold leading-tight">{{ era.title }}</h2>
          <p class="text-xs text-stone-500">
            {{ era.start_year }}{{ era.end_year ? `–${era.end_year}` : ' – presente' }}
            <span class="text-stone-400"> · {{ era.moments.length }} {{ era.moments.length === 1 ? 'moment' : 'moments' }}</span>
          </p>
          <div class="mt-2 h-1 w-12 rounded-full" :style="{ backgroundColor: era.color || '#c8102e' }" />
        </header>

        <ul class="space-y-2">
          <li v-for="m in era.moments" :key="m.id">
            <button
              class="w-full rounded-lg border bg-white p-3 text-left transition-shadow hover:shadow-md"
              :class="highlightedCountry && m.country_code === highlightedCountry ? 'border-cherry-400 ring-2 ring-cherry-200' : 'border-stone-200'"
              @click="emit('select', m)"
              @mouseenter="emit('hover', m)"
              @mouseleave="emit('hover', null)"
            >
              <div class="flex items-baseline justify-between gap-2">
                <h3 class="text-sm font-medium leading-tight">{{ m.title }}</h3>
                <span v-if="m.country_code" class="font-mono text-xs text-stone-400">{{ m.country_code }}</span>
              </div>
              <p class="mt-0.5 text-xs text-stone-500">{{ m.date }}{{ m.location ? ` · ${m.location}` : '' }}</p>
              <p v-if="m.body" class="mt-2 line-clamp-2 text-xs text-stone-600">{{ m.body }}</p>
            </button>
          </li>
        </ul>
      </article>
    </div>
  </div>
</template>
