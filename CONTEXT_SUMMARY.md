## Objective
- Develop Ranked Fitness social section fully functional Instagram-like; give each user their own profile/page with individual statistics; search web references; add professional-web suggestions; use available skills.

## Important Details
- Working dir `C:\Users\juanp\opencode1\ranked-fitness`.
- User directive (Spanish): "apartado social completamente funcional como instagram", "cada usuario tenga su propio [perfil] con estadisticas individuales", "busca referencias web", "agrega tus sugerencias para web profesional", "ayudate con las skills".
- User latest prompt: "Continue if you have next steps, or stop and ask for clarification if you are unsure how to proceed."
- git missing: `error.log` → `"git" no se reconoce`.
- websearch skill → `https://github.com/Agent-A345/Pulse` (Instagram-like: posts, stories+viewer modal, likes, comments, repost, pin, delete, search, hashtags, notifications).
- Dashboard pages use mock/localStorage data; unclear if social should stay mock or wire to backend (UNRESOLVED).
- lib files at `apps/web-admin/src/lib/`: `utils.ts`, `training.ts`, `social.ts`, `hooks.ts`, `athletes.ts`, `api.ts`, `toast.tsx`, `roles.tsx`, `providers.tsx`.

### Full file contents now available (previously truncated)

**api.ts** (complete):
- `API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'`
- `getActiveViewHeader()`: returns `'PLAYER'|'COACH'|'GYM'|'ADMIN'|null` from localStorage `ranked_fitness_active_profile`
- `ApiClient` class with `get`, `post`, `upload`, `put`, `delete` methods
- Request interceptor: attaches Clerk `Bearer` token + `X-Active-View` header
- Response interceptor: rejects auto-redirect to /sign-in (avoids infinite loop)
- Exports `api = new ApiClient()`
- Exports interfaces: `Exercise`, `CreateCustomExerciseInput`, `ExerciseFilters`, `Session`, `Set`, `CreateSetDto`, `RestTimer`, `TimerState`, `User`, `PaginatedResponse`

**social.ts** (complete):
- `'use client'`; localStorage mock key `ranked_fitness_social_state`
- `SocialState { following: Record<number, boolean>; friendRequests: Record<number, FriendRequestStatus> }`
- `DEFAULT_STATE`, `loadState()`, `saveState()`
- `followStatusFor(athleteId): FollowStatus`, `friendStatusFor(athleteId): FriendRequestStatus|null`
- `toggleFollow(athleteId): boolean`, `sendFriendRequest(athleteId): void`, `cancelFriendRequest(athleteId): void`
- No backend wiring - pure localStorage mock

**athletes.ts** (complete):
- `DivisionName = 'Platino'|'Oro'|'Plata'|'Bronce'`
- `AthleteStats { prs, sessions, streakDays, winRate, bestLift }`
- `Athlete { id, name, division, country, province, gym, isg, stats, medals }`
- `baseAthletes` mock (ids 1-17+, Argentina + Chile + Bolivia + Colombia + Mexico)
- `athletes: Athlete[] = baseAthletes.map(...)` with computed `stats` and `medals`
- `getAthleteById(id): Athlete|null`
- `initials(name): string`

**comunidad/page.tsx** (complete, Instagram-like):
- `'use client'`; imports `useUser` from `@clerk/nextjs`, lucide icons, `cn`, `api`
- Types: `ApiUser`, `ApiPost`, `Connection`, `FollowRequest`, `ChatRoom`, `ChatMessage`
- `Tab = 'feed'|'amigos'|'perfil'|'mensajes'|'solicitudes'`; `ReactionKey = 'FIRE'|'SKULL'|'CROWN'`; `FeedFilter = 'all'|'following'|'local'|'elite'`
- Helpers: `initials`, `timeAgo`, `roleLabel`, `roleColor`, `mediaKindOf`, `REACTIONS`, `FEED_FILTERS`, `FILTER_LABEL`
- `PostCard` component: avatar, author info, text, media (image/video), lift stats, reactions (FIRE/SKULL/CROWN), comments input, comment list
- `CommunityPage` component: full UI with tabs (feed, amigos, perfil, mensajes, solicitudes), post publishing, friend requests, chat rooms, search, athlete listings, stats columns
- Tab navigation, filters, publish form, comments, reactions, follow/friend requests, chat rooms, search results, athlete listings, profile page, messages page

### What's been accomplished
- Full file contents retrieved for all 4 previously-truncated files
- Code structure understood: API client, social mock, athlete mock, ComunidadPage Instagram-like UI
- Web reference: Pulse repo for Instagram-like UX reference
- Git missing but not blocking file-level edits
- Mock vs backend: now clear - `social.ts` is pure localStorage mock; `api.ts` has full ApiClient ready for backend; `comunidad/page.tsx` uses both `api` and localStorage state

### Next steps proposed
1. Build `comunidad/page.tsx` Instagram-like social (already have full code content - need to materialize it)
2. Extend `perfil/[id]/page.tsx` with individual user statistics
3. Add professional-web suggestions for user approval
4. Decide mock vs backend wiring (social.ts is mock; api.ts ready; comunidad page uses both)

### Blocked
- git missing → VCS ops blocked (but file-level edits possible)
- Unclear mock vs backend → now clear: social.ts is mock; api.ts ready; comunidad page uses both

### Next steps proposed
1. **Build `comunidad/page.tsx`** Instagram-like social section - materialize the full component from the retrieved code
2. **Extend `perfil/[id]/page.tsx`** with individual user statistics (import `getAthleteById`, display `AthleteStats`, `medals`, `myPosts`)
3. **Add professional-web suggestions** for user approval (UI/UX, branding, workflow)
4. **Decide mock vs backend wiring**: social.ts is pure localStorage mock; api.ts has full ApiClient ready; comunidad page uses both - decide whether to keep mock or wire to real backend
5. **Add professional-web suggestions** for UI/UX improvements

### Next steps
1. Build `comunidad/page.tsx` Instagram-like social section - materialize from retrieved code
2. Extend `perfil/[id]/page.tsx` with individual user statistics
3. Add professional-web suggestions for user approval
4. Decide mock vs backend wiring
5. Add professional-web suggestions for UI/UX