'use client';

import Link from 'next/link';
import { Users, ClipboardList, Dumbbell, ArrowRight } from 'lucide-react';

export default function GimnasioDashboard() {

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      {/* Header Fijo */}
      <header className="flex-shrink-0 px-6 pb-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Panel de Gimnasio</h1>
        <p className="mt-0.5 text-sm font-medium text-white/40">Gestión del centro y comunidad</p>
      </header>

      {/* Contenedor con scroll interno */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-48 scrollbar-hide">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Mis Jugadores */}
          <Link
            href="/dashboard/gimnasio/jugadores"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-[#FBBF24]/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Users className="h-4 w-4 text-[#FBBF24]" />
                Jugadores
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#FBBF24]" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Gestiona los jugadores vinculados al gimnasio. Ve su progreso y asigna entrenadores.
            </p>
          </Link>

          {/* Rutinas del Gimnasio */}
          <Link
            href="/dashboard/gimnasio/rutinas"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-[#EF4444]/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <ClipboardList className="h-4 w-4 text-[#EF4444]" />
                Rutinas
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#EF4444]" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Gestiona las rutinas oficiales del gimnasio. Crea programas para todos los niveles.
            </p>
          </Link>

          {/* Entrenadores */}
          <Link
            href="/dashboard/gimnasio/entrenadores"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-[#EF4444]/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Users className="h-4 w-4 text-[#EF4444]" />
                Entrenadores
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#EF4444]" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Gestiona los entrenadores vinculados. Asigna alumnos y revisa su trabajo.
            </p>
          </Link>

          {/* Ranking del Gimnasio */}
          <Link
            href="/dashboard/ranking"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-[#FBBF24]/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Users className="h-4 w-4 text-[#FBBF24]" />
                Ranking
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#FBBF24]" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Ranking interno del gimnasio. Ve quién lidera las divisiones.
            </p>
          </Link>

          {/* Configuración */}
          <Link
            href="/dashboard/gimnasio/configuracion"
            className="group rounded-3xl border border-white/10 bg-[#0D0D0D] p-6 transition-all hover:border-[#EF4444]/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.1)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <Dumbbell className="h-4 w-4 text-[#EF4444]" />
                Configuración
              </span>
              <ArrowRight className="h-4 w-4 text-white/20 transition-transform group-hover:translate-x-1 group-hover:text-[#EF4444]" />
            </div>
            <p className="mt-4 text-sm text-white/50">
              Configura datos del gimnasio, horarios, sedes y preferencias.
            </p>
          </Link>

          {/* Comunidad */}
          <Link
            href="/dashboard/comunidad"
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
              Feed social del gimnasio. Anuncios, logros y actividad.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}