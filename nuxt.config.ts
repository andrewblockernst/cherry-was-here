import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  modules: ['nuxt-auth-utils'],
  css: ['~/assets/css/main.css', 'maplibre-gl/dist/maplibre-gl.css'],
  vite: { plugins: [tailwindcss()] },
  devtools: { enabled: false },
})
