'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  Plus,
  Trash,
  Timer,
  Flame,
  Check,
  X,
  AlertTriangle,
  Dumbbell,
  Search,
  ListPlus,
  CalendarPlus,
  Ban,
  RotateCcw,
  Trophy,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/lib/roles';
import {
  uid,
  toNumber,
  formatScore,
  formatElapsed,
  METRIC_META,
  setTypeLabel,
  estimateSetISG,
  formatSetMeasure,
  createActiveSession,
  performedExercises,
  type ActiveSession,
  type SessionExercise,
  type SessionSet,
  type TemplateRoutine,
} from '@/lib/training';
import {
  useStartSession,
  useCreateSet,
  useEndSession,
} from '@/lib/hooks';
import type { Exercise } from '@/lib/api';
import type { MetricType, SetType } from '@ranked-fitness/shared';
import ExerciseInfo from './exercise-info';

interface EnCursoTabProps {
  session: ActiveSession | null;
  catalog: Exercise[];
  catalogLoading: boolean;
  onStartSession: (session: ActiveSession) => void;
  onUpdateSession: (session: ActiveSession) => void;
  onCompleteSession: (session: ActiveSession) => void;
  onCancelSession: () => void;
  onGoToTemplates: () => void;
  pendingRegister?: { exKey: string; seconds: number; failure: boolean } | null;
  onConsumedRegister?: () => void;
  pendingOpenBlock?: string | null;
  onConsumedOpenBlock?: () => void;
}

export interface PendingRegister {
  exKey: string;
  seconds: number;
  failure: boolean;
}

export interface CatalogEntry {
  name: string;
  description?: string | null;
  muscleGroup: string;
  metricType: MetricType;
  exerciseId?: string;
  exerciseFactor: number;
  defaultSets?: number | null;
  defaultReps?: number | null;
  defaultWeight?: number | null;
  defaultSec?: number | null;
}

export const FALLBACK_CATALOG: CatalogEntry[] = [
  { name: 'Press de Banca', muscleGroup: 'Pecho', metricType: 'REPS_WEIGHT', exerciseFactor: 1.0, defaultSets: 3, defaultReps: 10, defaultWeight: 60, description: 'Cómo hacerlo:\n1. Acostate boca arriba, pies firmes y hombros apoyados.\n2. Bajá la barra al pecho con control.\n3. Empujá hasta extender los brazos sin bloquear.' },
  { name: 'Sentadilla Libre', muscleGroup: 'Piernas', metricType: 'REPS_WEIGHT', exerciseFactor: 1.0, defaultSets: 4, defaultReps: 8, defaultWeight: 80, description: 'Cómo hacerlo:\n1. Pies al ancho de hombros, barra sobre trapecio.\n2. Bajá empujando la cadera atrás y atrás.\n3. Subí hasta extender piernas con el pecho alto.' },
  { name: 'Peso Muerto', muscleGroup: 'Espalda', metricType: 'REPS_WEIGHT', exerciseFactor: 1.0, defaultSets: 3, defaultReps: 5, defaultWeight: 100, description: 'Cómo hacerlo:\n1. Pies bajo la barra, espalda neutra.\n2. Empujá el piso y levantá la barra pegada al cuerpo.\n3. Bloqueá arriba con glúteos y bajá controlado.' },
  { name: 'Press Militar', muscleGroup: 'Hombros', metricType: 'REPS_WEIGHT', exerciseFactor: 1.0, defaultSets: 3, defaultReps: 8, defaultWeight: 40, description: 'Cómo hacerlo:\n1. Barra a la altura del mentón, core firme.\n2. Presioná hacia arriba y pasá la cabeza.\n3. Bajá hasta el mentón con control.' },
  { name: 'Dominadas', muscleGroup: 'Espalda', metricType: 'REPS_ONLY', exerciseFactor: 1.0, defaultSets: 3, defaultReps: 10, description: 'Cómo hacerlo:\n1. Colgate con agarre prono, brazos extendidos.\n2. Subí llevando el pecho a la barra.\n3. Bajá controlado hasta colgar por completo.' },
  { name: 'Flexiones', muscleGroup: 'Pecho', metricType: 'REPS_ONLY', exerciseFactor: 1.0, defaultSets: 3, defaultReps: 15, description: 'Cómo hacerlo:\n1. Manos al ancho de hombros, cuerpo en línea recta.\n2. Bajá el pecho cerca del piso.\n3. Empujá hasta estirar los brazos.' },
  { name: 'Plancha', muscleGroup: 'Core', metricType: 'TIME_ONLY', exerciseFactor: 1.0, defaultSets: 3, defaultSec: 45, description: 'Cómo hacerlo:\n1. Antebrazos en el piso, cuerpo en línea recta.\n2. Apretá glúteos y abdomen.\n3. Mantené la posición sin hundir la cadera.' },
  { name: 'Plancha Lateral', muscleGroup: 'Core', metricType: 'TIME_ONLY', exerciseFactor: 1.0, defaultSets: 3, defaultSec: 30, description: 'Cómo hacerlo:\n1. Apoyate en un antebrazo, cuerpo alineado.\n2. Elevá la cadera y mantené el torso recto.\n3. Sostené el tiempo indicado de cada lado.' },
  { name: 'Fondos al Fallo', muscleGroup: 'Pecho', metricType: 'TO_FAILURE', exerciseFactor: 1.0, defaultSets: 3, defaultReps: 12, description: 'Cómo hacerlo:\n1. Apoyate en las paralelas o un banco.\n2. Bajá hasta que los hombros queden a la altura de los codos.\n3. Subí hasta el fallo muscular y anotá las reps logradas.' },
  { name: 'Plancha al Fallo', muscleGroup: 'Core', metricType: 'TO_FAILURE', exerciseFactor: 1.0, defaultSets: 3, defaultSec: 40, description: 'Cómo hacerlo:\n1. Antebrazos en el piso, cuerpo en línea recta.\n2. Apretá glúteos y abdomen.\n3. Sostené hasta el fallo y anotá los segundos logrados.' },
];

