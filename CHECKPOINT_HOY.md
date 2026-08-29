# CHECKPOINT_HOY — Ranked Fitness

> Punto de control al cierre de la sesión de desarrollo. Cualquier instancia futura o sesión nueva debe leer este archivo primero para retomar el hilo sin pérdida de contexto.

- **Fecha:** 2026-08-20
- **Repo:** `C:\Users\juanp\opencode1\ranked-fitness` (monorepo Nx — `apps/backend` NestJS, `apps/web-admin` Next.js, `packages/shared` motor ISG)
- **Rama:** `main`
- **Estado general:** Sprint de UX de entrenamiento + seed de catálogo + módulo de ejercicios personalizados **completados y verificados**. Compilación de TypeScript limpia.

---

## 1. Cómo retomar (verificación rápida)

Todos los comandos se ejecutan desde la raíz del repo salvo que se indique lo contrario.

```bash
# Builds (typecheck). web-admin solo falla en prerender pre-existente (ver §5).
npx nx build shared
npx nx build backend
npx nx build web-admin
```

Prisma (la config vive en `apps/backend/prisma.config.ts`; `DATABASE_URL` está en `apps/backend/.env`). **Ejecutar con working dir `apps/backend`**:

```bash
# desde apps/backend
npx prisma generate      # cliente v7.9.1 -> node_modules/@prisma/client
npx prisma db seed       # upsert de 323 ejercicios (idempotente por nombre único)
npx prisma migrate dev   # si hubiera cambios de schema
```

- BD local: PostgreSQL `ranked_fitness` en `localhost:5432` (accesible).
- Migración aplicada: `20260819120000_add_custom_exercises` (agrega `description`, `isCustom`, `defaultSets/defaultReps/defaultWeight/defaultSec`, `createdById`, y hace `M/D/C/I` nullable).
- Seed aplicado: **323 ejercicios** (Pecho 46 · Espalda 50 · Hombros 39 · Brazos 39 · Piernas 58 · Core 46 · Cardio 33 · Full body/Otros 18).

---

## 2. Resumen técnico de lo implementado al 100%

### 2.1 Sistema de diseño Dark Mode estricto (aplicado en toda la app)
- Fondo general: `#000000` · Contenedores/tarjetas: `#0D0D0D` · Acento primario: `#EF4444` (rojo) · Acento secundario: `#FBBF24` (dorado) · Bordes: `white/5-10` · Skeleton/animaciones definidos en `apps/web-admin/src/app/global.css`.
- Isla flotante inferior (dock) de navegación en `apps/web-admin/src/app/dashboard/layout.tsx`, con navegación por rol.
- Los contenedores de scroll de las pestañas usan **`pb-32`** para que la isla flotante no tape los botones principales.

### 2.2 Catálogo de ejercicios + seed (300+)
- `apps/backend/prisma/seed.ts` reescrito: **323 ejercicios** con estructura `{ name, muscleGroup, level, metricType, M, D, C, I, description }`.
- Cada ejercicio tiene **descripción "Cómo hacerlo"** (3 pasos técnicos), `metricType` coherente (`REPS_WEIGHT` / `REPS_ONLY` / `TIME_ONLY`) y factor ISG derivado de `calculateExerciseFactor(M,D,C,I)` (promedio, escala 1-10).
- El seed corre con `upsert` por `name` (nombres únicos), idempotente.
- `apps/web-admin/src/app/catalogo/page.tsx`: catálogo visual (buscar, filtrar por grupo muscular, badge "Custom", modal de detalles).

### 2.3 Módulo de ejercicios personalizados (entrenadores)
- **Backend** (`apps/backend/src/modules/catalog/`):
  - `custom-exercise.controller.ts` (nuevo): `GET/POST /api/v1/exercises`, protegidos con `JwtAuthGuard` + `RolesGuard` y `@Roles('TRAINER','GYM_ADMIN','SUPER_ADMIN')`, validación Zod (`ZodValidationPipe`) y `@CurrentUser`.
  - `catalog.service.ts`: `createCustom(userId, dto)` y `findCustomByUser(userId)`; fix de null-coalescing en `update`.
  - `catalog.module.ts`: registro del controlador.
