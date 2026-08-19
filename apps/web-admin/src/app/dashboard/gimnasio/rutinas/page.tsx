'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  ClipboardList,
  Plus,
  X,
  Trash2,
  Target,
  Gauge,
  Dumbbell,
  Save,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'ranked_fitness_gym_routines';

type Level = 'Principiante' | 'Intermedio' | 'Avanzado';
type Goal = 'Fuerza' | 'Hipertrofia' | 'Resistencia' | 'Full Body';

interface RoutineExercise {
  name: string;
  sets: number;
  reps: number;
}

interface GymRoutine {
  id: string;
  name: string;
  description: string;
  level: Level;
  goal: Goal;
  exercises: RoutineExercise[];
  createdAt: number;
}

const CATALOG = [
  { name: 'Sentadilla', muscle: 'Piernas' },
  { name: 'Peso Muerto', muscle: 'Espalda' },
  { name: 'Press de Banca', muscle: 'Pecho' },
  { name: 'Press Militar', muscle: 'Hombros' },
  { name: 'Dominadas', muscle: 'Espalda' },
  { name: 'Remo con Barra', muscle: 'Espalda' },
  { name: 'Curl de Bíceps', muscle: 'Bíceps' },
  { name: 'Fondos', muscle: 'Tríceps' },
  { name: 'Zancadas', muscle: 'Piernas' },
  { name: 'Hip Thrust', muscle: 'Glúteos' },
];

const LEVELS: Level[] = ['Principiante', 'Intermedio', 'Avanzado'];
const GOALS: Goal[] = ['Fuerza', 'Hipertrofia', 'Resistencia', 'Full Body'];

const LEVEL_BADGE: Record<Level, string> = {
  Principiante: 'border-white/20 bg-white/5 text-gray-300',
  Intermedio: 'border-[#FBBF24]/50 bg-[#FBBF24]/10 text-[#FBBF24]',
  Avanzado: 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]',
};

const GOAL_BADGE: Record<Goal, string> = {
  Fuerza: 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]',
  Hipertrofia: 'border-[#FBBF24]/50 bg-[#FBBF24]/10 text-[#FBBF24]',
  Resistencia: 'border-[#38BDF8]/40 bg-[#38BDF8]/10 text-[#38BDF8]',
  'Full Body': 'border-white/20 bg-white/5 text-gray-300',
};

const DEFAULT_ROUTINES: GymRoutine[] = [
  {
    id: 'g1',
    name: 'Full Body Pantafit',
    description: 'Rutina completa de 3 días para base general.',
    level: 'Intermedio',
    goal: 'Full Body',
    createdAt: Date.now() - 86400000 * 3,
    exercises: [
      { name: 'Sentadilla', sets: 4, reps: 8 },
      { name: 'Press de Banca', sets: 4, reps: 8 },
      { name: 'Remo con Barra', sets: 4, reps: 8 },
    ],
  },
  {
    id: 'g2',
    name: 'Fuerza Competitiva',
    description: 'Bloque de fuerza enfocado en los 3 grandes levantamientos.',
    level: 'Avanzado',
    goal: 'Fuerza',
    createdAt: Date.now() - 86400000 * 6,
    exercises: [
      { name: 'Sentadilla', sets: 5, reps: 5 },
      { name: 'Press de Banca', sets: 5, reps: 5 },
      { name: 'Peso Muerto', sets: 3, reps: 3 },
    ],
  },
  {
    id: 'g3',
    name: 'Hipertrofia Pantafit',
    description: 'Volumen para desarrollo muscular de 4 días.',
    level: 'Intermedio',
    goal: 'Hipertrofia',
    createdAt: Date.now() - 86400000 * 10,
    exercises: [
      { name: 'Press Militar', sets: 4, reps: 10 },
      { name: 'Dominadas', sets: 4, reps: 8 },
      { name: 'Curl de Bíceps', sets: 3, reps: 12 },
      { name: 'Fondos', sets: 3, reps: 12 },
    ],
  },
];

const inputClass =
  'w-full rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-all placeholder:text-white/25 focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]';

