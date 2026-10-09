<script setup lang="ts">
import type { Moment } from '../../shared/types/cherry'

defineProps<{ moments: Moment[], countryNames: Record<string, string> }>()
const emit = defineEmits<{ delete: [id: number], hover: [moment: Moment | null] }>()
</script>

<template>
  <p v-if="!moments.length" class="rounded-lg border border-dashed border-stone-300 bg-white p-4 text-center text-sm text-stone-500">
    Sin moments todavía. Clickeá un país en el mapa para empezar.
  </p>
  <ul v-else class="space-y-2">
    <li
      v-for="m in moments"
      :key="m.id"
      class="group flex items-start justify-between gap-2 rounded-lg border border-stone-200 bg-white p-3 transition-shadow hover:shadow-sm"
      @mouseenter="emit('hover', m)"
      @mouseleave="emit('hover', null)"
    >
      <div class="min-w-0 flex-1">
        <h3 class="text-sm font-medium leading-tight">{{ m.title }}</h3>
        <p class="text-xs text-stone-500">
          {{ m.date }}
          <template v-if="m.country_code"> · {{ countryNames[m.country_code] ?? m.country_code }}</template>
          <template v-if="m.location"> · {{ m.location }}</template>
          <span class="ml-2 rounded px-1.5 py-0.5 text-[10px]" :class="m.visibility === 'public' ? 'bg-cherry-50 text-cherry-700' : 'bg-stone-100 text-stone-500'">
            {{ m.visibility }}
          </span>
        </p>
      </div>
      <button class="text-stone-400 opacity-0 transition-opacity hover:text-cherry-600 focus:opacity-100 group-hover:opacity-100" aria-label="Eliminar" @click="emit('delete', m.id)">
        🗑
      </button>
    </li>
  </ul>
</template>
