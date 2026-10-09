<script setup lang="ts">
import type { Profile } from '../../../shared/types/cherry'

const slug = useRoute().params.slug as string
const atlas = useAtlas()
const { data: profile } = await useFetch<Profile>(`/api/users/${slug}`)

const eras = computed(() => profile.value?.eras ?? [])
watchEffect(() => {
  const p = profile.value
  atlas.show(p
    ? { owner: 'user', user: p.user, countryCounts: p.country_counts, moments: eras.value.flatMap(e => e.moments), eras: eras.value }
    : { owner: 'world', user: null, countryCounts: {}, moments: [], eras: [], missing: slug })
})
useHead({ title: () => (profile.value ? `${profile.value.user.name || slug} · Cherry Was Here` : 'Cherry Was Here') })
</script>

<template>
  <span hidden />
</template>