export default function RutinasGimnasioPage() {
  const [routines, setRoutines] = useState<GymRoutine[]>(DEFAULT_ROUTINES);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState<Level>('Intermedio');
  const [goal, setGoal] = useState<Goal>('Fuerza');
  const [draftExercises, setDraftExercises] = useState<RoutineExercise[]>([
    { name: 'Sentadilla', sets: 3, reps: 10 },
  ]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setRoutines(stored);
      }
    } catch {
      // defaults
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
    } catch {
      // storage unavailable
    }
  }, [routines]);

  const addDraftExercise = () => {
    setDraftExercises((prev) => [...prev, { name: CATALOG[0].name, sets: 3, reps: 10 }]);
  };

  const updateDraftExercise = (index: number, patch: Partial<RoutineExercise>) => {
    setDraftExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, ...patch } : ex)));
  };

  const removeDraftExercise = (index: number) => {
    setDraftExercises((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setLevel('Intermedio');
    setGoal('Fuerza');
    setDraftExercises([{ name: CATALOG[0].name, sets: 3, reps: 10 }]);
  };

  const saveRoutine = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || draftExercises.length === 0) return;
    const routine: GymRoutine = {
      id: `gym-${Date.now()}`,
      name: trimmed,
      description: description.trim(),
      level,
      goal,
      exercises: draftExercises.filter((ex) => ex.name.trim()),
      createdAt: Date.now(),
    };
    setRoutines((prev) => [routine, ...prev]);
    resetForm();
    setCreating(false);
  };

  const deleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const totalExercises = routines.reduce((sum, r) => sum + r.exercises.length, 0);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      {/* Header Fijo */}
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black/80 px-6 pb-4 pt-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#0D0D0D] text-white/60 transition-all hover:text-white"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Biblioteca de Rutinas - Pantafit
            </h1>
            <p className="text-xs text-white/40">
              {routines.length} plantillas · {totalExercises} ejercicios
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setCreating(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[#EF4444] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90"
        >
          <Plus className="h-4 w-4" />
          Crear Nueva Rutina
        </button>
      </header>

      {/* Contenido con scroll */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-48 pt-6 scrollbar-hide">
        {routines.map((routine) => (
          <article
            key={routine.id}
            className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-white/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold tracking-tight text-white">{routine.name}</h3>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest',
                      LEVEL_BADGE[routine.level]
                    )}
                  >
                    <Gauge className="h-2.5 w-2.5" />
                    {routine.level}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest',
                      GOAL_BADGE[routine.goal]
                    )}
                  >
                    <Target className="h-2.5 w-2.5" />
                    {routine.goal}
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/40">
                  {routine.description || 'Sin descripción'}
                </p>
              </div>
              <button
                onClick={() => deleteRoutine(routine.id)}
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:border-[#EF4444]/50 hover:text-[#EF4444]"
                aria-label={`Eliminar ${routine.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/5 bg-white/5 p-4">
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <Dumbbell className="h-3.5 w-3.5 text-[#FBBF24]" />
                Movimientos · {routine.exercises.length}
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {routine.exercises.map((ex, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/30 px-3.5 py-2.5"
                  >
                    <span className="truncate text-sm font-semibold text-white">{ex.name}</span>
                    <span className="flex-shrink-0 text-xs font-bold text-white/50">
                      {ex.sets}×{ex.reps}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}

        {routines.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-white/10 py-14 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-white/15" />
            <p className="mt-3 text-sm font-bold text-white">Sin rutinas en la biblioteca</p>
            <p className="mt-1 text-xs text-white/40">
              Creá tu primera plantilla para asignarla a tus jugadores.
            </p>
          </div>
        )}
      </div>

      {/* Modal Crear Rutina */}
      {creating && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setCreating(false)}
        >
          <form
            onSubmit={saveRoutine}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88dvh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0D0D0D]"
          >
            <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/5 px-6 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Nueva plantilla
                </p>
                <h3 className="mt-0.5 text-lg font-bold text-white">Crear rutina del gimnasio</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 scrollbar-hide">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Nombre de la rutina
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Fuerza Principiante"
                  className={cn(inputClass, 'mt-1.5')}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objetivo y notas para los atletas..."
                  rows={2}
                  className={cn(inputClass, 'mt-1.5 resize-none')}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Nivel
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value as Level)}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-colors focus:border-[#EF4444]"
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Objetivo
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value as Goal)}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-colors focus:border-[#EF4444]"
                    >
                      {GOALS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                    <Dumbbell className="h-3.5 w-3.5 text-[#FBBF24]" />
                    Ejercicios y series
                  </p>
                  <button
                    type="button"
                    onClick={addDraftExercise}
                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#EF4444] transition-colors hover:text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </button>
                </div>

                <div className="mt-3 space-y-2.5">
                  {draftExercises.map((ex, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={ex.name}
                        onChange={(e) => updateDraftExercise(i, { name: e.target.value })}
                        className="min-w-0 flex-1 cursor-pointer appearance-none rounded-xl border border-white/10 bg-black/50 px-3 py-2.5 text-sm font-semibold text-white outline-none transition-colors focus:border-[#EF4444]"
                      >
                        {CATALOG.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name} · {c.muscle}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => updateDraftExercise(i, { sets: Math.max(1, Number(e.target.value) || 1) })}
                        aria-label="Series"
                        className="w-14 rounded-xl border border-white/10 bg-black/50 py-2.5 text-center text-sm font-bold text-white outline-none focus:border-[#EF4444]"
                      />
                      <span className="text-xs font-bold text-white/30">×</span>
                      <input
                        type="number"
                        value={ex.reps}
                        onChange={(e) => updateDraftExercise(i, { reps: Math.max(1, Number(e.target.value) || 1) })}
                        aria-label="Repeticiones"
                        className="w-14 rounded-xl border border-white/10 bg-black/50 py-2.5 text-center text-sm font-bold text-white outline-none focus:border-[#EF4444]"
                      />
                      <button
                        type="button"
                        onClick={() => removeDraftExercise(i)}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:border-[#EF4444]/50 hover:text-[#EF4444]"
                        aria-label="Quitar ejercicio"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 gap-3 border-t border-white/5 px-6 py-4">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 py-3.5 text-sm font-bold uppercase tracking-widest text-white/50 transition-all hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!name.trim() || draftExercises.length === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90 disabled:opacity-40"
              >
                <Save className="h-4 w-4" />
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}