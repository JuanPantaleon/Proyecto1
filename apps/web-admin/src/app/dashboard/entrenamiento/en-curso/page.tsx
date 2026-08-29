'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Play, Check, X, Plus, Dumbbell, Timer, Flame, QrCode, ShieldCheck, Zap, ShieldAlert, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionQR } from '@/components/dashboard/session-qr';
import { resolveLiftKind, validateLiftRatio, estimateOneRepMax, REQUIRES_VIDEO_LABEL } from '@ranked-fitness/shared';
import { useRole } from '@/lib/roles';

const STORAGE_KEY = 'ranked_fitness_custom_routines';
const SESSION_KEY = 'ranked_fitness_session';
const MODE_KEY = 'ranked_fitness_session_mode';

type SetStatus = 'pending' | 'done' | 'failed';
type SessionMode = 'casual' | 'competitivo';

interface SetData {
  kilos: string;
  repes: string;
}

interface SessionExercise {
  id: number;
  name: string;
  coefficient: number;
  restSeconds: number;
  status: SetStatus;
  requiresVideo?: boolean;
  sets: SetData[];
}

interface SessionDay {
  id: number;
  title: string;
  exercises: SessionExercise[];
}

type View = 'session' | 'modo';

const calcIsg = (coefficient: number, kilos: string, repes: string) => {
  const k = parseFloat(kilos);
  const r = parseFloat(repes);
  if (!k || !r) return 0;
  return Math.round((k * r * coefficient) / 10);
};

const STATUS_CLASS: Record<SetStatus, string> = {
  pending: 'border-white/5 bg-[#0D0D0D]',
  done: 'border-green-500/50 bg-green-950/30 text-green-200',
  failed: 'border-yellow-500/50 bg-yellow-950/30 text-yellow-200',
};

