import tailwindcss from '@tailwindcss/vite'

const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400..800,0..100;1,9..144,400..800,0..100&family=Lora:ital,wght@0,400..700;1,400..700&family=Special+Elite&display=swap'

export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  modules: ['nuxt-auth-utils'],
  css: ['~/assets/css/main.css', 'maplibre-gl/dist/maplibre-gl.css'],
  vite: { plugins: [tailwindcss()] },
  devtools: { enabled: false },
  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Cherry Was Here',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0d1119' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: FONTS },
      ],
    },
  },
})