- **Shared** (`packages/shared/src/dto/index.ts`, `types/index.ts`): `createCustomExerciseSchema`, `CreateCustomExerciseDto`, y tipo `Exercise` extendido (campos nuevos nullable).
- **Frontend** (`apps/web-admin`):
  - `lib/api.ts` + `lib/hooks.ts`: `Exercise` extendida, `CreateCustomExerciseInput`, `useCustomExercises`, `useCreateCustomExercise`.
  - `app/dashboard/entrenador/ejercicios/page.tsx` (nuevo): formulario de alta (nombre, descripción, modalidad, series/reps/carga/tiempo por defecto, factor ISG ajustable) + listado de ejercicios custom.
  - Item "Ejercicios" en el dock del rol `coach`.

### 2.4 Motor ISG / métricas flexibles
- `packages/shared/src/isg/`: `isg-formula.ts` (`calculateISG`, `calculateExerciseFactor`), `isg-constants.ts`, `anti-cheat.ts` + tests.
- Soporta las **3 métricas** (carga×reps, solo reps, solo tiempo) y `setType` (`NORMAL`/`FAILURE`/`WARMUP`).
- Estimación local en cliente como respaldo: `estimateSetISG` en `apps/web-admin/src/lib/training.ts`.
- **Pendiente de producto**: planificación de métricas flexibles (pesos/fórmulas configurables por usuario). La base técnica (multi-metric) ya está; falta la capa de configuración (ver §4).

### 2.5 Flujo de entrenamiento (pestaña "En Curso") — UX refinada
- `apps/web-admin/src/lib/training.ts` (nuevo): tipos `ActiveSession`/`SessionExercise`/`SessionSet`, persistencia `localStorage` (`ranked_fitness_active_session`, `ranked_fitness_history`, `ranked_fitness_custom_routines`), estimación ISG, agrupación de historial.
- `apps/web-admin/src/components/training/` (nuevo):
  - `en-curso.tsx`: hub de sesión (libre / plantilla / activa), logger por set con inputs adaptativos por métrica, toggle "Al Fallo", registro local+backend (`useStartSession`/`useCreateSet`/`useEndSession`), botón "Comenzar Ejercicio".
  - `routine-preview.tsx`: previsualización/ajuste previo a iniciar. **Tiempos configurados a nivel del ejercicio entero**: "Trabajo (s)" (solo TIME_ONLY) y "Descanso (s)", precargados desde `defaultSec`/`defaultSets` de la BD y editables. Series editables con stepper.
  - `exercise-info.tsx`: icono "i" (dorado) que abre modal con la descripción del ejercicio; integrado en catálogo, picker, logger, preview y resumen de sesión completada.
  - `mis-rutinas.tsx`, `historial.tsx`: listado/creación de plantillas y bitácora mensual.
- **Delegación exclusiva del tiempo al Temporizador Global** (sin relojes embebidos en el listado de ejercicios):
  - En `TIME_ONLY`, "Comenzar Ejercicio" navega a `/dashboard/temporizador?modo=ejercicio&exKey=…&nombre=…&segundos=…` con los segundos exactos del ejercicio.
  - `app/dashboard/temporizador/page.tsx`: modo ejercicio (nombre + cuenta regresiva preseteada, ajustable ±10s) y confirmación al terminar: *Marcar serie al fallo*, *Registrar serie* (vuelve a `/dashboard/entrenamiento?registrarSerie=…&segundos=…&fallo=0|1`), *Reintentar*, *Volver*.
  - `app/dashboard/entrenamiento/page.tsx`: consume `registrarSerie` vía `pendingRegister` y registra la serie con `saveSet`.
  - `en-curso.tsx` quedó **libre de cualquier reloj/cronómetro/cuenta regresiva** (se eliminaron el contador de sesión del encabezado, el chip de descanso "Descanso Xs" y los estados locales `now`/`restStartAt`).
