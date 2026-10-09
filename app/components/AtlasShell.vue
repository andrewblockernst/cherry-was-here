<script setup lang="ts">
const { state, toggleDrawer, setDrawer, closeModal } = useAtlas()
const { countries } = useCountries()
const burger = ref<HTMLButtonElement>()
const drawer = ref<HTMLElement>()

const open = computed(() => state.value.drawerOpen)
const countryTotal = computed(() => Object.keys(state.value.countryCounts).length)
const editableEras = computed(() => state.value.eras.filter(e => e.id > 0))

// Focus management: into the drawer when it opens, back to the button when it closes.
watch(open, async (isOpen) => {
  await nextTick()
  if (isOpen) drawer.value?.querySelector<HTMLElement>('[role=tab][aria-selected=true]')?.focus({ preventScroll: true })
  else if (drawer.value?.contains(document.activeElement)) burger.value?.focus()
})

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  if (state.value.modal.open) closeModal()
  else if (open.value) setDrawer(false)
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div>
    <NuxtLink to="/" class="brand" aria-label="Cherry Was Here, inicio">
      <span class="brand-title">Cherry <em>Was</em> Here</span>
      <span class="brand-tag">un atlas de momentos</span>
    </NuxtLink>

    <button
      ref="burger"
      class="burger"
      :class="{ 'is-open': open }"
      type="button"
      :aria-expanded="open"
      aria-controls="atlas-drawer"
      :aria-label="open ? 'Cerrar menú' : 'Abrir menú'"
      @click="toggleDrawer"
    >
      <span /><span /><span />
    </button>

    <aside
      id="atlas-drawer"
      ref="drawer"
      class="paper fixed bottom-0 left-0 top-0 z-40 w-full border-r border-ink-700/40 shadow-[8px_0_40px_rgb(8_10_18/0.5)] md:w-[var(--drawer-w)]"
      :class="open ? '' : 'pointer-events-none -translate-x-full'"
      aria-labelledby="atlas-drawer-title"
      :inert="!open"
    >
      <ClientOnly><AtlasDrawer /></ClientOnly>
    </aside>

    <ClientOnly>
    <Transition name="chip">
      <div v-if="state.owner === 'user' && state.user" class="chip">
        <span class="font-display italic">{{ state.user.name || state.user.slug }}</span>
        <span class="font-type text-[0.68rem] uppercase tracking-widest text-ink-600">{{ countryTotal }} países · {{ state.moments.length }} moments</span>
        <NuxtLink to="/" class="grid h-6 w-6 place-items-center rounded-full text-ink-600 hover:bg-ink-700/10" aria-label="Volver al mundo">✕</NuxtLink>
      </div>
    </Transition>
    </ClientOnly>

    <AddMomentModal
      :open="state.modal.open"
      :eras="editableEras"
      :countries="countries"
      :default-country-code="state.modal.code"
      :default-country-name="state.modal.name"
      @close="closeModal"
      @save="refreshNuxtData('me-moments')"
    />
  </div>
</template>

<style scoped>
.brand {
  position: fixed;
  top: max(1rem, env(safe-area-inset-top));
  left: 50%;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform: translateX(-50%);
  padding: 0.45rem 1.4rem 0.5rem;
  background: var(--color-paper-100);
  background-image: var(--paper-grain-soft);
  border: 1px solid rgb(82 61 44 / 0.55);
  outline: 1px solid rgb(82 61 44 / 0.35);
  outline-offset: -5px;
  box-shadow: 0 6px 22px rgb(8 10 18 / 0.45);
  color: var(--color-ink-900);
  text-decoration: none;
  white-space: nowrap;
}
.brand-title { font: 600 1.45rem/1.1 var(--font-display); font-variation-settings: "SOFT" 100, "opsz" 72; letter-spacing: -0.01em; }
.brand-title em { color: var(--color-cherry-700); font-weight: 500; }
.brand-tag { font: 400 0.6rem/1.2 var(--font-type); letter-spacing: 0.22em; text-transform: uppercase; color: var(--color-ink-600); }

.burger {
  position: fixed;
  top: max(1rem, env(safe-area-inset-top));
  left: 1rem;
  z-index: 50;
  width: 3rem;
  height: 3rem;
  background: var(--color-paper-100);
  background-image: var(--paper-grain-soft);
  border: 1px solid rgb(82 61 44 / 0.55);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgb(8 10 18 / 0.45), inset 0 0 0 3px var(--color-paper-100), inset 0 0 0 4px rgb(82 61 44 / 0.3);
}
.burger span {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1.15rem;
  height: 2px;
  margin: -1px 0 0 -0.575rem;
  background: var(--color-ink-800);
  border-radius: 1px;
}
.burger span:nth-child(1) { transform: translateY(-6px); }
.burger span:nth-child(3) { transform: translateY(6px); }
.burger.is-open span:nth-child(1) { transform: rotate(45deg); }
.burger.is-open span:nth-child(2) { opacity: 0; }
.burger.is-open span:nth-child(3) { transform: rotate(-45deg); }

.chip {
  position: fixed;
  bottom: max(1.25rem, env(safe-area-inset-bottom));
  left: 50%;
  z-index: 30;
  display: flex;
  max-width: calc(100vw - 2rem);
  align-items: center;
  gap: 0.75rem;
  transform: translateX(-50%);
  padding: 0.4rem 0.6rem 0.4rem 1rem;
  background: var(--color-paper-100);
  border: 1px solid rgb(82 61 44 / 0.55);
  box-shadow: 0 6px 22px rgb(8 10 18 / 0.45);
  color: var(--color-ink-900);
}
</style>
