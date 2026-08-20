'use client';

import { useState, type FormEvent } from 'react';
import {
  ScanLine,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  User,
  Dumbbell,
  Building2,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRole } from '@/lib/roles';

interface LiftData {
  code: string;
  athleteName: string;
  athleteId: string;
  exercise: string;
  weightKg: number;
  reps: number;
  isgScore: number;
  division: string;
  status: 'pending' | 'verified';
  verifiedAt?: string;
}

export default function ValidarSesionPage() {
  const { role, profile } = useRole();
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [lift, setLift] = useState<LiftData | null>(null);
  const [pantafitTrust, setPantafitTrust] = useState(128);

  const isCoach = role === 'coach' || role === 'admin';
  const gymName = 'role' in profile ? 'Pantafit' : profile.name;

  const simulateScan = () => {
    setScanning(true);
    setLift(null);
    setTimeout(() => {
      const scannedCode = (code.trim() || 'SESION|player-1|Juan Perez|18 agosto 2026|Sentadilla|145').toUpperCase();
      setLift({
        code: scannedCode,
        athleteName: 'Juan Pérez',
        athleteId: 'player-1',
        exercise: 'Sentadilla',
        weightKg: 120,
        reps: 5,
        isgScore: 145,
        division: 'Platino',
        status: 'pending',
      });
      setScanning(false);
    }, 1600);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    simulateScan();
  };

  const validate = () => {
    if (!lift) return;
    setLift({ ...lift, status: 'verified', verifiedAt: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) });
    setPantafitTrust((prev) => prev + 10);
  };

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black/80 px-6 pb-4 pt-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#0D0D0D] text-white/60 transition-all hover:text-white"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Validar Evidencia</h1>
            <p className="text-xs text-white/40">Escáner de QR · Anti-Cheat</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Confianza {gymName}</span>
          <span className="text-base font-black text-[#FBBF24]">{pantafitTrust} pts</span>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-48 pt-6 scrollbar-hide">
        {!isCoach && (
          <div className="flex items-center gap-3 rounded-2xl border border-yellow-500/30 bg-yellow-950/20 px-4 py-3 text-sm text-yellow-200">
            <Lock className="h-4 w-4 flex-shrink-0" />
            Herramienta exclusiva del rol Entrenador. Cambiá tu perfil en el inicio para validar.
          </div>
        )}

        {/* Simulador de escáner */}
        <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
            <ScanLine className="h-4 w-4 text-[#EF4444]" />
            Escanear QR / Código de sesión
          </p>

          <div className="relative mx-auto mt-6 flex h-56 w-56 items-center justify-center overflow-hidden rounded-3xl border-2 border-[#EF4444]/40 bg-black/60">
            <ScanLine className="h-14 w-14 text-[#EF4444]/60" />
            {scanning && (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#EF4444]/10 to-transparent" />
                <div className="absolute left-0 right-0 h-0.5 animate-pulse bg-[#EF4444]" />
              </>
            )}
            <span className="absolute bottom-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
              {scanning ? 'Escaneando…' : 'Enfocá el QR del atleta'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex items-center gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ingresá el código de sesión o pegá el QR"
              className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-semibold text-white outline-none transition-all placeholder:text-white/25 focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
            />
            <button
              type="submit"
              disabled={scanning}
              className="flex h-11 items-center gap-2 rounded-xl bg-[#EF4444] px-4 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90 disabled:opacity-40"
            >
              <ScanLine className="h-4 w-4" />
              Escanear
            </button>
          </form>
        </div>

        {/* Resultado del escaneo */}
        {lift && (
          <div
            className={cn(
              'rounded-[2rem] border p-6 shadow-2xl transition-all duration-500',
              lift.status === 'verified'
                ? 'border-green-500/50 bg-green-950/20'
                : 'border-[#FBBF24]/30 bg-[#0D0D0D]'
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <ShieldCheck className="h-4 w-4 text-[#FBBF24]" />
                Evidencia del atleta
              </p>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                {lift.code.slice(0, 28)}…
              </span>
            </div>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[#FBBF24]/60 bg-[#FBBF24]/15 text-sm font-black text-[#FBBF24]">
                {'JP'}
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-lg font-bold text-white">
                  <User className="h-4 w-4 text-white/30" />
                  {lift.athleteName}
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  ID {lift.athleteId} · División {lift.division}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Ejercicio</span>
                <p className="mt-1 flex items-center gap-1.5 text-sm font-bold text-white">
                  <Dumbbell className="h-3.5 w-3.5 text-white/40" />
                  {lift.exercise}
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Carga</span>
                <p className="mt-1 text-sm font-bold text-white">{lift.weightKg} kg</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Reps</span>
                <p className="mt-1 text-sm font-bold text-white">{lift.reps}</p>
              </div>
              <div className="rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 p-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]/70">ISG Proyectado</span>
                <p className="mt-1 flex items-center gap-1 text-sm font-black text-[#FBBF24]">
                  <Trophy className="h-3.5 w-3.5" />
                  +{lift.isgScore}
                </p>
              </div>
            </div>

            {lift.status === 'verified' ? (
              <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-green-500/50 bg-green-950/40 py-4 text-sm font-bold uppercase tracking-widest text-green-200">
                <CheckCircle2 className="h-5 w-5" />
                Entrenamiento verificado · {lift.verifiedAt}
              </div>
            ) : (
              <>
                <p className="mt-5 text-center text-xs text-white/40">
                  Al validar, sumás 10 puntos de confianza al ranking de {gymName}.
                </p>
                <button
                  onClick={validate}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#EF4444] to-[#FBBF24] py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all hover:brightness-110"
                >
                  <ShieldCheck className="h-5 w-5" />
                  Avalo Oficial · Validar Entrenamiento
                </button>
              </>
            )}
          </div>
        )}

        {!lift && !scanning && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-[#0D0D0D] px-4 py-3 text-sm text-white/40">
            <Building2 className="h-4 w-4 flex-shrink-0 text-[#FBBF24]" />
            Escaneá el QR que el jugador genera al certificar su sesión.
          </div>
        )}
      </div>
    </div>
  );
}