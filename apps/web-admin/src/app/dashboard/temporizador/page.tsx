'use client';

import { Suspense, useEffect, useReducer, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play, Pause, RotateCcw, Plus, Minus, Check, Flame, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MetricType } from '@ranked-fitness/shared';

type Fase = 'inactivo' | 'preparacion' | 'ejercicio' | 'descanso';

interface State {
  tiempoEjercicio: number;
  tiempoDescanso: number;
  seriesTotales: number;
  serieActual: number;
  fase: Fase;
  tiempoRestante: number;
  isRunning: boolean;
  exerciseMode: boolean;
  exerciseName: string;
  exerciseKey: string;
  exerciseMetricType: MetricType | null;
  exerciseDone: boolean;
  exerciseFailure: boolean;
}

type Action =
  | { type: 'TICK' }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'ADJUST'; phase: 'series' | 'ejercicio' | 'descanso'; delta: number }
  | { type: 'SETUP_EXERCISE'; name: string; key: string; metricType: MetricType | null; seconds: number }
  | { type: 'STOP_STOPWATCH' }
  | { type: 'TOGGLE_FAILURE' }
  | { type: 'RETRY' };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const initialState: State = {
  tiempoEjercicio: 10,
  tiempoDescanso: 10,
  seriesTotales: 3,
  serieActual: 1,
  fase: 'inactivo',
  tiempoRestante: 10,
  isRunning: false,
  exerciseMode: false,
  exerciseName: '',
  exerciseKey: '',
  exerciseMetricType: null,
  exerciseDone: false,
  exerciseFailure: false,
};

const isStopwatch = (state: State) =>
  state.exerciseMetricType === 'REPS_WEIGHT' ||
  state.exerciseMetricType === 'REPS_ONLY' ||
  state.exerciseMetricType === 'TO_FAILURE';

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TICK': {
      if (state.fase === 'inactivo' || !state.isRunning) return state;
      if (isStopwatch(state) && state.fase === 'ejercicio') {
        return { ...state, tiempoRestante: state.tiempoRestante + 1 };
      }
      const restante = state.tiempoRestante - 1;
      if (restante > 0) return { ...state, tiempoRestante: restante };

      switch (state.fase) {
        case 'preparacion':
          return {
            ...state,
            fase: 'ejercicio',
            tiempoRestante: isStopwatch(state) ? 0 : state.tiempoEjercicio,
          };
        case 'ejercicio':
          if (state.exerciseMode) {
            return {
              ...state,
              serieActual: 1,
              fase: 'inactivo',
              isRunning: false,
              tiempoRestante: isStopwatch(state) ? 0 : state.tiempoEjercicio,
              exerciseDone: true,
            };
          }
          if (state.serieActual < state.seriesTotales) {
            return { ...state, fase: 'descanso', tiempoRestante: state.tiempoDescanso };
          }
          return {
            ...state,
            serieActual: 1,
            fase: 'inactivo',
            isRunning: false,
            tiempoRestante: state.tiempoEjercicio,
          };
        case 'descanso':
          if (state.serieActual < state.seriesTotales) {
            return {
              ...state,
              serieActual: state.serieActual + 1,
              fase: 'preparacion',
              tiempoRestante: 5,
            };
          }
          return {
            ...state,
            serieActual: 1,
            fase: 'inactivo',
            isRunning: false,
            tiempoRestante: state.tiempoEjercicio,
          };
        default:
          return state;
      }
    }

    case 'START': {
      if (state.exerciseMode && state.exerciseDone) return state;
      if (state.fase === 'inactivo') {
        return { ...state, fase: 'preparacion', tiempoRestante: 5, isRunning: true };
      }
      return { ...state, isRunning: true };
    }

    case 'PAUSE':
      return { ...state, isRunning: false };

    case 'STOP_STOPWATCH':
      return { ...state, isRunning: false, exerciseDone: true };

    case 'RESET':
      return state.exerciseMode
        ? {
            ...state,
            fase: 'inactivo',
            isRunning: false,
            tiempoRestante: isStopwatch(state) ? 0 : state.tiempoEjercicio,
            exerciseDone: false,
            exerciseFailure: false,
          }
        : { ...initialState };

    case 'ADJUST': {
      if (action.phase === 'series') {
        return { ...state, seriesTotales: clamp(state.seriesTotales + action.delta, 1, 10) };
      }
      if (action.phase === 'ejercicio' || action.phase === 'descanso') {
        const base = action.phase === 'ejercicio' ? state.tiempoEjercicio : state.tiempoDescanso;
        const next = clamp(base + action.delta, 5, 3600);
        const configField = action.phase === 'ejercicio' ? 'tiempoEjercicio' : 'tiempoDescanso';
        return {
          ...state,
          [configField]: next,
          ...(state.fase === action.phase && !state.isRunning ? { tiempoRestante: next } : {}),
        };
      }
      return state;
    }

    case 'SETUP_EXERCISE':
      return {
        ...initialState,
        exerciseMode: true,
        exerciseName: action.name,
        exerciseKey: action.key,
        exerciseMetricType: action.metricType,
        tiempoEjercicio: action.seconds,
        tiempoRestante: action.seconds,
      };

    case 'TOGGLE_FAILURE':
      return { ...state, exerciseFailure: !state.exerciseFailure };

    case 'RETRY':
      return {
        ...state,
        exerciseDone: false,
        exerciseFailure: false,
        fase: 'inactivo',
        isRunning: false,
        tiempoRestante: isStopwatch(state) ? 0 : state.tiempoEjercicio,
      };

    default:
      return state;
  }
}

