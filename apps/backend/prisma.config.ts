// Prisma 7: este config es cargado por el CLI de Prisma (tanto local como en
// el build de Render). No importa módulos externos (dotenv): la resolución de
// node_modules del loader de Prisma en entornos de CI no está garantizada.
import { defineConfig } from "prisma/config";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// Carga apps/backend/.env de forma manual (solo para desarrollo local).
// En producción (Render/Supabase) DATABASE_URL ya llega como variable de
// entorno real del panel, por lo que esta función es un no-op.
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

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx ./prisma/seed.ts",
  },
  // Prisma 7: la URL de la base (PostgreSQL estándar) se resuelve SIEMPRE desde
  // la variable de entorno DATABASE_URL (Supabase/Render). Sin esto, Migrate
  // no puede conectarse a la base remota.
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});