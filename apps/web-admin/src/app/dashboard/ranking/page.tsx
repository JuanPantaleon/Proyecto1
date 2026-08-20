'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Globe, MapPin, Building2, Crown, ChevronDown, ShieldCheck, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { athletes, initials, type Athlete } from '@/lib/athletes';
import { useRole } from '@/lib/roles';

type Scope = 'global' | 'pais' | 'provincia' | 'gimnasio';
type RankKind = 'competitivo' | 'casual';

interface Country {
  name: string;
  provinces: string[];
  gyms: string[];
}

const currentUser = {
  name: 'Juan Pérez',
  division: 'Platino' as const,
  country: 'Argentina',
  isg: 2450,
};

const countries: Country[] = [
  { name: 'Argentina', provinces: ['Jujuy', 'Salta', 'Tucumán', 'Buenos Aires', 'Córdoba'], gyms: ['Pantafit', 'Titan Gym', 'Andes Fit'] },
  { name: 'Chile', provinces: ['Santiago', 'Valparaíso', 'Biobío'], gyms: ['Power House', 'Titan Gym'] },
  { name: 'Bolivia', provinces: ['La Paz', 'Cochabamba', 'Santa Cruz'], gyms: ['Andes Fit', 'Power House'] },
  { name: 'Colombia', provinces: ['Antioquia', 'Bogotá', 'Valle del Cauca'], gyms: ['Titan Gym', 'Andes Fit'] },
  { name: 'México', provinces: ['CDMX', 'Jalisco', 'Nuevo León'], gyms: ['Titan Gym', 'Power House'] },
];

const scopes: { key: Scope; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'global', label: 'Global', icon: Globe },
  { key: 'pais', label: 'País', icon: MapPin },
  { key: 'provincia', label: 'Provincia', icon: MapPin },
  { key: 'gimnasio', label: 'Gimnasio (Pantafit)', icon: Building2 },
];

const DIVISION_BADGE: Record<Athlete['division'], string> = {
  Platino: 'border-white/40 bg-white/10 text-white',
  Oro: 'border-[#FBBF24]/60 bg-[#FBBF24]/10 text-[#FBBF24]',
  Plata: 'border-white/20 bg-white/5 text-gray-300',
  Bronce: 'border-[#B45309]/60 bg-[#B45309]/10 text-[#D97706]',
};

const DIVISION_FRAME: Record<Athlete['division'], string> = {
  Platino: 'border-white/50 bg-white/10 text-white',
  Oro: 'border-[#FBBF24]/70 bg-[#FBBF24]/15 text-[#FBBF24]',
  Plata: 'border-white/20 bg-white/5 text-gray-300',
  Bronce: 'border-[#B45309]/60 bg-[#B45309]/15 text-[#D97706]',
};

const PODIUM_ORDER = [1, 0, 2];

const CASUAL_OFFSETS = [120, 260, 90, 180, 40, 210, 70, 150, 60, 200, 30, 140, 100, 190, 80, 170, 50];

const casualAthletes: Athlete[] = athletes.map((a, i) => ({
  ...a,
  isg: a.isg + (CASUAL_OFFSETS[i] ?? 0),
}));

const rankKinds: { key: RankKind; label: string; hint: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'competitivo', label: 'Ranking Competitivo', hint: 'Verificado por entrenadores / QR', icon: ShieldCheck },
  { key: 'casual', label: 'Ranking Casual', hint: 'Abierto · sin validación', icon: Flame },
];

