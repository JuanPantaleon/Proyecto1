'use client';

import { useState } from 'react';
import { QrCode, ShieldCheck, Maximize2, X, User, Calendar, Dumbbell, Trophy } from 'lucide-react';

const MATRIX_SIZE = 25;

function hashString(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (h * 33) ^ str.charCodeAt(i);
  }
  return h >>> 0;
}

function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMatrix(payload: string): boolean[][] {
  const rng = seededRandom(hashString(payload));
  const matrix = Array.from({ length: MATRIX_SIZE }, () =>
    Array.from({ length: MATRIX_SIZE }, () => rng() > 0.52)
  );

  const drawFinder = (row: number, col: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const border = r === 0 || r === 6 || c === 0 || c === 6;
        const center = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[row + r][col + c] = border || center;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, MATRIX_SIZE - 7);
  drawFinder(MATRIX_SIZE - 7, 0);
  return matrix;
}

interface SessionQRProps {
  payload: string;
  athleteName: string;
  athleteId: string;
  date: string;
  mainExercise: string;
  isgScore: number;
  title?: string;
}

export function SessionQR({
  payload,
  athleteName,
  athleteId,
  date,
  mainExercise,
  isgScore,
  title = 'QR de Certificación de Sesión',
}: SessionQRProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const matrix = buildMatrix(payload);

  const renderMatrix = (cellSize: string) => (
    <div className="rounded-2xl bg-white p-3">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${MATRIX_SIZE}, ${cellSize})`,
          gridTemplateRows: `repeat(${MATRIX_SIZE}, ${cellSize})`,
          gap: 0,
        }}
      >
        {matrix.flatMap((row, r) =>
          row.map((cell, c) => (
            <span
              key={`${r}-${c}`}
              className={cell ? 'bg-black' : 'bg-white'}
              style={{ width: cellSize, height: cellSize }}
            />
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
            <ShieldCheck className="h-4 w-4 text-[#FBBF24]" />
            {title}
          </p>
          <button
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-widest text-white/50 transition-all hover:text-white"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Ampliar
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-3xl border border-white/5 p-2">
              {renderMatrix('12px')}
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">
              Escaneá este código ante tu entrenador
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2.5 rounded-2xl border border-white/5 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm text-white/80">
            <User className="h-4 w-4 flex-shrink-0 text-white/30" />
            <span className="truncate">{athleteName}</span>
            <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-widest text-white/25">
              ID {athleteId}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Calendar className="h-4 w-4 flex-shrink-0 text-white/30" />
            {date}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Dumbbell className="h-4 w-4 flex-shrink-0 text-white/30" />
            <span className="truncate">{mainExercise}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/80">
            <Trophy className="h-4 w-4 flex-shrink-0 text-[#FBBF24]" />
            <span className="font-black text-[#FBBF24]">+{isgScore} ISG</span>
          </div>
        </div>

        <button
          onClick={() => setFullscreen(true)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EF4444] py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90"
        >
          <QrCode className="h-4 w-4" />
          Mostrar a mi entrenador
        </button>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-5 bg-black/95 p-6"
          onClick={() => setFullscreen(false)}
        >
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            {title}
          </p>
          <div onClick={(e) => e.stopPropagation()}>{renderMatrix('18px')}</div>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{athleteName}</p>
            <p className="text-xs text-white/40">
              {mainExercise} · +{isgScore} ISG · {date}
            </p>
          </div>
          <button
            onClick={() => setFullscreen(false)}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-[#0D0D0D] px-5 py-3 text-sm font-bold uppercase tracking-widest text-white/60 transition-all hover:text-white"
          >
            <X className="h-4 w-4" />
            Cerrar
          </button>
        </div>
      )}
    </>
  );
}