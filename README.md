# Cherry Was Here 🍒

Una app web para mapear tu vida en dos vistas que comparten datos:

- **Globo** — los países donde estuviste y tus moments como puntos sobre un globo 3D (MapLibre).
- **Timeline** — tu vida partida en eras (infancia, secundaria, etc.) con los moments de cada una.

Un `moment` puede tener país (aparece en el globo) y pertenecer a una era (aparece en la timeline). Es multiusuario: cada persona arma su vida y decide qué moments son públicos. La home (`/`) explora las vidas públicas de otros.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Nuxt 4 (Vue 3) + Nitro (rutas de servidor en `server/api`) |
| DB | Drizzle ORM + libSQL: archivo SQLite en local, Turso en producción |
| Auth | email + contraseña (bcryptjs), sesión por cookie sellada con `nuxt-auth-utils` |
| Estilos | Tailwind CSS v4 (escala `cherry` en `app/assets/css/main.css`) |
| Mapa | `maplibre-gl` con proyección globo, estilo OpenFreeMap (sin API key) y países de Natural Earth 110m |
| Tests | Vitest |

## Puesta en marcha

Requiere Node.js 22+ y npm.

```bash
npm i
cp .env.example .env     # completá NUXT_SESSION_PASSWORD (32+ caracteres)
npm run db:migrate       # crea las tablas en data/cherry.db
npm run db:seed          # carga la tabla countries
npm run dev              # http://localhost:3000
```

Opcional, para traer los datos de la app Phoenix anterior (solo funciona sobre una DB vacía y abre el origen en modo lectura):

```bash
npm run db:import                          # usa backend/andrews_timeline_dev.db
npm run db:import -- ruta/a/otra.db        # o una ruta explícita
```

Usuario de desarrollo (viene en esa DB importada): `andrew@cherry.local` / `cherry-was-here`, perfil público en `/u/andrew`.

## Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`.output/`) |
| `npm run preview` | Sirve el build localmente |
| `npm test` | Tests (Vitest) |
| `npx nuxi typecheck` | Chequeo de tipos |
| `npm run db:generate` | Genera una migración a partir de `server/db/schema.ts` |
| `npm run db:migrate` | Aplica las migraciones |
| `npm run db:seed` | Carga los países (idempotente) |
| `npm run db:import` | Importa la DB de Phoenix (una sola vez) |

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | `file:./data/cherry.db` en local; URL `libsql://…` de Turso en producción |
| `DATABASE_AUTH_TOKEN` | Token de Turso (vacío en local) |
| `NUXT_SESSION_PASSWORD` | Clave para sellar la cookie de sesión, mínimo 32 caracteres. Nunca la subas al repo |

## Rutas

| Ruta | Qué hace |
|------|---------|
| `/` | Explorar: grilla de usuarios con perfil público |
| `/login` | Entrar o crear cuenta |
| `/me` | Tu vida (requiere sesión): globo, timeline, lista de moments, crear y borrar |
| `/u/[slug]` | Perfil público: globo y timeline con sus moments públicos |

Pasar el mouse sobre un moment resalta su país en el globo, y hacer click en un punto o país del globo resalta los moments en la timeline.

## Deploy

Necesita un servidor Node (`node .output/server/index.mjs`) con las tres variables de entorno de arriba. En producción usá Turso (`DATABASE_URL` + `DATABASE_AUTH_TOKEN`); si en cambio usás un archivo SQLite, necesita un disco persistente. Corré `db:migrate` y `db:seed` contra la DB de destino antes del primer arranque.

## Código legado

`backend/` (Phoenix) y `frontend/` (React + Vite) son la app anterior. Quedan solo como referencia y como fuente del import de datos; están pendientes de eliminación.

## Licencia

MIT.
