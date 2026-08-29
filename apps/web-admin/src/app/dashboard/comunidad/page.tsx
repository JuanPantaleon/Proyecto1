'use client';

import { useEffect, useState, useRef} from 'react';
import { useUser } from '@clerk/nextjs';
import { Flame, Send, ImagePlus, X, Check, Users, User, MessageSquare, Newspaper, ArrowLeft, Skull, Crown, ClipboardList, MapPin, Search, Play, Loader2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

/* ----------------------------- Tipos ----------------------------- */
interface ApiUser { id: string; name?: string; email?: string; imageUrl?: string | null; role?: string; gymId?: string | null; streakDays?: number; }
interface ApiPost {
  id: string; type: string; text: string; mediaUrl?: string | null; mediaKind?: string | null;
  mediaDurationSec?: number | null; liftName?: string | null; weightKg?: number | null; reps?: number | null;
  isgScore?: number | null; createdAt: string; author: ApiUser;
  reactions: { FIRE?: number; SKULL?: number; CROWN?: number };
  myReactions: { FIRE?: boolean; SKULL?: boolean; CROWN?: boolean };
  comments: { id: string; text: string; createdAt: string; author: ApiUser }[];
}
interface Connection { id: string; type: string; user: ApiUser; }
interface FollowRequest { id: string; type: string; status: string; user: ApiUser; createdAt: string; }
interface ChatRoom { id: string; name: string; isGroup: boolean; members: ApiUser[]; lastMessage: { id?: string; text?: string; createdAt?: string; senderId?: string } | null; }
interface ChatMessage { id: string; roomId: string; senderId: string; text: string; mediaUrl?: string | null; mediaKind?: string | null; createdAt: string; sender: ApiUser; }

type Tab = 'feed' | 'amigos' | 'perfil' | 'mensajes' | 'solicitudes';
type ReactionKey = 'FIRE' | 'SKULL' | 'CROWN';
type FeedFilter = 'all' | 'following' | 'local' | 'elite';

/* ----------------------------- Helpers ----------------------------- */
const initials = (n?: string) => (n ?? '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
function timeAgo(iso?: string): string {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'ahora';
  const m = Math.floor(s / 60); if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60); if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24); if (d < 7) return `hace ${d} d`;
  return new Date(iso).toLocaleDateString();
}
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
const mediaKindOf = (p: ApiPost): 'IMAGE' | 'VIDEO' | null => {
  if (p.mediaKind) return p.mediaKind as 'IMAGE' | 'VIDEO';
  if (p.mediaUrl?.match(/\.(mp4|webm|ogg)$/i)) return 'VIDEO';
  if (p.mediaUrl) return 'IMAGE';
  return null;
};
const REACTIONS: { key: ReactionKey; label: string; icon: typeof Flame; activeClass: string }[] = [
  { key: 'FIRE', label: 'Respeto', icon: Flame, activeClass: 'border-[#EF4444]/60 bg-[#EF4444]/15 text-[#EF4444]' },
  { key: 'SKULL', label: 'Brutal', icon: Skull, activeClass: 'border-white/40 bg-white/10 text-white' },
  { key: 'CROWN', label: 'Legendario', icon: Crown, activeClass: 'border-[#FBBF24]/60 bg-[#FBBF24]/15 text-[#FBBF24]' },
];
const FEED_FILTERS: FeedFilter[] = ['all', 'following', 'local', 'elite'];
const FILTER_LABEL: Record<FeedFilter, string> = { all: 'Todo', following: 'Siguiendo', local: 'Mi gimnasio', elite: 'Legendario' };

