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
  Image,
  Loader2,
  MessageSquare,
  Send,
  Crown,
  Skull,
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

/* ----------------------------- Tipos ----------------------------- */
interface Post { id: string; type: string; text: string; mediaUrl?: string | null; mediaKind?: string | null; createdAt: string; author: { id: string; name: string; imageUrl?: string | null }; reactions: { FIRE?: number; SKULL?: number; CROWN?: number }; myReactions: { FIRE?: boolean; SKULL?: boolean; CROWN?: boolean }; comments: { id: string; text: string; createdAt: string; author: { id: string; name: string } }[]; }
type ReactionKey = 'FIRE' | 'SKULL' | 'CROWN';
const REACTIONS: { key: ReactionKey; label: string; icon: typeof Flame; activeClass: string }[] = [
  { key: 'FIRE', label: 'Respeto', icon: Flame, activeClass: 'border-[#EF4444]/60 bg-[#EF4444]/15 text-[#EF4444]' },
  { key: 'SKULL', label: 'Brutal', icon: Skull, activeClass: 'border-white/40 bg-white/10 text-white' },
  { key: 'CROWN', label: 'Legendario', icon: Crown, activeClass: 'border-[#FBBF24]/60 bg-[#FBBF24]/15 text-[#FBBF24]' },
];

