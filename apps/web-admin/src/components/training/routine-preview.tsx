'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUp, Play, Plus, Trash, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uid, METRIC_META, type SessionExercise, type SessionSet } from '@/lib/training';
import {
  FreeSessionPicker,
  emptySet,
  defaultsFromEntry,
  type CatalogEntry,
  type SetDefaults,
} from './en-curso';
import ExerciseInfo from './exercise-info';

interface RoutinePreviewModalProps {
  title: string;
  exercises: SessionExercise[];
  entries: CatalogEntry[];
  loading: boolean;
  onConfirm: (exercises: SessionExercise[]) => void;
  onCancel: () => void;
}

function planDefaults(ex: SessionExercise): SetDefaults {
  return {
    weightKg: ex.defaultWeight,
    reps: ex.defaultReps,
    durationSec: ex.defaultSec,
  };
}

function blockFromEntry(entry: CatalogEntry): SessionExercise {
  return {
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
}

function PlanLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">{children}</span>
  );
}

function SeriesStepper({
  count,
  onMinus,
  onPlus,
}: {
  count: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onMinus}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-white/50 transition-all hover:text-[#EF4444]"
        aria-label="Quitar una serie"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-black text-white">{count}</span>
      <button
        onClick={onPlus}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-white/50 transition-all hover:text-[#EF4444]"
        aria-label="Sumar una serie"
      >
        +
      </button>
    </div>
  );
}

function PlanInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <PlanLabel>{label}</PlanLabel>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-16 rounded-lg border border-white/5 bg-black/50 text-center text-sm font-bold text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#EF4444]"
      />
    </div>
  );
}

export default function RoutinePreviewModal({
  title,
  exercises,
  entries,
  loading,
  onConfirm,
  onCancel,
}: RoutinePreviewModalProps) {
  const [items, setItems] = useState<SessionExercise[]>(exercises);
  const [pickerOpen, setPickerOpen] = useState(false);

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
  };

  const removeAt = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const addEntry = (entry: CatalogEntry) => {
    setItems((prev) => [...prev, blockFromEntry(entry)]);
    setPickerOpen(false);
  };

  const updateSeriesCount = (index: number, count: number) => {
    const safe = Math.min(Math.max(count, 1), 20);
    setItems((prev) =>
      prev.map((ex, i) => {
        if (i !== index) return ex;
        const first = ex.sets[0] ?? emptySet(ex.metricType, planDefaults(ex));
        const next: SessionSet[] = Array.from({ length: safe }, (_, si) =>
          ex.sets[si] ?? { ...first, localId: uid() }
        );
        return { ...ex, sets: next };
      })
    );
  };

  const updateAllSets = (
    index: number,
    field: 'weightKg' | 'reps' | 'durationSec',
    value: string
  ) => {
    setItems((prev) =>
      prev.map((ex, i) =>
        i !== index ? ex : { ...ex, sets: ex.sets.map((st) => ({ ...st, [field]: value })) }
      )
    );
  };

  const updateRest = (index: number, value: string) => {
    const n = parseInt(value, 10);
    setItems((prev) =>
      prev.map((ex, i) => (i !== index ? ex : { ...ex, restSeconds: Number.isFinite(n) && n > 0 ? n : 0 }))
    );
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-[2rem] border-t border-white/10 bg-[#0D0D0D] p-6 pb-10 animate-fade-slide"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]">
              Sesión de hoy
            </p>
            <h2 className="mt-0.5 truncate text-xl font-black tracking-tight text-white">{title}</h2>
            <p className="mt-1 text-xs leading-relaxed text-white/40">
              Ajustá los ejercicios solo para hoy. La plantilla guardada en tu perfil no se
              modifica.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/50 transition-all hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lista de ejercicios ajustables */}
        <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pb-2 scrollbar-hide">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-white/40">
              Sin ejercicios todavía. Agregá al menos uno para comenzar.
            </p>
          ) : (
            items.map((ex, i) => {
              const meta = METRIC_META[ex.metricType];
              const first = ex.sets[0];
              const reps = first?.reps ?? (ex.defaultReps != null ? String(ex.defaultReps) : '');
              const weight =
                first?.weightKg ?? (ex.defaultWeight != null ? String(ex.defaultWeight) : '');
              const sec = first?.durationSec ?? (ex.defaultSec != null ? String(ex.defaultSec) : '');
              return (
                <div key={ex.key} className="rounded-2xl border border-white/5 bg-black/30 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-white/40">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white">{ex.name}</p>
                        <ExerciseInfo name={ex.name} description={ex.description} />
                      </div>
                      <p className="text-[11px] text-white/40">
                        {meta.label} · {ex.sets.length} series · {ex.restSeconds}s descanso
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-1">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/40 transition-all hover:text-[#FBBF24] disabled:opacity-30"
                        aria-label={`Subir ${ex.name}`}
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === items.length - 1}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/40 transition-all hover:text-[#FBBF24] disabled:opacity-30"
                        aria-label={`Bajar ${ex.name}`}
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeAt(i)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/40 transition-all hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                        aria-label={`Quitar ${ex.name}`}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-end gap-x-4 gap-y-2 border-t border-white/5 pt-2.5">
                    <div className="flex flex-col gap-1">
                      <PlanLabel>Series</PlanLabel>
                      <SeriesStepper
                        count={ex.sets.length}
                        onMinus={() => updateSeriesCount(i, ex.sets.length - 1)}
                        onPlus={() => updateSeriesCount(i, ex.sets.length + 1)}
                      />
                    </div>
                    {ex.metricType === 'REPS_WEIGHT' && (
                      <PlanInput
                        label="Peso (kg)"
                        value={weight}
                        onChange={(v) => updateAllSets(i, 'weightKg', v)}
                      />
                    )}
                    {ex.metricType !== 'TIME_ONLY' && (
                      <PlanInput
                        label="Reps"
                        value={reps}
                        onChange={(v) => updateAllSets(i, 'reps', v)}
                      />
                    )}
                    {(ex.metricType === 'TIME_ONLY' || ex.metricType === 'TO_FAILURE') && (
                      <PlanInput
                        label="Trabajo (s)"
                        value={sec}
                        onChange={(v) => updateAllSets(i, 'durationSec', v)}
                      />
                    )}
                    <PlanInput
                      label="Descanso (s)"
                      value={String(ex.restSeconds)}
                      onChange={(v) => updateRest(i, v)}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Agregar ejercicio */}
        <button
          onClick={() => setPickerOpen(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 py-3 text-sm font-bold uppercase tracking-widest text-white/60 transition-all hover:border-[#EF4444]/50 hover:text-[#EF4444]"
        >
          <Plus className="h-4 w-4" />
          Agregar ejercicio
        </button>

        {/* Pie: comenzar sesión ajustada */}
        <div className="mt-4 flex flex-col gap-3">
          <button
            onClick={() => onConfirm(items)}
            disabled={items.length === 0}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-4 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(239,68,68,0.35)] transition-all',
              items.length === 0 ? 'cursor-not-allowed opacity-50' : 'hover:bg-[#EF4444]/90'
            )}
          >
            <Play className="h-4 w-4" />
            Comenzar Sesión Ajustada
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold uppercase tracking-widest text-white/70 transition-all hover:text-white"
          >
            Volver
          </button>
        </div>

        <FreeSessionPicker
          open={pickerOpen}
          entries={entries}
          loading={loading}
          onAdd={addEntry}
          onClose={() => setPickerOpen(false)}
        />
      </div>
    </div>
  );
}