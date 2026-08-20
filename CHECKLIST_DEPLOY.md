# ✅ CHECKLIST_DEPLOY — Ranked Fitness a Producción

Arquitectura gratuita objetivo:

| Capa | Proveedor | Producto |
|---|---|---|
| Base de datos | Supabase (o Render PostgreSQL) | PostgreSQL |
| Backend (NestJS) | Render | Web Service Node.js (free) |
| Frontend (Next.js) | Vercel | Next.js |

> **Nota Prisma 7**: la URL de PostgreSQL se define **en `apps/backend/prisma.config.ts`** vía `process.env["DATABASE_URL"]` (Prisma 7 ya no admite `url = env(...)` dentro de `schema.prisma`). Las migraciones están listas: 8 migraciones, `prisma migrate deploy` las aplica automáticamente (idempotente).

---

## 1) Supabase — Base de Datos (una vez)

1. Crear proyecto en https://supabase.com (plan Free).
2. En **Settings → Database → Connection string (URI)** copiar la URL `postgresql://...`.
   - Recomendado: usar el pooler con modo **Session** (port 5432) para Prisma/Migrate:
     `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`
   - Desmarcar "Enable connection pooling (direct connection)" o usar el **direct connection** para Migrate:
     `postgresql://postgres.<ref>:<password>@db.<ref>.supabase.co:5432/postgres`
3. **No** crear tablas a mano: `prisma migrate deploy` las creará.
4. Este string será el valor de `DATABASE_URL` en Render.

---

## 2) Clerk — Configuración (una vez)

1. Crear app en Clerk. En **Production** usar las claves reales (`pk_live_...`, `sk_live_...`).
2. En **Clerk → User & Authentication → Email, Phone, Username** habilitar Email.
3. En **Clerk → Domains / Application URLs**:
   - **Application URL**: `https://<tu-app>.vercel.app`
   - **Allowed origins (CORS)**: `https://<tu-app>.vercel.app` y `http://localhost:3001`
4. En **Clerk → Webhooks**: crear webhook para eventos `user.created`, `user.updated`, `user.deleted`.
   - Endpoint: `https://<backend>.onrender.com/api/api/v1/auth/clerk-webhook`
   - Copiar el valor de **Signing secret** → será `CLERK_WEBHOOK_SECRET`.

---

## 3) Render — Backend (NestJS)

### Opción A — Blueprint (recomendada)
1. Conectar el repo a **Render → New → Blueprint**. Render detecta `render.yaml` en la raíz y crea:
   - Web Service `ranked-fitness-backend` (Node, free)
   - Base PostgreSQL `ranked-fitness-db` (free)
2. En el Web Service completar las variables marcadas como `sync: false`:
   - `CLERK_PUBLISHABLE_KEY` = `pk_live_...`
   - `CLERK_SECRET_KEY` = `sk_live_...`
   - `CLERK_WEBHOOK_SECRET` = `whsec_...`
3. Editar `CORS_ORIGINS` si la URL de Vercel es distinta.
4. **Manual deploy** inicial para que la base se cree y migre.

> Comandos que Render ejecuta (equivalentes a los scripts del `package.json` raíz):
> - **Build**: `cd apps/backend && npx prisma generate && cd ../.. && npx nx build backend`
> - **Start**: `cd apps/backend && npx prisma migrate deploy && cd ../.. && node apps/backend/dist/main.js`

### Opción B — Web Service manual
- **Root Directory**: `apps/backend`
- **Build Command**: `npx prisma generate && npx nx build backend`
- **Start Command**: `npx prisma migrate deploy && node dist/main.js`
- **Plan**: Free (se apaga tras ~15 min de inactividad; `healthCheckPath: /api/health` lo reactiva en el primer hit).

### Variables de entorno del Backend (Render)

| Variable | Valor | ¿Obligatoria? |
|---|---|---|
| `DATABASE_URL` | string PostgreSQL de Supabase (o `connectionString` de la BD de Render) | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `PORT` | `10000` (Render lo inyecta; el código usa `process.env.PORT \|\| 3000`) | ⚠️ (Render la setea sola) |
| `JWT_SECRET` | string aleatoria larga (la genera Render) | ✅ |
| `SUPER_ADMIN_EMAIL` | **`juanpantaleon06@gmail.com`** — confiere el rol raíz `OWNER` y el acceso a la mini-isla 👑 | ✅ (no cambiar) |
| `CLERK_PUBLISHABLE_KEY` | `pk_live_...` | ✅ |
| `CLERK_SECRET_KEY` | `sk_live_...` | ✅ |
| `CLERK_WEBHOOK_SECRET` | `whsec_...` (firma de webhooks) | ✅ |
| `CORS_ORIGINS` | `https://<tu-app>.vercel.app,https://<tu-app>.vercel.app` | ⚠️ (localhost se acepta siempre) |

---

## 4) Vercel — Frontend (Next.js)

1. Importar el repo en **Vercel → Add New → Project**.
2. Configuración del proyecto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web-admin`
   - **Install Command**: (default; Vercel detecta el monorepo npm y corre `npm install` en la raíz)
   - **Build Command**: `npm run build`
   - **Output**: (default)
3. En **Settings → Environment Variables** agregar (valores de PRODUCCIÓN de Clerk):

| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<backend>.onrender.com/api` (URL de Render **+** `/api`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_live_...` |
| `CLERK_SECRET_KEY` | `sk_live_...` (la necesita el middleware de Clerk en el servidor) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/dashboard` |

4. **Redeploy** después de cada cambio de env (las `NEXT_PUBLIC_*` se inyectan en build).

---

## 5) Verificación final (local, antes de conectar)

```bash
npm run build            # nx build backend + nx build web-admin
npm run db:migrate:deploy
npm run start:backend    # node apps/backend/dist/main.js
```

Checklist de humo:
- `GET https://<backend>.onrender.com/api/health` → `{"status":"ok","checks":{"database":"up","redis":"up"}}`
- `GET https://<backend>.onrender.com/api/api/v1/rutinas/public` → devuelve la "Rutina Líder" (5 días, 65 series)
- Abrir `https://<tu-app>.vercel.app`, loguear con `juanpantaleon06@gmail.com` → ver la mini-isla 👑 y poder cambiar de vista (OWNER)
- Registrar una serie en /dashboard/entrenamiento → refleja el ISG en /dashboard/ranking

---

## 6) Recordatorios de producción

- **Sleep en Render free**: el backend se duerme tras inactividad (~15 min). El primer request tarda unos segundos en despertar. Aceptable para pruebas; para SLA real, subir a plan Starter.
- **Redis**: el health check reporta `redis: up` aunque no haya Redis real (stub). Opcional: añadir un servicio Redis en Render y usar `REDIS_URL` en `health.service.ts`.
- **Seed**: la "Rutina Líder", el gimnasio **Pantafit** y el owner se cargan con `npm run db:seed` contra la base remota (idempotente). Correr una sola vez tras el primer `migrate deploy`.
- **Nx Cloud**: warning 401 en builds (workspace no conectado). Cosmético; no bloquea deploys.
- Los archivos `.env` locales **no** se suben (`.gitignore`); todas las variables van en los paneles de Vercel/Render.