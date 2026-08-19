'use client';

import { useEffect, useReducer, useState } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Fase = 'inactivo' | 'preparacion' | 'ejercicio' | 'descanso';

interface State {
  tiempoEjercicio: number;
  tiempoDescanso: number;
  seriesTotales: number;
  serieActual: number;
  fase: Fase;
  tiempoRestante: number;
  isRunning: boolean;
}

type Action =
  | { type: 'TICK' }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESET' }
  | { type: 'ADJUST'; phase: 'series' | 'ejercicio' | 'descanso'; delta: number };

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
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'TICK': {
      if (state.fase === 'inactivo' || !state.isRunning) return state;
      const restante = state.tiempoRestante - 1;
      if (restante > 0) return { ...state, tiempoRestante: restante };

      switch (state.fase) {
        case 'preparacion':
          return { ...state, fase: 'ejercicio', tiempoRestante: state.tiempoEjercicio };
        case 'ejercicio':
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
      if (state.fase === 'inactivo') {
        return { ...state, fase: 'preparacion', tiempoRestante: 5, isRunning: true };
      }
      return { ...state, isRunning: true };
    }

    case 'PAUSE':
      return { ...state, isRunning: false };

    case 'RESET':
      return { ...initialState };

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

    default:
      return state;
  }
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

export default function TemporizadorPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [editingType, setEditingType] = useState<'ejercicio' | 'descanso' | null>(null);
  const { tiempoEjercicio, tiempoDescanso, seriesTotales, serieActual, fase, tiempoRestante, isRunning } = state;

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

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

  const adjustTime = (phase: 'ejercicio' | 'descanso', seconds: number) => {
    const diff = seconds - (phase === 'ejercicio' ? tiempoEjercicio : tiempoDescanso);
    dispatch({ type: 'ADJUST', phase, delta: diff });
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-6 p-6 bg-black text-white">
      {/* Header Fijo */}
      <header className="flex-shrink-0">
        <h1 className="text-2xl font-bold tracking-tight text-white">Temporizador</h1>
        <p className="text-sm font-medium text-white/40">Intervalos</p>
      </header>

      {/* Configuración (solo visible en fase inactiva) */}
      {fase === 'inactivo' && (
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
      )}

      {/* Reloj Central */}
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

      {/* Controles */}
      <div className="flex flex-shrink-0 items-center gap-3">
        <button
          onClick={() =>
            isRunning
              ? dispatch({ type: 'PAUSE' })
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
              <Pause className="h-6 w-6" /> Pausar
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
    </div>
  );
}