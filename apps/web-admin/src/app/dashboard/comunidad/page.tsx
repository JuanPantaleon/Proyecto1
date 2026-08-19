'use client';

import { useEffect, useState, type FormEvent } from 'react';
import {
  Flame,
  MessageCircle,
  Send,
  Trophy,
  Dumbbell,
  ImagePlus,
  UserPlus,
  UserCheck,
  X,
  Check,
  Users,
  User,
  MessageSquare,
  Newspaper,
  ArrowLeft,
  ShieldCheck,
  Target,
  CalendarCheck,
  TrendingUp,
  MapPin,
  Building2,
  Crown,
  Video,
  Mic,
  Play,
  Pause,
  Paperclip,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole, PLAYER_PROFILE } from '@/lib/roles';

interface Comment {
  id: number;
  user: string;
  text: string;
}

interface FollowRequest {
  id: number;
  user: string;
  note: string;
}

interface Friend {
  id: number;
  name: string;
  division: string;
  online: boolean;
}

interface ChatMessage {
  id: number;
  from: 'me' | 'them';
  text?: string;
  time: string;
  attachments?: ChatAttachment[];
}

interface ChatAttachment {
  type: 'image' | 'video' | 'voice';
  label?: string;
  duration?: string;
}

interface Conversation {
  id: number;
  user: string;
  roleLabel: string;
  online: boolean;
  unread: number;
  messages: ChatMessage[];
}

type Tab = 'feed' | 'amigos' | 'perfil' | 'mensajes';

type PostMediaType = 'image' | 'video';

interface PostMedia {
  type: PostMediaType;
  gradient: string;
  label: string;
  duration?: string;
}

interface Post {
  id: number;
  user: string;
  role: 'player' | 'coach' | 'gym';
  roleLabel: string;
  division: string;
  text: string;
  isg?: number;
  media?: PostMedia;
  respects: number;
  comments: Comment[];
}

const ROLE_COLOR: Record<Post['role'], string> = {
  player: 'text-[#FBBF24]',
  coach: 'text-[#38BDF8]',
  gym: 'text-[#EF4444]',
};

const DIVISION_BADGE: Record<string, string> = {
  Platino: 'border-white/40 bg-white/10 text-white',
  Oro: 'border-[#FBBF24]/60 bg-[#FBBF24]/10 text-[#FBBF24]',
  Plata: 'border-white/20 bg-white/5 text-gray-300',
  Bronce: 'border-[#B45309]/60 bg-[#B45309]/10 text-[#D97706]',
};

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    user: 'Lautaro Díaz',
    role: 'player',
    roleLabel: 'Jugador',
    division: 'Platino',
    text: '¡Nuevo PR en Sentadilla con 120kg!',
    isg: 145,
    media: { type: 'video', gradient: 'from-[#1a1a1a] via-[#EF4444]/20 to-[#0D0D0D]', label: 'Sentadilla · 120 kg × 5', duration: '00:12' },
    respects: 42,
    comments: [
      { id: 1, user: 'Valentina Ríos', text: '¡Monstruo! 🔥' },
      { id: 2, user: 'Martín Quispe', text: 'Eso es mentalidad, crack.' },
    ],
  },
  {
    id: 2,
    user: 'Valentina Ríos',
    role: 'player',
    roleLabel: 'Jugador',
    division: 'Oro',
    text: 'Ascendí a División Oro 🏆 Gracias por el apoyo de siempre.',
    isg: 98,
    respects: 67,
    comments: [{ id: 3, user: 'Lautaro Díaz', text: '¡Bien merecido!' }],
  },
  {
    id: 3,
    user: 'Lucía Fernández',
    role: 'coach',
    roleLabel: 'Entrenadora',
    division: '—',
    text: 'Plan de hipertrofia actualizado para el bloque de competencia. ¡Se viene todo!',
    media: { type: 'image', gradient: 'from-[#0D0D0D] via-[#38BDF8]/15 to-[#1a1a1a]', label: 'Programa · Bloque Competitivo' },
    respects: 31,
    comments: [],
  },
  {
    id: 4,
    user: 'Pantafit',
    role: 'gym',
    roleLabel: 'Gimnasio',
    division: '—',
    text: '¡Nuevo equipamiento en la zona de peso muerto! Ven a probarlo.',
    media: { type: 'image', gradient: 'from-[#1a1a1a] via-[#FBBF24]/20 to-[#0D0D0D]', label: 'Zona de Fuerza · Pantafit' },
    respects: 54,
    comments: [],
  },
  {
    id: 5,
    user: 'Martín Quispe',
    role: 'player',
    roleLabel: 'Jugador',
    division: 'Plata',
    text: 'Press de Banca 100 kg cerrado a una repetición. El proceso sigue.',
    isg: 88,
    respects: 26,
    comments: [],
  },
];