/* ----------------------------- Tabs ----------------------------- */
const Avatar = ({ u, size = 40 }: { u: { name?: string; imageUrl?: string | null }; size?: number }) =>
  u.imageUrl ? (
    <img
      src={u.imageUrl}
      alt=""
      width={size}
      height={size}
      className="rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      className="flex items-center justify-center rounded-full bg-[#1a1a1a] text-[#FBBF24] font-bold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials(u.name)}
    </div>
  );
function FeedTab({
  tab, setTab, feedFilter, setFeedFilter, posts, loadingFeed, myReactions, followed, openComments, setOpenComments,
  draft, setDraft, meId, meName, avatarUrl, publish, fetchFeed,
  newText, setNewText, filePreview, setFilePreview, videoDuration, setVideoDuration,
  file, setFile, fileInputRef, handleFileChange, toggleReaction, submitComment, follow, me,
  publishing
}: any) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-[#111] p-4">
        <div className="flex gap-3">
          <Avatar u={{ name: meName, imageUrl: avatarUrl }} />
          <div className="flex-1">
            <textarea value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="¿Qué lograste hoy, guerrero?" rows={2}
              className="w-full resize-none rounded-xl border border-white/10 bg-[#0c0c0c] p-3 text-sm outline-none focus:border-[#FBBF24]/50" />
            {filePreview && (
              <div className="relative mt-2">
                {videoDuration !== null && file?.type.startsWith('video') ? (
                  <video src={filePreview} className="max-h-64 w-full rounded-xl" controls />
                ) : <img src={filePreview} className="max-h-64 w-full rounded-xl object-cover" alt="" />}
                <button onClick={() => { setFile(null); setFilePreview(null); setVideoDuration(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute right-2 top-2 rounded-full bg-black/70 p-1"><X className="h-4 w-4" /></button>
              </div>
            )}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/70 hover:text-white"><ImagePlus className="h-4 w-4" />Foto/Video</button>
                {me?.locationProvince && <span className="flex items-center gap-1 text-xs text-white/40"><MapPin className="h-3 w-3" />{me.locationProvince}</span>}
              </div>
              <button onClick={publish} disabled={publishing || (!newText.trim() && !file)}
                className="flex items-center gap-1 rounded-full bg-[#FBBF24] px-4 py-1.5 text-sm font-bold text-black disabled:opacity-40">
                {publishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publicar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {FEED_FILTERS.map((f) => (
          <button key={f} onClick={() => setFeedFilter(f)}
            className={cn('rounded-full px-3 py-1 text-xs font-semibold', feedFilter === f ? 'bg-white/15 text-white' : 'bg-[#1a1a1a] text-white/50')}>{FILTER_LABEL[f]}</button>
        ))}
      </div>

      {loadingFeed ? <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-[#FBBF24]" /></div>
        : posts.length === 0 ? <p className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center text-white/50">Aun no hay publicaciones. ¡Sé el primero en compartir tu progreso!</p>
          : posts.map((p : any) => <PostCard key={p.id} post={p} onReact={toggleReaction} onComment={submitComment} onFollow={follow}
              isFollowed={followed.has(p.author.id)} showComments={openComments.has(p.id)}
              toggleComments={(id) => setOpenComments((prev: any) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })}
              draft={draft[p.id] ?? ''} setDraft={(id, v) => setDraft((prev: any) => ({ ...prev, [id]: v }))}
              meId={meId} meName={meName} avatarUrl={avatarUrl} />
      )}
    </div>
  );
}

function AmigosTab({
  tab, setTab, searchQuery, doSearch, searching, searchResults, followed, startChatWith,
  requests, respondRequest, fetchFriends, follow, linkedCount, linkedAthletes, friends, me
}: any) {
  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input value={searchQuery} onChange={(e) => doSearch(e.target.value)} placeholder="Buscar por nombre o email..."
          className="w-full rounded-full border border-white/10 bg-[#111] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#FBBF24]/50" />
      </div>

      {searching && <p className="text-sm text-white/40">Buscando...</p>}
      {searchResults.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-white/40">Resultados</p>
          {searchResults.map((u: any) => (
            <div key={u.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111] p-3">
              <Avatar u={u} />
              <div className="flex-1"><p className="font-semibold">{u.name || u.email}</p><p className={cn('text-xs', roleColor(u.role))}>{roleLabel(u.role)}</p></div>
              {followed.has(u.id) ? <span className="text-xs text-white/40">Solicitud enviada</span>
                : <button onClick={() => follow(u.id)} className="flex items-center gap-1 rounded-full bg-[#EF4444] px-3 py-1 text-xs font-semibold text-white">
                  <UserPlus className="h-3 w-3" />Seguir</button>}
              <button onClick={() => startChatWith(u)} className="rounded-full border border-white/10 p-2 text-white/60 hover:text-white">
                <MessageSquare className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-white/40">{me?.role === 'TRAINER' || me?.role === 'SUPER_ADMIN' ? 'Atletas vinculados' : 'Amigos'} ({linkedCount})</p>
        {(me?.role === 'TRAINER' || me?.role === 'SUPER_ADMIN' ? linkedAthletes : friends.map((f: any) => f.user)).map((u: any) => (
          <div key={u.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111] p-3">
            <Avatar u={u} /><div className="flex-1"><p className="font-semibold">{u.name || u.email}</p><p className={cn('text-xs', roleColor(u.role))}>{roleLabel(u.role)}</p></div>
            <button onClick={() => startChatWith(u)} className="rounded-full border border-white/10 p-2 text-white/60 hover:text-white">
              <MessageSquare className="h-4 w-4" /></button>
          </div>
        ))}
        {(me?.role === 'TRAINER' || me?.role === 'SUPER_ADMIN' ? linkedAthletes.length === 0 : friends.length === 0) && <p className="text-sm text-white/40">Sin conexiones hoy.</p>}
      </div>
    </div>
  );
}

function SolicitudesTab({
  meRole, staffRequests, respondRequest
}: any) {
  return meRole === 'TRAINER' || meRole === 'SUPER_ADMIN' ? (
    <div className="space-y-2">
      {staffRequests.length === 0 ? <p className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center text-white/50">No hay solicitudes de vinculación.</p>
        : staffRequests.map((r: FollowRequest) => (
          <div key={r.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#111] p-3">
            <Avatar u={r.user} /><div className="flex-1"><p className="font-semibold">{r.user.name || r.user.email}</p><p className="text-xs text-white/50">Quiere unirse a tu grupo</p></div>
            <button onClick={() => respondRequest(r.id, 'ACCEPTED')} className="rounded-full bg-[#FBBF24] px-3 py-1 text-xs font-semibold text-black">Aceptar</button>
            <button onClick={() => respondRequest(r.id, 'REJECTED')} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Rechazar</button>
          </div>
        ))}
    </div>
  ) : null;
}

function PerfilTab({
  tab, meName, me, myPosts, linkedCount, linkedAthletes, friends,
  avatarUrl, openComments, setOpenComments, draft, setDraft, meId,
  toggleReaction, submitComment, follow
}: any) {
   return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#0c0c0c] p-6 text-center">
        <div className="mx-auto mb-3"><Avatar u={{ name: meName, imageUrl: avatarUrl }} size={80} /></div>
        <h2 className="text-xl font-bold">{meName}</h2>
        <p className={cn('text-sm', roleColor(me?.role))}>{roleLabel(me?.role)}</p>
        {me?.locationProvince && (
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-white/40">
            <MapPin className="h-3 w-3" />{me.locationProvince}{me.locationCountry ?`, ${me.locationProvince ? '' : ``}${me.locationCountry}` : ``}
          </p>
        )}
        <div className="mt-4 flex justify-center gap-6">
          <div><p className="text-2xl font-black text-[#FBBF24]">{myPosts.length}</p><p className="text-xs text-white/50">Publicaciones</p></div>
          <div><p className="text-2xl font-black text-[#FBBF24]">{linkedCount}</p><p className="text-xs text-white/50">{me?.role === 'TRAINER' || me?.role === 'SUPER_ADMIN' ? 'Atletas' : 'Amigos'}</p></div>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase text-white/40">Mis publicaciones</p>
        {myPosts.length === 0 ? <p className="text-sm text-white/40">Aun no has publicado.</p>
          : myPosts.map((p: ApiPost) => <PostCard key={p.id} post={p} onReact={toggleReaction} onComment={submitComment} onFollow={follow} isFollowed={false} showComments={openComments.has(p.id)} toggleComments={(id) => setOpenComments((prev: Set<string>) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; })} draft={draft[p.id] ?? ''} setDraft={(id, v) => setDraft((prev: Record<string, string>) => ({ ...prev, [id]: v }))} meId={meId} meName={meName} avatarUrl={avatarUrl} />)}
      </div>
    </div>
  );
}

function MensajesTab({
  tab, activeRoomId, openRooms, setActiveRoomId, openMessages, activeRoom, rooms, loadingRooms,
  chatDraft, setChatDraft, sendMessage, openRoom, fetchRooms, meId, meName, avatarUrl
}: any) {
  const activeRoomData = rooms.find((r: ChatRoom) => r.id === activeRoomId) || null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111]">
      {!activeRoomData && (
        <div className="p-3">
          <p className="mb-2 px-1 text-xs font-semibold uppercase text-white/40">Conversaciones</p>
          {loadingRooms ? <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-[#FBBF24]" /></div>
            : rooms.length === 0 ? <p className="px-1 text-sm text-white/40">Sin chats. Busca un amigo y pulsa el icono de mensaje.</p>
              : rooms.map((r: ChatRoom) => {
                const other = r.members.find((m) => m.id !== meId);
                return (
                  <button key={r.id} onClick={() => openRoom(r.id)} className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-white/5">
                    <Avatar u={other ?? r} />
                    <div className="flex-1 truncate"><p className="font-semibold">{other?.name || r.name || 'Grupo'}</p><p className="truncate text-xs text-white/50">{r.lastMessage?.text || 'Sin mensajes'}</p></div>
                    {r.lastMessage && r.lastMessage.senderId !== meId && <span className="h-2 w-2 rounded-full bg-[#EF4444]" />}
                  </button>
                );
              })}
        </div>
      )}

      {activeRoomData && (
        <div className="flex h-[70vh] flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 p-3">
            <button onClick={() => setActiveRoomId(null)} className="rounded-full border border-white/10 p-1.5"><ArrowLeft className="h-4 w-4" /></button>
            <Avatar u={activeRoomData.members.find((m: ApiUser) => m.id !== meId) ?? activeRoomData} />
            <p className="font-semibold">{activeRoomData.members.find((m: ApiUser) => m.id !== meId)?.name || activeRoomData.name || 'Grupo'}</p>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {openMessages.map((m: ChatMessage) => {
              const mine = m.senderId === meId;
              return (
                <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div className={cn('max-w-[75%] rounded-2xl px-3 py-2 text-sm', mine ? 'bg-[#FBBF24] text-black' : 'bg-[#1a1a1a] text-white')}>
                    {m.mediaUrl && (mediaKindOf({ mediaUrl: m.mediaUrl, mediaKind: m.mediaKind } as ApiPost) === 'VIDEO'
                      ? <video src={m.mediaUrl} controls className="mb-1 max-h-48 rounded-lg" />
                      : <img src={m.mediaUrl} alt="" className="mb-1 max-h-48 rounded-lg" />)}
                    {m.text && <p>{m.text}</p>}
                    <p className={cn('mt-1 text-[10px]', mine ? 'text-black/50' : 'text-white/30')}>{timeAgo(m.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 p-3">
            <input value={chatDraft} onChange={(e) => setChatDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Escribe un mensaje..." className="flex-1 rounded-full border border-white/10 bg-[#0c0c0c] px-4 py-2 text-sm outline-none focus:border-[#FBBF24]/50" />
            <button onClick={sendMessage} className="rounded-full bg-[#FBBF24] p-2.5 text-black"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function PostCard({
  post,
  onReact,
  onComment,
  onFollow,
  isFollowed,
  showComments,
  toggleComments,
  draft,
  setDraft,
  meId,
  meName,
  avatarUrl,
}: {
  post: ApiPost;
  onReact: (p: ApiPost, k: ReactionKey) => void;
  onComment: (p: ApiPost) => void;
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
            {isFollowed ? <Check className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}{isFollowed ? 'Enviado' : 'Seguir'}
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

      {(post.liftName || post.weightKg) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {post.liftName && <span className="rounded-full bg-[#FBBF24]/15 px-2 py-1 font-semibold text-[#FBBF24]">{post.liftName}</span>}
          {post.weightKg != null && <span className="rounded-full bg-white/10 px-2 py-1">{post.weightKg} kg{post.reps != null ? ` �- ${post.reps}` : ''}</span>}
          {post.isgScore != null && <span className="rounded-full bg-[#38BDF8]/15 px-2 py-1 text-[#38BDF8]">ISG {Math.round(post.isgScore)}</span>}
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

export default function ComunidadPage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const avatarUrl = clerkUser?.imageUrl ?? null;
  const clerkName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || clerkUser?.username || 'T';
  const meId = clerkUser?.id;

  const [me, setMe] = useState<{ id: string; name: string; role?: string; locationCountry?: string | null; locationProvince?: string | null } | null>(null);
  const meName = me?.name || clerkName;

  const [tab, setTab] = useState<Tab>('feed');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const [posts, setPosts] = useState<ApiPost[]>([]);
  const [myReactions, setMyReactions] = useState<Record<string, Partial<Record<ReactionKey, boolean>>>>({});
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [newText, setNewText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [friends, setFriends] = useState<Connection[]>([]);
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [followed, setFollowed] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ApiUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [staffRequests, setStaffRequests] = useState<FollowRequest[]>([]);
  const [linkedAthletes, setLinkedAthletes] = useState<ApiUser[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [chatDraft, setChatDraft] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!clerkLoaded) return;
    api.get<{ id: string; firstName?: string | null; lastName?: string | null; role?: string; locationCountry?: string | null; locationProvince?: string | null }>('/api/v1/auth/me')
      .then((m) => setMe({ id: m.id, name: [m.firstName, m.lastName].filter(Boolean).join(' ') || clerkName, role: m.role, locationCountry: m.locationCountry, locationProvince: m.locationProvince }))
      .catch(() => undefined);
  }, [clerkLoaded, clerkName]);

  const fetchFeed = (filter: FeedFilter) => {
    setLoadingFeed(true);
    api.get<ApiPost[]>('/api/v1/comunidad/feed', { filter })
      .then((apiPosts) => {
        const list = Array.isArray(apiPosts) ? apiPosts : [];
        setPosts(list);
        const mr: Record<string, Partial<Record<ReactionKey, boolean>>> = {};
        list.forEach((p) => { if (p.myReactions) mr[p.id] = p.myReactions; });
        setMyReactions(mr);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoadingFeed(false));
  };
  useEffect(() => { fetchFeed(feedFilter); }, [feedFilter]);

  const fetchFriends = () => api.get<Connection[]>('/api/v1/relaciones/conexiones').then(setFriends).catch(() => setFriends([]));
  const fetchRequests = () =>
    api.get<FollowRequest[]>('/api/v1/relaciones/solicitudes')
      .then((rs) => { setRequests(rs.filter((r) => r.type !== 'COACH_ATHLETE')); setStaffRequests(rs.filter((r) => r.type === 'COACH_ATHLETE')); })
      .catch(() => undefined);
  const fetchLinked = () => {
    if (!meId) return;
    const url = me?.role === 'TRAINER' || me?.role === 'SUPER_ADMIN' ? '/api/v1/relaciones/gimnasio/jugadores' : '/api/v1/relaciones/coach/atletas';
    api.get<ApiUser[]>(url).then(setLinkedAthletes).catch(() => setLinkedAthletes([]));
  };
  useEffect(() => { if (meId) { fetchFriends(); fetchRequests(); fetchLinked(); } }, [meId]);

  const fetchRooms = (openId?: string) => {
    setLoadingRooms(true);
    api.get<ChatRoom[]>('/api/v1/chat/salas')
      .then((rs) => { setRooms(rs); if (openId && !activeRoomId) setActiveRoomId(openId); })
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  };
  useEffect(() => { if (meId) fetchRooms(); }, [meId]);

  const openRoom = (id: string) => {
    setActiveRoomId(id);
    api.get<ChatMessage[]>('/api/v1/chat/salas/' + id + '/mensajes').then(setActiveMessages).catch(() => setActiveMessages([]));
    api.put('/api/v1/chat/salas/' + id + '/leido').catch(() => undefined);
  };

  const startChatWith = (other: ApiUser) => {
    const existing = rooms.find((r) => !r.isGroup && r.members.some((m) => m.id === other.id));
    if (existing) { openRoom(existing.id); setTab('mensajes'); return; }
    api.post<ChatRoom>('/api/v1/chat/salas', { memberIds: [other.id] })
      .then((room) => { fetchRooms(); openRoom(room.id); setTab('mensajes'); })
      .catch(() => undefined);
  };

  const publish = async () => {
    if (!meId) return;
    if (!newText.trim() && !file) return;
    setPublishing(true);
    try {
      let mediaUrl: string | null = null;
      let mediaKind: 'IMAGE' | 'VIDEO' | null = null;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await api.upload<{ url: string; mediaKind: 'IMAGE' | 'VIDEO' }>('/api/v1/media/upload', fd);
        mediaUrl = up.url; mediaKind = up.mediaKind;
      }
      const payload: Record<string, unknown> = { text: newText.trim() };
      if (mediaUrl) { payload.type = 'MEDIA'; payload.mediaUrl = mediaUrl; payload.mediaKind = mediaKind; if (mediaKind === 'VIDEO') payload.mediaDurationSec = videoDuration; }
      await api.post('/api/v1/comunidad/posts', payload);
      setNewText(''); setFile(null); setFilePreview(null); setVideoDuration(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchFeed(feedFilter);
    } finally { setPublishing(false); }
  };

  const toggleReaction = (post: ApiPost, key: ReactionKey) => {
    const cur = myReactions[post.id]?.[key] ?? false;
    setMyReactions((prev) => ({ ...prev, [post.id]: { ...prev[post.id], [key]: !cur } }));
    setPosts((prev) => prev.map((p) => p.id === post.id ? {
      ...p,
      reactions: { ...p.reactions, [key]: Math.max(0, (p.reactions[key] ?? 0) + (cur ? -1 : 1)) },
    } : p));
    api.post('/api/v1/comunidad/posts/' + post.id + '/reacciones', { type: key }).catch(() => undefined);
  };

  const submitComment = (post: ApiPost) => {
    const text = draft[post.id]?.trim();
    if (!text) return;
    const optimistic = { id: 'tmp-' + Date.now(), text, createdAt: new Date().toISOString(), author: { id: meId, name: meName, imageUrl: avatarUrl } as ApiUser };
    setPosts((prev) => prev.map((p) => p.id === post.id ? { ...p, comments: [...p.comments, optimistic] } : p));
    setDraft((prev) => ({ ...prev, [post.id]: '' }));
    api.post('/api/v1/comunidad/posts/' + post.id + '/comentarios', { text }).catch(() => undefined);
  };

  const follow = (authorId: string) => {
    if (authorId === meId) return;
    setFollowed((prev) => new Set(prev).add(authorId));
    api.post('/api/v1/relaciones/solicitud', { addresseeId: authorId, type: 'FRIEND' }).catch(() => undefined);
  };

  const respondRequest = (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    api.put('/api/v1/relaciones/solicitud/' + id, { status })
      .then(() => { fetchRequests(); fetchFriends(); })
      .catch(() => undefined);
  };

  const doSearch = (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    api.get<ApiUser[]>('/api/v1/relaciones/usuarios', { q })
      .then((res) => setSearchResults(res.filter((u) => u.id !== meId)))
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  };

  const sendMessage = () => {
    if (!activeRoomId || !chatDraft.trim() || !meId) return;
    const text = chatDraft.trim();
    const optimistic = { id: 'tmp-' + Date.now(), roomId: activeRoomId, senderId: meId, text, createdAt: new Date().toISOString(), sender: { id: meId, name: meName, imageUrl: avatarUrl } as ApiUser };
    setActiveMessages((prev) => [...prev, optimistic]);
    setRooms((prev) => prev.map((r) => r.id === activeRoomId ? { ...r, lastMessage: { text, senderId: meId, createdAt: new Date().toISOString() } } : r));
    setChatDraft('');
    api.post('/api/v1/chat/salas/' + activeRoomId + '/mensajes', { text }).catch(() => undefined);
  };

  const myPosts = posts.filter((p) => p.author.id === meId);
  const linkedCount = me?.role === 'TRAINER' || me?.role === 'SUPER_ADMIN' ? linkedAthletes.length : friends.length;
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || null;
  const unreadRooms = rooms.filter((r) => r.lastMessage && r.lastMessage.senderId !== meId).length;

  const TABS: { id: Tab; label: string; icon: typeof Flame; badge?: number }[] = [
    { id: 'feed', label: 'Feed', icon: Newspaper },
    { id: 'amigos', label: 'Amigos', icon: Users, badge: requests.length },
    ...(me?.role === 'TRAINER' || me?.role === 'SUPER_ADMIN' ? [{ id: 'solicitudes' as Tab, label: 'Solicitudes', icon: ClipboardList, badge: staffRequests.length }] : []),
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'mensajes', label: 'Mensajes', icon: MessageSquare, badge: unreadRooms },
  ];


  const handleFileChange = (e: any) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setFilePreview(url);
      if (f.type.startsWith('video')) {
        const v = document.createElement('video');
        v.preload = 'metadata';
        v.onloadedmetadata = () => setVideoDuration(Math.round(v.duration));
        v.src = url;
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6 text-white">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black tracking-tight">
            <Flame className="text-[#EF4444]" /> <span className="text-[#FBBF24]">RANKED</span> FITNESS
          </h1>
          <p className="text-sm text-white/50">{roleLabel(me?.role)} �� Comunidad</p>
        </div>
        <button onClick={() => setTab('mensajes')} className="relative rounded-full border border-white/10 bg-[#1a1a1a] p-2.5">
          <MessageSquare className="h-5 w-5" />{unreadRooms > 0 && <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#EF4444] text-[10px] font-bold leading-4">{unreadRooms}</span>}
        </button>
      </header>

      <nav className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'amigos') fetchFriends(); }}
              className={cn('flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition', active ? 'bg-[#FBBF24] text-black' : 'bg-[#1a1a1a] text-white/70 hover:text-white')}>
              <Icon className="h-4 w-4" />{t.label}
              {t.badge ? <span className={cn('ml-1 rounded-full px-1.5 text-[10px] font-bold', active ? 'bg-black/20 text-black' : 'bg-[#EF4444] text-white')}>{t.badge}</span> : null}
            </button>
          );
        })}
      </nav>

{tab === 'feed' ? (
        <FeedTab
          tab={tab}
          setTab={setTab}
          feedFilter={feedFilter}
          setFeedFilter={setFeedFilter}
          posts={posts}
          loadingFeed={loadingFeed}
          myReactions={myReactions}
          followed={followed}
          openComments={openComments}
          draft={draft}
          setDraft={setDraft}
          meId={meId}
          meName={meName}
          avatarUrl={avatarUrl}
          newText={newText}
          setNewText={setNewText}
          file={file}
          filePreview={filePreview}
          videoDuration={videoDuration}
          setFile={setFile}
          setFilePreview={setFilePreview}
          setVideoDuration={setVideoDuration}
          publishing={publishing}
          publish={publish}
          fetchFeed={fetchFeed}
          toggleReaction={toggleReaction}
          submitComment={submitComment}
          follow={follow}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
          me={me}
        />
      ) : null}

{tab === 'amigos' ? (
        <AmigosTab
          tab={tab}
          setTab={setTab}
          searchQuery={searchQuery}
          doSearch={doSearch}
          searching={searching}
          searchResults={searchResults}
          followed={followed}
          startChatWith={startChatWith}
          requests={requests}
          respondRequest={respondRequest}
          fetchFriends={fetchFriends}
          follow={follow}
          me={me}
          linkedCount={linkedCount}
          linkedAthletes={linkedAthletes}
          friends={friends}
        />
      ) : null}

{tab === 'solicitudes' ? (me?.role === 'TRAINER' || me?.role === 'SUPER_ADMIN' ? (
        <SolicitudesTab
          meRole={me?.role}
          staffRequests={staffRequests}
          respondRequest={respondRequest}
        />
      ) : null) : null}

{tab === 'perfil' ? (
        <PerfilTab
          tab={tab}
          meName={meName}
          me={me}
          myPosts={myPosts}
          linkedCount={linkedCount}
          linkedAthletes={linkedAthletes}
          friends={friends}
          avatarUrl={avatarUrl}
          openComments={openComments}
          setOpenComments={setOpenComments}
          draft={draft}
          setDraft={setDraft}
          meId={meId}
          toggleReaction={toggleReaction}
          submitComment={submitComment}
          follow={follow}
        />
      ) : null}

{tab === 'mensajes' ? (
        <MensajesTab
          tab={tab}
          activeRoomId={activeRoomId}
          openRooms={rooms}
          setActiveRoomId={setActiveRoomId}
          openMessages={activeMessages}
          activeRoom={activeRoom}
          rooms={rooms}
          loadingRooms={loadingRooms}
          chatDraft={chatDraft}
          sendMessage={sendMessage}
          openRoom={openRoom}
          fetchRooms={fetchRooms}
          meId={meId}
          meName={meName}
          avatarUrl={avatarUrl}
        />
      ): null}
    </div>
  );
}