export function toCatalogEntries(catalog: Exercise[]): CatalogEntry[] {
  return catalog.map((e) => ({
    name: e.name,
    description: e.description ?? null,
    muscleGroup: e.muscleGroup,
    metricType: e.metricType ?? 'REPS_WEIGHT',
    exerciseId: e.id,
    exerciseFactor: toNumber(e.exerciseFactor) ?? 1.0,
    defaultSets: e.defaultSets ?? null,
    defaultReps: e.defaultReps ?? null,
    defaultWeight: toNumber(e.defaultWeight),
    defaultSec: e.defaultSec ?? null,
  }));
}

export function resolveCatalogEntry(name: string, entries: CatalogEntry[]): CatalogEntry {
  const normalized = name.trim().toLowerCase();
  const found =
    entries.find((e) => e.name.trim().toLowerCase() === normalized) ||
    entries.find((e) => normalized.includes(e.name.trim().toLowerCase()) || e.name.trim().toLowerCase().includes(normalized));
  return (
    found ?? {
      name,
      muscleGroup: 'Otros',
      metricType: 'REPS_WEIGHT' as MetricType,
      exerciseFactor: 1.0,
    }
  );
}

export interface SetDefaults {
  weightKg?: number | string | null;
  reps?: number | string | null;
  durationSec?: number | string | null;
}

export function defaultsFromEntry(entry: CatalogEntry): SetDefaults {
  return {
    weightKg: entry.defaultWeight,
    reps: entry.defaultReps,
    durationSec: entry.defaultSec,
  };
}

export function emptySet(metricType: MetricType, defaults?: SetDefaults): SessionSet {
  const base: SessionSet = {
    localId: uid(),
    setType: 'NORMAL',
    isgScore: null,
    registered: false,
    localOnly: true,
  };
  if (metricType === 'TIME_ONLY')
    return { ...base, durationSec: defaults?.durationSec != null ? String(defaults.durationSec) : '' };
  if (metricType === 'REPS_ONLY')
    return { ...base, reps: defaults?.reps != null ? String(defaults.reps) : '' };
  if (metricType === 'TO_FAILURE')
    return {
      ...base,
      setType: 'FAILURE',
      reps: defaults?.reps != null ? String(defaults.reps) : '',
      durationSec: defaults?.durationSec != null ? String(defaults.durationSec) : '',
    };
  return {
    ...base,
    weightKg: defaults?.weightKg != null ? String(defaults.weightKg) : '',
    reps: defaults?.reps != null ? String(defaults.reps) : '',
  };
}

function sumIsg(exercises: SessionExercise[]): number {
  return exercises.reduce(
    (acc, e) => acc + e.sets.reduce((s, st) => s + (st.isgScore ?? 0), 0),
    0
  );
}

const MUSCLE_GROUPS = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'];

export function sessionFromTemplate(template: TemplateRoutine, entries: CatalogEntry[]): ActiveSession {
  const day = template.days?.[0];
  const templateExercises = day?.exercises ?? template.exercises ?? [];

  const exercises: SessionExercise[] = templateExercises.map((te) => {
    const entry = resolveCatalogEntry(te.name, entries);
    const templateSets = te.sets ?? [];
    const defaults = defaultsFromEntry(entry);
    let sets: SessionSet[];
    if (entry.metricType === 'REPS_WEIGHT' && templateSets.length > 0) {
      sets = templateSets.map((s) => ({
        localId: uid(),
        weightKg: s.kilos || (defaults.weightKg != null ? String(defaults.weightKg) : ''),
        reps: s.repes || (defaults.reps != null ? String(defaults.reps) : ''),
        setType: 'NORMAL',
        isgScore: null,
        registered: false,
        localOnly: true,
      }));
    } else {
      const count = Math.max(templateSets.length, entry.defaultSets ?? 3);
      sets = Array.from({ length: count }, () => emptySet(entry.metricType, defaults));
    }
    return {
      key: uid(),
      name: te.name,
      description: entry.description ?? null,
      metricType: entry.metricType,
      exerciseId: entry.exerciseId ?? null,
      exerciseFactor: entry.exerciseFactor,
      restSeconds: te.restSeconds ?? 90,
      defaultSets: entry.defaultSets ?? null,
      defaultReps: entry.defaultReps ?? null,
      defaultWeight: entry.defaultWeight ?? null,
      defaultSec: te.workSeconds ?? entry.defaultSec ?? null,
      sets,
    };
  });

  return {
    id: uid(),
    templateId: template.id,
    title: template.title,
    startedAt: new Date().toISOString(),
    status: 'active',
    backendSessionId: null,
    exercises,
    totalIsg: 0,
  };
}

