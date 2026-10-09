<script setup lang="ts">
const { fetch: refreshSession } = useUserSession()
const mode = ref<'login' | 'register'>('login')
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

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
  <div>
    <h2 class="font-display text-2xl font-semibold text-ink-900">{{ mode === 'login' ? 'Entrar' : 'Crear cuenta' }}</h2>
    <p class="mb-5 mt-1 text-sm italic text-ink-600">Mapea tu vida — los países donde estuviste y los moments que te marcaron.</p>

    <form class="space-y-3" @submit.prevent="submit">
      <label class="block">
        <span class="label">Email</span>
        <input v-model="email" type="email" required autocomplete="email" class="field">
      </label>

      <label class="block">
        <span class="label">Contraseña</span>
        <input v-model="password" type="password" required minlength="12" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" class="field">
        <span v-if="mode === 'register'" class="mt-1 block text-[0.7rem] italic text-ink-500">Mínimo 12 caracteres.</span>
      </label>

      <p v-if="error" role="alert" class="text-sm text-accent-700">{{ error }}</p>

      <button type="submit" :disabled="loading" class="btn-accent w-full">
        {{ loading ? '…' : mode === 'login' ? 'Entrar' : 'Crear cuenta' }}
      </button>

      <p class="pt-1 text-center text-xs text-ink-600">
        <template v-if="mode === 'login'">
          ¿No tenés cuenta?
          <button type="button" class="text-accent-700 underline underline-offset-2" @click="mode = 'register'">Crear una</button>
        </template>
        <template v-else>
          ¿Ya tenés cuenta?
          <button type="button" class="text-accent-700 underline underline-offset-2" @click="mode = 'login'">Entrar</button>
        </template>
      </p>
    </form>
  </div>
</template>
