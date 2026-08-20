'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  Plus,
  Trash,
  Dumbbell,
  Clock,
  Pencil,
  Copy,
  CalendarRange,
  AlertTriangle,
  Filter,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  loadTemplates,
  saveTemplates,
  estimateSetISG,
  formatScore,
  type TemplateRoutine,
  type TemplateExercise,
} from '@/lib/training';
import type { MetricType } from '@ranked-fitness/shared';

interface MisRutinasTabProps {
  activeTemplateId?: number;
  hasActiveSession: boolean;
  onStartTemplate: (template: TemplateRoutine) => void;
  onChanged?: () => void;
}

const FILTERS = ['Todos', 'Fuerza', 'Hipertrofia', 'Push', 'Pull', 'Legs', 'Full Body', 'PPL'];

const FALLBACK_WEIGHT = 82;
const FALLBACK_HEIGHT = 178;

function flatExercises(template: TemplateRoutine): TemplateExercise[] {
  const day = template.days?.[0];
  return day?.exercises ?? template.exercises ?? [];
}

function projectedIsg(template: TemplateRoutine): number {
  const exercises = flatExercises(template);
  let total = 0;
  for (const ex of exercises) {
    const metricType: MetricType = 'REPS_WEIGHT';
    for (const s of ex.sets ?? []) {
      const score = estimateSetISG({
        metricType,
        exerciseFactor: 1.0,
        bodyWeightKg: FALLBACK_WEIGHT,
        heightCm: FALLBACK_HEIGHT,
        weightKg: parseFloat(s.kilos) || undefined,
        reps: parseFloat(s.repes) || undefined,
        setType: 'NORMAL',
      });
      if (score !== null) total += score;
    }
  }
  return total;
}

function projectedDuration(template: TemplateRoutine): number {
  const exercises = flatExercises(template);
  const setCount = exercises.reduce((acc, e) => acc + (e.sets?.length ?? 0), 0);
  return Math.max(5, Math.round(setCount * 1.2 + exercises.length * 1.5));
}

