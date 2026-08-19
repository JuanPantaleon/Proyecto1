'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Plus, Trash, GripVertical, Search, X, CalendarPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'ranked_fitness_custom_routines';

const tagOptions = ['Fuerza', 'Hipertrofia', 'Full Body', 'PPL'] as const;

const muscleGroups = ['Todos', 'Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Core'] as const;

interface CatalogExercise {
  name: string;
  group: string;
  coefficient: number;
}

const exerciseCatalog: CatalogExercise[] = [
  { name: 'Press de Banca', group: 'Pecho', coefficient: 1.0 },
  { name: 'Press Inclinado', group: 'Pecho', coefficient: 0.9 },
  { name: 'Aperturas con Mancuernas', group: 'Pecho', coefficient: 0.8 },
  { name: 'Fondos en Paralelas', group: 'Pecho', coefficient: 0.9 },
  { name: 'Dominadas', group: 'Espalda', coefficient: 1.1 },
  { name: 'Remo con Barra', group: 'Espalda', coefficient: 1.0 },
  { name: 'Peso Muerto', group: 'Espalda', coefficient: 1.2 },
  { name: 'Jalón al Pecho', group: 'Espalda', coefficient: 0.9 },
  { name: 'Sentadilla Libre', group: 'Piernas', coefficient: 1.2 },
  { name: 'Prensa de Piernas', group: 'Piernas', coefficient: 0.9 },
  { name: 'Peso Muerto Rumano', group: 'Piernas', coefficient: 1.1 },
  { name: 'Zancadas', group: 'Piernas', coefficient: 0.9 },
  { name: 'Press Militar', group: 'Hombros', coefficient: 1.0 },
  { name: 'Elevaciones Laterales', group: 'Hombros', coefficient: 0.8 },
  { name: 'Press Arnold', group: 'Hombros', coefficient: 0.9 },
  { name: 'Curl de Bíceps', group: 'Brazos', coefficient: 0.8 },
  { name: 'Curl Martillo', group: 'Brazos', coefficient: 0.8 },
  { name: 'Extensión de Tríceps', group: 'Brazos', coefficient: 0.8 },
  { name: 'Plancha', group: 'Core', coefficient: 0.8 },
  { name: 'Crunch', group: 'Core', coefficient: 0.8 },
];

interface Set {
  kilos: string;
  repes: string;
  done: boolean;
}

interface Exercise {
  id: number;
  name: string;
  coefficient: number;
  restSeconds: number;
  sets: Set[];
}

interface Day {
  id: number;
  title: string;
  exercises: Exercise[];
}

const REST_OPTIONS = [30, 45, 60, 90, 120, 150, 180];

const newExercise = (): Exercise => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  name: 'Nuevo Ejercicio',
  coefficient: 1.0,
  restSeconds: 90,
  sets: [{ kilos: '', repes: '', done: false }],
});

const initialDays: Day[] = [
  {
    id: 1,
    title: 'Día 1',
    exercises: [
      {
        id: 2,
        name: 'Press de Banca',
        coefficient: 1.0,
        restSeconds: 90,
        sets: [
          { kilos: '60', repes: '12', done: true },
          { kilos: '70', repes: '10', done: true },
        ],
      },
    ],
  },
];

const calcIsg = (coefficient: number, kilos: string, repes: string) => {
  const k = parseFloat(kilos);
  const r = parseFloat(repes);
  if (!k || !r) return 0;
  return Math.round((k * r * coefficient) / 10);
};

