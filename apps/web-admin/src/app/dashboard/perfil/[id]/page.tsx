'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Trophy,
  Medal,
  Flame,
  Target,
  CalendarCheck,
  TrendingUp,
  Zap,
  UserPlus,
  UserCheck,
  Check,
  MapPin,
  Building2,
  UserX,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAthleteById, initials, type Athlete } from '@/lib/athletes';
import {
  followStatusFor,
  friendStatusFor,
  toggleFollow,
  sendFriendRequest,
  cancelFriendRequest,
} from '@/lib/social';
import type { FriendRequestStatus } from '@ranked-fitness/shared';

const DIVISION_BADGE: Record<string, string> = {
  Platino: 'border-white/40 bg-white/10 text-white',
  Oro: 'border-[#FBBF24]/60 bg-[#FBBF24]/10 text-[#FBBF24]',
  Plata: 'border-white/20 bg-white/5 text-gray-300',
  Bronce: 'border-[#B45309]/60 bg-[#B45309]/10 text-[#D97706]',
};

const MEDAL_COLOR: Record<string, string> = {
  Platino: 'text-white',
  Oro: 'text-[#FBBF24]',
  Plata: 'text-gray-300',
  Bronce: 'text-[#D97706]',
};

function Skeleton() {
  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      <header className="flex-shrink-0 px-6 pb-4 pt-5">
        <div className="h-11 w-11 animate-pulse rounded-2xl bg-white/5" />
      </header>
      <div className="flex-1 space-y-6 overflow-hidden px-6 pb-48">
        <div className="h-44 animate-pulse rounded-[2rem] bg-white/5" />
        <div className="h-28 animate-pulse rounded-3xl bg-white/5" />
        <div className="h-16 animate-pulse rounded-3xl bg-white/5" />
      </div>
    </div>
  );
}

