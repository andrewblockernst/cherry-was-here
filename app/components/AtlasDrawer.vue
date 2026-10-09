<script setup lang="ts">
import type { PublicUserSummary, User } from '../../shared/types/cherry'
import type { Panel } from '../composables/useAtlas'

const { state, setDrawer, enter, openModal } = useAtlas()
const { loggedIn, clear } = useUserSession()
const { data: me } = useFetch<User>('/api/me', { key: 'me', immediate: loggedIn.value, watch: [loggedIn] })

const { data: explore, status: exploreStatus } = useFetch<{ users: PublicUserSummary[] }>('/api/explore', { key: 'explore' })
const users = computed(() => explore.value?.users ?? [])
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)
const initial = (name: string | null, slug: string | null) => (name || slug || '?')[0]?.toUpperCase()

const countryTotal = computed(() => Object.keys(state.value.countryCounts).length)

const tabs = computed<{ id: Panel, label: string }[]>(() => [
  { id: 'explore', label: 'Explorar' },
  { id: 'me', label: loggedIn.value ? 'Tu vida' : 'Entrar' },
  { id: 'options', label: 'Opciones' },
])

async function selectTab(id: Panel) {
  enter(id, false)
  if (id === 'explore' && state.value.owner === 'me') await navigateTo('/')
  if (id === 'me') await navigateTo(loggedIn.value ? '/me' : '/login')
}

function onPickUser() {
  if (window.matchMedia('(max-width: 767px)').matches) setDrawer(false)
}

