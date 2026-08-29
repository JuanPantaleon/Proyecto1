import { calculateISG, type ISGInput, type MetricType, type SetType } from '@ranked-fitness/shared';

export const ROUTINES_KEY = 'ranked_fitness_custom_routines';
export const ACTIVE_SESSION_KEY = 'ranked_fitness_active_session';
export const HISTORY_KEY = 'ranked_fitness_history';

/* ============================================================
 * Plantillas (formato compartido con el creador de rutinas)
 * ============================================================ */

export interface TemplateSet {
  kilos: string;
  repes: string;
}

export interface TemplateExercise {
  name: string;
  restSeconds?: number;
  workSeconds?: number;
  sets: TemplateSet[];
}

export interface TemplateDay {
  title: string;
  exercises: TemplateExercise[];
}

export interface TemplateRoutine {
  id: number;
  title: string;
  description?: string;
  tags?: string[];
  days?: TemplateDay[];
  exercises?: TemplateExercise[];
  createdAt?: string;
}

/* ============================================================
 * Sesión activa (hub "En Curso")
 * ============================================================ */

export interface SessionSet {
  localId: string;
  weightKg?: string;
  reps?: string;
  durationSec?: string;
  setType: SetType;
  isgScore: number | null;
  registered: boolean;
  localOnly: boolean;
}

export interface SessionExercise {
  key: string;
  name: string;
  description?: string | null;
  metricType: MetricType;
  exerciseId: string | null;
  exerciseFactor: number;
  restSeconds: number;
  sets: SessionSet[];
  defaultSets?: number | null;
  defaultReps?: number | null;
  defaultWeight?: number | null;
  defaultSec?: number | null;
}

export type ActiveSessionStatus = 'active' | 'completed' | 'cancelled';

export interface ActiveSession {
  id: string;
  templateId?: number;
  title: string;
  startedAt: string;
  status: ActiveSessionStatus;
  backendSessionId: string | null;
  exercises: SessionExercise[];
  completedAt?: string;
  totalIsg: number;
}

/* ============================================================
 * Historial (bitácora local + sesiones del backend)
 * ============================================================ */

export interface HistorySet {
  weightKg?: number;
  reps?: number;
  durationSec?: number;
  setType: SetType;
  isgScore: number | null;
}

export interface HistoryExercise {
  name: string;
  metricType: MetricType;
  sets: HistorySet[];
}

export interface HistoryRecord {
  id: string;
  sessionId?: string;
  title: string;
  date: string;
  durationSec: number;
  totalIsg: number;
  exercises: HistoryExercise[];
}

export interface HistoryDay {
  key: string;
  dateISO: string;
  label: string;
  records: HistoryRecord[];
}

export interface HistoryMonth {
  key: string;
  label: string;
  days: HistoryDay[];
}

/* ============================================================
 * Helpers de identificación
 * ============================================================ */

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function toNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

export function formatScore(value: number | null | undefined): string {
  const n = toNumber(value);
  if (n === null) return '—';
  return n >= 100 ? String(Math.round(n)) : String(Math.round(n * 10) / 10);
}

/* ============================================================
 * Metadatos de métricas
 * ============================================================ */

export const METRIC_META: Record<
  MetricType,
  { label: string; short: string; hint: string; units: string; inputLabels: string[] }
> = {
  REPS_WEIGHT: {
    label: 'Fuerza',
    short: 'KG×REPS',
    hint: 'Peso + repeticiones',
    units: 'kg',
    inputLabels: ['Peso (kg)', 'Reps'],
  },
  REPS_ONLY: {
    label: 'Calistenia',
    short: 'REPS',
    hint: 'Solo repeticiones',
    units: 'reps',
    inputLabels: ['Reps'],
  },
  TO_FAILURE: {
    label: 'Al fallo',
    short: 'FALLO',
    hint: 'Reps o segundos hasta el fallo',
    units: 'fallo',
    inputLabels: ['Reps', 'Segundos'],
  },
  TIME_ONLY: {
    label: 'Tiempo',
    short: 'SEG',
    hint: 'Duración isométrica',
    units: 's',
    inputLabels: ['Segundos'],
  },
};

export function setTypeLabel(setType: SetType): string {
  return setType === 'FAILURE' ? 'Al fallo' : setType === 'WARMUP' ? 'Calentamiento' : 'Normal';
}

/* ============================================================
 * Estimación ISG en cliente (respaldo cuando la API no responde)
 * ============================================================ */