export function createFreeSession(exercises: SessionExercise[]): ActiveSession {
  return createActiveSession('Entrenamiento Libre', exercises);
}

type Notice = { kind: 'ok' | 'warn' | 'err'; msg: string } | null;

function NoticeToast({ notice }: { notice: Notice }) {
  if (!notice) return null;
  const color =
    notice.kind === 'ok' ? 'text-green-400 border-green-500/40' : notice.kind === 'warn'
      ? 'text-[#FBBF24] border-[#FBBF24]/40'
      : 'text-[#EF4444] border-[#EF4444]/40';
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-24 z-[800] flex justify-center px-6 pointer-events-none animate-fade-slide'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border bg-[#0D0D0D] px-4 py-2.5 text-xs font-bold uppercase tracking-widest shadow-2xl',
          color
        )}
      >
        {notice.kind === 'ok' ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
        {notice.msg}
      </div>
    </div>
  );
}

function SetInput({
  label,
  value,
  onChange,
  placeholder,
  failure = false,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  failure?: boolean;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={label}
      className={cn(
        'w-full rounded-xl border py-2 text-center font-bold text-white outline-none transition-colors placeholder:text-white/20',
        failure
          ? 'border-[#EF4444]/60 bg-[#EF4444]/5 focus:border-[#EF4444]'
          : 'border-white/5 bg-black/50 focus:border-[#EF4444]'
      )}
    />
  );
}

function gridColsFor(metricType: MetricType): string {
  if (metricType === 'REPS_WEIGHT' || metricType === 'TO_FAILURE') {
    return 'grid-cols-[2rem_1fr_1fr_5.75rem_3rem_4rem]';
  }
  return 'grid-cols-[2rem_1fr_5.75rem_3rem_4rem]';
}

function SetTableHeader({ metricType }: { metricType: MetricType }) {
  const isTimeOnly = metricType === 'TIME_ONLY';
  const isToFailure = metricType === 'TO_FAILURE';
  return (
    <div className={cn('grid items-center gap-2 px-2', gridColsFor(metricType))}>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Serie</span>
      {metricType === 'REPS_WEIGHT' && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Peso (kg)</span>
      )}
      {!isTimeOnly && !isToFailure && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Reps</span>
      )}
      {isToFailure && (
        <>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Reps</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Segundos</span>
        </>
      )}
      {isTimeOnly && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Segundos</span>
      )}
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Fallar</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">ISG</span>
      <span />
    </div>
  );
}

export function FreeSessionPicker({
  open,
  entries,
  loading,
  onAdd,
  onClose,
}: {
  open: boolean;
  entries: CatalogEntry[];
  loading: boolean;
  onAdd: (entry: CatalogEntry) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('Todos');

  useEffect(() => {
    if (open) {
      setSearch('');
      setGroup('Todos');
    }
  }, [open]);

  if (!open) return null;

  const filtered = entries.filter(
    (e) =>
      (group === 'Todos' || e.muscleGroup.toLowerCase() === group.toLowerCase()) &&
      e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80dvh] w-full max-w-lg flex-col rounded-t-[2rem] border-t border-white/10 bg-[#0D0D0D] p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Entrenamiento Libre</h2>
            <p className="mt-0.5 text-xs text-white/40">Elegí los ejercicios de tu sesión</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/50 transition-all hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejercicio..."
            className="w-full rounded-2xl border border-white/10 bg-black/50 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#EF4444]"
          />
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {MUSCLE_GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g)}
              className={cn(
                'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all',
                group === g
                  ? 'border border-white/20 bg-white/10 text-white'
                  : 'border border-white/5 bg-white/5 text-white/50'
              )}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pb-2 scrollbar-hide">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl skeleton" />
            ))
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-white/40">Sin resultados</p>
          ) : (
            filtered.map((entry) => {
              const meta = METRIC_META[entry.metricType];
              return (
                <div
                  key={entry.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => onAdd(entry)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onAdd(entry);
                    }
                  }}
                  className="group flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-all hover:border-[#EF4444]/40 hover:bg-[#EF4444]/5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">{entry.name}</p>
                    <ExerciseInfo name={entry.name} description={entry.description} />
                    <p className="hidden text-xs text-white/40 sm:block">
                      {entry.muscleGroup} · {meta.label}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'flex flex-shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest',
                      entry.metricType === 'TIME_ONLY'
                        ? 'border-[#FBBF24]/40 text-[#FBBF24]'
                        : entry.metricType === 'REPS_ONLY'
                          ? 'border-green-500/40 text-green-400'
                          : 'border-[#EF4444]/40 text-[#EF4444]'
                    )}
                  >
                    {meta.short}
                    <Plus className="h-3 w-3 transition-transform group-hover:rotate-90" />
                  </span>
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90"
        >
          <Check className="h-4 w-4" />
          Listo
        </button>
      </div>
    </div>
  );
}

