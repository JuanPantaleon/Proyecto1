'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Copy, Plus, Filter, Dumbbell, Clock, Trash, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'ranked_fitness_custom_routines';

const filters = ['Todos', 'Fuerza', 'Hipertrofia', 'Push', 'Pull', 'Legs'];

const routines: RoutineCard[] = [
  {
    title: 'Torso Destructor',
    description: 'Enfocado en hipertrofia de pecho y espalda alta',
    sets: 4,
    reps: 8,
    isg: 450,
    exercises: 8,
    duration: 75,
    span: 'sm:col-span-2',
    featured: true,
  },
  {
    title: 'Leg Day Extremo',
    description: 'Sentadillas, zancadas y peso muerto rumano para fuerza',
    sets: 5,
    reps: 5,
    isg: 620,
    exercises: 6,
    duration: 90,
    span: '',
    featured: false,
  },
  {
    title: 'Push & Press',
    description: 'Preses de pecho, hombros y fondos con volumen alto',
    sets: 4,
    reps: 10,
    isg: 380,
    exercises: 5,
    duration: 60,
    span: '',
    featured: false,
  },
  {
    title: 'Pull Máximo',
    description: 'Dominadas, remos y curls para una espalda ancha',
    sets: 4,
    reps: 12,
    isg: 410,
    exercises: 6,
    duration: 65,
    span: '',
    featured: false,
  },
  {
    title: 'Core de Hierro',
    description: 'Trabajo abdominal y estabilidad de tren inferior',
    sets: 3,
    reps: 15,
    isg: 290,
    exercises: 5,
    duration: 45,
    span: 'sm:col-span-2',
    featured: false,
  },
];

interface CustomRoutine {
  id: number;
  title: string;
  description: string;
  tags: string[];
  days?: { title: string; exercises: { name: string; sets: { kilos: string; repes: string }[] }[] }[];
  exercises?: { name: string; sets: { kilos: string; repes: string }[] }[];
  createdAt: string;
}

interface RoutineCard {
  title: string;
  description: string;
  sets: number;
  reps: number;
  isg: number;
  exercises: number;
  duration: number;
  span: string;
  featured: boolean;
}

function normalizeRoutine(routine: CustomRoutine): RoutineCard {
  const allExercises = routine.days
    ? routine.days.flatMap((d) => d.exercises ?? [])
    : (routine.exercises ?? []);
  const setCounts = allExercises.map((e) => e.sets.length);
  const sets = Math.max(1, ...setCounts);
  const reps = Number(allExercises[0]?.sets[0]?.repes) || 8;
  const isg = 300 + allExercises.length * 50 + sets * 20;
  return {
    title: routine.title,
    description: routine.description,
    sets,
    reps,
    isg,
    exercises: allExercises.length,
    duration: sets * 10,
    span: '',
    featured: false,
  };
}

export default function EntrenamientoPage() {
  const [tab, setTab] = useState<'mine' | 'explore'>('mine');
  const [filter, setFilter] = useState('Todos');
  const [customRoutines, setCustomRoutines] = useState<CustomRoutine[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (Array.isArray(stored)) setCustomRoutines(stored);
    } catch {
      setCustomRoutines([]);
    }
  }, []);

  const filteredCustomRoutines = customRoutines.filter(
    (r) => filter === 'Todos' || r.tags.includes(filter)
  );

  const handleDelete = (id: number) => {
    if (!window.confirm('¿Eliminar esta rutina?')) return;
    const next = customRoutines.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setCustomRoutines(next);
  };

  return (
    <div className="h-full flex flex-col gap-4 min-h-0">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Entrenamiento</h1>
        <Link
          href="/dashboard/entrenamiento/crear"
          className="flex items-center gap-2 rounded-2xl bg-[#EF4444] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#EF4444]/90"
        >
          <Plus className="h-4 w-4" />
          Crear Rutina
        </Link>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTab('mine')}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-medium transition-colors',
            tab === 'mine' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
          )}
        >
          Mis Rutinas
        </button>
        <button
          onClick={() => setTab('explore')}
          className={cn(
            'rounded-full px-5 py-2 text-sm font-medium transition-colors',
            tab === 'explore' ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
          )}
        >
          Explorar
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Filter className="h-4 w-4 flex-shrink-0 text-gray-500" />
        {filters.map((f) => (
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

      {/* Bento Grid of cards (internal scroll) */}
      <div className="grid flex-1 min-h-0 content-start gap-4 overflow-y-auto grid-cols-1 pb-40 sm:grid-cols-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tab === 'mine' && filteredCustomRoutines.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5">
              <Dumbbell className="h-9 w-9 text-white/30" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Aún no tienes rutinas</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-gray-400">
                Crea tu primera rutina personalizada y aparecerá aquí.
              </p>
            </div>
            <Link
              href="/dashboard/entrenamiento/crear"
              className="flex items-center gap-2 rounded-full bg-[#EF4444] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90"
            >
              <Plus className="h-4 w-4" />
              Crear Rutina
            </Link>
          </div>
        ) : tab === 'mine' ? (
          filteredCustomRoutines.map((custom) => (
            <div
              key={custom.id}
              className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0D0D0D] p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 text-gray-300">
                    <Dumbbell className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-gray-400">
                    {custom.days?.length ?? 1} {custom.days?.length === 1 ? 'Día' : 'Días'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs">{normalizeRoutine(custom).duration} min</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white">{custom.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{custom.description}</p>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                <span className="text-lg font-bold text-[#FBBF24]">+{normalizeRoutine(custom).isg} ISG</span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/entrenamiento/crear?id=${custom.id}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-[#FBBF24]/40 hover:text-[#FBBF24]"
                    aria-label={`Editar ${custom.title}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(custom.id)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:border-[#EF4444]/40 hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                    aria-label={`Eliminar ${custom.title}`}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/dashboard/entrenamiento/en-curso?id=${custom.id}`}
                    className="flex h-10 items-center gap-2 rounded-xl bg-[#EF4444] px-4 text-sm font-medium text-white transition-colors hover:bg-[#EF4444]/90"
                  >
                    <Play className="h-4 w-4" />
                    Iniciar
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          routines.map((routine) => (
          <div
            key={routine.title}
            className={cn(
              'flex flex-col gap-4 rounded-3xl border border-white/10 bg-[#0D0D0D] p-5',
              routine.span,
              routine.featured && 'bg-gradient-to-br from-[#0D0D0D] to-[#1c1212] border-[#EF4444]/20'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-2xl',
                    routine.featured ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-white/5 text-gray-300'
                  )}
                >
                  <Dumbbell className="h-5 w-5" />
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-gray-400">
                  {routine.sets} Series x {routine.reps} Reps
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Clock className="h-4 w-4" />
                <span className="text-xs">{routine.duration} min</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">{routine.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{routine.description}</p>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
              <span className="text-lg font-bold text-[#FBBF24]">+{routine.isg} ISG</span>
              <div className="flex items-center gap-2">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-colors hover:text-white"
                  aria-label={`Clonar ${routine.title}`}
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button className="flex h-10 items-center gap-2 rounded-xl bg-[#EF4444] px-4 text-sm font-medium text-white transition-colors hover:bg-[#EF4444]/90">
                  <Play className="h-4 w-4" />
                  Iniciar
                </button>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );
}