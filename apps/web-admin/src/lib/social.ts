'use client';

import type { FollowStatus, FriendRequestStatus } from '@ranked-fitness/shared';

const SOCIAL_KEY = 'ranked_fitness_social_state';

interface SocialState {
  following: Record<number, boolean>;
  friendRequests: Record<number, FriendRequestStatus>;
}

const DEFAULT_STATE: SocialState = { following: {}, friendRequests: {} };

function loadState(): SocialState {
  try {
    const raw = localStorage.getItem(SOCIAL_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as SocialState;
    return {
      following: parsed.following ?? {},
      friendRequests: parsed.friendRequests ?? {},
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: SocialState) {
  try {
    localStorage.setItem(SOCIAL_KEY, JSON.stringify(state));
  } catch {
    // storage no disponible
  }
}

export function followStatusFor(athleteId: number): FollowStatus {
  const state = loadState();
  if (state.following[athleteId]) return 'following';
  return 'none';
}

export function friendStatusFor(athleteId: number): FriendRequestStatus | null {
  return loadState().friendRequests[athleteId] ?? null;
}

export function toggleFollow(athleteId: number): boolean {
  const state = loadState();
  const next = !state.following[athleteId];
  state.following[athleteId] = next;
  saveState(state);
  return next;
}

export function sendFriendRequest(athleteId: number): void {
  const state = loadState();
  state.friendRequests[athleteId] = 'pending';
  saveState(state);
}

export function cancelFriendRequest(athleteId: number): void {
  const state = loadState();
  delete state.friendRequests[athleteId];
  saveState(state);
}