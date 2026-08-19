# Ranked Fitness - Monorepo

Aplicación móvil de fitness competitivo con gamificación, rankings y sistema de puntuación ISG.

## Stack Tecnológico

- **Monorepo**: Nx 23.x
- **Backend**: NestJS 11 + Prisma 7 + PostgreSQL 16 + Redis 7
- **Mobile**: Flutter 3.24 + Riverpod + go_router + Drift (SQLite offline)
- **Web Admin**: Next.js 16 (App Router) + Tailwind + shadcn/ui + Clerk
- **Auth**: Clerk (Google OAuth, MFA, Organizations)
- **CI/CD**: GitHub Actions
- **Deploy**: Railway (Backend) + Vercel (Web Admin) + Firebase Hosting (Mobile Web)

## Estructura del Monorepo

```
ranked-fitness/
├── apps/
│   ├── backend/          # NestJS API
│   ├── mobile/           # Flutter App
│   └── web-admin/        # Next.js Admin Dashboard
├── packages/
│   ├── shared/           # Types, DTOs, ISG Engine, Constants
│   ├── eslint-config/    # ESLint config compartida
│   └── tsconfig/         # TS configs base
├── docker-compose.yml    # PostgreSQL, Redis, Mailhog
└── .github/workflows/    # CI/CD pipelines
```

## Primeros Pasos

### Prerrequisitos

- Node.js 20+
- npm 10+
- Flutter 3.24+
- Docker Desktop
- Cuenta en Clerk (clerk.com)

### Instalación

```bash
# Clonar e instalar dependencias
git clone <repo>
cd ranked-fitness
npm ci

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus keys de Clerk

# Levantar base de datos
docker compose up -d

# Generar Prisma Client y migrar
cd apps/backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Desarrollo
cd ../..
npm run dev:backend    # Backend en http://localhost:3000
npm run dev:web        # Web Admin en http://localhost:3001
cd apps/mobile && flutter run  # Mobile
```

### Variables de Entorno Requeridas

Ver `.env.example` para la lista completa. Mínimo necesitas:
- `CLERK_PUBLISHABLE_KEY` y `CLERK_SECRET_KEY` de Clerk Dashboard
- `DATABASE_URL` para PostgreSQL
- `JWT_SECRET` (generar uno seguro para producción)

## Comandos Útiles

```bash
# Backend
cd apps/backend
npm run prisma:generate    # Generar cliente Prisma
npm run prisma:migrate     # Ejecutar migraciones
npm run prisma:push        # Push schema sin migraciones
npm run prisma:seed        # Poblar ejercicios base
npm run prisma:studio      # UI de Prisma
npm run test               # Tests unitarios
npm run build              # Build producción

# Web Admin
cd apps/web-admin
npm run dev                # Dev server
npm run build              # Build producción
npm run lint               # Linting

# Mobile
cd apps/mobile
flutter pub get            # Instalar deps
flutter run                # Ejecutar en dispositivo/emulador
flutter build web          # Build web
flutter build apk          # Build Android
flutter build ios          # Build iOS

# Monorepo
npx nx affected -t lint --parallel=3
npx nx affected -t test --parallel=3
npx nx affected -t build --parallel=3
```

## API Endpoints (Fase 1)

```
POST   /api/v1/auth/clerk-webhook    # Webhook Clerk
GET    /api/v1/auth/me               # Perfil usuario actual

GET    /api/v1/catalogo/ejercicios   # Listar ejercicios (filtros: muscleGroup, level, search)
GET    /api/v1/catalogo/ejercicios/:id
GET    /api/v1/catalogo/grupos-musculares
POST   /api/v1/catalogo/ejercicios   # Solo SUPER_ADMIN
PUT    /api/v1/catalogo/ejercicios/:id
DELETE /api/v1/catalogo/ejercicios/:id

POST   /api/v1/entrenamiento/sesion           # Iniciar sesión
PUT    /api/v1/entrenamiento/sesion/:id/finalizar
POST   /api/v1/entrenamiento/set              # Registrar set (calcula ISG)
GET    /api/v1/entrenamiento/sesion/:id
GET    /api/v1/entrenamiento/mis-sesiones

GET    /health                    # Health check
GET    /health/ready              # Readiness
GET    /health/live               # Liveness

GET    /api/v1/audit/logs         # Solo SUPER_ADMIN, GYM_ADMIN
```

## ISG Engine (Shared Package)

El motor de cálculo ISG está en `packages/shared/src/isg/`:

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
// result.finalScore = score calculado
// result.isPhysiologicalLimitExceeded = true/false
```

## Seed Data

El seed incluye 50+ ejercicios base con valores M,D,C,I predefinidos y FE pre-calculado:

- **Pecho**: 8 ejercicios
- **Espalda**: 8 ejercicios
- **Piernas**: 10 ejercicios
- **Hombros**: 6 ejercicios
- **Brazos**: 6 ejercicios
- **Core**: 5 ejercicios
- **Cardio**: 3 ejercicios

## Roles y Permisos

| Rol | Permisos |
|-----|----------|
| USER | Registrar entrenamientos, ver catálogo, ver perfil |
| TRAINER | TODO USER + crear rutinas, validar evidencias (Fase 2+) |
| GYM_ADMIN | TODO TRAINER + gestión gimnasio, auditoría logs |
| SUPER_ADMIN | TODO + CRUD catálogo ejercicios, gestión usuarios |

## Despliegue

### Backend → Railway
1. Conectar repo a Railway
2. Añadir plugin PostgreSQL + Redis
3. Configurar variables de entorno
4. Deploy automático en push a `develop` (staging) o tag `v*` (prod)

### Web Admin → Vercel
1. Importar proyecto en Vercel
2. Configurar `NEXT_PUBLIC_API_URL` y keys de Clerk
3. Deploy automático

### Mobile Web → Firebase Hosting
1. `flutter build web --release`
2. `firebase deploy --only hosting`

## Roadmap Fases

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Core: Auth, Catálogo, ISG Engine, Registro Sets, Timer, Rachas | 🚧 En desarrollo |
| 2 | Motor Avanzado: Límites fisiológicos, Evidencias, Score Confiabilidad | ⏳ Pendiente |
| 3 | Sistema Competitivo: Rankings, Ligas, PRs, Marcos especiales | ⏳ Pendiente |
| 4 | Gamificación Profunda: Logros, Misiones, Clanes, Live events | ⏳ Pendiente |
| 5 | IA y Personalización: Recomendaciones, Análisis volumen, PR Predictivo | ⏳ Pendiente |
| 6 | Estructura Real: Gimnasios, Entrenadores, Marketplace | ⏳ Pendiente |
| 7 | Red Social Completa: Feed, Historias, DMs, Comparativas | ⏳ Pendiente |
| 8 | Monetización: Ads, Suscripciones B2C/B2B, PCI-DSS | ⏳ Pendiente |

## Licencia

MIT