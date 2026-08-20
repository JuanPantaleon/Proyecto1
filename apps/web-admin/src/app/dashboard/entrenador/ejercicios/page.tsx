'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Minus, Dumbbell, Clock, Flame, Ban, Save } from 'lucide-react';
import { useRole } from '@/lib/roles';
import { useCustomExercises, useCreateCustomExercise } from '@/lib/hooks';
import type { Exercise } from '@/lib/api';
import type { MetricType } from '@ranked-fitness/shared';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MODALITY_OPTIONS: { value: MetricType; label: string; hint: string }[] = [
  { value: 'REPS_WEIGHT', label: 'Fuerza con Carga', hint: 'Peso x Repeticiones' },
  { value: 'REPS_ONLY', label: 'Calistenia', hint: 'Solo Repeticiones' },
  { value: 'TIME_ONLY', label: 'Isometría / Cardio', hint: 'Solo Tiempo (segundos)' },
  { value: 'TO_FAILURE', label: 'Al Fallo', hint: 'Reps o segundos hasta el fallo' },
];

const toNum = (v: number | string | null | undefined): number =>
  typeof v === 'string' ? Number(v) || 0 : v ?? 0;

const MODALITY_LABEL: Record<string, string> = {
  REPS_WEIGHT: 'Fuerza con Carga',
  REPS_ONLY: 'Calistenia',
  TIME_ONLY: 'Isometría / Cardio',
  TO_FAILURE: 'Al Fallo',
};

interface FormState {
  name: string;
  description: string;
  metricType: MetricType;
  defaultSets: string;
  defaultReps: string;
  defaultWeight: string;
  defaultSec: string;
  exerciseFactor: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  metricType: 'REPS_WEIGHT',
  defaultSets: '',
  defaultReps: '',
  defaultWeight: '',
  defaultSec: '',
  exerciseFactor: '1.0',
};

