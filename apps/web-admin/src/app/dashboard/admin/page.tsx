'use client';

import Link from 'next/link';
import { Crown, Users, Dumbbell, Trophy, Building2, ArrowRight, BarChart3, Settings, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/lib/roles';

export default function AdminDashboard() {
  const { isOwner } = useRole();

  const adminStats = [
    { label: 'Total Usuarios', value: '1,234', icon: Users, color: 'text-[#FBBF24]' },
    { label: 'Gimnasios', value: '12', icon: Building2, color: 'text-[#EF4444]' },
    { label: 'Entrenadores', value: '45', icon: Users, color: 'text-[#FBBF24]' },
    { label: 'Sesiones Hoy', value: '89', icon: Zap, color: 'text-[#EF4444]' },
  ];

  const quickActions = [
    { href: '/dashboard/admin/usuarios', label: 'Gestionar Usuarios', icon: Users, color: 'text-[#FBBF24]', desc: 'Ver, editar y eliminar usuarios' },
    { href: '/dashboard/admin/gimnasios', label: 'Gimnasios', icon: Building2, color: 'text-[#EF4444]', desc: 'Gestionar gimnasios y sedes' },
    { href: '/dashboard/admin/entrenadores', label: 'Entrenadores', icon: Users, color: 'text-[#FBBF24]', desc: 'Ver y gestionar entrenadores' },
    { href: '/dashboard/admin/ejercicios', label: 'Catálogo Ejercicios', icon: Dumbbell, color: 'text-[#EF4444]', desc: 'Catálogo global de ejercicios' },
    { href: '/dashboard/admin/ranking', label: 'Ranking Global', icon: Trophy, color: 'text-[#FBBF24]', desc: 'Ranking global de todos los atletas' },
    { href: '/dashboard/admin/configuracion', label: 'Configuración', icon: Settings, color: 'text-[#EF4444]', desc: 'Configuración global de la plataforma' },
  ];

  const ownerActions = isOwner ? (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
        <Crown className="h-4 w-4 text-[#FBBF24]" />
        Accesos Owner
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/dashboard/entrenador"
          className="group rounded-2xl border border-[#FBBF24]/30 bg-[#0D0D0D] p-4 transition-all hover:border-[#FBBF24]/60 hover:bg-[#FBBF24]/5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBBF24]/10 text-[#FBBF24]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Modo Entrenador</p>
              <p className="text-xs text-white/40">Ver como entrenador</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-white/30 group-hover:text-[#FBBF24]" />
          </div>
        </Link>
        <Link
          href="/dashboard/gimnasio"
          className="group rounded-2xl border border-[#FBBF24]/30 bg-[#0D0D0D] p-4 transition-all hover:border-[#FBBF24]/60 hover:bg-[#FBBF24]/5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBBF24]/10 text-[#FBBF24]">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">Modo Gimnasio</p>
              <p className="text-xs text-white/40">Ver como gimnasio</p>
            </div>
            <ArrowRight className="ml-auto h-4 w-4 text-white/30 group-hover:text-[#FBBF24]" />
          </div>
        </Link>
      </div>
    </div>
  ) : null;

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      {/* Header Fijo */}
      <header className="flex-shrink-0 px-6 pb-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Panel de Administración</h1>
            <p className="mt-0.5 text-sm font-medium text-white/40">Vista global y gestión de la plataforma</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#FBBF24]">
              <Crown className="h-3.5 w-3.5" />
              Owner
            </span>
          </div>
        </div>
      </header>

      {/* Contenedor con scroll interno */}
      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-48 scrollbar-hide">
        {/* Stats Globales */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminStats.map((stat, i) => (
            <div key={i} className="rounded-3xl border border-white/5 bg-[#0D0D0D] p-5 transition-all hover:border-white/10">
              <div className="flex items-center justify-between">
                <stat.icon className={cn('h-5 w-5', stat.color)} />
                <span className="text-2xl font-black text-white">{stat.value}</span>
              </div>
              <p className="mt-2 text-xs font-medium text-white/40">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Acciones Rápidas */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
            <BarChart3 className="h-4 w-4 text-[#FBBF24]" />
            Gestión Global
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="group rounded-2xl border border-white/10 bg-[#0D0D0D] p-5 transition-all hover:border-white/20 hover:shadow-[0_0_20px_rgba(0,0,0,0.3)]"
              >
                <div className="flex items-center gap-3">
                  <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', action.color)}>
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">{action.label}</p>
                    <p className="text-xs text-white/40">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-white/40" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {ownerActions}

        {/* Feed Admin */}
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
            <ShieldCheck className="h-4 w-4 text-[#FBBF24]" />
            Auditoría y Seguridad
          </h2>
          <div className="rounded-2xl border border-white/5 bg-[#0D0D0D] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Sistema operativo</p>
                <p className="text-xs text-white/40">Todos los servicios funcionando correctamente</p>
              </div>
              <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-green-400">
                OK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}