export default function EnCursoTab({
  session,
  catalog,
  catalogLoading,
  onStartSession,
  onUpdateSession,
  onCompleteSession,
  onCancelSession,
  onGoToTemplates,
  pendingRegister = null,
  onConsumedRegister,
  pendingOpenBlock = null,
  onConsumedOpenBlock,
}: EnCursoTabProps) {
  const router = useRouter();
  const { profile, recordSetIsg } = useRole();
  const playerId = 'role' in profile && profile.role === 'player' ? profile.id : 'player-1';
  const bodyWeightKg = 'role' in profile && profile.role === 'player' ? profile.weightKg || 82 : 82;
  const heightCm = 'role' in profile && profile.role === 'player' ? profile.heightCm || 178 : 178;

  const [hasToken] = useState<boolean>(
    () => typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState<SessionExercise[] | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({});

  const startSessionMut = useStartSession();
  const createSetMut = useCreateSet();
  const endSessionMut = useEndSession();

  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 3600);
    return () => clearTimeout(id);
  }, [notice]);

  const entries = toCatalogEntries(catalog);
  const shownEntries = entries.length > 0 ? entries : FALLBACK_CATALOG;

  const showNotice = (kind: NonNullable<Notice>['kind'], msg: string) => setNotice({ kind, msg });

  const applyUpdate = (fn: (s: ActiveSession) => ActiveSession) => {
    const cur = sessionRef.current;
    if (!cur) return;
    const next = fn(cur);
    sessionRef.current = next;
    onUpdateSession(next);
  };

  const elapsedSeconds = session
    ? Math.floor(
        (Date.parse(session.completedAt ?? session.startedAt) - Date.parse(session.startedAt)) / 1000
      )
    : 0;

  const addEntryToSession = (entry: CatalogEntry) => {
    const block: SessionExercise = {
      key: uid(),
      name: entry.name,
      description: entry.description ?? null,
      metricType: entry.metricType,
      exerciseId: entry.exerciseId ?? null,
      exerciseFactor: entry.exerciseFactor,
      restSeconds: 90,
      defaultSets: entry.defaultSets ?? null,
      defaultReps: entry.defaultReps ?? null,
      defaultWeight: entry.defaultWeight ?? null,
      defaultSec: entry.defaultSec ?? null,
      sets: [emptySet(entry.metricType, defaultsFromEntry(entry))],
    };
    if (!session) {
      onStartSession(createFreeSession([block]));
    } else if (session.status === 'active') {
      applyUpdate((s) => ({ ...s, exercises: [...s.exercises, block] }));
    }
    showNotice('ok', `${entry.name} agregado`);
  };

  const updateSetField = (
    exKey: string,
    setLocalId: string,
    field: 'weightKg' | 'reps' | 'durationSec',
    value: string
  ) => {
    applyUpdate((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.key === exKey
          ? { ...e, sets: e.sets.map((st) => (st.localId === setLocalId ? { ...st, [field]: value } : st)) }
          : e
      ),
    }));
  };

  const toggleSetType = (exKey: string, setLocalId: string) => {
    applyUpdate((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.key === exKey
          ? {
              ...e,
              sets: e.sets.map((st) =>
                st.localId === setLocalId
                  ? { ...st, setType: st.setType === 'FAILURE' ? 'NORMAL' : 'FAILURE' }
                  : st
              ),
            }
          : e
      ),
    }));
  };

  const addSetRow = (exKey: string) => {
    applyUpdate((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.key === exKey ? { ...e, sets: [...e.sets, emptySet(e.metricType)] } : e
      ),
    }));
  };

  const removeSetRow = (exKey: string, setLocalId: string) => {
    applyUpdate((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.key === exKey
          ? { ...e, sets: e.sets.length > 1 ? e.sets.filter((st) => st.localId !== setLocalId) : e.sets }
          : e
      ),
    }));
  };

  const removeExercise = (exKey: string) => {
    applyUpdate((s) => ({
      ...s,
      exercises: s.exercises.filter((e) => e.key !== exKey),
    }));
  };

  const previewScore = (block: SessionExercise, set: SessionSet): number | null => {
    return estimateSetISG({
      metricType: block.metricType,
      exerciseFactor: block.exerciseFactor,
      bodyWeightKg,
      heightCm,
      weightKg: toNumber(set.weightKg) ?? undefined,
      reps: toNumber(set.reps) ?? undefined,
      durationSec: toNumber(set.durationSec) ?? undefined,
      setType: set.setType,
    });
  };

  const saveSet = async (exKey: string, setLocalId: string) => {
    const current = sessionRef.current;
    if (!current) return;
    const block = current.exercises.find((e) => e.key === exKey);
    const set = block?.sets.find((st) => st.localId === setLocalId);
    if (!block || !set) return;

    const weightKg = toNumber(set.weightKg);
    const reps = toNumber(set.reps);
    const durationSec = toNumber(set.durationSec);

    const isValid =
      block.metricType === 'TIME_ONLY'
        ? (durationSec ?? 0) > 0
        : block.metricType === 'REPS_ONLY'
          ? (reps ?? 0) > 0
          : block.metricType === 'TO_FAILURE'
            ? (reps ?? 0) > 0 || (durationSec ?? 0) > 0
            : (weightKg ?? 0) > 0 && (reps ?? 0) > 0;

    if (!isValid) {
      showNotice('err', `Completá los datos de la serie (${METRIC_META[block.metricType].hint})`);
      return;
    }

    const estimate = estimateSetISG({
      metricType: block.metricType,
      exerciseFactor: block.exerciseFactor,
      bodyWeightKg,
      heightCm,
      weightKg: weightKg ?? undefined,
      reps: reps ?? undefined,
      durationSec: durationSec ?? undefined,
      setType: set.setType,
    });

    let nextSet: SessionSet = {
      ...set,
      registered: false,
      localOnly: true,
      isgScore: estimate,
    };

    if (hasToken && block.exerciseId) {
      try {
        let backendSessionId = current.backendSessionId;
        if (!backendSessionId) {
          const started = await startSessionMut.mutateAsync();
          backendSessionId = started.id;
          applyUpdate((s) => ({ ...s, backendSessionId }));
        }
        const res = await createSetMut.mutateAsync({
          sessionId: backendSessionId,
          exerciseId: block.exerciseId,
          weightKg: block.metricType === 'REPS_WEIGHT' ? weightKg ?? undefined : undefined,
          reps:
            block.metricType === 'REPS_ONLY' ||
            block.metricType === 'REPS_WEIGHT' ||
            block.metricType === 'TO_FAILURE'
              ? reps ?? undefined
              : undefined,
          durationSec:
            block.metricType === 'TIME_ONLY' || block.metricType === 'TO_FAILURE'
              ? durationSec ?? undefined
              : undefined,
          setType: set.setType as SetType,
        });
        const serverScore = toNumber(res.isgResult?.finalScore) ?? toNumber(res.set?.isgScore);
        nextSet = { ...set, registered: true, localOnly: false, isgScore: serverScore ?? estimate };
      } catch {
        nextSet = { ...set, registered: false, localOnly: true, isgScore: estimate };
        showNotice('warn', 'Sin conexión: ISG estimado localmente');
      }
    }

    applyUpdate((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.key === exKey
          ? { ...e, sets: e.sets.map((st) => (st.localId === setLocalId ? nextSet : st)) }
          : e
      ),
    }));
    if ((set.isgScore ?? 0) <= 0 && (nextSet.isgScore ?? 0) > 0) {
      recordSetIsg(playerId, nextSet.isgScore ?? 0);
    }
    showNotice('ok', `Serie registrada (+${formatScore(nextSet.isgScore)} ISG)`);
  };

  const openBlock = (exKey: string) => {
    setOpenBlocks((prev) => ({ ...prev, [exKey]: true }));
  };

  const closeBlock = (exKey: string) => {
    setOpenBlocks((prev) => ({ ...prev, [exKey]: false }));
  };

  const beginExercise = (block: SessionExercise) => {
    const seconds = toNumber(block.sets[0]?.durationSec) ?? block.defaultSec ?? 30;
    const params = new URLSearchParams({
      modo: 'ejercicio',
      exKey: block.key,
      nombre: block.name,
      metricType: block.metricType,
      segundos: String(seconds),
    });
    router.push(`/dashboard/temporizador?${params.toString()}`);
  };

  useEffect(() => {
    if (!pendingRegister) return;
    const current = sessionRef.current;
    if (!current) {
      onConsumedRegister?.();
      return;
    }
    const { exKey, seconds, failure } = pendingRegister;
    const block = current.exercises.find((e) => e.key === exKey);
    const target = block?.sets.find((st) => !st.registered) ?? block?.sets[0];
    if (!block || !target) {
      onConsumedRegister?.();
      return;
    }
    applyUpdate((s) => ({
      ...s,
      exercises: s.exercises.map((e) =>
        e.key === exKey
          ? {
              ...e,
              sets: e.sets.map((st) =>
                st.localId === target.localId
                  ? { ...st, durationSec: String(seconds), setType: failure ? 'FAILURE' : 'NORMAL' }
                  : st
              ),
            }
          : e
      ),
    }));
    openBlock(exKey);
    saveSet(exKey, target.localId);
    onConsumedRegister?.();
  }, [pendingRegister]);

  useEffect(() => {
    if (!pendingOpenBlock) return;
    openBlock(pendingOpenBlock);
    onConsumedOpenBlock?.();
  }, [pendingOpenBlock]);

  const requestComplete = () => {
    const current = sessionRef.current;
    if (!current) return;
    const omitted = current.exercises.filter((e) => !e.sets.some((st) => (st.isgScore ?? 0) > 0));
    if (omitted.length > 0) {
      setCompleteOpen(omitted);
      return;
    }
    completeSession();
  };

  const discardSession = async () => {
    const current = sessionRef.current;
    if (!current) return;
    if (current.backendSessionId) {
      try {
        await endSessionMut.mutateAsync(current.backendSessionId);
      } catch {
        // la sesión local se descarta igual, sin tocar la BD
      }
    }
    setCancelOpen(false);
    onCancelSession();
    showNotice('warn', 'Sesión descartada');
  };

  const completeSession = async () => {
    const current = sessionRef.current;
    if (!current) return;
    if (current.backendSessionId) {
      try {
        await endSessionMut.mutateAsync(current.backendSessionId);
      } catch {
        // se completa igual en local
      }
    }
    const s = current;
    const performed = performedExercises(s.exercises);
    const next: ActiveSession = {
      ...s,
      status: 'completed',
      completedAt: new Date().toISOString(),
      totalIsg: sumIsg(performed),
    };
    sessionRef.current = next;
    setCompleteOpen(null);
    onCompleteSession(next);
  };

  /* ============================== ESTADO: VACÍO ============================== */
  if (!session) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="flex flex-1 flex-col items-center justify-center gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0D0D0D] to-[#160d0d] px-6 py-12 text-center animate-fade-slide">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[#EF4444]/20 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#EF4444]/30 bg-black/60 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
              <Dumbbell className="h-10 w-10 text-[#EF4444]" />
            </div>
          </div>

          <div className="max-w-sm">
            <h2 className="text-2xl font-black tracking-tight text-white">
              Tu sesión de hoy te espera
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/40">
              Iniciá un entrenamiento libre, elegí una plantilla de tus rutinas o arrancá con un
              ejercicio en frío. Cada serie suma ISG a tu ranking.
            </p>
          </div>

          <div className="flex w-full max-w-sm flex-col gap-3">
            <button
              onClick={() => setPickerOpen(true)}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-4 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(239,68,68,0.35)] transition-all hover:bg-[#EF4444]/90"
            >
              <Play className="h-4 w-4 transition-transform group-hover:scale-110" />
              Iniciar Entrenamiento Libre
            </button>
            <button
              onClick={onGoToTemplates}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0D0D0D] py-4 text-sm font-bold uppercase tracking-widest text-white/70 transition-all hover:border-[#FBBF24]/50 hover:text-[#FBBF24]"
            >
              <CalendarPlus className="h-4 w-4" />
              Elegir Plantilla
            </button>
          </div>
        </div>

        <FreeSessionPicker
          open={pickerOpen}
          entries={shownEntries}
          loading={catalogLoading}
          onAdd={addEntryToSession}
          onClose={() => setPickerOpen(false)}
        />
        <NoticeToast notice={notice} />
      </div>
    );
  }

  /* ============================== ESTADO: COMPLETADO ============================== */
  if (session.status === 'completed') {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
        <div className="rounded-[2rem] border border-[#FBBF24]/20 bg-gradient-to-br from-[#0D0D0D] to-[#1a1408] p-6 text-center animate-fade-slide">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#FBBF24]/40 bg-[#FBBF24]/10">
            <Trophy className="h-8 w-8 text-[#FBBF24]" />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-white/40">
            Sesión completada
          </p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-white">{session.title}</h2>
          <p className="mt-3 text-4xl font-black tracking-tighter text-[#FBBF24]">
            +{formatScore(session.totalIsg)}
            <span className="ml-2 text-sm font-bold text-white/40">ISG</span>
          </p>
          <p className="mt-1 text-xs text-white/40">
            {formatElapsed(elapsedSeconds)} de entrenamiento ·{' '}
            {session.exercises.reduce((acc, e) => acc + e.sets.filter((s) => s.isgScore !== null).length, 0)}{' '}
            series registradas
          </p>
        </div>

        <div className="space-y-3">
          {session.exercises.map((block) => {
            const meta = METRIC_META[block.metricType];
            const blockIsg = block.sets.reduce((a, s) => a + (s.isgScore ?? 0), 0);
            return (
              <div key={block.key} className="rounded-3xl border border-white/10 bg-[#0D0D0D] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate text-lg font-bold text-white">{block.name}</h3>
                    <ExerciseInfo name={block.name} description={block.description} />
                  </div>
                  <span className="text-base font-black text-[#FBBF24]">+{formatScore(blockIsg)}</span>
                </div>
                <p className="mt-0.5 text-xs text-white/40">
                  {meta.label} · {block.sets.length} series
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {block.sets.map((st, i) => (
                    <span
                      key={st.localId}
                      className={cn(
                        'rounded-full border px-3 py-1 text-[11px] font-semibold',
                        st.setType === 'FAILURE'
                          ? 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]'
                          : 'border-white/10 bg-white/5 text-white/60'
                      )}
                    >
                      {i + 1}
                      {st.setType === 'FAILURE' && ' · Al fallo'}
                      {` · ${formatSetMeasure(block.metricType, st)}`}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onCancelSession}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-4 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(239,68,68,0.3)] transition-all hover:bg-[#EF4444]/90"
        >
          <RotateCcw className="h-4 w-4" />
          Nueva sesión
        </button>
        <NoticeToast notice={notice} />
      </div>
    );
  }

  /* ============================== ESTADO: EN CURSO ============================== */
  const isLive = session.status === 'active';

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Cabecera de sesión */}
      <div className="rounded-3xl border border-white/10 bg-[#0D0D0D] p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF4444] opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#EF4444]" />
              </span>
              <h2 className="truncate text-xl font-black tracking-tight text-white">{session.title}</h2>
            </div>
            <p className="mt-0.5 text-xs text-white/40">
              {isLive ? 'Sesión en curso' : 'Sesión finalizada'} ·{' '}
              {session.exercises.length} ejercicios
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#EF4444]/20 bg-black/40 px-4 py-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            ISG acumulado
          </span>
          <span className="flex items-center gap-1 text-lg font-black text-[#EF4444]">
            <Flame className="h-4 w-4" />
            +{formatScore(sumIsg(session.exercises))}
          </span>
        </div>
      </div>

      {/* Bloque de ejercicios */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-32 scrollbar-hide">
        {session.exercises.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-white/10 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <ListPlus className="h-8 w-8 text-white/30" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Aún no hay ejercicios</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-white/40">
                Agregá el primer ejercicio de tu sesión libre.
              </p>
            </div>
            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[#EF4444] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90"
            >
              <Plus className="h-4 w-4" />
              Agregar ejercicio
            </button>
          </div>
        ) : (
          session.exercises.map((block) => {
            const meta = METRIC_META[block.metricType];
            const blockIsg = block.sets.reduce((a, st) => a + (st.isgScore ?? 0), 0);
            const isTimeOnly = block.metricType === 'TIME_ONLY';
            const isRepsOnly = block.metricType === 'REPS_ONLY';
            const isToFailure = block.metricType === 'TO_FAILURE';
            const isOpen = !!openBlocks[block.key];

            return (
              <div
                key={block.key}
                className="space-y-4 rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-5 shadow-lg"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <h3 className="truncate text-lg font-bold text-white">{block.name}</h3>
                    <ExerciseInfo name={block.name} description={block.description} />
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest',
                        isTimeOnly
                          ? 'border-[#FBBF24]/40 text-[#FBBF24]'
                          : isRepsOnly
                            ? 'border-green-500/40 text-green-400'
                            : 'border-[#EF4444]/40 text-[#EF4444]'
                      )}
                    >
                      {meta.short}
                    </span>
                    <span className="text-base font-black text-[#FBBF24]">+{formatScore(blockIsg)}</span>
                    <button
                      onClick={() => removeExercise(block.key)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-white/30 transition-all hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                      aria-label={`Eliminar ${block.name}`}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {block.exerciseId ? (
                    <span className="text-green-400">· Catálogo</span>
                  ) : (
                    <span>· Sin servidor</span>
                  )}{' '}
                  · {meta.label} · {block.restSeconds}s descanso
                </p>

                {isOpen ? (
                  <>
                    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/40 px-4 py-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                        Series
                      </span>
                      <button
                        onClick={() => closeBlock(block.key)}
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/50 transition-all hover:text-white"
                      >
                        <ChevronDown className="h-4 w-4 rotate-180" />
                        Cerrar
                      </button>
                    </div>

                    {/* Tabla de series: inputs adaptativos por métrica */}
                    <div className="space-y-2">
                      <SetTableHeader metricType={block.metricType} />

                  {block.sets.map((st, index) => {
                    const score = st.isgScore ?? previewScore(block, st);
                    const failure = st.setType === 'FAILURE';
                    return (
                      <div
                        key={st.localId}
                        className={cn(
                          'grid items-center gap-2 rounded-2xl border p-2 transition-colors',
                          gridColsFor(block.metricType),
                          failure ? 'border-[#EF4444]/40 bg-[#EF4444]/[0.04]' : 'border-white/5 bg-black/30'
                        )}
                      >
                        <span className="text-center text-sm font-black text-white/30">{index + 1}</span>

                        {block.metricType === 'REPS_WEIGHT' && (
                          <SetInput
                            label="Peso (kg)"
                            value={st.weightKg ?? ''}
                            onChange={(v) => updateSetField(block.key, st.localId, 'weightKg', v)}
                            placeholder="kg"
                          />
                        )}

                        {isToFailure ? (
                          <>
                            <SetInput
                              label="Reps"
                              value={st.reps ?? ''}
                              onChange={(v) => updateSetField(block.key, st.localId, 'reps', v)}
                              placeholder="reps"
                              failure={failure}
                            />
                            <SetInput
                              label="Segundos"
                              value={st.durationSec ?? ''}
                              onChange={(v) => updateSetField(block.key, st.localId, 'durationSec', v)}
                              placeholder="seg"
                              failure={failure}
                            />
                          </>
                        ) : isTimeOnly ? (
                          <SetInput
                            label="Segundos"
                            value={st.durationSec ?? ''}
                            onChange={(v) => updateSetField(block.key, st.localId, 'durationSec', v)}
                            placeholder="seg"
                            failure={failure}
                          />
                        ) : (
                          <SetInput
                            label="Reps"
                            value={st.reps ?? ''}
                            onChange={(v) => updateSetField(block.key, st.localId, 'reps', v)}
                            placeholder="reps"
                            failure={failure}
                          />
                        )}

                        <button
                          onClick={() => toggleSetType(block.key, st.localId)}
                          title={setTypeLabel(st.setType)}
                          aria-pressed={failure}
                          className={cn(
                            'flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all',
                            failure
                              ? 'border-[#EF4444]/60 bg-[#EF4444]/15 text-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.35)]'
                              : 'border-white/10 bg-black/40 text-white/30 hover:border-[#EF4444]/40 hover:text-[#EF4444]'
                          )}
                        >
                          <Flame className={cn('h-3.5 w-3.5', failure && 'fill-[#EF4444]')} />
                          Fallar
                        </button>

                        <span className="text-center text-xs font-bold text-[#FBBF24]">
                          {score !== null ? `+${formatScore(score)}` : ''}
                        </span>

                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveSet(block.key, st.localId)}
                            disabled={st.registered}
                            className={cn(
                              'flex h-9 w-9 items-center justify-center rounded-xl transition-all',
                              st.registered
                                ? 'bg-white/10 text-[#FBBF24]'
                                : 'bg-[#EF4444] text-white hover:bg-[#EF4444]/90'
                            )}
                            aria-label="Registrar serie"
                            title={st.registered ? 'Registrada' : 'Registrar'}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          {block.sets.length > 1 && (
                            <button
                              onClick={() => removeSetRow(block.key, st.localId)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-white/30 transition-all hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                              aria-label="Eliminar serie"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => addSetRow(block.key)}
                        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/40 transition-all hover:text-[#EF4444]"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar serie
                      </button>
                      {block.sets.some((x) => x.setType === 'FAILURE') && (
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
                          <Flame className="mr-1 inline h-3 w-3" />
                          Al fallo activo
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => beginExercise(block)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-3 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all hover:bg-[#EF4444]/90"
                  >
                    {isTimeOnly ? (
                      <>
                        <Timer className="h-4 w-4" />
                        Comenzar Ejercicio
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Comenzar Ejercicio
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Acciones de sesión */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setPickerOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-3.5 text-sm font-bold uppercase tracking-widest text-white/60 transition-all hover:border-[#EF4444]/50 hover:bg-[#EF4444]/5 hover:text-[#EF4444]"
        >
          <Plus className="h-4 w-4" />
          Agregar ejercicio
        </button>
        <div className="flex flex-col gap-3">
          <button
            onClick={requestComplete}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(239,68,68,0.25)] transition-all hover:bg-[#EF4444]/90"
          >
            <Trophy className="h-4 w-4" />
            Completar Entrenamiento
          </button>
          <button
            onClick={() => setCancelOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#EF4444]/40 bg-[#EF4444]/5 py-3.5 text-sm font-bold uppercase tracking-widest text-[#EF4444] transition-all hover:bg-[#EF4444]/15"
          >
            <Ban className="h-4 w-4" />
            Cancelar Entrenamiento
          </button>
        </div>
      </div>

      {/* Selector de ejercicios libres */}
      <FreeSessionPicker
        open={pickerOpen}
        entries={shownEntries}
        loading={catalogLoading}
        onAdd={addEntryToSession}
        onClose={() => setPickerOpen(false)}
      />

      {/* Modal de validación al completar */}
      {completeOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setCompleteOpen(null)}
        >
          <div
            className="w-full max-w-sm rounded-[2rem] border border-[#FBBF24]/40 bg-[#0D0D0D] p-6 text-center animate-fade-slide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FBBF24]/40 bg-[#FBBF24]/10">
              <AlertTriangle className="h-7 w-7 text-[#FBBF24]" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">Ejercicios sin series registradas</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/50">
              Se omitirán del cálculo de ISG porque no registraste ninguna serie:
            </p>
            <ul className="mt-4 space-y-2">
              {completeOpen.map((e) => (
                <li
                  key={e.key}
                  className="rounded-xl border border-white/5 bg-black/40 px-3 py-2 text-sm font-semibold text-white/70"
                >
                  {e.name}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setCompleteOpen(null)}
                className="rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold uppercase tracking-widest text-white/70 transition-all hover:text-white"
              >
                Volver
              </button>
              <button
                onClick={completeSession}
                className="rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90"
              >
                Completar igual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de cancelación */}
      {cancelOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setCancelOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-[2rem] border border-[#EF4444]/40 bg-[#0D0D0D] p-6 text-center animate-fade-slide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#EF4444]/40 bg-[#EF4444]/10">
              <AlertTriangle className="h-7 w-7 text-[#EF4444]" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">¿Cancelar este entrenamiento?</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/50">
              La sesión activa se descartará y se limpiará el estado local. Las series ya
              registradas siguen guardadas en tu historial.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setCancelOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold uppercase tracking-widest text-white/70 transition-all hover:text-white"
              >
                Volver
              </button>
              <button
                onClick={discardSession}
                className="rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90"
              >
                Cancelar Entrenamiento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      <NoticeToast notice={notice} />
    </div>
  );
}

export { resolveCatalogEntry as resolveTemplateEntry };