<script setup lang="ts">
import type { CountryCounts, EraWithMoments, Era, Moment } from '../../shared/types/cherry'

definePageMeta({ middleware: 'auth' })

const { countries, names } = await useCountries()
const { data: momentsData, refresh: refreshMoments } = await useFetch<{ moments: Moment[], country_counts: CountryCounts }>('/api/moments')
const { data: erasData } = await useFetch<{ eras: Era[] }>('/api/eras')

const moments = computed(() => momentsData.value?.moments ?? [])
const counts = computed(() => momentsData.value?.country_counts ?? {})

const eras = computed<EraWithMoments[]>(() =>
  (erasData.value?.eras ?? []).map(e => ({
    ...e,
    moments: moments.value.filter(m => m.era_id === e.id).sort((a, b) => a.date.localeCompare(b.date)),
  })),
)

const tab = ref<'map' | 'timeline'>('map')
const hovered = ref<string | null>(null)
const selected = ref<string | null>(null)
const highlighted = computed(() => hovered.value ?? selected.value)

const modal = reactive({ open: false, code: null as string | null, name: null as string | null })
const openModal = (code: string | null = null, name: string | null = null) => Object.assign(modal, { open: true, code, name })

function onSelect({ iso2, name, momentId }: { iso2: string, name: string, momentId?: number }) {
  selected.value = iso2
  if (momentId === undefined) openModal(iso2, name)
}

async function remove(id: number) {
  if (!confirm('¿Eliminar este moment?')) return
  await $fetch(`/api/moments/${id}`, { method: 'DELETE' })
  await refreshMoments()
}
</script>

<template>
  <div>
    <header class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Tu vida</h1>
        <p class="mt-1 text-sm text-stone-500">
          <strong class="text-stone-900">{{ Object.keys(counts).length }}</strong> países ·
          <strong class="text-stone-900">{{ moments.length }}</strong> moments
        </p>
      </div>
      <button class="rounded-md bg-cherry-600 px-4 py-2 text-sm font-medium text-white hover:bg-cherry-700" @click="openModal()">
        + Nuevo moment
      </button>
    </header>

    <TabSwitch v-model="tab" />

    <div v-if="tab === 'map'" class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2">
        <div class="h-[500px] overflow-hidden rounded-xl border border-stone-200 bg-white">
          <WorldGlobe :country-counts="counts" :moments="moments" :highlighted-iso2="highlighted" :country-names="names" @select="onSelect" />
        </div>
      </div>
      <div>
        <h2 class="mb-2 text-sm font-semibold text-stone-600">Moments</h2>
        <MomentList :moments="moments" :country-names="names" @delete="remove" @hover="hovered = $event?.country_code ?? null" />
      </div>
    </div>
    <TimelineView v-else :eras="eras" :highlighted-country="highlighted" @hover="hovered = $event?.country_code ?? null" />

    <AddMomentModal
      :open="modal.open"
      :eras="erasData?.eras ?? []"
      :countries="countries"
      :default-country-code="modal.code"
      :default-country-name="modal.name"
      @close="modal.open = false"
      @save="refreshMoments()"
    />
  </div>
</template>
