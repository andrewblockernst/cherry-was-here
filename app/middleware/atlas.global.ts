/** Picks the drawer panel for a route before anything renders (so SSR and the client agree). */
export default defineNuxtRouteMiddleware((to) => {
  const { enter } = useAtlas()
  if (to.path === '/') enter('explore', false)
  else if (to.path.startsWith('/u/')) enter('explore')
  else enter('me')
})
