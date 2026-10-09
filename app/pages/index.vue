<script setup lang="ts">
import type { PublicUserSummary } from '../../shared/types/cherry'

const { data, status } = await useFetch<{ users: PublicUserSummary[] }>('/api/explore')
const users = computed(() => data.value?.users ?? [])
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)
</script>

<template>
  <div>
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight">Vidas</h1>
      <p class="mt-1 text-stone-500">Cada uno mapea su vida. Acá están las que decidieron mostrarla.</p>
    </header>

    <p v-if="status === 'pending'" class="text-stone-500">Cargando…</p>
    <ul v-else-if="users.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="u in users" :key="u.slug">
        <NuxtLink :to="`/u/${u.slug}`" class="block rounded-xl border border-stone-200 bg-white p-4 transition-shadow hover:shadow-md">
          <div class="flex items-center gap-3">
            <img v-if="u.avatar_url" :src="u.avatar_url" alt="" class="h-12 w-12 rounded-full object-cover">
            <div v-else class="flex h-12 w-12 items-center justify-center rounded-full bg-cherry-100 text-lg font-semibold text-cherry-700">
              {{ (u.name || u.slug || '?')[0]?.toUpperCase() }}
            </div>
            <div class="min-w-0">
              <h2 class="truncate font-semibold">{{ u.name || u.slug }}</h2>
              <p class="truncate text-xs text-stone-500">@{{ u.slug }}</p>
            </div>
          </div>
          <p v-if="u.bio" class="mt-3 line-clamp-2 text-sm text-stone-600">{{ u.bio }}</p>
          <div class="mt-3 flex gap-4 text-xs text-stone-500">
            <span><strong class="text-stone-900">{{ u.country_count }}</strong> {{ plural(u.country_count, 'país', 'países') }}</span>
            <span><strong class="text-stone-900">{{ u.moment_count }}</strong> {{ plural(u.moment_count, 'moment', 'moments') }}</span>
          </div>
        </NuxtLink>
      </li>
    </ul>
    <p v-else class="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
      Todavía no hay perfiles públicos. Sé el primero.
    </p>
  </div>
</template>
