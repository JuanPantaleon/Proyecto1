# 📌 CHECKPOINT_PRODUCCION — Ranked Fitness

> Estado del monorepo en el umbral de producción (Fase 1).

## 1) Configuración Vercel — Frontend (Next.js)

| Campo | Valor |
|---|---|
| Root Directory | `apps/web-admin` |
| Framework Preset | Next.js |
| Build Command | `next build` (equivale a `npm run build` en `apps/web-admin`) |
| Output Directory | **vacío** (Vercel detecta `.next` automáticamente) |
| Install Command | `npm install` (Vercel resuelve el workspace npm desde el `package-lock.json` raíz) |
| Proyecto Nx | `web-admin` (`apps/web-admin/package.json` → `"nx": { "name": "web-admin" }`) |

> Alternativa local: `npx nx build web-admin` (verificado OK).

## 2) Variables de entorno críticas

### Vercel (frontend — se inyectan en build)
| Variable | Valor esperado |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<backend>.onrender.com/api` (URL de Render + `/api`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` (producción) |
| `CLERK_SECRET_KEY` | `sk_live_...` (usada por el middleware de Clerk en el servidor) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/dashboard` |

### Render (backend — inyectadas en runtime)
| Variable | Valor esperado |
|---|---|
| `DATABASE_URL` | `postgresql://postgres:****@db.uvdnrnqtopuqgiprgmad.supabase.co:5432/postgres` (Supabase) |
| `NODE_ENV` | `production` |
| `PORT` | Render la inyecta (código usa `process.env.PORT \|\| 3000`) |
| `JWT_SECRET` | aleatoria (generada por Render) |
| `SUPER_ADMIN_EMAIL` | **`juanpantaleon06@gmail.com`** — confiere rol `OWNER` (mini-isla 👑) |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `CLERK_SECRET_KEY` | `sk_live_...` |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` (firma webhooks → `/api/api/v1/auth/clerk-webhook`) |
| `CORS_ORIGINS` | `https://<tu-app>.vercel.app` (localhost se acepta siempre) |

> Los `.env` locales (con claves reales) están en `.gitignore` y **no** se suben.

## 3) Estado de la Fase 1

- ✅ **Monorepo limpio y en `main`**: último push `f5b8074` sincronizado con `origin/main`.
- ✅ **Backend compila**: `npx nx build backend` → OK (webpack → `apps/backend/dist/main.js`).
- ✅ **Frontend compila**: `npx nx build web-admin` → "Compiled successfully" (Next.js).
- ✅ **TypeScript**: `tsc --noEmit` backend → exit 0.
- ✅ **Prisma**: 8 migraciones aplicadas en **Supabase**; seed idempotente ejecutado (334 ejercicios, gimnasio **Pantafit**, owner **juanpantaleon06@gmail.com** rol `OWNER`, **Rutina Líder** 5 días/65 series pública).
- ✅ **Prisma 7**: `DATABASE_URL` se resuelve en `apps/backend/prisma.config.ts` (`process.env["DATABASE_URL"]`); `dotenv` declarado explícitamente en `apps/backend/package.json` (fix de build en Render).
- ✅ **Deploy config**: `render.yaml` (Blueprint Render + PostgreSQL) y `CHECKLIST_DEPLOY.md` en la raíz.

### Fase 1 — Pendientes opcionales
- ⏳ Conectar el repo a Render (Blueprint) y a Vercel (Root Directory `apps/web-admin`).
- ⏳ Completar envs reales de Clerk en los paneles de Vercel/Render.
- ⏳ (Cosmético) Ignorar warning de Nx Cloud 401 en builds.

**Conclusión**: el monorepo está en un estado impecable y listo para conectar los despliegues de producción.