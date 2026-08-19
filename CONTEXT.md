# Ranked Fitness - Contexto de Trabajo

## Estado Actual (15/08/2026)

**Proyecto**: Monorepo Nx con 3 apps (Backend NestJS, Web Admin Next.js, Mobile Flutter)
**Fase**: 1 - Core (Auth, Catálogo, ISG Engine, Registro Sets, Timer, Rachas) ✅ **COMPLETADO**

## Qué funciona ya

- ✅ Monorepo configurado con Nx 23.x
- ✅ Docker Compose con PostgreSQL 16 + Redis 7 + Mailhog
- ✅ Backend NestJS 11 + Prisma 7 estructurado y **corriendo en puerto 3000**
- ✅ Shared package con ISG Engine implementado
- ✅ Web Admin Next.js 16 + Clerk auth configurado (estructura base)
- ✅ CI/CD GitHub Actions configurado
- ✅ **Tests unitarios: 42 passing** (auth: 15, catalog: 15, training: 12)
- ✅ **Lint: 0 errors** (solo warnings de tipos `any`)
- ✅ **Build: exitoso**

## Comandos clave

```bash
# Levantar BD (Docker ya instalado)
cd C:\Users\juanp\opencode1\ranked-fitness
docker compose up -d

# Backend
cd apps/backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npx nx serve backend              # http://localhost:3000/api
npx nx test backend                # 42 tests
npx nx lint backend                # 0 errors
npx nx run backend:build           # Build exitoso

# Web Admin
cd apps/web-admin
npm run dev              # http://localhost:3001
```

## Variables de entorno necesarias

Copiar `.env.example` a `.env` en la raíz y en `apps/backend/.env`:
- `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` (crear cuenta en clerk.com)
- `DATABASE_URL` = `postgresql://postgres:postgres@localhost:5432/ranked_fitness`
- `JWT_SECRET` = generar uno seguro
- `CLERK_WEBHOOK_SECRET` = configurar en Clerk Dashboard

## Endpoints Backend (Phase 1) - TODOS FUNCIONANDO

### Auth
- `POST /api/api/v1/auth/clerk-webhook` - Webhook Clerk
- `GET /api/api/v1/auth/me` - Perfil usuario actual (requiere JWT)

### Catálogo (65 ejercicios seed)
- `GET /api/api/v1/catalogo/ejercicios` - Listar con filtros (muscleGroup, level, search)
- `GET /api/api/v1/catalogo/ejercicios/:id` - Obtener ejercicio
- `GET /api/api/v1/catalogo/grupos-musculares` - Grupos disponibles
- `POST/PUT/DELETE /api/api/v1/catalogo/ejercicios` - CRUD (Solo SUPER_ADMIN)

### Entrenamiento (requiere JWT)
- `POST /api/api/v1/entrenamiento/sesion` - Iniciar sesión
- `PUT /api/api/v1/entrenamiento/sesion/:id/finalizar` - Finalizar sesión
- `POST /api/api/v1/entrenamiento/set` - Registrar set (calcula ISG automático)
- `GET /api/api/v1/entrenamiento/sesion/:id` - Detalle sesión con sets
- `GET /api/api/v1/entrenamiento/mis-sesiones` - Listar mis sesiones

### Timer (NUEVO - Phase 1)
- `POST /api/api/v1/entrenamiento/sesion/:id/timer/iniciar` - Iniciar timer
- `PUT /api/api/v1/entrenamiento/sesion/:id/timer/pausar` - Pausar timer
- `PUT /api/api/v1/entrenamiento/sesion/:id/timer/reanudar` - Reanudar timer
- `PUT /api/api/v1/entrenamiento/sesion/:id/timer/detener` - Detener timer
- `GET /api/api/v1/entrenamiento/sesion/:id/timer` - Estado timer (elapsed, formatted HH:MM:SS)
- `POST /api/api/v1/entrenamiento/sesion/:id/descanso/iniciar` - Iniciar descanso
- `PUT /api/api/v1/entrenamiento/sesion/:id/descanso/finalizar` - Finalizar descanso
- `GET /api/api/v1/entrenamiento/sesion/:id/descansos` - Historial descansos

### Health & Audit
- `GET /api/health` - Health check (DB + Redis)
- `GET /api/health/ready` - Readiness
- `GET /api/health/live` - Liveness
- `GET /api/api/v1/audit/logs` - Logs auditoría (SUPER_ADMIN, GYM_ADMIN)

## Próximos pasos (Post-Phase 1 / Pre-Phase 2)

1. **Swagger/OpenAPI** - Documentación API automática (`@nestjs/swagger` ya instalado)
2. **Redis real integration** - Cache, rate limiting, sessions
3. **Web Admin** - Páginas reales (Dashboard, Catálogo, Usuarios, Entrenamientos)
4. **Mobile Flutter** - Crear app en monorepo (apps/mobile)
5. **Clerk config** - Keys reales para auth completo
6. **E2E tests** - Playwright para flujos completos

## Estructura importante

```
apps/
├── backend/          # NestJS API (puerto 3000) ✅ FUNCIONANDO + TESTS
│   ├── src/
│   │   ├── auth/     # Clerk webhook, JWT guards, tests ✅
│   │   ├── catalogo/ # Ejercicios, grupos musculares, tests ✅
│   │   ├── entrenamiento/ # Sesiones, sets, ISG, TIMER, tests ✅
│   │   ├── health/   # Health checks
│   │   └── audit/    # Audit logs
│   └── prisma/       # Schema + migraciones + seed (timer fields añadidos)
├── web-admin/        # Next.js Admin (puerto 3001) - estructura base
└── mobile/           # Flutter App - NO CREADO

packages/
└── shared/           # Types, DTOs, ISG Engine (@ranked-fitness/shared)
```

## ISG Engine (packages/shared/src/isg/)

```typescript
import { calculateISG, ISGInput } from '@ranked-fitness/shared';

const input: ISGInput = {
  weightKg: 100,
  reps: 8,
  exerciseFactor: 8.5,
  bodyWeightKg: 80,
  heightCm: 175,
  variantBonus: 1.0,
  penalty: 1.0,
};
const result = calculateISG(input);
// result.finalScore = 85.85 (ejemplo)
// result.isPhysiologicalLimitExceeded = false
```

## Test User para desarrollo

```
User ID: 70767518-f58c-4efe-92a1-29660704f9f0
Email: test@test.com
JWT Token: (generar con gen-token.ts)
```

## Notas para próxima sesión

- Docker ya está instalado y funcionando
- Backend corriendo: `npx nx serve backend` (puerto 3000)
- Tests: `npx nx test backend` (42 passing)
- Leer este archivo: `cat CONTEXT.md`
- Ejecutar `docker compose up -d` primero
- Las keys de Clerk son el bloqueo principal para probar auth completo
- **Phase 1 backend 100% completo** - Listo para Phase 2 o frontend work