const INITIAL_FRIENDS: Friend[] = [
  { id: 1, name: 'Lautaro Díaz', division: 'Platino', online: true },
  { id: 2, name: 'Valentina Ríos', division: 'Oro', online: false },
  { id: 3, name: 'Martín Quispe', division: 'Plata', online: true },
  { id: 4, name: 'Camila Sosa', division: 'Plata', online: false },
  { id: 5, name: 'Joaquín Arce', division: 'Bronce', online: true },
];

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    user: 'Lautaro Díaz',
    roleLabel: 'Jugador · Platino',
    online: true,
    unread: 2,
    messages: [
      { id: 1, from: 'them', text: '¡Buen PR de hoy, crack!', time: '10:12' },
      { id: 2, from: 'me', text: 'Gracias bro, el plan de Lucía está pegando fuerte 💪', time: '10:15' },
      { id: 3, from: 'them', text: '¿Mañana entrenamos juntos la sentadilla?', time: '10:18' },
      { id: 4, from: 'them', text: 'Arranco 9:00 en Pantafit', time: '10:19' },
      { id: 5, from: 'them', attachments: [{ type: 'voice', label: 'Nota de voz', duration: '0:08' }], time: '10:20' },
      { id: 6, from: 'them', attachments: [{ type: 'image', label: 'Progreso · Sentadilla 120 kg' }], time: '10:21' },
    ],
  },
  {
    id: 2,
    user: 'Lucía Fernández',
    roleLabel: 'Entrenadora · Pantafit',
    online: true,
    unread: 0,
    messages: [
      { id: 1, from: 'them', text: 'Te dejé el bloque de hipertrofia actualizado.', time: '09:02' },
      { id: 2, from: 'me', text: 'Perfecto, lo reviso hoy.', time: '09:05' },
    ],
  },
  {
    id: 3,
    user: 'Pantafit',
    roleLabel: 'Gimnasio',
    online: false,
    unread: 1,
    messages: [
      { id: 1, from: 'them', text: 'Tu cuota de septiembre está al día ✅', time: 'Ayer' },
      { id: 2, from: 'them', text: 'Nueva zona de peso muerto habilitada.', time: 'Ayer' },
    ],
  },
];

const WEEK_PROGRESS = [
  { day: 'L', pct: 85 },
  { day: 'M', pct: 60 },
  { day: 'X', pct: 95 },
  { day: 'J', pct: 40 },
  { day: 'V', pct: 70 },
  { day: 'S', pct: 100 },
  { day: 'D', pct: 25 },
];

const DEFAULT_IMAGE_MEDIA: PostMedia = {
  type: 'image',
  gradient: 'from-[#1a1a1a] via-[#EF4444]/20 to-[#0D0D0D]',
  label: 'Imagen adjunta',
};

const DEFAULT_VIDEO_MEDIA: PostMedia = {
  type: 'video',
  gradient: 'from-[#0D0D0D] via-[#38BDF8]/15 to-[#1a1a1a]',
  label: 'Video adjunto',
  duration: '00:15',
};

const WAVEFORM_BARS = Array.from({ length: 28 }, (_, i) => 10 + ((i * 37) % 26));

