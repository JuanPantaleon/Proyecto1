# Ranked Fitness - Estado Actual del Proyecto

**Fecha:** 18/08/2026  
**Fase:** 1 - Core (Completado) → Iniciando Dashboard Web Admin

---

## ✅ Qué está Funcionando

### Backend (NestJS) - Puerto 3000
- ✅ Monorepo Nx 23.x configurado
- ✅ Docker Compose: PostgreSQL 16 + Redis 7 (healthy)
- ✅ Prisma 7 con schema completo (users, exercises, sessions, sets, rest_timers, audit_logs)
- ✅ 45 ejercicios seed cargados con ISG Engine
- ✅ 42 tests passing (auth: 15, catalog: 15, training: 12)
- ✅ Lint: 0 errors
- ✅ Build: exitoso
- ✅ Servidor corriendo en `http://localhost:3000/api`

**Endpoints verificados:**
- `GET /api/health` → `{"status":"ok","checks":{"database":"up","redis":"up"}}`
- `GET /api/api/v1/catalogo/ejercicios` → 45 ejercicios
- `GET /api/api/v1/catalogo/grupos-musculares` → 7 grupos

### Web Admin (Next.js 16) - Puerto 3001
- ✅ Clerk Auth configurado (Account Portal: `https://moved-possum-7025.accounts.dev`)
- ✅ Landing page completa con secciones: Hero, BentoPillars, DivisionsGrid, CtaBanner, SocialFeed, etc.
- ✅ **Nuevo Layout Dashboard** creado en `apps/web-admin/src/app/dashboard/layout.tsx`:
  - Pantalla única `h-[100dvh]` con `overflow-hidden`
  - Fondo negro puro `#000000`
  - Isla flotante (Dock) inferior con 4 items: Inicio, Entrenamiento, Temporizador, Ranking
  - Item activo "Inicio" en rojo `#EF4444`
  - Fondo translúcido `bg-card/80 backdrop-blur-xl`
- ✅ ClerkProvider configurado con URLs de Account Portal
- ✅ Middleware actualizado (rutas públicas: `/`, `/api/*`)
- ✅ Header de landing redirige a Account Portal para sign-in/sign-up

---

## 📁 Archivos Modificados Recientemente

### Web Admin
| Archivo | Cambio |
|---------|--------|
| `apps/web-admin/src/app/dashboard/layout.tsx` | **NUEVO** - Layout con Dock flotante y pantalla completa |
| `apps/web-admin/src/app/layout.tsx` | ClerkProvider con `signInUrl`, `signUpUrl`, `afterSignInUrl` |
| `apps/web-admin/middleware.ts` | Removidas rutas `/sign-in`, `/sign-up` de públicas |
| `apps/web-admin/src/components/landing/header.tsx` | Botones redirigen a Account Portal |
| `apps/web-admin/.env` | Variables Clerk + API URL |

### Backend
| Archivo | Cambio |
|---------|--------|
| `apps/backend/.env` | Configuración BD + Clerk keys |
| `apps/backend/dist/main.js` | Build compilado funcionando |

---

## 🚀 Cómo Levantar el Proyecto

```bash
# 1. Ir al root del proyecto
cd C:\Users\juanp\opencode1\ranked-fitness

# 2. Levantar base de datos (Docker Desktop debe estar corriendo)
docker compose up -d

# 3. Backend (terminal 1)
cd apps/backend
# Si no está corriendo:
node dist/main.js
# Verificar: curl http://localhost:3000/api/health

# 4. Web Admin (terminal 2)
cd apps/web-admin
npm run dev
# Abre: http://localhost:3001
# Sign-in: https://moved-possum-7025.accounts.dev/sign-in
```

---

## 🎯 Próximos Pasos (Pendientes)

### Dashboard - Vista "Inicio" (`apps/web-admin/src/app/dashboard/page.tsx`)
**Refactorizar para usar el nuevo Layout y estilo landing:**
- [ ] Sección "Tus Estadísticas" - 4 tarjetas estilo BentoPillars (ISG Score, Racha, Ranking, PRs)
- [ ] Sección "Novedades" - Panel ancho estilo SocialFeed (actividad reciente + testimonios)
- [ ] Fondo con partículas/gradientes como Hero
- [ ] Tarjetas con `bg-[#0D0D0D]` y bordes `border-white/10`
- [ ] Colores: Rojo `#EF4444` (primario), Dorado `#FBBF24` (acento)

### Otras Vistas del Dock
- [ ] `/dashboard/entrenamiento` - Lista de sesiones + botón "Nueva Sesión"
- [ ] `/dashboard/temporizador` - Timer principal con controles
- [ ] `/dashboard/ranking` - Tabla global con divisiones (Elite → Bronce)

### Integración Backend
- [ ] Hooks `useCurrentUser`, `useSessions`, `useExercises` conectados a API
- [ ] Swagger/OpenAPI en backend (`@nestjs/swagger` ya instalado)
- [ ] Redis real integration (cache, rate limiting)

---

## 🔑 Variables de Entorno Clave

**Clerk (Account Portal):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>`
- `CLERK_SECRET_KEY=<your_clerk_secret_key>`
- **Account Portal URL:** *(el del dashboard de Clerk)*

**Backend:**
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ranked_fitness`
- `REDIS_URL=redis://localhost:6379`
- `JWT_SECRET=your-super-secret-jwt-key-change-in-production`

---

## 🐛 Issues Conocidos

1. **Hydration warning** en sign-in page (común con Clerk SSR) - suprimido con `suppressHydrationWarning`
2. **Dock navigation** - rutas `/dashboard/entrenamiento`, `/dashboard/temporizador`, `/dashboard/ranking` aún no existen (404)
3. **Tests e2e** - Playwright no configurado aún

---

## 📝 Notas para Retomar

1. El **layout del dashboard ya está listo** en `apps/web-admin/src/app/dashboard/layout.tsx`
2. El **page.tsx actual tiene código legacy** - necesita reescritura completa usando el nuevo layout
3. **Estilo visual:** Copiar exactamente de landing page (Hero, BentoPillars, SocialFeed, DivisionsGrid)
4. **Colores design system:**
   - Background: `#000000` (`bg-black`)
   - Cards: `#0D0D0D` (`bg-[#0D0D0D]`)
   - Border: `rgba(255,255,255,0.1)` (`border-white/10`)
   - Primary: `#EF4444` (`red-500`)
   - Accent: `#FBBF24` (`amber-400`)

---

## Comandos Útiles

```bash
# Ver logs backend
tail -f apps/backend/backend.log

# Test backend
cd apps/backend && npx nx test backend

# Lint backend
cd apps/backend && npx nx lint backend

# Build web-admin
cd apps/web-admin && npm run build

# Prisma Studio
cd apps/backend && npm run prisma:studio

# Reset DB
cd apps/backend && npm run prisma:migrate reset --force
```