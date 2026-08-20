'use client';

import CoachPlayersView from '@/components/dashboard/coach-players-view';
import GymPlayersView from '@/components/dashboard/gym-players-view';
import { useRole } from '@/lib/roles';

export default function JugadoresPage() {
  const { role } = useRole();

  if (role === 'coach') {
    return <CoachPlayersView />;
  }

  return <GymPlayersView />;
}