async function logout() {
  await $fetch('/api/session', { method: 'DELETE' })
  await clear()
  me.value = undefined
  await navigateTo('/login')
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header class="flex h-[4.5rem] shrink-0 items-center gap-3 pl-[4.75rem] pr-4">
      <h2 id="atlas-drawer-title" class="font-display text-xl font-semibold italic text-ink-900">Atlas</h2>
    </header>

    <div role="tablist" aria-label="Secciones" class="flex shrink-0 gap-1 border-b border-ink-700/30 px-4">
      <button
        v-for="t in tabs"
        :id="`tab-${t.id}`"
        :key="t.id"
        role="tab"
        :aria-selected="state.panel === t.id"
        aria-controls="atlas-panel"
        class="-mb-px border border-b-0 px-3.5 py-2 font-type text-[0.72rem] uppercase tracking-widest transition-colors"
        :class="state.panel === t.id ? 'border-ink-700/40 bg-paper-50 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800'"
        @click="selectTab(t.id)"
      >
        {{ t.label }}
      </button>
    </div>

    <div id="atlas-panel" role="tabpanel" :aria-labelledby="`tab-${state.panel}`" class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-10 pt-5">
      <Transition name="panel" mode="out-in">
        <!-- Explore: every public life, or the one being viewed -->
        <section v-if="state.panel === 'explore'" :key="`explore-${state.user?.slug ?? state.missing ?? 'all'}`">
          <template v-if="state.owner === 'user' && state.user">
            <NuxtLink to="/" class="font-type text-[0.7rem] uppercase tracking-widest text-ink-600 hover:text-cherry-700">← Todas las vidas</NuxtLink>
            <header class="mt-3 flex items-center gap-3">
              <img v-if="state.user.avatar_url" :src="state.user.avatar_url" alt="" class="h-14 w-14 rounded-full border-2 border-ink-600 object-cover">
              <span v-else class="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-ink-600 bg-paper-50 font-display text-xl font-semibold text-cherry-700">{{ initial(state.user.name, state.user.slug) }}</span>
              <div class="min-w-0">
                <h3 class="truncate font-display text-2xl font-semibold leading-tight text-ink-900">{{ state.user.name || state.user.slug }}</h3>
                <p class="font-type text-[0.7rem] tracking-wide text-ink-600">
                  @{{ state.user.slug }} · {{ countryTotal }} {{ plural(countryTotal, 'país', 'países') }} · {{ state.moments.length }} {{ plural(state.moments.length, 'moment', 'moments') }}
                </p>
              </div>
            </header>
            <p v-if="state.user.bio" class="mt-3 text-sm italic text-ink-700">{{ state.user.bio }}</p>
            <div class="mt-6">
              <EraTimeline :eras="state.eras" empty="Todavía no hay eras." />
            </div>
          </template>

          <template v-else>
            <h3 class="font-display text-3xl font-semibold text-ink-900">Vidas</h3>
            <p class="mb-5 mt-1 text-sm italic text-ink-600">
              <template v-if="state.missing">No se encontró el perfil <span class="font-type not-italic">@{{ state.missing }}</span>. </template>
              Cada uno mapea su vida. Acá están las que decidieron mostrarla.
            </p>

            <p v-if="exploreStatus === 'pending'" class="text-sm italic text-ink-600">Cargando…</p>
            <ul v-else-if="users.length" class="space-y-3">
              <li v-for="(u, i) in users" :key="u.slug" class="stagger" :style="{ '--i': i }">
                <NuxtLink :to="`/u/${u.slug}`" class="group block border border-ink-700/25 bg-paper-50/80 p-3.5 transition-all duration-300 ease-out-quart hover:-translate-y-0.5 hover:border-cherry-700/50 hover:shadow-lg" @click="onPickUser">
                  <span class="flex items-center gap-3">
                    <img v-if="u.avatar_url" :src="u.avatar_url" alt="" class="h-11 w-11 rounded-full border border-ink-600 object-cover">
                    <span v-else class="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink-600 bg-paper-100 font-display text-lg font-semibold text-cherry-700">{{ initial(u.name, u.slug) }}</span>
                    <span class="min-w-0">
                      <span class="block truncate font-display text-lg font-semibold leading-tight text-ink-900 group-hover:text-cherry-800">{{ u.name || u.slug }}</span>
                      <span class="block truncate font-type text-[0.7rem] text-ink-500">@{{ u.slug }}</span>
                    </span>
                  </span>
                  <span v-if="u.bio" class="mt-2 line-clamp-2 block text-sm italic text-ink-700">{{ u.bio }}</span>
                  <span class="mt-2 flex gap-4 font-type text-[0.68rem] uppercase tracking-widest text-ink-600">
                    <span><b class="text-cherry-700">{{ u.country_count }}</b> {{ plural(u.country_count, 'país', 'países') }}</span>
                    <span><b class="text-cherry-700">{{ u.moment_count }}</b> {{ plural(u.moment_count, 'moment', 'moments') }}</span>
                  </span>
                </NuxtLink>
              </li>
            </ul>
            <p v-else class="border border-dashed border-ink-400 p-6 text-center text-sm italic text-ink-600">Todavía no hay perfiles públicos. Sé el primero.</p>
          </template>
        </section>

        <!-- Me: account form or my own timeline -->
        <section v-else-if="state.panel === 'me'" key="me">
          <AuthForm v-if="!loggedIn" />
          <template v-else>
            <header class="flex items-end justify-between gap-3">
              <div class="min-w-0">
                <h3 class="font-display text-3xl font-semibold text-ink-900">Tu vida</h3>
                <p class="font-type text-[0.7rem] uppercase tracking-widest text-ink-600">
                  {{ countryTotal }} {{ plural(countryTotal, 'país', 'países') }} · {{ state.moments.length }} {{ plural(state.moments.length, 'moment', 'moments') }}
                </p>
              </div>
              <button class="btn-cherry shrink-0" @click="state.owner === 'me' ? openModal() : navigateTo('/me')">+ Nuevo moment</button>
            </header>

            <p class="mt-2 truncate text-xs italic text-ink-600">{{ me?.name || me?.email }}</p>

            <div class="mt-5">
              <EraTimeline v-if="state.owner === 'me'" :eras="state.eras" editable empty="Sin moments todavía. Clickeá un país en el mapa para empezar." />
            </div>

            <footer class="mt-8 flex flex-wrap items-center gap-2 border-t border-ink-700/25 pt-4">
              <NuxtLink v-if="me?.slug" :to="`/u/${me.slug}`" class="btn-ghost">Perfil público</NuxtLink>
              <button class="btn-ghost" @click="logout">Salir</button>
            </footer>
          </template>
        </section>

        <!-- Options -->
        <section v-else key="options">
          <h3 class="font-display text-3xl font-semibold text-ink-900">Opciones</h3>
          <div class="mt-8 border-t border-ink-700/25 pt-5 text-sm leading-relaxed text-ink-700">
            <h4 class="label mb-2">Acerca de</h4>
            <p class="italic">Cherry Was Here es un atlas personal: cada uno marca los países donde estuvo y los moments que lo marcaron.</p>
            <p class="mt-3 text-xs text-ink-500">Mapa: OpenFreeMap · © OpenMapTiles · datos © colaboradores de OpenStreetMap.</p>
          </div>
        </section>
      </Transition>
    </div>
  </div>
</template>