export default function ComunidadPage() {
  const { profile } = useRole();
  const own = 'role' in profile && profile.role === 'player' ? profile : PLAYER_PROFILE;

  const [tab, setTab] = useState<Tab>('feed');
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [respected, setRespected] = useState<Set<number>>(new Set());
  const [openComments, setOpenComments] = useState<Set<number>>(new Set());
  const [draft, setDraft] = useState<Record<number, string>>({});
  const [newText, setNewText] = useState('');
  const [newMedia, setNewMedia] = useState<PostMedia | null>(null);
  const [friends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [followRequests, setFollowRequests] = useState<FollowRequest[]>([
    { id: 1, user: 'Lautaro Díaz', note: 'Quiere seguirte' },
    { id: 2, user: 'Camila Sosa', note: 'Solicitud de seguimiento' },
    { id: 3, user: 'Renata Vidal', note: 'Te sigue desde el ranking' },
  ]);
  const [acceptedFollows, setAcceptedFollows] = useState<number[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chatDraft, setChatDraft] = useState('');
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<ChatAttachment | null>(null);
  const [voicePlayingId, setVoicePlayingId] = useState<number | null>(null);
  const [voiceProgress, setVoiceProgress] = useState<Record<number, number>>({});

  const acceptFollow = (id: number) => {
    setAcceptedFollows((prev) => [...prev, id]);
  };

  const rejectFollow = (id: number) => {
    setFollowRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleRespect = (postId: number) => {
    setRespected((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
        setPosts((ps) =>
          ps.map((p) => (p.id === postId ? { ...p, respects: Math.max(0, p.respects - 1) } : p))
        );
      } else {
        next.add(postId);
        setPosts((ps) =>
          ps.map((p) => (p.id === postId ? { ...p, respects: p.respects + 1 } : p))
        );
      }
      return next;
    });
  };

  const toggleComments = (postId: number) => {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const submitComment = (postId: number) => {
    const text = (draft[postId] ?? '').trim();
    if (!text) return;
    setPosts((ps) =>
      ps.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, { id: Date.now(), user: 'Juan Pérez', text }] }
          : p
      )
    );
    setDraft((prev) => ({ ...prev, [postId]: '' }));
  };

  const publish = (e: FormEvent) => {
    e.preventDefault();
    const text = newText.trim();
    if (!text) return;
    const post: Post = {
      id: Date.now(),
      user: 'Juan Pérez',
      role: 'player',
      roleLabel: 'Jugador',
      division: 'Platino',
      text,
      isg: 72,
      media: newMedia ?? undefined,
      respects: 0,
      comments: [],
    };
    setPosts((prev) => [post, ...prev]);
    setNewText('');
    setNewMedia(null);
  };

  const openChat = (id: number) => {
    setActiveChatId(id);
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const sendMessage = () => {
    const text = chatDraft.trim();
    if ((!text && !pendingAttachment) || activeChatId === null) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: Date.now(),
                  from: 'me' as const,
                  text,
                  time: 'ahora',
                  attachments: pendingAttachment ? [pendingAttachment] : undefined,
                },
              ],
            }
          : c
      )
    );
    setChatDraft('');
    setPendingAttachment(null);
    setAttachMenuOpen(false);
  };

  const toggleVoice = (messageId: number) => {
    if (voicePlayingId === messageId) {
      setVoicePlayingId(null);
      setVoiceProgress((prev) => ({ ...prev, [messageId]: 0 }));
    } else {
      setVoicePlayingId(messageId);
    }
  };

  useEffect(() => {
    if (voicePlayingId === null) return;
    const interval = setInterval(() => {
      setVoiceProgress((prev) => {
        const next = (prev[voicePlayingId] ?? 0) + 2;
        if (next >= 100) {
          setVoicePlayingId(null);
          return { ...prev, [voicePlayingId]: 0 };
        }
        return { ...prev, [voicePlayingId]: next };
      });
    }, 120);
    return () => clearInterval(interval);
  }, [voicePlayingId]);

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread, 0);
  const activeConversation = conversations.find((c) => c.id === activeChatId) ?? null;

  const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { key: 'feed', label: 'Feed', icon: Newspaper },
    { key: 'amigos', label: 'Amigos', icon: Users, badge: followRequests.length },
    { key: 'perfil', label: 'Perfil', icon: User },
    { key: 'mensajes', label: 'Mensajes', icon: MessageSquare, badge: unreadTotal },
  ];

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      {/* Header Fijo */}
      <header className="flex-shrink-0 px-6 pb-4 pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">Comunidad</h1>
        <p className="mt-0.5 text-sm font-medium text-white/40">Pantafit · Social</p>

        {/* Tabs superiores */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex flex-shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300',
                  isActive
                    ? 'bg-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'border border-white/5 bg-[#0D0D0D] text-white/50 hover:text-white'
                )}
                aria-pressed={isActive}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {typeof t.badge === 'number' && t.badge > 0 && (
                  <span
                    className={cn(
                      'flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black',
                      isActive ? 'bg-white text-[#EF4444]' : 'bg-[#EF4444] text-white'
                    )}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Contenido con scroll interno */}
      <div key={tab} className="flex-1 space-y-6 overflow-y-auto px-6 pb-48 scrollbar-hide animate-fade-slide">
        {/* ===== FEED ===== */}
        {tab === 'feed' && (
          <>
            {/* Composer */}
            <form onSubmit={publish} className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-[#FBBF24]/60 bg-[#FBBF24]/15 text-sm font-black text-[#FBBF24]">
                  {initials(own.name)}
                </div>
                <textarea
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="Comparte tu nuevo PR o estado..."
                  rows={2}
                  className="flex-1 resize-none rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-semibold text-white outline-none transition-all placeholder:text-white/25 focus:border-[#EF4444] focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                />
              </div>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setNewMedia((prev) =>
                          prev?.type === 'image' ? null : { ...DEFAULT_IMAGE_MEDIA }
                        )
                      }
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all',
                        newMedia?.type === 'image'
                          ? 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]'
                          : 'border-white/10 bg-white/5 text-white/40 hover:text-white'
                      )}
                      aria-pressed={newMedia?.type === 'image'}
                    >
                      <ImagePlus className="h-3.5 w-3.5" />
                      Imagen
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setNewMedia((prev) =>
                          prev?.type === 'video' ? null : { ...DEFAULT_VIDEO_MEDIA }
                        )
                      }
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold uppercase tracking-widest transition-all',
                        newMedia?.type === 'video'
                          ? 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]'
                          : 'border-white/10 bg-white/5 text-white/40 hover:text-white'
                      )}
                      aria-pressed={newMedia?.type === 'video'}
                    >
                      <Video className="h-3.5 w-3.5" />
                      Video
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-[#EF4444] px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#EF4444]/90 disabled:opacity-40 disabled:hover:bg-[#EF4444]"
                    disabled={!newText.trim() && !newMedia}
                  >
                    <Send className="h-4 w-4" />
                    Publicar
                  </button>
                </div>

                {newMedia && (
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div
                      className={cn(
                        'relative flex h-16 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-gradient-to-br',
                        newMedia.gradient
                      )}
                    >
                      {newMedia.type === 'video' && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-5 w-5 text-white" fill="currentColor" />
                        </span>
                      )}
                      {newMedia.type === 'image' ? (
                        <ImagePlus className="h-6 w-6 text-white/60" />
                      ) : (
                        <Video className="h-6 w-6 text-white/60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold uppercase tracking-widest text-white/60">
                        {newMedia.label}
                      </p>
                      <button
                        type="button"
                        onClick={() => setNewMedia(null)}
                        className="mt-1 text-xs font-bold text-[#EF4444] transition-all hover:text-[#EF4444]/80"
                      >
                        Quitar adjunto
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Posts */}
            {posts.map((post) => {
              const isRespected = respected.has(post.id);
              const isOpen = openComments.has(post.id);
              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[2rem] border border-white/5 bg-[#0D0D0D] transition-all hover:border-white/15"
                >
                  {/* Header post */}
                  <div className="flex items-center gap-3 p-5 pb-0">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-white/10 bg-white/5 text-sm font-black text-white/70">
                      {initials(post.user)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-x-2 text-sm font-bold text-white">
                        {post.user}
                        <span className={cn('text-[10px] font-bold uppercase tracking-widest', ROLE_COLOR[post.role])}>
                          · {post.roleLabel}
                        </span>
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        {post.division !== '—' && (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest',
                              DIVISION_BADGE[post.division] ?? DIVISION_BADGE.Plata
                            )}
                          >
                            <Trophy className="h-2.5 w-2.5" />
                            {post.division}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-white/30">hace 10 min</span>
                      </div>
                    </div>
                  </div>

                  {/* Texto + ISG */}
                  <div className="px-5 pt-4">
                    <p className="text-sm font-semibold leading-relaxed text-white/90">{post.text}</p>
                    {typeof post.isg === 'number' && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-3 py-1 text-[11px] font-black text-[#FBBF24]">
                        <Flame className="h-3 w-3" />
                        +{post.isg} ISG
                      </span>
                    )}
                  </div>

                  {/* Media: imagen o video */}
                  {post.media && (
                    <div
                      className={cn(
                        'relative mx-5 mt-4 flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br',
                        post.media.gradient
                      )}
                    >
                      {post.media.type === 'video' && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm transition-transform hover:scale-110">
                            <Play className="h-6 w-6 text-white" fill="currentColor" />
                          </span>
                        </span>
                      )}
                      <div className="flex flex-col items-center gap-2 text-white/50">
                        {post.media.type === 'image' ? (
                          <Dumbbell className="h-8 w-8" />
                        ) : (
                          <Video className="h-8 w-8" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {post.media.label}
                        </span>
                      </div>
                      {post.media.type === 'video' && post.media.duration && (
                        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold text-white">
                          <Play className="h-3 w-3" fill="currentColor" />
                          {post.media.duration}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/5 px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRespect(post.id)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold uppercase tracking-widest transition-all',
                          isRespected
                            ? 'border-[#EF4444]/60 bg-[#EF4444]/15 text-[#EF4444]'
                            : 'border-white/10 bg-white/5 text-white/40 hover:text-white'
                        )}
                        aria-pressed={isRespected}
                      >
                        <Flame className={cn('h-4 w-4 transition-transform', isRespected && 'scale-125')} />
                        Respeto
                      </button>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-white/40 transition-all hover:text-white"
                        aria-expanded={isOpen}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {post.comments.length}
                      </button>
                    </div>
                    <span className="text-xs font-black text-white/60">
                      {post.respects} <span className="font-semibold text-white/30">respetos</span>
                    </span>
                  </div>

                  {/* Comentarios */}
                  {isOpen && (
                    <div className="space-y-3 border-t border-white/5 bg-black/30 px-5 py-4">
                      {post.comments.length > 0 && (
                        <ul className="space-y-2.5">
                          {post.comments.map((comment) => (
                            <li key={comment.id} className="flex items-start gap-2.5">
                              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/5 text-[9px] font-black text-white/50">
                                {initials(comment.user)}
                              </div>
                              <div className="rounded-xl bg-white/5 px-3 py-2">
                                <p className="text-xs font-bold text-white">{comment.user}</p>
                                <p className="text-xs text-white/60">{comment.text}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex items-center gap-2">
                        <input
                          value={draft[post.id] ?? ''}
                          onChange={(e) => setDraft((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitComment(post.id);
                          }}
                          placeholder="Escribe un comentario..."
                          className="flex-1 rounded-xl border border-white/10 bg-black/50 px-3.5 py-2.5 text-sm font-semibold text-white outline-none transition-all placeholder:text-white/25 focus:border-[#EF4444]"
                        />
                        <button
                          onClick={() => submitComment(post.id)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EF4444] text-white transition-all hover:bg-[#EF4444]/90"
                          aria-label="Enviar comentario"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </>
        )}

        {/* ===== AMIGOS ===== */}
        {tab === 'amigos' && (
          <>
            <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                  <Users className="h-4 w-4 text-[#EF4444]" />
                  Tus amigos
                </p>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                  {friends.length} amigos
                </span>
              </div>

              {friends.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-white/10 py-10 text-center">
                  <UserCheck className="mx-auto h-8 w-8 text-white/15" />
                  <p className="mt-2 text-sm text-white/40">Aún no tienes amigos</p>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {friends.map((friend) => (
                    <li
                      key={friend.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:border-white/15"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-white/60">
                            {initials(friend.name)}
                          </span>
                          <span
                            className={cn(
                              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0D0D0D]',
                              friend.online ? 'bg-green-500' : 'bg-white/20'
                            )}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{friend.name}</p>
                          <span
                            className={cn(
                              'mt-1 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest',
                              DIVISION_BADGE[friend.division] ?? DIVISION_BADGE.Plata
                            )}
                          >
                            <Trophy className="h-2.5 w-2.5" />
                            {friend.division}
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          'flex-shrink-0 text-[10px] font-bold uppercase tracking-widest',
                          friend.online ? 'text-green-400' : 'text-white/30'
                        )}
                      >
                        {friend.online ? 'En línea' : 'Offline'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                  <UserPlus className="h-4 w-4 text-[#EF4444]" />
                  Solicitudes de amistad / seguimiento
                </p>
                <span className="rounded-full border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#EF4444]">
                  {followRequests.length} pendientes
                </span>
              </div>

              {followRequests.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-white/10 py-10 text-center">
                  <UserCheck className="mx-auto h-8 w-8 text-white/15" />
                  <p className="mt-2 text-sm text-white/40">Sin solicitudes pendientes</p>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {followRequests.map((req) => {
                    const isAccepted = acceptedFollows.includes(req.id);
                    return (
                      <li
                        key={req.id}
                        className={cn(
                          'flex flex-col gap-3 rounded-2xl border p-4 transition-all sm:flex-row sm:items-center',
                          isAccepted ? 'border-green-500/40 bg-green-950/20' : 'border-white/5 bg-white/5'
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-white/60">
                            {initials(req.user)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-white">{req.user}</p>
                            <p className="truncate text-xs text-white/40">{req.note}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isAccepted ? (
                            <span className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-500/50 bg-green-950/40 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-green-200 sm:flex-none">
                              <Check className="h-4 w-4" />
                              Aceptado
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => acceptFollow(req.id)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#EF4444] px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#EF4444]/90 sm:flex-none"
                              >
                                <Check className="h-4 w-4" />
                                Aceptar
                              </button>
                              <button
                                onClick={() => rejectFollow(req.id)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white/40 transition-all hover:border-[#EF4444]/50 hover:text-[#EF4444] sm:flex-none"
                              >
                                <X className="h-4 w-4" />
                                Rechazar
                              </button>
                            </>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </>
        )}

        {/* ===== PERFIL ===== */}
        {tab === 'perfil' && (
          <>
            {/* Hero del perfil */}
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-[#0D0D0D] to-[#1a1a1a] p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border-2 border-[#FBBF24]/60 bg-[#FBBF24]/15 text-xl font-black text-[#FBBF24]">
                    {initials(own.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="break-words text-xl font-bold tracking-tight text-white">{own.name}</h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#FBBF24]/60 bg-[#FBBF24]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]">
                        <Crown className="h-3 w-3" />
                        {own.division.name}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <ShieldCheck className="h-3 w-3" />
                        Jugador
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {own.location.country} · {own.location.province}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" />
                        Pantafit
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-shrink-0 flex-col items-end">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                    Score ISG
                  </span>
                  <span className="text-4xl font-black tracking-tighter text-[#FBBF24]">
                    {own.isgScore.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <TrendingUp className="h-4 w-4 text-[#FBBF24]" />
                Estadísticas de rendimiento
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <Target className="h-4 w-4 text-[#EF4444]" />
                  <p className="mt-2 text-2xl font-black tracking-tighter text-white">18</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">PRs</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <CalendarCheck className="h-4 w-4 text-[#EF4444]" />
                  <p className="mt-2 text-2xl font-black tracking-tighter text-white">112</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Sesiones</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <Flame className="h-4 w-4 text-[#EF4444]" />
                  <p className="mt-2 text-2xl font-black tracking-tighter text-white">9</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Racha</p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                  <Dumbbell className="h-4 w-4 text-[#EF4444]" />
                  <p className="mt-2 text-2xl font-black tracking-tighter text-white">74%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Win rate</p>
                </div>
              </div>
            </div>

            {/* Datos corporales */}
            <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                <User className="h-4 w-4 text-[#EF4444]" />
                Datos corporales
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Peso corporal', value: `${own.weightKg} kg` },
                  { label: 'Altura', value: `${own.heightCm} cm` },
                  { label: 'Edad', value: `${own.age} años` },
                  { label: 'Gimnasio', value: 'Pantafit' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                    <p className="text-xl font-black tracking-tighter text-white">{item.value}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progreso semanal */}
            <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                  <TrendingUp className="h-4 w-4 text-[#FBBF24]" />
                  Volumen semanal
                </p>
                <span className="rounded-full border border-[#FBBF24]/40 bg-[#FBBF24]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FBBF24]">
                  +12% esta semana
                </span>
              </div>
              <div className="mt-5 flex items-end justify-between gap-2">
                {WEEK_PROGRESS.map((d, i) => (
                  <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-24 w-full items-end overflow-hidden rounded-xl bg-white/5">
                      <div
                        className={cn(
                          'w-full rounded-xl transition-all duration-300',
                          i % 2 === 0 ? 'bg-[#EF4444]' : 'bg-[#FBBF24]',
                          d.pct === 100 && 'shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                        )}
                        style={{ height: `${d.pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                      {d.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ===== MENSAJES ===== */}
        {tab === 'mensajes' && (
          activeConversation === null ? (
            <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                  <MessageSquare className="h-4 w-4 text-[#EF4444]" />
                  Bandeja de mensajes
                </p>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/50">
                  {conversations.length} chats
                </span>
              </div>

              {conversations.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-white/10 py-10 text-center">
                  <MessageSquare className="mx-auto h-8 w-8 text-white/15" />
                  <p className="mt-2 text-sm text-white/40">Sin conversaciones todavía</p>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {conversations.map((chat) => {
                    const lastMessage = chat.messages[chat.messages.length - 1];
                    return (
                      <li key={chat.id}>
                        <button
                          onClick={() => openChat(chat.id)}
                          className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-left transition-all hover:border-white/15"
                        >
                          <div className="relative flex-shrink-0">
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-white/60">
                              {initials(chat.user)}
                            </span>
                            <span
                              className={cn(
                                'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0D0D0D]',
                                chat.online ? 'bg-green-500' : 'bg-white/20'
                              )}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-bold text-white">{chat.user}</p>
                              <span className="flex-shrink-0 text-[10px] font-semibold text-white/30">
                                {lastMessage?.time}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center justify-between gap-2">
                              <p className="truncate text-xs text-white/40">{lastMessage?.text}</p>
                              {chat.unread > 0 && (
                                <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#EF4444] px-1.5 text-[10px] font-black text-white">
                                  {chat.unread}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
                              {chat.roleLabel}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            <div className="flex h-[64dvh] min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#0D0D0D]">
              {/* Header del chat */}
              <div className="flex flex-shrink-0 items-center gap-3 border-b border-white/5 p-4">
                <button
                  onClick={() => setActiveChatId(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-black/40 text-white/60 transition-all hover:text-white"
                  aria-label="Volver a la bandeja"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="relative flex-shrink-0">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-white/60">
                    {initials(activeConversation.user)}
                  </span>
                  <span
                    className={cn(
                      'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0D0D0D]',
                      activeConversation.online ? 'bg-green-500' : 'bg-white/20'
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{activeConversation.user}</p>
                  <p className="truncate text-[10px] font-bold uppercase tracking-widest text-white/40">
                    {activeConversation.roleLabel}
                    <span className="ml-2 font-semibold normal-case text-white/30">
                      {activeConversation.online ? '· En línea' : ''}
                    </span>
                  </p>
                </div>
              </div>

              {/* Mensajes */}
              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4 scrollbar-hide">
                {activeConversation.messages.map((message) => {
                  const isMine = message.from === 'me';
                  const isVoicePlaying = voicePlayingId === message.id;
                  const progress = voiceProgress[message.id] ?? 0;
                  return (
                    <div key={message.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-4 py-2.5',
                          isMine
                            ? 'border border-[#EF4444]/40 bg-[#EF4444]/15 text-white'
                            : 'border border-white/5 bg-white/5 text-white/90'
                        )}
                      >
                        {message.text && (
                          <p className="text-sm font-semibold leading-relaxed">{message.text}</p>
                        )}

                        {message.attachments?.map((att) => (
                          <div key={`${message.id}-${att.type}`}>
                            {att.type === 'voice' && (
                              <div
                                className={cn(
                                  'mt-2 flex items-center gap-3 rounded-2xl border px-3 py-2.5',
                                  isMine
                                    ? 'border-[#EF4444]/30 bg-[#EF4444]/10'
                                    : 'border-white/5 bg-black/40'
                                )}
                              >
                                <button
                                  onClick={() => toggleVoice(message.id)}
                                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#EF4444] text-white transition-transform hover:scale-105"
                                  aria-label={isVoicePlaying ? 'Pausar nota de voz' : 'Reproducir nota de voz'}
                                >
                                  {isVoicePlaying ? (
                                    <Pause className="h-4 w-4" fill="currentColor" />
                                  ) : (
                                    <Play className="h-4 w-4 pl-0.5" fill="currentColor" />
                                  )}
                                </button>
                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                  <div className="flex h-7 items-center gap-0.5">
                                    {WAVEFORM_BARS.map((height, i) => {
                                      const isReached = isVoicePlaying && (i / WAVEFORM_BARS.length) * 100 <= progress;
                                      return (
                                        <span
                                          key={i}
                                          className={cn(
                                            'w-1 rounded-full transition-all duration-150',
                                            i % 2 === 0 ? 'bg-[#EF4444]' : 'bg-[#FBBF24]',
                                            isVoicePlaying && isReached && 'opacity-100',
                                            isVoicePlaying && !isReached && 'opacity-30',
                                            !isVoicePlaying && 'opacity-50'
                                          )}
                                          style={{ height: `${height}px` }}
                                        />
                                      );
                                    })}
                                  </div>
                                  <div className="flex items-center justify-between gap-2">
                                    <span className={cn('text-[10px] font-bold uppercase tracking-widest', isMine ? 'text-[#FBBF24]/80' : 'text-white/40')}>
                                      {isVoicePlaying ? 'Reproduciendo...' : 'Nota de voz'}
                                    </span>
                                    <span className={cn('text-[10px] font-semibold', isMine ? 'text-white/50' : 'text-white/30')}>
                                      {att.duration}
                                    </span>
                                  </div>
                                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                                    <div
                                      className="h-full rounded-full bg-[#FBBF24] transition-all duration-150"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {att.type === 'image' && (
                              <div className="mt-2 flex h-36 items-center justify-center rounded-2xl border border-white/5 bg-gradient-to-br from-[#1a1a1a] via-[#FBBF24]/15 to-[#0D0D0D]">
                                <div className="flex flex-col items-center gap-1.5 text-white/50">
                                  <ImagePlus className="h-7 w-7" />
                                  <span className="px-2 text-center text-[10px] font-bold uppercase tracking-widest">
                                    {att.label ?? 'Imagen'}
                                  </span>
                                </div>
                              </div>
                            )}

                            {att.type === 'video' && (
                              <div className="relative mt-2 flex h-36 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0D0D0D] via-[#38BDF8]/15 to-[#1a1a1a]">
                                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 backdrop-blur-sm">
                                  <Play className="h-5 w-5 text-white" fill="currentColor" />
                                </span>
                                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-2 text-[10px] font-bold text-white/80">
                                  <span className="flex items-center gap-1 uppercase tracking-widest">
                                    <Video className="h-3 w-3" />
                                    {att.label ?? 'Video'}
                                  </span>
                                  {att.duration && (
                                    <span className="rounded-full bg-black/60 px-2 py-0.5">{att.duration}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        <p className={cn('mt-1 text-right text-[10px] font-semibold', isMine ? 'text-[#FBBF24]/70' : 'text-white/30')}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input */}
              <div className="flex flex-shrink-0 flex-col border-t border-white/5 p-4">
                {pendingAttachment && (
                  <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center rounded-xl border border-white/5 bg-gradient-to-br from-[#1a1a1a] via-[#EF4444]/15 to-[#0D0D0D]">
                      {pendingAttachment.type === 'voice' ? (
                        <Mic className="h-5 w-5 text-[#EF4444]" />
                      ) : pendingAttachment.type === 'video' ? (
                        <Play className="h-5 w-5 text-white/70" fill="currentColor" />
                      ) : (
                        <ImagePlus className="h-5 w-5 text-white/70" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold uppercase tracking-widest text-white/60">
                        {pendingAttachment.type === 'voice'
                          ? `Nota de voz · ${pendingAttachment.duration}`
                          : pendingAttachment.label ?? pendingAttachment.type}
                      </p>
                      <button
                        onClick={() => setPendingAttachment(null)}
                        className="mt-1 text-xs font-bold text-[#EF4444] transition-all hover:text-[#EF4444]/80"
                      >
                        Quitar adjunto
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onClick={() => setAttachMenuOpen((v) => !v)}
                      className={cn(
                        'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition-all',
                        attachMenuOpen
                          ? 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]'
                          : 'border-white/10 bg-black/50 text-white/40 hover:text-white'
                      )}
                      aria-label="Adjuntar archivo"
                      aria-expanded={attachMenuOpen}
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    {attachMenuOpen && (
                      <div className="absolute bottom-full left-0 z-20 mb-2 w-40 space-y-1 rounded-2xl border border-white/10 bg-[#0D0D0D] p-2 shadow-xl">
                        <button
                          onClick={() => {
                            setPendingAttachment({ type: 'image', label: 'Imagen' });
                            setAttachMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-white/60 transition-all hover:bg-white/5 hover:text-white"
                        >
                          <ImagePlus className="h-4 w-4" />
                          Imagen
                        </button>
                        <button
                          onClick={() => {
                            setPendingAttachment({ type: 'video', label: 'Video', duration: '00:15' });
                            setAttachMenuOpen(false);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold uppercase tracking-widest text-white/60 transition-all hover:bg-white/5 hover:text-white"
                        >
                          <Video className="h-4 w-4" />
                          Video
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setPendingAttachment({ type: 'voice', label: 'Nota de voz', duration: '0:08' })}
                    className={cn(
                      'flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border transition-all',
                      pendingAttachment?.type === 'voice'
                        ? 'border-[#EF4444]/50 bg-[#EF4444]/10 text-[#EF4444]'
                        : 'border-white/10 bg-black/50 text-white/40 hover:text-[#EF4444]'
                    )}
                    aria-label="Grabar nota de voz"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <input
                    value={chatDraft}
                    onChange={(e) => setChatDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendMessage();
                    }}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-semibold text-white outline-none transition-all placeholder:text-white/25 focus:border-[#EF4444]"
                  />
                  <button
                    onClick={sendMessage}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#EF4444] text-white transition-all hover:bg-[#EF4444]/90 disabled:opacity-40"
                    disabled={!chatDraft.trim() && !pendingAttachment}
                    aria-label="Enviar mensaje"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}