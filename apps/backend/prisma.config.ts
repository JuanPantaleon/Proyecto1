// Config de Prisma 7. Único import: módulos NATIVOS de Node (siempre disponibles).
// No importa ningún paquete externo (ni prisma/config ni dotenv) para que el
// loader de Prisma funcione en cualquier entorno, incluido el build de Render.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// En producción (Render/Supabase) DATABASE_URL llega como variable de entorno
// real del panel y este loader es un no-op. En local se carga apps/backend/.env
// manualmente (Prisma 7 no auto-carga .env).
function loadLocalEnv(): void {
  if (process.env["DATABASE_URL"]) return;
  const candidates = [
    resolve(process.cwd(), ".env"),
    resolve(process.cwd(), "apps/backend/.env"),
  ];
  for (const envPath of candidates) {
    if (!existsSync(envPath)) continue;
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"?([^"\r\n]*)"?\s*$/);
      if (!m) continue;
      if (process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
    break;
  }
}

loadLocalEnv();

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx ./prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
};