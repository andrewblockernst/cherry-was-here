# yafue

Una app web para mapear tu vida en dos vistas que comparten datos:

- **Globo** — la pantalla completa es el mundo: los países donde estuviste y tus moments como puntos sobre un globo 3D (MapLibre), con estética de atlas antiguo.
- **Timeline** — tu vida partida en eras (infancia, secundaria, etc.) con los moments de cada una, como estampillas con matasellos, dentro del menú lateral.

Un `moment` puede tener país (aparece en el globo) y pertenecer a una era (aparece en la timeline). Es multiusuario: cada persona arma su vida y decide qué moments son públicos. Desde el menú (hamburguesa arriba a la izquierda) se exploran las vidas públicas de otros.

## Stack

| Capa | Tecnología |
|------|------------|
| Framework | Nuxt 4 (Vue 3) + Nitro (rutas de servidor en `server/api`) |
| DB | Drizzle ORM + libSQL: archivo SQLite en local, Turso en producción |
| Auth | email + contraseña (bcryptjs), sesión por cookie sellada con `nuxt-auth-utils` |
| Estilos | Tailwind CSS v4: paleta papel/tinta/mar y escala `accent` como tokens en `app/assets/css/main.css`; tipografías Fraunces, Lora y Special Elite (Google Fonts) |
| Mapa | `maplibre-gl` con proyección globo, estilo OpenFreeMap (sin API key) recoloreado en `app/utils/atlasStyle.ts` y países de Natural Earth 110m |
| Tests | Vitest |

## Puesta en marcha

Requiere Node.js 22+ y npm.

```bash
npm i
cp .env.example .env     # completá NUXT_SESSION_PASSWORD (32+ caracteres)
npm run db:migrate       # crea las tablas en data/yafue.db
npm run db:seed          # carga la tabla countries
npm run dev              # http://localhost:3000
```

Creá una cuenta desde `/login`; tu perfil público queda en `/u/<slug>`.

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

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | `file:./data/yafue.db` en local; URL `libsql://…` de Turso en producción |
| `DATABASE_AUTH_TOKEN` | Token de Turso (vacío en local) |
| `NUXT_SESSION_PASSWORD` | Clave para sellar la cookie de sesión, mínimo 32 caracteres. Nunca la subas al repo |

## Interfaz

Hay un único globo a pantalla completa que persiste entre rutas; todo lo demás son capas encima:

- **Marca** "yafue" arriba a la derecha y **hamburguesa** arriba a la izquierda (`Esc` cierra el menú).
- **Menú lateral** con tres pestañas: *Explorar* (vidas públicas), *Tu vida* (tu timeline, crear y borrar moments, o entrar / crear cuenta) y *Opciones* (animaciones y créditos).
- Los moments se muestran como **estampillas** con matasellos en las listas y en los popups del globo. Pasar el mouse por uno resalta su país; hacer click vuela hasta él.
- En tu mapa (`/me`), hacer click en un país abre el formulario de nuevo moment con ese país.

### Movimiento

Intro de cámara, giro lento del globo en reposo (se detiene al interactuar), puntos que laten, menú con entrada escalonada y transiciones entre paneles. Se desactiva todo con la opción *Animaciones* del menú (se guarda en `localStorage`) y automáticamente si el sistema pide `prefers-reduced-motion`.

## Rutas

| Ruta | Qué hace |
|------|---------|
| `/` | El globo del mundo; el menú abre en *Explorar* con los usuarios de perfil público |
| `/login` | Globo con el menú abierto en el formulario para entrar o crear cuenta |
| `/me` | Tu vida (requiere sesión): tus países y moments en el globo, timeline y gestión en el menú |
| `/u/[slug]` | Perfil público: el globo vuela a sus países y el menú muestra su timeline |

## Deploy

Necesita un servidor Node (`node .output/server/index.mjs`) con las tres variables de entorno de arriba. En producción usá Turso (`DATABASE_URL` + `DATABASE_AUTH_TOKEN`); si en cambio usás un archivo SQLite, necesita un disco persistente. Corré `db:migrate` y `db:seed` contra la DB de destino antes del primer arranque.

## Licencia

MIT.