- Creador de plantillas (`app/dashboard/entrenamiento/crear/page.tsx`): cada ejercicio tiene "Tiempo de trabajo" (`workSeconds`, default 45s) y "Descanso entre series" (`restSeconds`), persistidos en la plantilla; `sessionFromTemplate` los precarga en `defaultSec`.

### 2.6 Vistas de gimnasios / jugadores / social (UI en pie)
- Presentes y navegables desde el dock por rol (`apps/web-admin/src/app/dashboard/layout.tsx`):
  - **Jugadores/Gimnasio:** `gimnasio/jugadores`, `gimnasio/rutinas`.
  - **Perfil de jugador:** `perfil/[id]`.
  - **Social:** `comunidad` (feed, amigos, perfil, mensajes), `ranking`, `usuarios`, `entrenador/validar`.
- Estado: **UI/mock/localStorage** funcionando; aún no conectadas al backend (ver §4).

---

## 3. Archivos clave tocados hoy

| Área | Archivo |
| --- | --- |
| Schema/migración | `apps/backend/prisma/schema.prisma`, `apps/backend/prisma/migrations/20260819120000_add_custom_exercises/migration.sql` |
| Seed | `apps/backend/prisma/seed.ts` (323) |
| Backend catálogo | `catalog.service.ts`, `custom-exercise.controller.ts`, `catalog.module.ts` |
| Shared | `packages/shared/src/dto/index.ts`, `packages/shared/src/types/index.ts` |
| Entrenamiento | `lib/training.ts`, `components/training/*` (5 componentes), `dashboard/entrenamiento/page.tsx`, `crear/page.tsx`, `temporizador/page.tsx` |
| Trainer | `dashboard/entrenador/ejercicios/page.tsx` |
| Dock | `dashboard/layout.tsx` |
| API/hooks | `lib/api.ts`, `lib/hooks.ts` |

---

## 4. Siguientes pasos pendientes (exactos)

1. **Conectar vistas gimnasio/jugadores/social al backend.** Hoy son UI mock/localStorage (`gimnasio/jugadores`, `gimnasio/rutinas`, `comunidad`, `ranking`, `usuarios`). Faltan endpoints NestJS de jugadores (perfil, progreso, ranking) y social (feed, amistades, mensajes).
2. **Planificación de métricas flexibles (PRD).** La base multi-metric (tiempo/fallo/carga) está en `packages/shared/src/isg`. Siguiente capa: UI de configuración de fórmulas/pesos por métrica y por usuario (factor ISG editable, ponderaciones), y su persistencia.
3. **Persistir tiempos de bloque (work/rest) en el backend.** `workSeconds`/`restSeconds` viven en plantillas locales; el backend persiste sets pero no el nivel bloque/plantilla. Definir migración para rutinas/plantillas del servidor.
4. **Unificar escala del factor ISG.** Los ejercicios custom del trainer usan factor 0.1–3; los del seed usan promedio de M/D/C/I (~3.75–10). Decidir y normalizar para que ambos sean consistentes.
5. **CRUD de catálogo para admin.** Los endpoints de catálogo general requieren `SUPER_ADMIN`; no hay UI para administrar (editar/desactivar) ejercicios del catálogo.
6. **QR de certificación** (`dashboard/entrenamiento/en-curso/page.tsx` tiene botón "Certificar sesión con QR" sin flujo funcional) y "Cambiar modo de sesión".

---

## 5. Problemas conocidos / blockers

- **`nx build web-admin` falla SIEMPRE en prerender** de `/_global-error` (a veces `/_not-found`) con `TypeError: Cannot read properties of null (reading 'useContext')` — **pre-existente** (Next 16.1.7 + Clerk). El typecheck de TypeScript pasa limpio; usar este build como verificación de tipos.
- `seed.ts` no pasa por el build (se ejecuta con `tsx` vía `prisma.config.ts`); su tipado se verifica en runtime (seed ya ejecutado OK).
- `nx cloud` no conectado (aviso 401 no bloqueante).
- En el shell: los comandos de Prisma deben correr con working dir `apps/backend` (desde la raíz fallan con "Could not find Prisma Schema").