export default function CrearRutinaPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>(['Fuerza']);
  const [days, setDays] = useState<Day[]>(initialDays);
  const [activeDayId, setActiveDayId] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [targetExerciseId, setTargetExerciseId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('Todos');

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    setEditingId(Number(id));
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      const found = stored.find((r: { id: number }) => r.id === Number(id));
      if (!found) return;
      setName(found.title === 'Rutina sin nombre' ? '' : found.title);
      setDescription(found.description ?? '');
      setTags(found.tags?.length ? found.tags : ['Fuerza']);
      if (found.days?.length) {
        const loadedDays: Day[] = found.days.map((d: { title: string; exercises: Exercise[] }, i: number) => ({
          id: Date.now() + i,
          title: d.title || `Día ${i + 1}`,
          exercises: d.exercises.map((e) => ({
            id: Date.now() + i * 100 + Math.floor(Math.random() * 100),
            name: e.name,
            coefficient: 1.0,
            restSeconds: e.restSeconds ?? 90,
            sets: e.sets.map((s) => ({ kilos: s.kilos, repes: s.repes, done: false })),
          })),
        }));
        setDays(loadedDays);
        setActiveDayId(loadedDays[0].id);
      }
    } catch {
      // datos corruptos en localStorage: se ignora
    }
  }, []);

  const activeDay = days.find((d) => d.id === activeDayId) ?? days[0];

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addDay = () => {
    const day: Day = { id: Date.now(), title: `Día ${days.length + 1}`, exercises: [] };
    setDays((prev) => [...prev, day]);
    setActiveDayId(day.id);
  };

  const removeDay = (id: number) => {
    setDays((prev) => {
      const next = prev.filter((d) => d.id !== id);
      if (next.length === 0) {
        const day: Day = { id: Date.now(), title: 'Día 1', exercises: [] };
        setActiveDayId(day.id);
        return [day];
      }
      if (activeDayId === id) setActiveDayId(next[next.length - 1].id);
      return next;
    });
  };

  const renameDay = (id: number, value: string) => {
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, title: value } : d)));
  };

  const addExercise = (dayId: number) => {
    const exercise = newExercise();
    setDays((prev) => prev.map((d) => (d.id === dayId ? { ...d, exercises: [...d.exercises, exercise] } : d)));
    setTargetExerciseId(exercise.id);
    setSearchTerm('');
    setGroupFilter('Todos');
    setSelectorOpen(true);
  };

  const removeExercise = (dayId: number, exerciseId: number) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) } : d))
    );
  };

  const addSet = (dayId: number, exerciseId: number) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exerciseId ? { ...e, sets: [...e.sets, { kilos: '', repes: '', done: false }] } : e
              ),
            }
          : d
      )
    );
  };

  const removeSet = (dayId: number, exerciseId: number, index: number) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exerciseId ? { ...e, sets: e.sets.filter((_, i) => i !== index) } : e
              ),
            }
          : d
      )
    );
  };

  const toggleSet = (dayId: number, exerciseId: number, index: number) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exerciseId
                  ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, done: !s.done } : s)) }
                  : e
              ),
            }
          : d
      )
    );
  };

  const updateSet = (dayId: number, exerciseId: number, index: number, field: 'kilos' | 'repes', value: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.id === exerciseId
                  ? { ...e, sets: e.sets.map((s, i) => (i === index ? { ...s, [field]: value } : s)) }
                  : e
              ),
            }
          : d
      )
    );
  };

  const updateExerciseName = (dayId: number, exerciseId: number, value: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => (e.id === exerciseId ? { ...e, name: value } : e)) }
          : d
      )
    );
  };

  const updateRestSeconds = (dayId: number, exerciseId: number, value: number) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => (e.id === exerciseId ? { ...e, restSeconds: value } : e)) }
          : d
      )
    );
  };

  const openSelector = (exerciseId: number) => {
    setTargetExerciseId(exerciseId);
    setSearchTerm('');
    setGroupFilter('Todos');
    setSelectorOpen(true);
  };

  const selectExercise = (catalogExercise: CatalogExercise) => {
    if (targetExerciseId !== null) {
      setDays((prev) =>
        prev.map((d) =>
          d.exercises.some((e) => e.id === targetExerciseId)
            ? {
                ...d,
                exercises: d.exercises.map((e) =>
                  e.id === targetExerciseId
                    ? { ...e, name: catalogExercise.name, coefficient: catalogExercise.coefficient }
                    : e
                ),
              }
            : d
        )
      );
    }
    setSelectorOpen(false);
    setTargetExerciseId(null);
  };

  const filteredCatalog = exerciseCatalog.filter(
    (e) =>
      (groupFilter === 'Todos' || e.group === groupFilter) &&
      e.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIsg = days.reduce(
    (sum, d) =>
      sum +
      d.exercises.reduce(
        (s, e) => s + e.sets.reduce((setSum, set) => setSum + calcIsg(e.coefficient, set.kilos, set.repes), 0),
        0
      ),
    0
  );

  const handleSave = () => {
    const routine = {
      id: editingId ?? Date.now(),
      title: name.trim() || 'Rutina sin nombre',
      description: description.trim(),
      tags,
      days: days.map((day) => ({
        title: day.title,
        exercises: day.exercises.map((exercise) => ({
          name: exercise.name,
          restSeconds: exercise.restSeconds,
          sets: exercise.sets.map((set) => ({ kilos: set.kilos, repes: set.repes })),
        })),
      })),
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      let next: unknown[];
      if (Array.isArray(existing)) {
        if (editingId !== null) {
          next = existing.map((r) => (r?.id === editingId ? routine : r));
        } else {
          next = [routine, ...existing];
        }
      } else {
        next = [routine];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([routine]));
    }

    router.push('/dashboard/entrenamiento');
  };

  return (
    <div className="h-full min-h-0 flex flex-col bg-black text-white">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* Header Fijo */}
        <header className="sticky top-0 z-50 flex items-center justify-between border-b border-white/5 bg-black/80 px-6 pb-4 pt-6 backdrop-blur-xl">
          <button
            onClick={() => router.push('/dashboard/entrenamiento')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#0D0D0D] text-white/60 transition-all hover:text-white"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-white">
            {editingId ? 'Editar Rutina' : 'Nueva Rutina'}
          </h1>
          <button
            onClick={handleSave}
            className="rounded-full bg-[#EF4444] px-5 py-2 font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all hover:bg-[#EF4444]/90"
          >
            Guardar
          </button>
        </header>

        {/* Contenido */}
        <div className="space-y-8 px-6 pb-40 pt-8">
          {/* Información */}
          <section className="space-y-6">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Full Body 1 Día..."
              className="w-full bg-transparent text-4xl font-black tracking-tighter text-white outline-none placeholder:text-white/20 md:text-5xl"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción y objetivo"
              rows={3}
              className="w-full resize-none rounded-3xl border border-white/5 bg-[#0D0D0D] p-5 text-sm text-white/70 outline-none transition-colors placeholder:text-white/30 focus:border-white/20"
            />

            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {tagOptions.map((tag) => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all',
                      active
                        ? 'border border-white/20 bg-white/10 text-white'
                        : 'border border-white/5 bg-white/5 text-white/50'
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Días de Entrenamiento */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">
                Días de Entrenamiento
              </h2>
              <div className="flex items-center gap-2 rounded-2xl border border-[#FBBF24]/20 bg-[#0D0D0D] px-4 py-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  ISG Proyectado
                </span>
                <span className="text-base font-black text-[#FBBF24]">+{totalIsg}</span>
              </div>
            </div>

            {/* Tabs de días */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {days.map((day) => (
                <div
                  key={day.id}
                  className={cn(
                    'flex flex-shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all',
                    day.id === activeDayId
                      ? 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]'
                      : 'border-white/5 bg-white/5 text-white/50'
                  )}
                >
                  <button onClick={() => setActiveDayId(day.id)} className="max-w-[10rem] truncate">
                    {day.title || `Día ${days.indexOf(day) + 1}`}
                  </button>
                  {days.length > 1 && (
                    <button
                      onClick={() => removeDay(day.id)}
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/60 transition-all hover:bg-[#EF4444] hover:text-white"
                      aria-label={`Eliminar ${day.title}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addDay}
                className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-dashed border-white/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/60 transition-all hover:border-[#EF4444]/50 hover:text-[#EF4444]"
              >
                <CalendarPlus className="h-4 w-4" />
                Agregar Día
              </button>
            </div>

            {activeDay && (
              <div className="space-y-4">
                {/* Título del día activo */}
                <input
                  value={activeDay.title}
                  onChange={(e) => renameDay(activeDay.id, e.target.value)}
                  placeholder="Ej. Lunes - Pierna"
                  className="w-full bg-transparent text-2xl font-bold tracking-tight text-white outline-none placeholder:text-white/20"
                />

                {/* Ejercicios del día */}
                {activeDay.exercises.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-dashed border-white/10 py-10 text-center">
                    <p className="text-sm text-white/40">Este día aún no tiene ejercicios</p>
                    <button
                      onClick={() => addExercise(activeDay.id)}
                      className="flex items-center gap-2 rounded-full bg-[#EF4444] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90"
                    >
                      <Plus className="h-4 w-4" />
                      Agregar Ejercicio
                    </button>
                  </div>
                ) : (
                  activeDay.exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="relative space-y-5 rounded-[2rem] border border-white/5 bg-[#0D0D0D] p-5 shadow-lg"
                    >
                      {/* Nombre del ejercicio */}
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 flex-shrink-0 text-white/20" />
                        <input
                          value={exercise.name}
                          onChange={(e) => updateExerciseName(activeDay.id, exercise.id, e.target.value)}
                          className="w-full bg-transparent text-xl font-bold text-white outline-none"
                        />
                        <button
                          onClick={() => removeExercise(activeDay.id, exercise.id)}
                          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white/30 transition-all hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
                          aria-label={`Eliminar ${exercise.name}`}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => openSelector(exercise.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold uppercase tracking-widest text-white/50 transition-all hover:border-[#EF4444]/40 hover:text-[#EF4444]"
                      >
                        <Search className="h-4 w-4" />
                        Seleccionar Ejercicio
                      </button>

                      {/* Descanso entre series */}
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                          Descanso entre series
                        </span>
                        <select
                          value={exercise.restSeconds}
                          onChange={(e) => updateRestSeconds(activeDay.id, exercise.id, Number(e.target.value))}
                          className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-center text-sm font-bold text-[#FBBF24] outline-none transition-colors focus:border-[#EF4444]"
                          aria-label="Tiempo de descanso"
                        >
                          {REST_OPTIONS.map((secs) => (
                            <option key={secs} value={secs}>
                              {secs}s
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tabla de series */}
                      <div className="grid grid-cols-[2rem_1fr_1fr_2.75rem_2rem_2rem] items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                          Serie
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                          Kilos
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                          Repes
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                          ISG
                        </span>
                        <span />
                        <span />
                        {exercise.sets.map((set, index) => {
                          const isg = calcIsg(exercise.coefficient, set.kilos, set.repes);
                          return (
                            <div key={index} className="contents">
                              <span className="flex items-center text-sm font-bold text-white/40">
                                {index + 1}
                              </span>
                              <input
                                type="number"
                                value={set.kilos}
                                onChange={(e) => updateSet(activeDay.id, exercise.id, index, 'kilos', e.target.value)}
                                placeholder="kg"
                                className="w-full rounded-xl border border-white/5 bg-black/50 py-2 text-center font-bold text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#EF4444]"
                              />
                              <input
                                type="number"
                                value={set.repes}
                                onChange={(e) => updateSet(activeDay.id, exercise.id, index, 'repes', e.target.value)}
                                placeholder="reps"
                                className="w-full rounded-xl border border-white/5 bg-black/50 py-2 text-center font-bold text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#EF4444]"
                              />
                              <span className="flex items-center justify-center text-xs font-bold text-[#FBBF24]">
                                {isg > 0 ? `+${isg}` : ''}
                              </span>
                              <button
                                onClick={() => toggleSet(activeDay.id, exercise.id, index)}
                                className={cn(
                                  'flex h-9 w-9 items-center justify-center rounded-xl transition-all',
                                  set.done
                                    ? 'bg-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                                    : 'border border-white/5 bg-black/50 text-white/30 hover:text-white'
                                )}
                                aria-label={set.done ? 'Marcar como pendiente' : 'Marcar como completada'}
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => removeSet(activeDay.id, exercise.id, index)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-white/30 transition-all hover:text-[#EF4444]"
                                aria-label="Eliminar serie"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => addSet(activeDay.id, exercise.id)}
                        className="text-xs font-bold uppercase tracking-widest text-[#EF4444] transition-all hover:text-white"
                      >
                        + Agregar serie
                      </button>
                    </div>
                  ))
                )}

                {activeDay.exercises.length > 0 && (
                  <button
                    onClick={() => addExercise(activeDay.id)}
                    className="flex w-full items-center justify-center gap-2 rounded-[2rem] border-2 border-dashed border-white/10 py-4 font-bold uppercase tracking-widest text-white/50 transition-all hover:border-[#EF4444]/50 hover:bg-[#EF4444]/5 hover:text-[#EF4444]"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar Ejercicio
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Bottom Sheet - Selector de Ejercicios */}
      {selectorOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => {
            setSelectorOpen(false);
            setTargetExerciseId(null);
          }}
        >
          <div
            className="flex max-h-[75dvh] w-full max-w-lg flex-col rounded-t-[2rem] border-t border-white/10 bg-[#0D0D0D] p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight text-white">Seleccionar Ejercicio</h2>
              <button
                onClick={() => {
                  setSelectorOpen(false);
                  setTargetExerciseId(null);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-white/50 transition-all hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ejercicio..."
                className="w-full rounded-2xl border border-white/10 bg-black/50 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#EF4444]"
              />
            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
              {muscleGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => setGroupFilter(group)}
                  className={cn(
                    'flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest transition-all',
                    groupFilter === group
                      ? 'border border-white/20 bg-white/10 text-white'
                      : 'border border-white/5 bg-white/5 text-white/50'
                  )}
                >
                  {group}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto scrollbar-hide">
              {filteredCatalog.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/40">Sin resultados</p>
              ) : (
                filteredCatalog.map((exercise) => (
                  <button
                    key={exercise.name}
                    onClick={() => selectExercise(exercise)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-all hover:border-[#EF4444]/40 hover:bg-[#EF4444]/5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{exercise.name}</p>
                      <p className="text-xs text-white/40">{exercise.group}</p>
                    </div>
                    <span className="text-xs font-bold text-[#FBBF24]">x{exercise.coefficient}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}