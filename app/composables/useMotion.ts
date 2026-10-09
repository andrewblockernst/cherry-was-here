const KEY = 'cherry:animations'

/**
 * Motion preference: the in-app toggle (persisted) AND the OS "reduce motion" setting.
 * `<html data-motion="on|off">` mirrors the result so CSS can switch every animation off at once.
 */
export function useMotion() {
  const animations = useState('motion-animations', () => true)
  const reduced = useState('motion-reduced', () => false)
  const enabled = computed(() => animations.value && !reduced.value)

  /** Client-only, call once on mount. */
  function init() {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved !== null) animations.value = saved === '1'
    } catch { /* storage blocked: keep the default */ }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduced.value = query.matches
    query.addEventListener('change', e => (reduced.value = e.matches))
    watchEffect(() => { document.documentElement.dataset.motion = enabled.value ? 'on' : 'off' })
  }

  function setAnimations(on: boolean) {
    animations.value = on
    try { localStorage.setItem(KEY, on ? '1' : '0') } catch { /* not persisted */ }
  }

  return { animations, reduced, enabled, init, setAnimations }
}
