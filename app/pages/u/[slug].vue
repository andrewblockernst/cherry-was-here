<script setup lang="ts">
import type { Profile } from '../../../shared/types/cherry'

const slug = useRoute().params.slug as string
const { names } = await useCountries()
const { data: profile, error } = await useFetch<Profile>(`/api/users/${slug}`)

const tab = ref<'map' | 'timeline'>('map')
const hovered = ref<string | null>(null)
const selected = ref<string | null>(null)
const highlighted = computed(() => hovered.value ?? selected.value)

const eras = computed(() => profile.value?.eras ?? [])
const moments = computed(() => eras.value.flatMap(e => e.moments))
</script>

<template>
  <p v-if="error || !profile" class="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
    No se encontró el perfil <span class="font-mono">@{{ slug }}</span>.
  </p>

  <div v-else>
    <header class="mb-6 flex items-center gap-4">
      <img v-if="profile.user.avatar_url" :src="profile.user.avatar_url" alt="" class="h-14 w-14 rounded-full object-cover">
      <div v-else class="flex h-14 w-14 items-center justify-center rounded-full bg-cherry-100 text-xl font-semibold text-cherry-700">
        {{ (profile.user.name || profile.user.slug || '?')[0]?.toUpperCase() }}
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight">{{ profile.user.name || profile.user.slug }}</h1>
        <p class="text-sm text-stone-500">
          @{{ profile.user.slug }} · <strong class="text-stone-900">{{ Object.keys(profile.country_counts).length }}</strong> países ·
          <strong class="text-stone-900">{{ moments.length }}</strong> moments
        </p>
        <p v-if="profile.user.bio" class="mt-1 max-w-prose text-sm text-stone-600">{{ profile.user.bio }}</p>
      </div>
    </header>

    <TabSwitch v-model="tab" />

    <div v-if="tab === 'map'" class="h-[500px] overflow-hidden rounded-xl border border-stone-200 bg-white">
      <WorldGlobe
        :country-counts="profile.country_counts"
        :moments="moments"
        :highlighted-iso2="highlighted"
        :country-names="names"
        @select="selected = $event.iso2"
      />
    </div>
    <TimelineView
      v-else
      :eras="eras"
      :highlighted-country="highlighted"
      @hover="hovered = $event?.country_code ?? null"
      @select="selected = $event.country_code"
    />
  </div>
</template>
