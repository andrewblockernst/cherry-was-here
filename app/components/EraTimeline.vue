<script setup lang="ts">
import type { EraWithMoments } from '../../shared/types/app'

defineProps<{ eras: EraWithMoments[], editable?: boolean, empty: string }>()
const atlas = useAtlas()
const { names } = useCountries()
</script>

<template>
  <p v-if="!eras.length" class="border border-dashed border-ink-400 p-4 text-center text-sm italic text-ink-600">{{ empty }}</p>

  <ol v-else class="relative space-y-7 border-l-2 border-dashed border-ink-400/70 pl-5">
    <li v-for="(era, i) in eras" :key="era.id" class="era relative" :style="{ '--i': i }">
      <span
        class="absolute -left-[2.15rem] top-0 grid h-7 w-7 place-items-center rounded-full border-2 border-ink-600 bg-paper-50 text-sm"
        :style="{ boxShadow: `0 0 0 3px ${era.color || 'var(--color-accent-700)'}33` }"
      >{{ era.emoji || '•' }}</span>
      <h3 class="font-display text-lg font-semibold leading-tight text-ink-900">{{ era.title }}</h3>
      <p class="font-type text-[0.7rem] uppercase tracking-widest text-ink-500">
        <template v-if="era.id">{{ era.start_year }}{{ era.end_year ? `–${era.end_year}` : ' – presente' }} · </template>{{ era.moments.length }} {{ era.moments.length === 1 ? 'moment' : 'moments' }}
      </p>
      <ul class="mt-3 space-y-3">
        <MomentStamp
          v-for="(m, k) in era.moments"
          :key="m.id"
          :style="{ '--k': k }"
          :moment="m"
          :color="era.color"
          :country-name="m.country_code ? names[m.country_code] : undefined"
          :active="!!atlas.highlighted.value && m.country_code === atlas.highlighted.value"
          :editable="editable"
          @hover="atlas.hover($event?.country_code ?? null)"
          @pick="atlas.pick"
          @edit="atlas.editMoment"
          @delete="atlas.removeMoment"
        />
      </ul>
    </li>
  </ol>
</template>