export default function MisRutinasTab({
  activeTemplateId,
  hasActiveSession,
  onStartTemplate,
  onChanged,
}: MisRutinasTabProps) {
  const [templates, setTemplates] = useState<TemplateRoutine[]>([]);
  const [filter, setFilter] = useState('Todos');
  const [confirmDelete, setConfirmDelete] = useState<TemplateRoutine | null>(null);
  const [confirmReplace, setConfirmReplace] = useState<TemplateRoutine | null>(null);

  useEffect(() => {
    setTemplates(loadTemplates());
  }, []);

  const notifyChanged = () => {
    setTemplates(loadTemplates());
    onChanged?.();
  };

  const filtered = useMemo(
    () =>
      templates.filter((t) => filter === 'Todos' || (t.tags ?? []).includes(filter)),
    [templates, filter]
  );

  const handleStart = (template: TemplateRoutine) => {
    if (hasActiveSession) {
      setConfirmReplace(template);
      return;
    }
    onStartTemplate(template);
  };

  const confirmStart = () => {
    if (confirmReplace) onStartTemplate(confirmReplace);
    setConfirmReplace(null);
  };

  const duplicate = (template: TemplateRoutine) => {
    const copy: TemplateRoutine = {
      ...template,
      id: Date.now(),
      title: `${template.title} (copia)`,
      createdAt: new Date().toISOString(),
    };
    saveTemplates([copy, ...templates]);
    notifyChanged();
  };

  const confirmDeleteRoutine = () => {
    if (!confirmDelete) return;
    saveTemplates(templates.filter((t) => t.id !== confirmDelete.id));
    setConfirmDelete(null);
    notifyChanged();
  };

  const hasTemplates = templates.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black tracking-tight text-white">Mis Rutinas</h2>
          <p className="text-xs text-white/40">
            {hasTemplates
              ? `${templates.length} plantilla${templates.length === 1 ? '' : 's'} listas para iniciar`
              : 'Plantillas guardadas en tu perfil'}
          </p>
        </div>
        <Link
          href="/dashboard/entrenamiento/crear"
          className="flex items-center gap-2 rounded-full bg-[#EF4444] px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all hover:bg-[#EF4444]/90"
        >
          <Plus className="h-4 w-4" />
          Crear
        </Link>
      </div>

      {/* Filtros */}
      {hasTemplates && (
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide">
          <Filter className="h-4 w-4 flex-shrink-0 text-gray-500" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors',
                filter === f
                  ? 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:text-white'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {/* Grid de plantillas */}
      {!hasTemplates ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-[2rem] border border-dashed border-white/10 px-6 py-14 text-center animate-fade-slide">
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5">
            <Dumbbell className="h-9 w-9 text-white/30" />
          </div>
          <div className="max-w-xs">
            <h3 className="text-lg font-semibold text-white">Aún no tienes rutinas</h3>
            <p className="mt-1 text-sm text-white/40">
              Crea tu primera plantilla y luego iniciá tu sesión desde «En Curso».
            </p>
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/dashboard/entrenamiento/crear"
              className="flex items-center gap-2 rounded-full bg-[#EF4444] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90"
            >
              <Plus className="h-4 w-4" />
              Crear Rutina
            </Link>
            <Link
              href="/dashboard/entrenamiento"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/70 transition-all hover:border-[#FBBF24]/50 hover:text-[#FBBF24]"
            >
              <Sparkles className="h-4 w-4" />
              Entrenamiento Libre
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-3xl border border-dashed border-white/10 py-14 text-center">
          <p className="text-sm text-white/40">Sin rutinas para el filtro «{filter}»</p>
        </div>
      ) : (
        <div className="grid flex-1 min-h-0 content-start gap-4 overflow-y-auto pb-32 grid-cols-1 scrollbar-hide sm:grid-cols-2">
          {filtered.map((template) => {
            const exercises = flatExercises(template);
            const setCount = exercises.reduce((acc, e) => acc + (e.sets?.length ?? 0), 0);
            const isActive = activeTemplateId === template.id;
            const isg = projectedIsg(template);
            const duration = projectedDuration(template);

            return (
              <div
                key={template.id}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0D0D0D] p-5 transition-all hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-gray-300">
                      <Dumbbell className="h-5 w-5" />
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-gray-400">
                      {template.days?.length ?? 1}{' '}
                      {(template.days?.length ?? 1) === 1 ? 'Día' : 'Días'} · {exercises.length}{' '}
                      ejercicios
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">{duration} min</span>
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-white">{template.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-400">
                    {template.description || 'Sin descripción'}
                  </p>
                  {(template.tags ?? []).length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {template.tags!.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/5 bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                  {isActive ? (
                    <span className="flex items-center gap-1.5 text-sm font-bold text-[#EF4444]">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#EF4444] opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4444]" />
                      </span>
                      En curso
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-[#FBBF24]">
                      {isg > 0 ? `+${formatScore(isg)} ISG` : `${setCount} series`}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/entrenamiento/crear?id=${template.id}`}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-[#FBBF24]/40 hover:text-[#FBBF24]"
                      aria-label={`Editar ${template.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => duplicate(template)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-[#FBBF24]/40 hover:text-[#FBBF24]"
                      aria-label={`Duplicar ${template.title}`}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(template)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-[#EF4444]/40 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                      aria-label={`Eliminar ${template.title}`}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleStart(template)}
                      className="flex h-10 items-center gap-2 rounded-xl bg-[#EF4444] px-4 text-sm font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all hover:bg-[#EF4444]/90"
                    >
                      <Play className="h-4 w-4" />
                      Iniciar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* CTA crear nueva */}
          <Link
            href="/dashboard/entrenamiento/crear"
            className="flex min-h-[9rem] flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-white/10 text-white/40 transition-all hover:border-[#EF4444]/40 hover:bg-[#EF4444]/5 hover:text-[#EF4444]"
          >
            <CalendarRange className="h-6 w-6" />
            <span className="text-sm font-bold uppercase tracking-widest">Crear nueva rutina</span>
          </Link>
        </div>
      )}

      {/* Modal confirmar inicio con sesión activa */}
      {confirmReplace && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setConfirmReplace(null)}
        >
          <div
            className="w-full max-w-sm rounded-[2rem] border border-[#EF4444]/40 bg-[#0D0D0D] p-6 text-center animate-fade-slide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#EF4444]/40 bg-[#EF4444]/10">
              <AlertTriangle className="h-7 w-7 text-[#EF4444]" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">Hay una sesión en curso</h2>
            <p className="mt-1 text-sm leading-relaxed text-white/50">
              Iniciar «{confirmReplace.title}» reemplazará la sesión activa actual. ¿Continuar?
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmReplace(null)}
                className="rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold uppercase tracking-widest text-white/70 transition-all hover:text-white"
              >
                Volver
              </button>
              <button
                onClick={confirmStart}
                className="rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90"
              >
                Reemplazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6 text-center animate-fade-slide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
              <Trash className="h-7 w-7 text-[#EF4444]" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">¿Eliminar esta rutina?</h2>
            <p className="mt-1 text-sm text-white/50">
              «{confirmDelete.title}» se quitará de tus plantillas. Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold uppercase tracking-widest text-white/70 transition-all hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteRoutine}
                className="rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}