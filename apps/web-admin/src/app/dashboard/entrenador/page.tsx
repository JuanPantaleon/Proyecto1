'use client';

import Link from 'next/link';
import { ClipboardList, Users, Trophy, ScanLine, Dumbbell, ArrowRight } from 'lucide-react';

export default function EntrenadorDashboard() {

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      {/* Header Fijo */}
      <header className="flex-shrink-0 px-6 pb-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Panel de Entrenador</h1>
        <p className="mt-0.5 text-sm font-medium text-white/40">Gestión de alumnos y programas</p>
      </header>

      {/* Contenedor con scroll interno */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-48 scrollbar-hide">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Mis Programas */}
          <Link
            href="/dashboard/entrenador/entrenamiento"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-[#EF4444]/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <ClipboardList className="h-4 w-4 text-[#EF4444]" />
                Programas
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#EF4444]" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Diseña y asigna rutinas a tus alumnos. Gestiona bloques, ejercicios y progresiones.
            </p>
          </Link>

          {/* Validar Ejercicios */}
          <Link
            href="/dashboard/entrenador/validar"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-[#FBBF24]/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <ScanLine className="h-4 w-4 text-[#FBBF24]" />
                Validar Series
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#FBBF24]" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Revisa y aprueba las series enviadas por tus alumnos. Sube de peso o corrige técnica.
            </p>
          </Link>

          {/* Mis Alumnos */}
          <Link
            href="/dashboard/entrenador/jugadores"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-[#FBBF24]/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Users className="h-4 w-4 text-[#FBBF24]" />
                Mis Alumnos
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#FBBF24]" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Gestiona tus alumnos vinculados. Ve su progreso, asigna rutinas y comunica.
            </p>
          </Link>

          {/* Catálogo de Ejercicios */}
          <Link
            href="/dashboard/entrenador/ejercicios"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-[#EF4444]/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Dumbbell className="h-4 w-4 text-[#EF4444]" />
                Catálogo
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#EF4444]" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Explora y crea ejercicios personalizados. Define coeficientes ISG y métricas.
            </p>
          </Link>

          {/* Ranking */}
          <Link
            href="/dashboard/entrenador/ranking"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-[#FBBF24]/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Trophy className="h-4 w-4 text-[#FBBF24]" />
                Ranking
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#FBBF24]" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Monitorea el rendimiento de tus alumnos. Ve divisiones, ISG y récords.
            </p>
          </Link>

          {/* Comunidad */}
          <Link
            href="/dashboard/entrenador/comunidad"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-white/20"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Users className="h-4 w-4 text-[#FBBF24]" />
                Comunidad
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-white" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Interactúa con la comunidad Pantafit. Comparte logros y motiva.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}