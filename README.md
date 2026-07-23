# FlagStats

Plataforma web para gestionar ligas de flag football: calendario, resultados, tabla de posiciones, playoffs, estadísticas de jugadores y administración completa de temporada — todo multi-liga bajo un solo dominio (`/:leagueSlug/...`).

## Stack

- **Frontend**: React 19 + TypeScript + Vite, React Router v7.
- **Backend**: [Supabase](https://supabase.com) — Postgres (base de datos), Auth, Storage (imágenes) y Edge Functions (Deno).
- **IA**: Google Gemini (`gemini-3.5-flash-lite`), usada solo para generar el borrador de crónica de una jornada (función admin, bajo volumen).
- **Hosting**: Vercel (frontend), Hostinger (dominio), Supabase (todo el backend) — todo en plan gratuito.

## Requisitos

- Node.js 20+
- Una cuenta/proyecto de [Supabase](https://supabase.com)

## Puesta en marcha local

```bash
npm install
cp .env.example .env   # y llena las variables (ver abajo)
npm run dev
```

### Variables de entorno

| Variable | Dónde conseguirla |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |

Estas dos son las únicas que usa el frontend. Las Edge Functions (ver abajo) usan sus propios secrets, configurados directo en Supabase, no en este `.env`.

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo (Vite) |
| `npm run build` | Type-check (`tsc -b`) + build de producción |
| `npm run lint` | ESLint |
| `npm run preview` | Sirve el build de producción localmente |

## Estructura del proyecto

```
src/
  pages/            Páginas públicas (Home, Calendar, Results, Standings, Playoffs,
                     PlayerStats, Teams, TeamProfile, PlayerProfile, Reglamento, MatchDetail)
  pages/admin/       Panel de administración (ver "Roles y administración")
  components/        Componentes de UI, organizados por dominio (match/, team/, player/,
                     calendar/, Admin/, common/, auth/)
  context/           React Context: Auth, League, Season, Category
                     (resuelven de qué liga/temporada/categoría se está hablando
                     según la URL, y los comparten hacia abajo en el árbol)
  guards/            ProtectedRoute — controla acceso a rutas /admin/* según el rol
  hooks/             Hooks compartidos (ej. useLeagueMembership)
  services/          Una función por operación contra Supabase (un archivo por tabla/entidad)
  libs/              Cliente de Supabase (supabase.js) y helper runQuery (supabaseQuery.js)
  utils/             Utilidades (compresión de imágenes, cache de queries, etc.)
supabase/
  functions/         Edge Functions (Deno) — ver abajo
.github/workflows/   Automatizaciones (backup semanal de la base de datos)
```

No hay carpeta de migraciones SQL: el esquema de la base de datos se administra directo en el dashboard de Supabase.

## Roles y administración

Cada usuario tiene un rol por liga (tabla `League_User`), controlado por `ProtectedRoute`:

- **Admin / SuperAdmin**: acceso completo a `/admin` — gestor de temporada, crear/editar jornadas, equipos, sedes, usuarios, configuración.
- **Referi**: acceso a editar los resultados/estadísticas de una jornada ya creada.
- **Fotografo**: acceso solo a la gestión de enlaces de fotos por jornada.
- **Coach**: acceso solo a gestionar el roster de su propio equipo.

## Edge Functions (Supabase)

Ubicadas en `supabase/functions/`, se despliegan con la Supabase CLI (requiere estar logueado, `supabase functions deploy <nombre>`):

- **`create-user`** / **`delete-user`**: altas/bajas de usuarios (requieren `service_role`, no se puede hacer desde el cliente).
- **`generate-matchday-summary`**: genera con Gemini un borrador de crónica de una jornada terminada. Requiere el secret `GEMINI_API_KEY` (`supabase secrets set GEMINI_API_KEY=...`).

## Rendimiento y costos (Supabase free tier)

- Las imágenes se comprimen en el navegador antes de subirse (`src/utils/compressImage.js`, máx. 400-500px) y se suben con `cacheControl` de 1 año — cada archivo tiene nombre único, así que nunca hay riesgo de servir una versión vieja.
- Los `<img>` de listas/grids usan `loading="lazy"`.
- Las lecturas a Supabase pasan por un cache en memoria de 1 minuto (`src/utils/queryCache.js`), invalidado explícitamente al escribir.
- Las fotos de partido se enlazan desde Google Drive, no se suben a Supabase Storage.

## Backups

`.github/workflows/backup.yml` corre cada domingo (y manualmente desde la pestaña Actions → "Run workflow") un `pg_dump` del esquema `public` de la base de datos y lo publica como GitHub Release (`backup-YYYY-MM-DD`) en este mismo repo. Requiere el secret de repo `SUPABASE_DB_URL` (connection string **directa/session**, no la de connection pooling — Settings → Database → Connection string en Supabase).

No incluye el esquema `auth` (contraseñas/sesiones) ni el bucket de imágenes de Storage.
