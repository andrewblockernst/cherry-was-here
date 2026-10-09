<script setup lang="ts">
const { loggedIn } = useUserSession()
if (loggedIn.value) await navigateTo('/me')

const atlas = useAtlas()
atlas.show({ owner: 'world', user: null, countryCounts: {}, moments: [], eras: [] })
useHead({ title: 'Entrar · yafue' })
</script>

<template>
  <span hidden />
</template>
