<script setup lang="ts">
const tab = defineModel<'map' | 'timeline'>({ required: true })
const tabs = [['map', 'Mapa'], ['timeline', 'Timeline']] as const
</script>

<template>
  <div class="mb-4 inline-flex rounded-lg bg-stone-100 p-1 text-sm">
    <button
      v-for="[id, label] in tabs"
      :key="id"
      class="rounded-md px-4 py-1.5 transition"
      :class="tab === id ? 'bg-white shadow-sm' : 'text-stone-500'"
      @click="tab = id"
    >
      {{ label }}
    </button>
  </div>
</template>