export default function RankingPage() {
  const { players } = useRole();
  const [kind, setKind] = useState<RankKind>('competitivo');
  const [scope, setScope] = useState<Scope>('global');
  const [country, setCountry] = useState('Argentina');
  const [province, setProvince] = useState('Jujuy');
  const [gym, setGym] = useState('Pantafit');

  const playerMe = players.find((p) => p.id === 'player-1');
  const liveCurrentUser = {
    name: playerMe?.name ?? currentUser.name,
    division: (playerMe?.division ?? currentUser.division) as Athlete['division'],
    isg: playerMe?.isgScore ?? currentUser.isg,
  };
  const liveAthletes: Athlete[] = athletes.map((a) => {
    const roster = players.find((p) => p.name === a.name);
    return roster
      ? { ...a, isg: roster.isgScore, division: roster.division as Athlete['division'] }
      : a;
  });

  const list = kind === 'competitivo' ? liveAthletes : casualAthletes;
  const userIsg = kind === 'competitivo' ? liveCurrentUser.isg : liveCurrentUser.isg + 260;

  const activeCountry = countries.find((c) => c.name === country) ?? countries[0];

  const changeCountry = (value: string) => {
    const selected = countries.find((c) => c.name === value) ?? countries[0];
    setCountry(value);
    setProvince(selected.provinces[0]);
    setGym(selected.gyms[0]);
    setScope('pais');
  };

  const changeProvince = (value: string) => {
    setProvince(value);
    setScope('provincia');
  };

  const changeGym = (value: string) => {
    setGym(value);
    setScope('gimnasio');
  };

  const filteredAthletes = () => {
    switch (scope) {
      case 'pais':
        return list.filter((a) => a.country === country);
      case 'provincia':
        return list.filter((a) => a.country === country && a.province === province);
      case 'gimnasio':
        return list.filter((a) => a.gym === gym);
      default:
        return list;
    }
  };

  const sorted = filteredAthletes().sort((a, b) => b.isg - a.isg);
  const podium = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      {/* Header Fijo */}
      <header className="flex-shrink-0 px-6 pb-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Clasificación</h1>
        <p className="mt-0.5 text-sm font-medium text-white/40">Leaderboard Global &amp; Local</p>
      </header>

      {/* Contenedor con scroll interno */}
      <div className="flex-1 space-y-8 overflow-y-auto px-6 pb-48 scrollbar-hide">
        {/* Selector de Ranking */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rankKinds.map((rk) => {
            const active = kind === rk.key;
            const Icon = rk.icon;
            return (
              <button
                key={rk.key}
                onClick={() => setKind(rk.key)}
                className={cn(
                  'rounded-[1.5rem] border p-4 text-left transition-all duration-300',
                  active
                    ? rk.key === 'competitivo'
                      ? 'border-[#EF4444]/60 bg-[#EF4444]/10 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
                      : 'border-[#FBBF24]/60 bg-[#FBBF24]/10 shadow-[0_0_25px_rgba(251,191,36,0.2)]'
                    : 'border-white/10 bg-[#0D0D0D] hover:border-white/25'
                )}
                aria-pressed={active}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                      active
                        ? rk.key === 'competitivo'
                          ? 'bg-[#EF4444] text-white'
                          : 'bg-[#FBBF24] text-black'
                        : 'bg-white/5 text-white/40'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className={cn('text-sm font-bold', active ? 'text-white' : 'text-white/60')}>
                      {rk.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/40">{rk.hint}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Hero Profile Card */}
        <div className="flex items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-gradient-to-r from-[#0D0D0D] to-[#1a1a1a] p-6 shadow-2xl">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[#FBBF24]/60 bg-[#FBBF24]/15 text-lg font-black text-[#FBBF24]">
              {initials(liveCurrentUser.name)}
            </div>
            <div className="min-w-0">
              <p className="break-words text-base font-bold text-white">{liveCurrentUser.name}</p>
              <span
                className={cn(
                  'mt-1 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest',
                  DIVISION_BADGE[liveCurrentUser.division]
                )}
              >
                <Trophy className="h-3 w-3" />
                {liveCurrentUser.division}
              </span>
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
              Score ISG
            </span>
            <span className="text-4xl font-black tracking-tighter text-[#FBBF24]">
              {userIsg.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Pestañas de Alcance */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {scopes.map((s) => {
            const active = scope === s.key;
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                onClick={() => setScope(s.key)}
                className={cn(
                  'flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all',
                  active
                    ? 'bg-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'border border-white/5 bg-[#0D0D0D] text-white/50 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Filtros en Cascada */}
        {scope !== 'global' && (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            <div className="relative flex-shrink-0">
              <select
                value={country}
                onChange={(e) => changeCountry(e.target.value)}
                className="cursor-pointer appearance-none rounded-2xl border border-white/10 bg-[#0D0D0D] px-4 py-3 pr-9 text-sm text-white outline-none transition-colors focus:border-[#EF4444]"
                aria-label="Seleccionar país"
              >
                {countries.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            </div>
            <div className="relative flex-shrink-0">
              <select
                value={province}
                onChange={(e) => changeProvince(e.target.value)}
                className="cursor-pointer appearance-none rounded-2xl border border-white/10 bg-[#0D0D0D] px-4 py-3 pr-9 text-sm text-white outline-none transition-colors focus:border-[#EF4444]"
                aria-label="Seleccionar provincia"
              >
                {activeCountry.provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            </div>
            <div className="relative flex-shrink-0">
              <select
                value={gym}
                onChange={(e) => changeGym(e.target.value)}
                className="cursor-pointer appearance-none rounded-2xl border border-white/10 bg-[#0D0D0D] px-4 py-3 pr-9 text-sm text-white outline-none transition-colors focus:border-[#EF4444]"
                aria-label="Seleccionar gimnasio"
              >
                {activeCountry.gyms.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            </div>
          </div>
        )}

        {/* Pódium Olímpico Top 3 */}
        <div className="flex items-end justify-center gap-3">
          {PODIUM_ORDER.map((order) => {
            const athlete = podium[order];
            if (!athlete) return <div key={order} className="min-h-40 flex-1" />;
            const isFirst = order === 0;
            return (
              <Link
                key={athlete.id}
                href={`/dashboard/perfil/${athlete.id}`}
                className={cn(
                  'relative flex flex-1 flex-col items-center rounded-[2rem] border bg-[#0D0D0D] p-5 text-center shadow-xl transition-all duration-300',
                  isFirst
                    ? 'min-h-52 border-[#FBBF24]/50 shadow-[0_0_35px_rgba(251,191,36,0.25)]'
                    : 'min-h-40 border-white/10 hover:border-[#FBBF24]/40'
                )}
              >
                {isFirst && (
                  <div className="absolute -top-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full border border-[#FBBF24]/60 bg-[#FBBF24] text-black shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                    <Crown className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full border-2 font-black',
                    DIVISION_FRAME[athlete.division],
                    isFirst ? 'mt-3 h-14 w-14 text-lg' : 'mt-2 h-12 w-12 text-sm'
                  )}
                >
                  {initials(athlete.name)}
                </div>
                <span className="mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  {isFirst ? (
                    <Trophy className="h-3.5 w-3.5 text-[#FBBF24]" />
                  ) : (
                    <Medal className={cn('h-3.5 w-3.5', order === 1 ? 'text-gray-300' : 'text-[#D97706]')} />
                  )}
                  #{order + 1}
                </span>
                <p className="mt-1 w-full break-words text-sm leading-normal font-bold text-white">
                  {athlete.name || 'Atleta Destacado'}
                </p>
                <span className="mt-2 text-lg font-black text-[#FBBF24]">
                  {athlete.isg.toLocaleString()}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Lista Dinámica (4+) */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/40">
            Resto del Ranking
          </h2>
          {rest.map((athlete, i) => (
            <Link
              key={athlete.id}
              href={`/dashboard/perfil/${athlete.id}`}
              className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-[#0D0D0D] p-4 transition-all duration-300 hover:border-[#EF4444]/40 hover:bg-white/5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm font-black text-white/40">
                  {i + 4}
                </span>
                <div className="min-w-0">
                  <p className="break-words text-sm font-semibold text-white">{athlete.name}</p>
                  <span
                    className={cn(
                      'mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest',
                      DIVISION_BADGE[athlete.division]
                    )}
                  >
                    {athlete.division}
                  </span>
                </div>
              </div>

              <div className="flex flex-shrink-0 items-center gap-2">
                <span className="hidden text-right text-[10px] leading-tight text-white/30 sm:block">
                  {athlete.gym}
                  <br />
                  {athlete.country}
                </span>
                <span className="text-sm font-bold text-[#FBBF24]">
                  {athlete.isg.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
          {rest.length === 0 && (
            <div className="rounded-2xl border border-white/5 bg-[#0D0D0D] p-6 text-center">
              <p className="text-sm text-white/40">Sin más atletas en este rango</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}