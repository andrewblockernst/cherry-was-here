<script setup lang="ts">
import { PALETTE } from '../utils/atlasStyle'

defineProps<{ label: string }>()
const model = defineModel<string>({ required: true })

/** Vintage-atlas swatches: the palette inks plus a few warm paper-friendly tones. */
const SWATCHES = [PALETTE.accent, PALETTE.accentDeep, '#C2410C', '#B7791F', '#556B2F', PALETTE.seaInk, '#6B4E8C', PALETTE.ink]
</script>

<template>
  <div role="group" :aria-label="label" class="flex flex-wrap items-center gap-1.5">
    <input v-model="model" type="color" :aria-label="label" class="h-8 w-10 cursor-pointer border border-ink-700/40 bg-paper-50 p-0.5">
    <button
      v-for="c in SWATCHES"
      :key="c"
      type="button"
      class="h-6 w-6 rounded-full border border-ink-700/40"
      :class="model.toLowerCase() === c.toLowerCase() ? 'ring-2 ring-ink-800 ring-offset-1' : ''"
      :style="{ background: c }"
      :aria-label="`${label}: ${c}`"
      :aria-pressed="model.toLowerCase() === c.toLowerCase()"
      @click="model = c"
    />
  </div>
</template>
