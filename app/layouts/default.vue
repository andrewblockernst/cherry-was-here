<script setup lang="ts">
import type { User } from '../../shared/types/cherry'

const { loggedIn, clear } = useUserSession()
const { data: me } = await useFetch<User>('/api/me', { key: 'me', immediate: loggedIn.value, watch: [loggedIn] })

async function logout() {
  await $fetch('/api/session', { method: 'DELETE' })
  await clear()
  me.value = undefined
  await navigateTo('/login')
}

const link = 'rounded-md px-3 py-1.5 hover:bg-stone-100'
</script>

<template>
  <div class="min-h-screen bg-stone-50 text-stone-900">
    <header class="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur-md">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <NuxtLink to="/" class="flex items-center gap-2 font-semibold tracking-tight">
          <span class="text-xl">🍒</span>
          <span>cherry was here</span>
        </NuxtLink>

        <nav class="flex items-center gap-1 text-sm">
          <NuxtLink to="/" :class="link" active-class="bg-stone-100 font-medium">Explorar</NuxtLink>
          <template v-if="loggedIn">
            <NuxtLink to="/me" :class="link" active-class="bg-stone-100 font-medium">Tu vida</NuxtLink>
            <NuxtLink v-if="me?.slug" :to="`/u/${me.slug}`" :class="link">Perfil público</NuxtLink>
            <button :class="[link, 'text-stone-600']" @click="logout">Salir</button>
          </template>
          <NuxtLink v-else to="/login" class="rounded-md bg-cherry-600 px-3 py-1.5 font-medium text-white hover:bg-cherry-700">
            Entrar
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
      <slot />
    </main>
  </div>
</template>