export default function SesionEnCursoPage() {
  const [view, setView] = useState<View>('modo');
  const [mode, setMode] = useState<SessionMode | null>(null);
  const [sessionDay, setSessionDay] = useState<SessionDay | null>(null);
  const [empty, setEmpty] = useState(false);
  const [validationExerciseId, setValidationExerciseId] = useState<number | null>(null);
  const [qrExercise, setQrExercise] = useState<{ exercise: SessionExercise; isg: number } | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [antiCheat, setAntiCheat] = useState<{ exerciseId: number; message: string } | null>(null);

  const router = useRouter();
  const { profile } = useRole();
  const playerWeightKg = 'role' in profile && profile.role === 'player' ? profile.weightKg : 0;

  useEffect(() => {
    const storedMode = sessionStorage.getItem(MODE_KEY) as SessionMode | null;
    if (storedMode === 'casual' || storedMode === 'competitivo') {
      setMode(storedMode);
      setView('session');
    }
  }, []);

  const chooseMode = (next: SessionMode) => {
    setMode(next);
    sessionStorage.setItem(MODE_KEY, next);
    setView('session');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const loadRoutine = (routine: {
      days: { title: string; exercises: { name: string; restSeconds?: number; sets: { kilos: string; repes: string }[] }[] }[];
    }) => {
      const firstDay = routine.days[0];
      const day: SessionDay = {
        id: Date.now(),
        title: firstDay?.title || 'Día 1',
        exercises: (firstDay?.exercises ?? []).map((e, i) => ({
          id: Date.now() + i + 1,
          name: e.name,
          coefficient: 1.0,
          restSeconds: e.restSeconds ?? 90,
          status: 'pending' as SetStatus,
          sets: e.sets.map((s) => ({ kilos: s.kilos, repes: s.repes })),
        })),
      };
      setSessionDay(day);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(day));
    };

    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SessionDay;
        setSessionDay(parsed);
        return;
      }

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(stored) || stored.length === 0) {
        setEmpty(true);
        return;
      }
      const routine = id ? stored.find((r: { id: number }) => String(r.id) === String(id)) : stored[0];
      if (!routine?.days?.length) {
        setEmpty(true);
        return;
      }
      loadRoutine(routine);
    } catch {
      setEmpty(true);
    }
  }, []);

  useEffect(() => {
    if (sessionDay) sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionDay));
  }, [sessionDay]);

  const activeDay = sessionDay;

  const updateSet = (exerciseId: number, setIndex: number, field: 'kilos' | 'repes', value: string) => {
    setSessionDay((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) =>
              e.id === exerciseId
                ? { ...e, sets: e.sets.map((s, i) => (i === setIndex ? { ...s, [field]: value } : s)) }
                : e
            ),
          }
        : prev
    );
  };

  const addSet = (exerciseId: number) => {
    setSessionDay((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) =>
              e.id === exerciseId
                ? { ...e, sets: [...e.sets, { kilos: '', repes: '' }] }
                : e
            ),
          }
        : prev
    );
  };

  const startExercise = (exercise: SessionExercise) => {
    const params = new URLSearchParams({
      modo: 'ejercicio',
      exKey: `legacy-${exercise.id}`,
      nombre: exercise.name,
      metricType: 'REPS_WEIGHT',
      segundos: '40',
    });
    router.push(`/dashboard/temporizador?${params.toString()}`);
  };

  const confirmExercise = (answer: 'done' | 'failed') => {
    if (!validationExerciseId || !sessionDay) return;
    const exercise = sessionDay.exercises.find((e) => e.id === validationExerciseId);
    if (!exercise) return;

    let requiresVideo = false;
    if (answer === 'done' && playerWeightKg > 0) {
      const liftKind = resolveLiftKind(exercise.name);
      if (liftKind !== 'other') {
        const best1RM = exercise.sets.reduce((max, set) => {
          const k = parseFloat(set.kilos);
          const r = parseFloat(set.repes);
          if (!k || !r) return max;
          return Math.max(max, estimateOneRepMax(k, r));
        }, 0);
        const result = validateLiftRatio({
          liftKind,
          estimated1RMKg: best1RM,
          bodyWeightKg: playerWeightKg,
        });
        if (result.status === 'blocked') {
          setValidationExerciseId(null);
          setAntiCheat({ exerciseId: exercise.id, message: result.message });
          return;
        }
        requiresVideo = result.status === 'requires_video';
      }
    }

    setSessionDay((prev) =>
      prev
        ? {
            ...prev,
            exercises: prev.exercises.map((e) =>
              e.id === validationExerciseId
                ? { ...e, status: answer, requiresVideo: answer === 'done' ? requiresVideo : false }
                : e
            ),
          }
        : prev
    );
    setValidationExerciseId(null);
    if (answer === 'done') {
      const isg = exercise.sets.reduce(
        (sum, set) => sum + calcIsg(exercise.coefficient, set.kilos, set.repes),
        0
      );
      setQrExercise({ exercise: { ...exercise, requiresVideo }, isg });
    }
  };

  const totalIsg =
    activeDay?.exercises.reduce(
      (sum, e) => sum + e.sets.reduce((s, set) => s + calcIsg(e.coefficient, set.kilos, set.repes), 0),
      0
    ) ?? 0;

  const mainExercise = activeDay?.exercises[0]?.name ?? 'Sin ejercicio';
  const sessionDate = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const qrPayload = `SESION|player-1|Juan Perez|${sessionDate}|${mainExercise}|${totalIsg}`;

  if (empty) {
    return (
      <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <Dumbbell className="h-12 w-12 text-white/20" />
          <h1 className="text-xl font-bold text-white">Sin rutina activa</h1>
          <p className="max-w-xs text-sm text-white/40">
            Crea o selecciona una rutina para comenzar una sesión de entrenamiento.
          </p>
          <Link
            href="/dashboard/entrenamiento/crear"
            className="rounded-full bg-[#EF4444] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90"
          >
            Crear rutina
          </Link>
        </div>
      </div>
    );
  }

  if (view === 'modo') {
    return (
      <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-10">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">
              Antes de comenzar
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">Modo de la sesión</h1>
            <p className="mx-auto mt-2 max-w-xs text-sm text-white/40">
              Elegí cómo se registrarán tus puntos en el ranking.
            </p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <button
              onClick={() => chooseMode('casual')}
              className="group w-full rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6 text-left transition-all hover:border-[#FBBF24]/50 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBBF24]/10 text-[#FBBF24]">
                  <Zap className="h-6 w-6" />
                </span>
                <span className="rounded-full border border-[#FBBF24]/40 bg-[#FBBF24]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]">
                  Casual
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">Entrenamiento Casual</h2>
              <p className="mt-1 text-sm text-white/40">
                Los puntos suman únicamente al <span className="font-bold text-white/70">Ranking Casual</span>. Sin validación.
              </p>
            </button>

            <button
              onClick={() => chooseMode('competitivo')}
              className="group w-full rounded-[2rem] border border-[#EF4444]/30 bg-[#0D0D0D] p-6 text-left transition-all hover:border-[#EF4444]/70 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EF4444]/10 text-[#EF4444]">
                  <ShieldCheck className="h-6 w-6" />
                </span>
                <span className="rounded-full border border-[#EF4444]/50 bg-[#EF4444]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
                  Competitivo
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">Entrenamiento Competitivo</h2>
              <p className="mt-1 text-sm text-white/40">
                Los puntos suman al <span className="font-bold text-white/70">Casual y Competitivo</span>. Requiere validación por QR por ejercicio.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      {/* Header Fijo */}
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black/80 px-6 pb-4 pt-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/entrenamiento"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#0D0D0D] text-white/60 transition-all hover:text-white"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Sesión en Curso</h1>
            <p className="text-xs text-white/40">{activeDay?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('modo')}
            className={cn(
              'flex items-center gap-1.5 rounded-2xl border px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all',
              mode === 'competitivo'
                ? 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]'
                : 'border-[#FBBF24]/40 bg-[#FBBF24]/10 text-[#FBBF24]'
            )}
            aria-label="Cambiar modo de sesión"
          >
            {mode === 'competitivo' ? <ShieldCheck className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {mode === 'competitivo' ? 'Competitivo' : 'Casual'}
          </button>
          <button
            onClick={() => setQrOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FBBF24]/30 bg-[#0D0D0D] text-[#FBBF24] transition-all hover:border-[#FBBF24]/60"
            aria-label="Certificar sesión con QR"
          >
            <QrCode className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 rounded-2xl border border-[#FBBF24]/20 bg-[#0D0D0D] px-4 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">ISG</span>
            <span className="text-base font-black text-[#FBBF24]">+{totalIsg}</span>
          </div>
        </div>
      </header>

      {/* Contenido con scroll */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-48 pt-6 scrollbar-hide">
        {activeDay?.exercises.map((exercise) => {
          const isg = exercise.sets.reduce(
            (sum, set) => sum + calcIsg(exercise.coefficient, set.kilos, set.repes),
            0
          );
          return (
            <div
              key={exercise.id}
              className={cn('space-y-4 rounded-[2rem] border p-5 shadow-lg', STATUS_CLASS[exercise.status])}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-lg font-bold text-white">{exercise.name}</h3>
                  <p className="mt-0.5 text-xs text-white/40">
                    {exercise.sets.length} series · {exercise.restSeconds}s descanso · +{isg} ISG
                  </p>
                </div>
                <Dumbbell className="h-5 w-5 flex-shrink-0 text-white/20" />
              </div>

              {exercise.requiresVideo && (
                <span className="flex w-fit items-center gap-1.5 rounded-full border border-[#FBBF24]/50 bg-[#FBBF24]/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]">
                  <Video className="h-3.5 w-3.5" />
                  {REQUIRES_VIDEO_LABEL}
                </span>
              )}

              <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Serie</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Kilos</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Repes</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">ISG</span>

                {exercise.sets.map((set, index) => {
                  const setIsg = calcIsg(exercise.coefficient, set.kilos, set.repes);
                  return (
                    <div key={index} className="contents">
                      <span className="flex items-center text-sm font-black text-white/30">{index + 1}</span>
                      <input
                        type="number"
                        value={set.kilos}
                        onChange={(e) => updateSet(exercise.id, index, 'kilos', e.target.value)}
                        placeholder="kg"
                        className="w-full rounded-xl border border-white/5 bg-black/50 py-2 text-center font-bold text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#EF4444]"
                      />
                      <input
                        type="number"
                        value={set.repes}
                        onChange={(e) => updateSet(exercise.id, index, 'repes', e.target.value)}
                        placeholder="reps"
                        className="w-full rounded-xl border border-white/5 bg-black/50 py-2 text-center font-bold text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#EF4444]"
                      />
                      <span className="flex items-center justify-center text-xs font-bold text-[#FBBF24]">
                        {setIsg > 0 ? `+${setIsg}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => addSet(exercise.id)}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-white/40 transition-all hover:text-[#EF4444]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Agregar serie
                </button>
                <Flame className="h-4 w-4 text-[#EF4444]" />
              </div>

              {exercise.status === 'done' ? (
                <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-green-500/50 bg-green-950/40 py-3.5 text-sm font-bold uppercase tracking-widest text-green-200">
                  <Check className="h-4 w-4" />
                  Ejercicio completado
                </div>
              ) : exercise.status === 'failed' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-yellow-500/50 bg-yellow-950/40 py-3.5 text-sm font-bold uppercase tracking-widest text-yellow-200">
                    <X className="h-4 w-4" />
                    No realizado
                  </div>
                  <button
                    onClick={() => startExercise(exercise)}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90"
                  >
                    <Play className="h-4 w-4" />
                    Reintentar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startExercise(exercise)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90"
                >
                  <Play className="h-4 w-4" />
                  Comenzar
                </button>
              )}
            </div>
          );
        })}

        {activeDay && activeDay.exercises.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 py-10 text-center">
            <p className="text-sm text-white/40">Este día no tiene ejercicios</p>
          </div>
        )}
      </div>

      {/* Diálogo de Validación */}
      {validationExerciseId !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setValidationExerciseId(null)}
        >
          <div
            className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
              <Timer className="h-7 w-7 text-[#EF4444]" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">¿Se realizó el ejercicio?</h2>
            <p className="mt-1 text-sm text-white/40">
              Marca el resultado para continuar con tu sesión.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => confirmExercise('done')}
                className="rounded-2xl border border-green-500/50 bg-green-950/40 py-3.5 text-sm font-bold uppercase tracking-widest text-green-200 transition-all hover:bg-green-900/40"
              >
                Sí
              </button>
              <button
                onClick={() => confirmExercise('failed')}
                className="rounded-2xl border border-yellow-500/50 bg-yellow-950/40 py-3.5 text-sm font-bold uppercase tracking-widest text-yellow-200 transition-all hover:bg-yellow-900/40"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR de Certificación */}
      {qrOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setQrOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <SessionQR
              payload={qrPayload}
              athleteName="Juan Pérez"
              athleteId="player-1"
              date={sessionDate}
              mainExercise={mainExercise}
              isgScore={totalIsg}
            />
          </div>
        </div>
      )}

      {/* Modal QR de Certificación del Ejercicio */}
      {qrExercise && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
          onClick={() => setQrExercise(null)}
        >
          <div
            className="w-full max-w-md overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <SessionQR
              title="QR de Certificación del Ejercicio"
              payload={`EXERCISE|player-1|Juan Perez|${qrExercise.exercise.name}|${qrExercise.exercise.sets.length} series|+${qrExercise.isg}${qrExercise.exercise.requiresVideo ? '|REQUIERE_VIDEO' : ''}`}
              athleteName="Juan Pérez"
              athleteId="player-1"
              date={sessionDate}
              mainExercise={qrExercise.exercise.name}
              isgScore={qrExercise.isg}
            />
          </div>
        </div>
      )}

      {/* Modal de Bloqueo Anti-Trampa */}
      {antiCheat && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setAntiCheat(null)}
        >
          <div
            className="w-full max-w-sm rounded-[2rem] border border-[#EF4444]/40 bg-[#0D0D0D] p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#EF4444]/40 bg-[#EF4444]/10">
              <ShieldAlert className="h-7 w-7 text-[#EF4444]" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-white">Registro bloqueado</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/50">{antiCheat.message}</p>
            <button
              onClick={() => setAntiCheat(null)}
              className="mt-6 w-full rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}