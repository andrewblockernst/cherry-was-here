import type { CountryCounts, EraWithMoments, Moment, PublicUser } from '../../shared/types/app'

export type Panel = 'explore' | 'me' | 'options'
export type Owner = 'world' | 'user' | 'me'

export interface AtlasState {
  owner: Owner
  user: PublicUser | null
  /** Slug of a profile that was requested but does not exist. */
  missing: string | null
  countryCounts: CountryCounts
  moments: Moment[]
  eras: EraWithMoments[]
  drawerOpen: boolean
  panel: Panel
  hovered: string | null
  selected: string | null
  /** A fly-to request; `n` changes on every request so repeating the same target still fires. */
  focus: { iso2: string | null, momentId: number | null, n: number } | null
  /** Identity of the data on the globe (`owner:slug`); the camera re-frames when it changes. */
  viewKey: string
  modal: { open: boolean, code: string | null, name: string | null }
}

const initial = (): AtlasState => ({
  owner: 'world', user: null, missing: null, countryCounts: {}, moments: [], eras: [],
  drawerOpen: false, panel: 'explore', hovered: null, selected: null, focus: null, viewKey: 'world:',
  modal: { open: false, code: null, name: null },
})

const isMobile = () => import.meta.client && window.matchMedia('(max-width: 767px)').matches

/** Shared state between the single globe, the drawer and the (thin) route pages. */
export function useAtlas() {
  const state = useState<AtlasState>('atlas', initial)
  const highlighted = computed(() => state.value.hovered ?? state.value.selected)

  /** What the globe shows: set by the route pages. */
  function show(view: Pick<AtlasState, 'owner' | 'user' | 'countryCounts' | 'moments' | 'eras'> & { missing?: string | null }) {
    Object.assign(state.value, { missing: null }, view, { hovered: null, selected: null, viewKey: `${view.owner}:${view.user?.slug ?? ''}` })
  }

  /** Select a drawer panel; opens the drawer on first load or on desktop, never over the globe on mobile navigation. */
  function enter(panel: Panel, open = true) {
    state.value.panel = panel
    if (open && (import.meta.server || useNuxtApp().isHydrating || !isMobile())) state.value.drawerOpen = true
  }

  const setDrawer = (open: boolean) => { state.value.drawerOpen = open }
  const toggleDrawer = () => setDrawer(!state.value.drawerOpen)
  const hover = (code: string | null) => { state.value.hovered = code }

  function flyTo(iso2: string | null, momentId: number | null = null) {
    state.value.focus = { iso2, momentId, n: (state.value.focus?.n ?? 0) + 1 }
  }

  function pick(m: Moment) {
    state.value.selected = m.country_code
    flyTo(m.country_code, m.id)
    if (isMobile()) setDrawer(false)
  }

  function openModal(code: string | null = null, name: string | null = null) {
    state.value.modal = { open: true, code, name }
  }
  const closeModal = () => { state.value.modal.open = false }

  /** A click on the globe: on my own map a bare country opens the add-moment form. */
  function selectOnGlobe(p: { iso2: string, name: string, momentId?: number }) {
    state.value.selected = p.iso2
    if (state.value.owner === 'me' && p.momentId === undefined) openModal(p.iso2, p.name)
  }

  async function removeMoment(id: number) {
    if (!confirm('¿Eliminar este moment?')) return
    await $fetch(`/api/moments/${id}`, { method: 'DELETE' })
    await refreshNuxtData('me-moments')
  }

  return { state, highlighted, show, enter, setDrawer, toggleDrawer, hover, flyTo, pick, openModal, closeModal, selectOnGlobe, removeMoment }
}
