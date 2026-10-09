<script setup lang="ts">
import type { CountryCounts, Era, Moment } from '../../shared/types/app'

definePageMeta({ middleware: 'auth' })

const atlas = useAtlas()
const { data: momentsData } = await useFetch<{ moments: Moment[], country_counts: CountryCounts }>('/api/moments', { key: 'me-moments' })
const { data: erasData } = await useFetch<{ eras: Era[] }>('/api/eras', { key: 'me-eras' })

watchEffect(() => {
  const moments = momentsData.value?.moments ?? []
  atlas.show({
    owner: 'me',
    user: null,
    countryCounts: momentsData.value?.country_counts ?? {},
    moments,
    eras: groupByEra(erasData.value?.eras ?? [], moments),
  })
})
useHead({ title: 'Tu vida · La vida es una' })
</script>

<template>
  <span hidden />
</template>