function buildInitialState(searchParams: URLSearchParams): State {
  const modo = searchParams.get('modo');
  const exKey = searchParams.get('exKey');
  if (modo === 'ejercicio' && exKey) {
    const metricType = searchParams.get('metricType') as MetricType | null;
    const stopwatch =
      metricType === 'REPS_WEIGHT' ||
      metricType === 'REPS_ONLY' ||
      metricType === 'TO_FAILURE';
    const seconds = stopwatch ? 0 : clamp(Number(searchParams.get('segundos')) || 30, 5, 3600);
    return {
      ...initialState,
      exerciseMode: true,
      exerciseName: searchParams.get('nombre') || 'Ejercicio',
      exerciseKey: exKey,
      exerciseMetricType: metricType,
      tiempoEjercicio: seconds,
      tiempoRestante: seconds,
    };
  }
  return initialState;
}

const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const FASE_STYLES: Record<Fase, { color: string; label: string }> = {
  inactivo: { color: '#FFFFFF', label: 'Listo' },
  preparacion: { color: '#38BDF8', label: '¡Prepárate!' },
  ejercicio: { color: '#EF4444', label: '¡A Entrenar!' },
  descanso: { color: '#FBBF24', label: 'Descanso' },
};

function DurationEditor({
  seconds,
  editing,
  onStartEdit,
  onConfirm,
}: {
  seconds: number;
  editing: boolean;
  onStartEdit: () => void;
  onConfirm: (seconds: number) => void;
}) {
  const [min, setMin] = useState(Math.floor(seconds / 60));
  const [sec, setSec] = useState(seconds % 60);

  useEffect(() => {
    if (editing) {
      setMin(Math.floor(seconds / 60));
      setSec(seconds % 60);
    }
  }, [editing, seconds]);

  if (!editing) {
    return (
      <button
        onClick={onStartEdit}
        className="mt-2 block text-4xl font-black tracking-tighter text-white transition-colors hover:text-white/80"
        aria-label="Editar duración"
      >
        {formatTime(seconds)}
      </button>
    );
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <select
        value={min}
        onChange={(e) => setMin(Number(e.target.value))}
        className="appearance-none rounded-xl border border-white/10 bg-black/50 px-2 py-2 text-center text-xl font-bold text-white outline-none"
        aria-label="Minutos"
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>
            {String(i).padStart(2, '0')}
          </option>
        ))}
      </select>
      <span className="text-xl font-bold text-white/40">:</span>
      <select
        value={sec}
        onChange={(e) => setSec(Number(e.target.value))}
        className="appearance-none rounded-xl border border-white/10 bg-black/50 px-2 py-2 text-center text-xl font-bold text-white outline-none"
        aria-label="Segundos"
      >
        {Array.from({ length: 60 }, (_, i) => (
          <option key={i} value={i}>
            {String(i).padStart(2, '0')}
          </option>
        ))}
      </select>
      <button
        onClick={() => onConfirm(clamp(min * 60 + sec, 5, 3600))}
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#EF4444] text-white transition-all hover:bg-[#EF4444]/90"
        aria-label="Confirmar duración"
      >
        <Check className="h-4 w-4" />
      </button>
    </div>
  );
}

function TimerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(reducer, searchParams, buildInitialState);
  const [editingType, setEditingType] = useState<'ejercicio' | 'descanso' | null>(null);
  const { tiempoEjercicio, tiempoDescanso, seriesTotales, serieActual, fase, tiempoRestante, isRunning, exerciseMode, exerciseName, exerciseDone, exerciseFailure } = state;
  const exerciseStopwatch = isStopwatch(state);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const adjustTime = (phase: 'ejercicio' | 'descanso', seconds: number) => {
    const diff = seconds - (phase === 'ejercicio' ? tiempoEjercicio : tiempoDescanso);
    dispatch({ type: 'ADJUST', phase, delta: diff });
  };

  const registerSet = () => {
    if (exerciseStopwatch) {
      router.push(`/dashboard/entrenamiento?abrirBloque=${encodeURIComponent(state.exerciseKey)}`);
      return;
    }
    router.push(
      `/dashboard/entrenamiento?registrarSerie=${encodeURIComponent(state.exerciseKey)}&segundos=${tiempoEjercicio}&fallo=${exerciseFailure ? 1 : 0}`
    );
  };

  const total =
    fase === 'descanso'
      ? tiempoDescanso
      : fase === 'ejercicio'
        ? tiempoEjercicio
        : fase === 'preparacion'
          ? 5
          : tiempoEjercicio;

  const progress = total > 0 ? tiempoRestante / total : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const activeColor = FASE_STYLES[fase].color;

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 p-6 bg-black text-white">
      {/* Header Fijo */}
      <header className="flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-white">Temporizador</h1>
        <p className="text-sm font-medium text-white/40">
          {exerciseMode ? `Comenzar Ejercicio · ${exerciseName}` : 'Intervalos'}
        </p>
      </header>

      {/* Configuración (solo visible en fase inactiva y sin confirmar) */}
      {fase === 'inactivo' && !exerciseDone && (
        exerciseMode ? (
          exerciseStopwatch ? (
            <div className="flex-shrink-0 rounded-[2rem] border border-[#EF4444]/20 bg-[#0D0D0D] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
                    Cronómetro
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-white">{exerciseName}</p>
                </div>
                <span className="flex-shrink-0 rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                  Series
                </span>
              </div>
              <p className="mt-3 text-xs font-medium leading-relaxed text-white/40">
                Cronometrá el tiempo de la serie. Al finalizar, registrá las repeticiones y el peso
                en el registro.
              </p>
            </div>
          ) : (
            <div className="flex-shrink-0 rounded-[2rem] border border-[#EF4444]/20 bg-[#0D0D0D] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
                    Trabajo
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-white">{exerciseName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => dispatch({ type: 'ADJUST', phase: 'ejercicio', delta: -10 })}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                    aria-label="Restar 10 segundos"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'ADJUST', phase: 'ejercicio', delta: 10 })}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                    aria-label="Sumar 10 segundos"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <DurationEditor
                seconds={tiempoEjercicio}
                editing={editingType === 'ejercicio'}
                onStartEdit={() => setEditingType('ejercicio')}
                onConfirm={(s) => {
                  adjustTime('ejercicio', s);
                  setEditingType(null);
                }}
              />
            </div>
          )
        ) : (
          <div className="grid grid-cols-3 gap-3 flex-shrink-0">
            {/* Series */}
            <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Series</p>
              <p className="mt-2 text-4xl font-black tracking-tighter text-white">{seriesTotales}</p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => dispatch({ type: 'ADJUST', phase: 'series', delta: -1 })}
                  className="flex h-10 w-10 flex-1 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  aria-label="Restar una serie"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => dispatch({ type: 'ADJUST', phase: 'series', delta: 1 })}
                  className="flex h-10 w-10 flex-1 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  aria-label="Sumar una serie"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Ejercicio */}
            <div className="rounded-[2rem] border border-[#EF4444]/20 bg-[#0D0D0D] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
                Ejercicio
              </p>
              <DurationEditor
                seconds={tiempoEjercicio}
                editing={editingType === 'ejercicio'}
                onStartEdit={() => setEditingType('ejercicio')}
                onConfirm={(s) => {
                  adjustTime('ejercicio', s);
                  setEditingType(null);
                }}
              />
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => dispatch({ type: 'ADJUST', phase: 'ejercicio', delta: -10 })}
                  className="flex h-10 w-10 flex-1 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  aria-label="Restar 10 segundos"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => dispatch({ type: 'ADJUST', phase: 'ejercicio', delta: 10 })}
                  className="flex h-10 w-10 flex-1 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  aria-label="Sumar 10 segundos"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Descanso */}
            <div className="rounded-[2rem] border border-[#FBBF24]/20 bg-[#0D0D0D] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]">Descanso</p>
              <DurationEditor
                seconds={tiempoDescanso}
                editing={editingType === 'descanso'}
                onStartEdit={() => setEditingType('descanso')}
                onConfirm={(s) => {
                  adjustTime('descanso', s);
                  setEditingType(null);
                }}
              />
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => dispatch({ type: 'ADJUST', phase: 'descanso', delta: -10 })}
                  className="flex h-10 w-10 flex-1 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  aria-label="Restar 10 segundos"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => dispatch({ type: 'ADJUST', phase: 'descanso', delta: 10 })}
                  className="flex h-10 w-10 flex-1 items-center justify-center rounded-full bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  aria-label="Sumar 10 segundos"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* Reloj Central o Confirmación */}
      {!exerciseDone ? (
        exerciseStopwatch ? (
          <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-white/50">
              Serie {serieActual} de {seriesTotales}
            </p>
            <p className="text-7xl font-black tracking-tighter tabular-nums text-white">
              {formatTime(tiempoRestante)}
            </p>
            <p
              className="mt-2 text-xs font-bold uppercase tracking-[0.3em] transition-colors"
              style={{ color: `${activeColor}CC` }}
            >
              {FASE_STYLES[fase].label}
            </p>
          </div>
        ) : (
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
          <svg viewBox="0 0 200 200" className="h-full max-h-full w-auto max-w-full">
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
            />
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke={activeColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 100 100)"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease', filter: `drop-shadow(0 0 12px ${activeColor}55)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-white/50">
              Serie {serieActual} de {seriesTotales}
            </p>
            <p
              className="text-7xl font-black tracking-tighter tabular-nums"
              style={{ color: activeColor }}
            >
              {formatTime(tiempoRestante)}
            </p>
            <p
              className="mt-2 text-xs font-bold uppercase tracking-[0.3em] transition-colors"
              style={{ color: `${activeColor}CC` }}
            >
              {FASE_STYLES[fase].label}
            </p>
          </div>
        </div>
        )
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-8 animate-fade-slide">
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#FBBF24]">
              {exerciseStopwatch ? 'Serie cronometrada' : 'Serie completada'}
            </p>
            <p className="mt-2 text-6xl font-black tracking-tighter tabular-nums text-[#FBBF24]">
              {formatTime(exerciseStopwatch ? tiempoRestante : tiempoEjercicio)}
            </p>
            <p className="mt-2 truncate text-sm font-semibold text-white/50">{exerciseName}</p>
          </div>

          <div className="w-full max-w-sm space-y-3">
            {!exerciseStopwatch && (
              <button
                onClick={() => dispatch({ type: 'TOGGLE_FAILURE' })}
                aria-pressed={exerciseFailure}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-bold uppercase tracking-widest transition-all',
                  exerciseFailure
                    ? 'border-[#EF4444]/60 bg-[#EF4444]/15 text-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                    : 'border-white/10 bg-black/40 text-white/50 hover:border-[#EF4444]/40 hover:text-[#EF4444]'
                )}
              >
                <Flame className={cn('h-4 w-4', exerciseFailure && 'fill-[#EF4444]')} />
                Marcar serie al fallo
              </button>
            )}
            <button
              onClick={registerSet}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-4 text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_25px_rgba(239,68,68,0.35)] transition-all hover:bg-[#EF4444]/90"
            >
              <Check className="h-4 w-4" />
              {exerciseStopwatch ? 'Registrar serie en el registro' : 'Registrar serie'}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => dispatch({ type: 'RETRY' })}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-bold uppercase tracking-widest text-white/60 transition-all hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Reintentar
              </button>
              <button
                onClick={() => router.push('/dashboard/entrenamiento')}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-bold uppercase tracking-widest text-white/60 transition-all hover:text-white"
              >
                <X className="h-4 w-4" />
                Volver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controles */}
      {!exerciseDone && (
        <div className="flex flex-shrink-0 items-center gap-3">
          <button
            onClick={() =>
              isRunning
                ? dispatch(exerciseStopwatch ? { type: 'STOP_STOPWATCH' } : { type: 'PAUSE' })
                : dispatch({ type: 'START' })
            }
            className={cn(
              'flex-1 rounded-[2rem] py-6 text-xl font-black uppercase transition-all',
              isRunning
                ? 'bg-white/10 text-white hover:bg-white/15'
                : 'bg-[#EF4444] text-white shadow-[0_0_25px_rgba(239,68,68,0.4)] hover:bg-[#EF4444]/90'
            )}
          >
            {isRunning ? (
              <span className="flex items-center justify-center gap-3">
                <Pause className="h-6 w-6" /> {exerciseStopwatch ? 'Detener' : 'Pausar'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <Play className="h-6 w-6" /> {fase === 'inactivo' ? 'Iniciar' : 'Reanudar'}
              </span>
            )}
          </button>
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[2rem] bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white"
            aria-label="Reiniciar"
          >
            <RotateCcw className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function TemporizadorPage() {
  return (
    <Suspense fallback={null}>
      <TimerContent />
    </Suspense>
  );
}