export default function PerfilAtletaPage() {
  const params = useParams<{ id: string }>();
  const athleteId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState<Athlete | null>(null);
  const [following, setFollowing] = useState(false);
  const [friendStatus, setFriendStatus] = useState<FriendRequestStatus | null>(null);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      const found = getAthleteById(athleteId);
      setAthlete(found);
      if (found) {
        setFollowing(followStatusFor(found.id) === 'following');
        setFriendStatus(friendStatusFor(found.id));
      }
      setLoading(false);
    }, 650);
    return () => clearTimeout(timeout);
  }, [athleteId]);

  if (loading) return <Skeleton />;

  if (!athlete) {
    return (
      <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <UserX className="h-12 w-12 text-white/20" />
          <h1 className="text-xl font-bold text-white">Atleta no encontrado</h1>
          <p className="max-w-xs text-sm text-white/40">
            El perfil solicitado no existe o fue removido del ranking.
          </p>
          <Link
            href="/dashboard/ranking"
            className="rounded-full bg-[#EF4444] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90"
          >
            Volver al ranking
          </Link>
        </div>
      </div>
    );
  }

  const handleFollow = () => {
    setFollowing(toggleFollow(athlete.id));
  };

  const handleFriend = () => {
    if (friendStatus === 'pending') {
      cancelFriendRequest(athlete.id);
      setFriendStatus(null);
    } else {
      sendFriendRequest(athlete.id);
      setFriendStatus('pending');
    }
  };

  const isCurrentUser = athlete.id === 0;

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black/80 px-6 pb-4 pt-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/ranking"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#0D0D0D] text-white/60 transition-all hover:text-white"
            aria-label="Volver al ranking"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Perfil del Atleta</h1>
            <p className="text-xs text-white/40">Pantafit · Público</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-[#FBBF24]/20 bg-[#0D0D0D] px-4 py-2.5">
          <Trophy className="h-4 w-4 text-[#FBBF24]" />
          <span className="text-base font-black text-[#FBBF24]">{athlete.isg.toLocaleString()}</span>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-48 pt-6 scrollbar-hide">
        {/* Hero del perfil */}
        <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-[#0D0D0D] to-[#1a1a1a] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border-2 border-[#FBBF24]/60 bg-[#FBBF24]/15 text-xl font-black text-[#FBBF24]">
                {initials(athlete.name)}
              </div>
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold tracking-tight text-white">
                  {athlete.name}
                </h2>
                <span
                  className={cn(
                    'mt-1.5 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest',
                    DIVISION_BADGE[athlete.division]
                  )}
                >
                  <Trophy className="h-3 w-3" />
                  {athlete.division}
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {athlete.country} · {athlete.province}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {athlete.gym}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-shrink-0 flex-col items-end">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                Score ISG
              </span>
              <span className="text-4xl font-black tracking-tighter text-[#FBBF24]">
                {athlete.isg.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Medallas */}
          <div className="mt-5 rounded-2xl border border-white/5 bg-white/5 p-4">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
              <Medal className="h-3.5 w-3.5 text-[#FBBF24]" />
              Marcos obtenidos
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {athlete.medals.length === 0 && (
                <span className="text-xs text-white/30">Sin marcos todavía</span>
              )}
              {athlete.medals.map((medal) => (
                <span
                  key={medal}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest',
                    MEDAL_COLOR[medal],
                    medal === 'Platino'
                      ? 'border-white/30 bg-white/5'
                      : medal === 'Oro'
                        ? 'border-[#FBBF24]/40 bg-[#FBBF24]/10'
                        : medal === 'Plata'
                          ? 'border-white/20 bg-white/5'
                          : 'border-[#B45309]/40 bg-[#B45309]/10'
                  )}
                >
                  <Medal className="h-3 w-3" />
                  {medal}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Acciones sociales */}
        {!isCurrentUser && (
          <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              Acciones sociales
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={handleFollow}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-bold uppercase tracking-widest transition-all',
                  following
                    ? 'border-[#FBBF24]/60 bg-[#FBBF24]/10 text-[#FBBF24]'
                    : 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20'
                )}
                aria-pressed={following}
              >
                {following ? <Check className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {following ? 'Siguiendo' : 'Seguir'}
              </button>

              <button
                onClick={handleFriend}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-bold uppercase tracking-widest transition-all',
                  friendStatus === 'pending'
                    ? 'border-[#FBBF24]/60 bg-[#FBBF24]/10 text-[#FBBF24]'
                    : 'border-white/15 bg-white/5 text-white/60 hover:border-[#EF4444]/50 hover:text-[#EF4444]'
                )}
                aria-pressed={friendStatus === 'pending'}
              >
                {friendStatus === 'pending' ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {friendStatus === 'pending' ? 'Solicitud Enviada' : 'Agregar Amigo'}
              </button>
            </div>
          </div>
        )}

        {/* Estadísticas de rendimiento */}
        <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
            <TrendingUp className="h-4 w-4 text-[#FBBF24]" />
            Estadísticas de rendimiento
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <Target className="h-4 w-4 text-[#EF4444]" />
              <p className="mt-2 text-2xl font-black tracking-tighter text-white">{athlete.stats.prs}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">PRs</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <CalendarCheck className="h-4 w-4 text-[#EF4444]" />
              <p className="mt-2 text-2xl font-black tracking-tighter text-white">{athlete.stats.sessions}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Sesiones</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <Flame className="h-4 w-4 text-[#EF4444]" />
              <p className="mt-2 text-2xl font-black tracking-tighter text-white">{athlete.stats.streakDays}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Racha</p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <Zap className="h-4 w-4 text-[#EF4444]" />
              <p className="mt-2 text-2xl font-black tracking-tighter text-white">{athlete.stats.winRate}%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Win rate</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]/70">
              Mejor levantamiento
            </p>
            <p className="mt-1 text-sm font-bold text-[#FBBF24]">{athlete.stats.bestLift}</p>
          </div>
        </div>
      </div>
    </div>
  );
}