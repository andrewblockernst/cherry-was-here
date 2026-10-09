export default defineEventHandler(async event => serializeUser(await requireUser(event)))
