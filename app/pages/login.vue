<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()
const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

const input = 'mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-cherry-500 focus:outline-none focus:ring-1 focus:ring-cherry-500'

async function submit() {
  loading.value = true
  error.value = null
  try {
    await $fetch(mode.value === 'login' ? '/api/session' : '/api/users', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await refreshSession()
    await navigateTo('/me')
  } catch (e) {
    error.value = apiError(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm pt-12">
    <h1 class="mb-1 text-2xl font-bold tracking-tight">{{ mode === 'login' ? 'Entrar' : 'Crear cuenta' }}</h1>
    <p class="mb-6 text-sm text-stone-500">Mapea tu vida — los países donde estuviste y los moments que te marcaron.</p>

    <form class="space-y-3" @submit.prevent="submit">
      <label class="block">
        <span class="text-xs font-medium text-stone-600">Email</span>
        <input v-model="email" type="email" required :class="input">
      </label>

      <label class="block">
        <span class="text-xs font-medium text-stone-600">Contraseña</span>
        <input v-model="password" type="password" required minlength="12" :class="input">
        <span v-if="mode === 'register'" class="mt-1 block text-[10px] text-stone-400">Mínimo 12 caracteres.</span>
      </label>

      <p v-if="error" class="text-sm text-cherry-600">{{ error }}</p>

      <button type="submit" :disabled="loading" class="w-full rounded-md bg-cherry-600 px-4 py-2 text-sm font-medium text-white hover:bg-cherry-700 disabled:opacity-50">
        {{ loading ? '…' : mode === 'login' ? 'Entrar' : 'Crear cuenta' }}
      </button>

      <p class="text-center text-xs text-stone-500">
        <template v-if="mode === 'login'">
          ¿No tenés cuenta?
          <button type="button" class="text-cherry-600 hover:underline" @click="mode = 'register'">Crear una</button>
        </template>
        <template v-else>
          ¿Ya tenés cuenta?
          <button type="button" class="text-cherry-600 hover:underline" @click="mode = 'login'">Entrar</button>
        </template>
      </p>

      <p class="pt-4 text-center text-xs text-stone-400">
        <NuxtLink to="/" class="hover:underline">← Volver a explorar</NuxtLink>
      </p>
    </form>
  </div>
</template>
