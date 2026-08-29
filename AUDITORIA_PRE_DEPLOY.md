# 🛡️ Auditoría Pre-Deploy — Ranked Fitness

> Fecha: 2026-08-20 · Alcance: monorepo completo (backend NestJS + Prisma/PostgreSQL, frontend Next.js, paquete compartido)

---

## 🔍 Qué se analizó

| Área | Detalle |
|---|---|
| **Entornos / secretos** | `.env.example` raíz, `apps/backend/.env` vs `.env.example`, `apps/web-admin/.env` vs `.env.example` |
| **Configuración de producción** | `main.ts`, `app.module.ts`, `prisma.config.ts`, `prisma.service.ts`, `next.config.js`, `middleware.ts`, `docker-compose.yml` |
| **Builds / tests** | `nx build backend`, `nx build web-admin`, `nx test backend`, `nx test shared`, `prisma validate`, `prisma migrate status` |
| **CORS / conectividad** | CORS backend↔frontend, conexión PostgreSQL, Redis, smoke test real del servidor |
| **RBAC maestro OWNER** | Flujo `X-Active-View` → `computeEffectiveRole` → `JwtStrategy` → `ActiveViewGuard`; mini-isla 👑 |
| **Sincronización de vistas OWNER** | Posts (Social), solicitudes de coaching, asignación de rutinas, registro de series (ISG incl. `TO_FAILURE`) reflejándose al instante en OWNER-PLAYER / OWNER-COACH / OWNER-GYM |
| **Relaciones de datos** | Esquema Prisma, migraciones aplicadas, derivación de perfiles (isgScore, división, linkedPlayers, linkedStudents) |

---

## ⚠️ Qué se detectó

### Críticos (corregidos)
1. **Sin CORS en el backend** — `main.ts` no tenía `enableCors()`. El frontend (Next.js en `:3001`) llama a `http://localhost:3000/api` por axios cross-origin → peticiones bloqueadas por el navegador en despliegues reales.
2. **Falta de `.env.example`** en `apps/backend` y `apps/web-admin` — sin plantilla de referencia, era imposible reproducir el entorno.
3. **Secretos backend duplicados en `apps/web-admin/.env`** — `DATABASE_URL`, `REDIS_URL`, `CLERK_WEBHOOK_SECRET`, `JWT_SECRET`, `PORT`, `NODE_ENV` vivían en el frontend (los clientes pueden leerlos vía bundle/middleware si se exponen). El frontend solo necesita `NEXT_PUBLIC_*` + `CLERK_SECRET_KEY` (middleware).
4. **`.env.example` raíz incompleto** — faltaban `SUPER_ADMIN_EMAIL` (clave del rol OWNER) y las URL públicas de Clerk (`NEXT_PUBLIC_CLERK_SIGN_IN_URL` etc.).
5. **`middleware.ts` protegía rutas públicas de Clerk** — `/sign-in`, `/sign-up` y `/onboarding` quedaban tras auth → riesgo de bucle de redirección Clerk.
6. **Sincronización OWNER de `isgScore` rota en frontend** — `en-curso.tsx` y `ranking/page.tsx` usaban valores estáticos (`2450`/`2710`); los registros de series no se reflejaban en las vistas del Owner.

### Menores
7. **`health.service.ts`**: el check de Redis siempre devuelve `true` (stub cosmético).
8. **`JWT_SECRET`** con fallback `'your-secret-key'` — solo para desarrollo.
9. **Logs obsoletos** (`web-admin-dev.err.log` mostraba `ReferenceError: isRespected is not defined`) — ya corregido en el código actual; log viejo.
10. **Prefijo doble `/api/api/v1/...`** — heredado y consistente (el frontend concatena `/api` base + `/api/v1/...`); feo pero funciona. No se toca para no romper contratos.
11. **Nx Cloud sin conectar** — warning `401` al ejecutar tareas (cosmético, no bloquea).

---

## 🛠️ Qué se solucionó

