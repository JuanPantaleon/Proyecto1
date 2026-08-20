import type { Role } from '@prisma/client';

export const ACTIVE_VIEWS = ['PLAYER', 'COACH', 'GYM', 'ADMIN'] as const;
export type ActiveView = (typeof ACTIVE_VIEWS)[number];

const ACTIVE_VIEW_TO_ROLE: Record<ActiveView, Role> = {
  PLAYER: 'USER',
  COACH: 'TRAINER',
  GYM: 'GYM_ADMIN',
  ADMIN: 'SUPER_ADMIN',
};

/**
 * Valida estrictamente la cabecera contextual `X-Active-View`.
 * Solo se aceptan valores de la allowlist; cualquier otra cosa se ignora.
 */
export function resolveActiveView(raw: unknown): ActiveView | undefined {
  if (typeof raw !== 'string') return undefined;
  const value = raw.trim().toUpperCase() as ActiveView;
  return ACTIVE_VIEWS.includes(value) ? value : undefined;
}

/**
 * Calcula el rol efectivo de un usuario.
 * - Un usuario común SIEMPRE usa su rol real verificado en la BD: la cabecera
 *   `X-Active-View` se ignora por completo (anti elevación de privilegios).
 * - Solo el rol raíz OWNER puede cambiar de vista; por defecto actúa como USER.
 */
export function computeEffectiveRole(user: { role: Role; activeView?: ActiveView }): Role {
  if (user.role !== 'OWNER') return user.role;
  return ACTIVE_VIEW_TO_ROLE[user.activeView ?? 'PLAYER'];
}