export default function EjerciciosPage() {
  const router = useRouter();
  const { role } = useRole();
  const [hasToken, setHasToken] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: customExercises, isLoading } = useCustomExercises(hasToken);
  const createMutation = useCreateCustomExercise();

  useEffect(() => {
    if (role !== 'coach' && role !== 'admin') {
      router.replace('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setHasToken(!!localStorage.getItem('auth_token'));
  }, []);

  const setField = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const setFactor = (delta: number) => {
    setForm((prev) => {
      const next = Math.round((toNum(prev.exerciseFactor) + delta) * 10) / 10;
      return { ...prev, exerciseFactor: String(Math.min(3, Math.max(0.1, next))) };
    });
  };

  const setFactorAbs = (value: number) => {
    const next = Math.round(value * 10) / 10;
    setForm((prev) => ({ ...prev, exerciseFactor: String(Math.min(3, Math.max(0.1, next))) }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFormOpen(false);
  };

  const handleSubmit = () => {
    const name = form.name.trim();
    if (!name) return;

    const payload: {
      name: string;
      description: string;
      metricType: MetricType;
      defaultSets?: number;
      defaultReps?: number;
      defaultWeight?: number;
      defaultSec?: number;
      exerciseFactor: number;
    } = {
      name,
      description: form.description.trim(),
      metricType: form.metricType,
      exerciseFactor: toNum(form.exerciseFactor) || 1.0,
    };

    const sets = Number(form.defaultSets);
    const reps = Number(form.defaultReps);
    const weight = Number(form.defaultWeight);
    const sec = Number(form.defaultSec);

    if (sets > 0) payload.defaultSets = sets;
    if (form.metricType !== 'TIME_ONLY' && reps > 0) payload.defaultReps = reps;
    if (form.metricType === 'REPS_WEIGHT' && weight > 0) payload.defaultWeight = weight;
    if (
      (form.metricType === 'TIME_ONLY' || form.metricType === 'TO_FAILURE') &&
      sec > 0
    ) {
      payload.defaultSec = sec;
    }

    createMutation.mutate(payload, {
      onSuccess: resetForm,
    });
  };

  const showsReps = form.metricType !== 'TIME_ONLY';
  const showsWeight = form.metricType === 'REPS_WEIGHT';
  const showsSec =
    form.metricType === 'TIME_ONLY' || form.metricType === 'TO_FAILURE';

  const factor = toNum(form.exerciseFactor);
  const canSubmit = form.name.trim().length > 0 && hasToken && !createMutation.isPending;

  return (
    <div className="h-full min-h-0 flex flex-col bg-black text-white">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Header Fijo */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/80 px-6 pb-4 pt-6 backdrop-blur-xl">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#0D0D0D] text-white/60 transition-all hover:text-white"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-white">Mis Ejercicios</h1>
          <button
            onClick={() => setFormOpen(true)}
            disabled={!hasToken}
            className="flex items-center gap-2 rounded-full bg-[#EF4444] px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all hover:bg-[#EF4444]/90 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Nuevo
          </button>
        </header>

        {/* Lista */}
        <div className="px-6 pb-40 pt-6">
          {!hasToken && (
            <p className="mb-4 rounded-2xl border border-[#FBBF24]/20 bg-[#FBBF24]/5 px-4 py-3 text-sm text-[#FBBF24]/80">
              Inicia sesión para crear y gestionar ejercicios personalizados.
            </p>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-[2rem] border border-white/5 bg-[#0D0D0D]" />
              ))}
            </div>
          ) : customExercises && customExercises.length > 0 ? (
            <div className="space-y-3">
              {customExercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-dashed border-white/10 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-[#0D0D0D]">
                <Dumbbell className="h-6 w-6 text-[#FBBF24]" />
              </div>
              <div>
                <p className="font-bold text-white">Aún no creaste ejercicios</p>
                <p className="mt-1 text-sm text-white/40">
                  Crea ejercicios personalizados para tus alumnos.
                </p>
              </div>
              <button
                onClick={() => setFormOpen(true)}
                disabled={!hasToken}
                className="flex items-center gap-2 rounded-full bg-[#EF4444] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Crear ejercicio
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sheet - Formulario */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={resetForm}
        >
          <div
            className="flex max-h-[88dvh] w-full max-w-lg flex-col rounded-t-[2rem] border-t border-white/10 bg-[#0D0D0D] p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-white">Nuevo Ejercicio</h2>
              <button
                onClick={resetForm}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/50 transition-all hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto scrollbar-hide pb-4">
              <Input
                label="Nombre *"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Ej. Press Búlgaro Inclinado"
                maxLength={100}
              />

              <div className="space-y-1.5">
                <label className="label">Descripción</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Breve descripción y ejecución"
                  rows={3}
                  maxLength={500}
                  className="w-full resize-none rounded-lg border border-input bg-input px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-border-focus focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="label">Modalidad</label>
                <Select
                  value={form.metricType}
                  onValueChange={(v) => setField('metricType', v as MetricType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona modalidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODALITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} — {option.hint}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Series"
                  type="number"
                  min={1}
                  max={20}
                  value={form.defaultSets}
                  onChange={(e) => setField('defaultSets', e.target.value)}
                  placeholder="3"
                />
                {showsReps && (
                  <Input
                    label="Repeticiones"
                    type="number"
                    min={1}
                    max={100}
                    value={form.defaultReps}
                    onChange={(e) => setField('defaultReps', e.target.value)}
                    placeholder="10"
                  />
                )}
                {showsWeight && (
                  <Input
                    label="Carga (kg)"
                    type="number"
                    min={0}
                    max={1000}
                    step={0.5}
                    value={form.defaultWeight}
                    onChange={(e) => setField('defaultWeight', e.target.value)}
                    placeholder="40"
                  />
                )}
                {showsSec && (
                  <Input
                    label="Tiempo por serie (s)"
                    type="number"
                    min={1}
                    max={3600}
                    value={form.defaultSec}
                    onChange={(e) => setField('defaultSec', e.target.value)}
                    placeholder="30"
                  />
                )}
              </div>

              <div className="rounded-2xl border border-[#FBBF24]/20 bg-[#FBBF24]/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]">
                    Factor ISG
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFactor(-0.1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/60 transition-all hover:text-white"
                      aria-label="Reducir factor"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-14 text-center text-lg font-black text-[#FBBF24]">
                      {factor.toFixed(1)}
                    </span>
                    <button
                      onClick={() => setFactor(0.1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 text-white/60 transition-all hover:text-white"
                      aria-label="Aumentar factor"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={3}
                  step={0.1}
                  value={factor}
                  onChange={(e) => setFactorAbs(Number(e.target.value))}
                  className="mt-3 w-full accent-[#FBBF24]"
                  aria-label="Factor ISG"
                />
                <p className="mt-2 text-xs text-white/40">
                  Pondera la puntuación del ejercicio. 1.0 = estándar, más difícil = mayor factor.
                </p>
              </div>

              {createMutation.isError && (
                <p className="rounded-xl border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-2 text-sm text-[#EF4444]">
                  No se pudo crear el ejercicio. Intenta de nuevo.
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-3.5 font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all hover:bg-[#EF4444]/90 disabled:opacity-40"
            >
              <Save className="h-4 w-4" />
              {createMutation.isPending ? 'Guardando...' : 'Guardar Ejercicio'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const defaults: string[] = [];

  if (exercise.defaultSets) defaults.push(`${exercise.defaultSets} series`);
  if (exercise.metricType !== 'TIME_ONLY' && exercise.defaultReps)
    defaults.push(`${exercise.defaultReps} reps`);
  if (exercise.metricType === 'REPS_WEIGHT' && exercise.defaultWeight)
    defaults.push(`${toNum(exercise.defaultWeight).toFixed(1)} kg`);
  if (
    (exercise.metricType === 'TIME_ONLY' || exercise.metricType === 'TO_FAILURE') &&
    exercise.defaultSec
  )
    defaults.push(`${exercise.defaultSec}s por serie`);

  const ModalityIcon = exercise.metricType === 'TIME_ONLY' ? Clock : exercise.metricType === 'REPS_WEIGHT' ? Dumbbell : Flame;

  return (
    <div className="rounded-[2rem] border border-white/5 bg-[#0D0D0D] p-5 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-white">{exercise.name}</p>
          {exercise.description ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-white/40">{exercise.description}</p>
          ) : null}
        </div>
        <span className="flex-shrink-0 rounded-full border border-[#FBBF24]/20 bg-[#FBBF24]/10 px-3 py-1 text-xs font-bold text-[#FBBF24]">
          x{toNum(exercise.exerciseFactor).toFixed(1)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70">
          <ModalityIcon className="h-3.5 w-3.5 text-[#EF4444]" />
          {MODALITY_LABEL[exercise.metricType] ?? exercise.metricType}
        </span>
        {defaults.length > 0 &&
          defaults.map((d) => (
            <span key={d} className="rounded-full border border-white/5 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/50">
              {d}
            </span>
          ))}
        <span className="ml-auto flex items-center gap-1 text-xs text-white/30">
          <Ban className="h-3.5 w-3.5" />
          Solo entrenador
        </span>
      </div>
    </div>
  );
}