1. **`apps/backend/src/main.ts`** → `app.enableCors({ origin: true, credentials: true })`. Verificado con smoke test: `Access-Control-Allow-Origin: http://localhost:3001` presente. ✅
2. **`apps/backend/.env.example`** creado (plantilla completa + `SUPER_ADMIN_EMAIL`). ✅
3. **`apps/web-admin/.env.example`** creado (solo `NEXT_PUBLIC_*` + `CLERK_SECRET_KEY`). ✅
4. **`apps/web-admin/.env`** saneado → solo variables del frontend; secretos backend eliminados. ✅
5. **`.env.example` raíz** → unificado (backend + web-admin + mobile). ✅
6. **`apps/web-admin/middleware.ts`** → rutas públicas agregadas: `/sign-in(.*)`, `/sign-up(.*)`, `/onboarding(.*)`. ✅
7. **`src/lib/roles.tsx`** → store compartido de ecosistema (fuente única de verdad): roster de jugadores, solicitudes de unión, solicitudes de coaching, rutinas asignadas, estudiantes del coach; acciones `acceptCoaching`, `rejectCoaching`, `approveJoin`, `rejectJoin`, `assignRoutine`, `recordSetIsg`; perfiles derivados (isgScore/división, `linkedPlayers`, `linkedStudents`). Persistido en `localStorage`. ✅
8. **`coach-players-view.tsx` / `gym-players-view.tsx`** → consumen el store (estudiantes = `linkedStudents`, roster vivo, asignación de rutinas). ✅
9. **`comunidad/page.tsx`** → destructure el store (`players`, `coachingRequests`, `acceptCoaching`, `rejectCoaching`, `routineAssignments`, `assignRoutine`); elimina estado local duplicado (`coachRequests`, `acceptedCoach`, `routineAssignments`) y el efecto de fetch; badges y Solicitudes ahora leen del store (respuesta instantánea en vistas OWNER). ✅
10. **`en-curso.tsx`** → `recordSetIsg(playerId, isgScore)` al registrar cada serie (solo si antes no había score, evita doble conteo); `playerId` deriva del perfil activo (player→`profile.id`, resto→`player-1`). ✅
11. **`ranking/page.tsx`** → el ranking competitivo y el hero card leen el `isgScore` vivo del roster (`player-1`) en vez de `2450`/`2710` hardcodeados; los atletas del leaderboard se mapean por nombre al roster. ✅
12. **`gym-players-view.tsx`** → restaurado `useEffect` de carga de `ranked_fitness_gym_routines` (biblioteca local del gimnasio). ✅
13. **`apps/backend/.env`** → `SUPER_ADMIN_EMAIL=owner@rankedfitness.com` añadido. ✅

---

## ❌ Qué no se pudo solucionar

- **Check de Redis en `/api/health`** siempre `ok` (stub). Para producción real: implementar `PING` real con `ioredis` en `HealthService`.
- **Prefijo `/api/api/v1`** se mantiene por compatibilidad (el cambio es ruptura). Documentado para un refactor futuro.
- **Nx Cloud no conectado** (warning 401). Opcional: `npx nx connect` para caché remota.
- **`JWT_SECRET` fallback de desarrollo**: asegurarse de definir uno real en producción (el `.env.example` ya lo marca).

---

## 📌 Contexto Técnico General

- **Monorepo Nx** con `apps/backend` (NestJS + Prisma 7 via `prisma.config.ts` + adapter `PrismaPg`, PostgreSQL `ranked_fitness` en `:5432`, Redis en `:6379` vía docker-compose) y `apps/web-admin` (Next.js 16, React 19, Clerk `^7.7.6`).
- **Migraciones**: 7 migraciones aplicadas; `Database schema is up to date!` ✅ (Postgres accesible).
- **RBAC**: `X-Active-View` permite `PLAYER|COACH|GYM|ADMIN`; `computeEffectiveRole` valida contra el usuario autenticado (solo OWNER, verificado por `SUPER_ADMIN_EMAIL`, puede alternar vistas); `ActiveViewGuard` global sanitiza el header. No-owners no pueden suplantar roles. ✅
- **Sincronización OWNER**: con el store compartido en `roles.tsx`, cualquier cambio (serie registrada con `TO_FAILURE`→ISG, solicitud aceptada/rechazada, rutina asignada) se propaga al instante a las vistas OWNER-PLAYER/COACH/GYM — no hay caché por componente ni Data Scoping contradictorio.
- **Verificación final**:
  - `nx build backend` ✅
  - `nx build web-admin` ✅ (incluye prerender estático completo; se resolvió el fallo previo de `/_global-error`)
  - `nx test backend` → 5 suites / 48 tests ✅
  - `nx test shared` → 4 suites / 42 tests ✅
  - `prisma validate` ✅
  - Smoke test: `GET /api/health` → `{"status":"ok","checks":{"database":"up","redis":"up"}}` con `Access-Control-Allow-Origin: http://localhost:3001` ✅