export function estimateSetISG(opts: {
  metricType: MetricType;
  exerciseFactor: number;
  bodyWeightKg: number;
  heightCm: number;
  weightKg?: number;
  reps?: number;
  durationSec?: number;
  setType: SetType;
}): number | null {
  try {
    const base = {
      exerciseFactor: opts.exerciseFactor,
      bodyWeightKg: opts.bodyWeightKg,
      heightCm: opts.heightCm,
      variantBonus: 1.0,
      penalty: 1.0,
      setType: opts.setType,
    };
    let input: ISGInput;
    if (opts.metricType === 'TIME_ONLY') {
      if (!opts.durationSec || opts.durationSec <= 0) return null;
      input = { metricType: 'TIME_ONLY', durationSec: opts.durationSec, ...base };
    } else if (opts.metricType === 'REPS_ONLY') {
      if (!opts.reps || opts.reps <= 0) return null;
      input = { metricType: 'REPS_ONLY', reps: opts.reps, ...base };
    } else if (opts.metricType === 'TO_FAILURE') {
      const hasDuration = (opts.durationSec ?? 0) > 0;
      const hasReps = (opts.reps ?? 0) > 0;
      if (!hasDuration && !hasReps) return null;
      if (hasDuration && !hasReps) {
        input = { metricType: 'TO_FAILURE', durationSec: opts.durationSec!, ...base };
      } else {
        input = { metricType: 'TO_FAILURE', reps: opts.reps!, ...base };
      }
    } else {
      if (!opts.weightKg || opts.weightKg <= 0 || !opts.reps || opts.reps <= 0) return null;
      input = { metricType: 'REPS_WEIGHT', weightKg: opts.weightKg, reps: opts.reps, ...base };
    }
    return calculateISG(input).finalScore;
  } catch {
    return null;
  }
}

export function formatSetMeasure(
  metricType: MetricType,
  set: {
    reps?: string | number | null;
    weightKg?: string | number | null;
    durationSec?: string | number | null;
  }
): string {
  if (metricType === 'TIME_ONLY') return `${set.durationSec ?? '—'}s`;
  if (metricType === 'REPS_ONLY') return `${set.reps ?? '—'} reps`;
  if (metricType === 'TO_FAILURE') {
    const parts: string[] = [];
    if (set.reps != null && String(set.reps).trim() !== '') parts.push(`${set.reps} reps`);
    if (set.durationSec != null && String(set.durationSec).trim() !== '') {
      parts.push(`${set.durationSec}s`);
    }
    return parts.join(' · ') || '—';
  }
  return `${set.weightKg ?? '—'}kg × ${set.reps ?? '—'}`;
}

/* ============================================================
 * Persistencia localStorage
 * ============================================================ */

export function loadActiveSession(): ActiveSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveSession;
    if (!parsed || typeof parsed !== 'object' || !parsed.id) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: ActiveSession) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
  } catch {
    // almacenamiento no disponible
  }
}

export function clearActiveSession() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {
    // almacenamiento no disponible
  }
}

export function loadTemplates(): TemplateRoutine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ROUTINES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TemplateRoutine[]) : [];
  } catch {
    return [];
  }
}

export function saveTemplates(templates: TemplateRoutine[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(templates));
  } catch {
    // almacenamiento no disponible
  }
}

export function loadHistory(): HistoryRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(records: HistoryRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, 100)));
  } catch {
    // almacenamiento no disponible
  }
}

export function pushHistoryRecord(record: HistoryRecord) {
  const next = [record, ...loadHistory().filter((r) => r.id !== record.id)];
  saveHistory(next);
  return next;
}

export function createActiveSession(
  title: string,
  exercises: SessionExercise[],
  templateId?: number
): ActiveSession {
  return {
    id: uid(),
    templateId,
    title,
    startedAt: new Date().toISOString(),
    status: 'active',
    backendSessionId: null,
    exercises,
    totalIsg: 0,
  };
}

export function performedExercises(exercises: SessionExercise[]): SessionExercise[] {
  return exercises.filter((e) => e.sets.some((st) => (st.isgScore ?? 0) > 0));
}

export function sessionToHistoryRecord(session: ActiveSession): HistoryRecord {
  const exercises: HistoryExercise[] = session.exercises.map((e) => ({
    name: e.name,
    metricType: e.metricType,
    sets: e.sets.map((st) => ({
      weightKg: toNumber(st.weightKg) ?? undefined,
      reps: toNumber(st.reps) ?? undefined,
      durationSec: toNumber(st.durationSec) ?? undefined,
      setType: st.setType,
      isgScore: st.isgScore,
    })),
  }));
  const started = Date.parse(session.startedAt);
  const ended = session.completedAt ? Date.parse(session.completedAt) : Date.now();
  return {
    id: session.backendSessionId ?? session.id,
    sessionId: session.backendSessionId ?? undefined,
    title: session.title,
    date: session.startedAt,
    durationSec: Math.max(0, Math.floor((ended - started) / 1000)),
    totalIsg: session.totalIsg,
    exercises,
  };
}

/* ============================================================
 * Agrupación cronológica del historial (Mes/Año → Día)
 * ============================================================ */

export function groupHistory(records: HistoryRecord[]): HistoryMonth[] {
  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const months = new Map<string, HistoryMonth>();

  for (const record of sorted) {
    const d = new Date(record.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const dayKey = `${monthKey}-${String(d.getDate()).padStart(2, '0')}`;

    let month = months.get(monthKey);
    if (!month) {
      const label = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
      month = {
        key: monthKey,
        label: label.charAt(0).toUpperCase() + label.slice(1),
        days: [],
      };
      months.set(monthKey, month);
    }

    let day = month.days.find((x) => x.key === dayKey);
    if (!day) {
      day = {
        key: dayKey,
        dateISO: `${dayKey}T00:00:00`,
        label: d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' }),
        records: [],
      };
      month.days.push(day);
    }
    day.records.push(record);
  }

  return Array.from(months.values());
}

/* ============================================================
 * Formato de tiempo
 * ============================================================ */

export function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDurationShort(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest > 0 ? `${h}h ${rest}m` : `${h}h`;
}