/* ----------------------------- Helpers ----------------------------- */
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
const initials2 = (n?: string) => (n ?? '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
const timeAgo = (iso?: string): string => {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'ahora';
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString();
};
const roleLabel = (r?: string | null): string => {
  switch (r) {
    case 'TRAINER': case 'SUPER_ADMIN': return 'Entrenador/a';
    case 'GYM_ADMIN': return 'Gimnasio';
    case 'OWNER': return 'Admin';
    default: return 'Jugador';
  }
};
const roleColor = (r?: string | null): string =>
  r === 'TRAINER' || r === 'SUPER_ADMIN' || r === 'OWNER' ? 'text-[#38BDF8]' :
  r === 'GYM_ADMIN' ? 'text-[#EF4444]' : 'text-[#FBBF24]';

function PostCard2({
  post, onReact, onComment, onFollow, isFollowed, showComments, toggleComments, draft, setDraft, meId, meName, avatarUrl
}: {
  post: Post;
  onReact: (p: Post, k: ReactionKey) => void;
  onComment: (p: Post) => void;
  onFollow: (id: string) => void;
  isFollowed: boolean;
  showComments: boolean;
  toggleComments: (id: string) => void;
  draft: string;
  setDraft: (p: string, v: string) => void;
  meId?: string;
  meName: string;
  avatarUrl?: string | null;
}) {
  const mediaKindOf = (p: Post): 'IMAGE' | 'VIDEO' | null => {
    if (p.mediaKind) return p.mediaKind as 'IMAGE' | 'VIDEO';
    if (p.mediaUrl?.match(/\.(mp4|webm|ogg)$/i)) return 'VIDEO';
    if (p.mediaUrl) return 'IMAGE';
    return null;
  };
  const kind = mediaKindOf(post);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
      <div className="flex items-center gap-3">
        <img src={post.author.imageUrl ?? undefined} alt="" className="h-10 w-10 rounded-full bg-[#1a1a1a] object-cover" onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden'; }} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{post.author.name || 'Usuario'}</p>
          <p className={cn('text-xs', roleColor(post.author.role))}>{roleLabel(post.author.role)} �� {timeAgo(post.createdAt)}</p>
        </div>
        {post.author.id !== meId && (
          <button onClick={() => onFollow(post.author.id)} disabled={isFollowed}
            className={cn('flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold', isFollowed ? 'bg-[#1a1a1a] text-white/40' : 'bg-[#EF4444] text-white')}>
            {isFollowed ? <Check className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />} {isFollowed ? 'Enviado' : 'Seguir'}
          </button>
        )}
      </div>

      {post.text && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{post.text}</p>}

      {kind && post.mediaUrl && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          {kind === 'VIDEO' ? (
            <video src={post.mediaUrl} controls className="max-h-96 w-full bg-black" />
          ) : <img src={post.mediaUrl} alt="" className="max-h-96 w-full object-cover" />}
          {kind === 'VIDEO' && <Play className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-white/80" />}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        {REACTIONS.map((r) => {
          const Icon = r.icon;
          const active = post.myReactions?.[r.key];
          return (
            <button key={r.key} onClick={() => onReact(post, r.key)}
              className={cn('flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition', active ? r.activeClass : 'border-white/10 text-white/60 hover:text-white')}>
              <Icon className="h-3.5 w-3.5" />{post.reactions?.[r.key] ?? 0}
            </button>
          );
        })}
        <button onClick={() => toggleComments(post.id)} className="ml-auto flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/60 hover:text-white">
          <MessageSquare className="h-3.5 w-3.5" />{post.comments.length}
        </button>
      </div>

      {showComments && (
        <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
          {post.comments.map((c) => (
            <div key={c.id} className="flex gap-2 text-sm"><span className="font-semibold text-[#FBBF24]">{c.author.name || 'Usuario'}</span><span className="text-white/80">{c.text}</span></div>
          ))}
          <div className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(post.id, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onComment(post)} placeholder="Comenta..." className="flex-1 rounded-full border border-white/10 bg-[#0c0c0c] px-3 py-1.5 text-sm outline-none focus:border-[#FBBF24]/50" />
            <button onClick={() => onComment(post)} className="rounded-full bg-[#FBBF24] px-3 py-1.5 text-sm font-bold text-black">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PerfilAtletaPage() {
  const params = useParams<{ id: string }>();
  const athleteId = Number(params.id);

  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const avatarUrl = clerkUser?.imageUrl ?? null;
  const clerkName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || clerkUser?.username || 'T';
  const meId = clerkUser?.id;

  const [me, setMe] = useState<{ id: string; name: string; role?: string; locationCountry?: string | null; locationProvince?: string | null } | null>(null);
  const meIdState = me?.id;
  const meName = me?.name || clerkName;

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

  if (loading) return <div className="h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden flex items-center justify-center">Cargando perfil...</div>;

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

  const isCurrentUser = athlete.id === (clerkUser?.id ?? 0);

  /* --- Posts del atleta (mock) --- */
  const [athletePosts, setAthletePosts] = useState<Post[]>([]);
  useEffect(() => {
    // Mock posts based on athlete data
    const mockPosts: Post[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const created = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const hasMedia = i % 3 !== 0;
      mockPosts.push({
        id: `post-${athlete.id}-${i}`,
        type: hasMedia ? 'MEDIA' : 'TEXT',
        text: `Progreso #${i + 1} - ${athlete.name} ISG ${athlete.isg}`,
        mediaUrl: hasMedia ? `/images/athlete-${athlete.id}-${i}.jpg` : undefined,
        mediaKind: hasMedia ? (i % 2 === 0 ? 'IMAGE' : 'VIDEO') : undefined,
        createdAt: created.toISOString(),
        author: { id: athlete.id.toString(), name: athlete.name, imageUrl: avatarUrl },
        reactions: { FIRE: 5 + i, SKULL: 0, CROWN: 0 },
        myReactions: { FIRE: false, SKULL: false, CROWN: false },
        comments: [],
      });
    }
    setAthletePosts(mockPosts);
  }, [athleteId, avatarUrl]);

  /* --- Tab switching --- */
  const [tab, setTab] = useState<'profile' | 'posts' | 'stats'>('profile');

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
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#0D0D0D] to-[#1a1a1a] p-6 shadow-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border-2 border-[#FBBF24]/60 bg-[#FBBF24]/15 text-xl font-black text-[#FBBF24]">
                {initials2(athlete.name)}
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
                    medal === 'Platino' ? 'border-white/30 bg-white/5' : medal === 'Oro' ? 'border-[#FBBF24]/40 bg-[#FBBF24]/10' : medal === 'Plata' ? 'border-white/20 bg-white/5' : 'border-[#B45309]/40 bg-[#B45309]/10'
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
          <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">
              Acciones sociales
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                onClick={handleFollow}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-bold uppercase tracking-widest transition-all',
                  following ? 'border-[#FBBF24]/60 bg-[#FBBF24]/10 text-[#FBBF24]' : 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20'
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
        <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-6">
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
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
              <Zap className="h-4 w-4 text-[#EF4444]" />
              <p className="mt-2 text-2xl font-black tracking-tighter text-white">{athlete.stats.bestLift}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Mejor levantamiento</p>
            </div>
          </div>
          <div className="mt-3 rounded-2xl border border-[#FBBF24]/30 bg-[#FBBF24]/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]/70">
              Mejor levantamiento
            </p>
            <p className="mt-1 text-sm font-bold text-[#FBBF24]">{athlete.stats.bestLift}</p>
          </div>
        </div>

        {/* Publicaciones del atleta */}
        {tab === 'posts' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Publicaciones de {athlete.name}</h2>
              <button
                onClick={() => setTab('profile')}
                className="text-sm text-[#FBBF24] hover:underline"
              >
                Ver perfil
              </button>
            </div>
            {athletePosts.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center text-white/50">
                Aun no tiene publicaciones. ��S� el primero en compartir!
              </p>
            ) : athletePosts.map((p) => <PostCard2 key={p.id} post={p} onReact={() => {}} onComment={() => {}} onFollow={handleFollow} isFollowed={followed.has(p.author.id)} showComments={false} toggleComments={() => {}} draft={''} setDraft={() => {}} meId={meId} meName={meName} avatarUrl={avatarUrl} />)}
          </div>
        )}

        {/* Pestaña de estadísticas detalladas */}
        {tab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Estadísticas Detalladas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">ISG Score</p>
                <p className="mt-2 text-3xl font-black tracking-tighter text-[#FBBF24]">
                  {athlete.isg.toLocaleString()}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Division</p>
                <p className="mt-2 text-2xl font-bold text-[#FBBF24]">{athlete.division}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">País</p>
                <p className="mt-2 text-lg text-white">{athlete.country}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Provincia</p>
                <p className="mt-2 text-lg text-white">{athlete.province}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Gimnasio</p>
                <p className="mt-2 text-lg text-white">{athlete.gym}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Medallas</p>
                <p className="mt-2 text-lg text-white">{athlete.medals.length > 0 ? athlete.medals.join(', ') : 'Ninguna'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones adicionales */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">
            Acciones rápidas
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => window.open(`/dashboard/atletas/${athlete.id}/editar`, '_blank')}
              className="flex-1 rounded-full bg-[#1a1a1a] border border-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:border-white/30 transition"
            >
              Editar perfil
            </button>
            <button
              onClick={() => setTab('posts')}
              className={cn('flex-1 rounded-full bg-[#FBBF24] text-black px-4 py-2.5 text-sm font-bold', tab === 'posts' ? 'opacity-100' : 'opacity-50')}
            >
              Ver publicaciones
            </button>
            <button
              onClick={() => setTab('stats')}
              className={cn('flex-1 rounded-full bg-[#FBBF24] text-black px-4 py-2.5 text-sm font-bold', tab === 'stats' ? 'opacity-100' : 'opacity-50')}
            >
              Ver stats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}