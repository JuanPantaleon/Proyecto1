'use client';

import { useState } from 'react';
import { GraduationCap, Trophy, ClipboardList, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole, divisionForScore } from '@/lib/roles';

interface Student {
  id: string;
  name: string;
  isgScore: number;
  division: string;
  assignedRoutine?: string;
}

interface Routine {
  id: string;
  title: string;
  days: number;
}

const DIVISION_BADGE: Record<string, string> = {
  Platino: 'border-white/40 bg-white/10 text-white',
  Oro: 'border-[#FBBF24]/60 bg-[#FBBF24]/10 text-[#FBBF24]',
  Plata: 'border-white/20 bg-white/5 text-gray-300',
  Bronce: 'border-[#B45309]/60 bg-[#B45309]/10 text-[#D97706]',
};

const ROUTINE_LIBRARY: Routine[] = [
  { id: 'r1', title: 'Full Body Pantafit', days: 3 },
  { id: 'r2', title: 'Push + Pull', days: 4 },
  { id: 'r3', title: 'Fuerza Competitiva', days: 5 },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function CoachPlayersView() {
  const { profile, players, routineAssignments, assignRoutine } = useRole();
  const [assignTarget, setAssignTarget] = useState<Student | null>(null);
  const [justAssigned, setJustAssigned] = useState<string | null>(null);

  const students: Student[] =
    'linkedStudents' in profile && Array.isArray(profile.linkedStudents)
      ? profile.linkedStudents.map((s) => {
          const roster = players.find((p) => p.id === s.id);
          const isgScore = s.isgScore ?? roster?.isgScore ?? 0;
          return {
            id: s.id,
            name: s.name,
            isgScore,
            division: roster?.division ?? divisionForScore(isgScore),
            assignedRoutine: routineAssignments[s.id],
          };
        })
      : [];

  const handleAssign = (title: string) => {
    if (!assignTarget) return;
    assignRoutine(assignTarget.id, title);
    setJustAssigned(`${assignTarget.id}:${title}`);
    setAssignTarget(null);
    setTimeout(() => setJustAssigned(null), 2500);
  };

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-black text-white overflow-hidden">
      <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-black/80 px-6 pb-4 pt-5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/5 bg-[#0D0D0D] text-white/60 transition-all hover:text-white"
            aria-label="Volver"
          >
            <Trophy className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Mis Jugadores</h1>
            <p className="text-xs text-white/40">Atletas vinculados (COACH_ATHLETE)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0D0D0D] px-4 py-2.5">
          <GraduationCap className="h-4 w-4 text-[#FBBF24]" />
          <span className="text-base font-black text-white">{students.length}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
            atletas
          </span>
        </div>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 pb-48 pt-6 scrollbar-hide">
        <div className="rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
            <ClipboardList className="h-4 w-4 text-[#FBBF24]" />
            Atletas vinculados
          </p>

          <div className="mt-4 space-y-3">
            {students.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center">
                <GraduationCap className="mx-auto h-8 w-8 text-white/15" />
                <p className="mt-2 text-sm text-white/40">
                  Aún no tenés atletas vinculados con estado aceptado.
                </p>
              </div>
            )}
            {students.map((student) => (
              <div
                key={student.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-white/60">
                    {initials(student.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{student.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest',
                          DIVISION_BADGE[student.division] ?? DIVISION_BADGE.Plata
                        )}
                      >
                        {student.division}
                      </span>
                      <span className="text-xs font-bold text-[#FBBF24]">
                        +{student.isgScore} ISG
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-2">
                  <div className="min-w-0 max-w-[10rem]">
                    <p className="truncate text-[10px] font-bold uppercase tracking-widest text-white/30">
                      Rutina asignada
                    </p>
                    <p
                      className={cn(
                        'truncate text-xs font-bold',
                        student.assignedRoutine ? 'text-white' : 'text-white/30'
                      )}
                    >
                      {student.assignedRoutine ?? 'Sin asignar'}
                    </p>
                  </div>
                  <button
                    onClick={() => setAssignTarget(student)}
                    className="flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-bold uppercase tracking-widest text-white/50 transition-all hover:border-[#FBBF24]/50 hover:text-[#FBBF24]"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Asignar
                  </button>
                </div>

                {justAssigned === `${student.id}:r1` && (
                  <p className="text-xs font-bold text-green-300">✓ Rutina asignada</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {assignTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 pb-6 backdrop-blur-sm sm:items-center"
          onClick={() => setAssignTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#0D0D0D] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Asignar rutina a
                </p>
                <h3 className="mt-1 text-lg font-bold text-white">{assignTarget.name}</h3>
              </div>
              <button
                onClick={() => setAssignTarget(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition-all hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-4 space-y-2.5">
              {ROUTINE_LIBRARY.map((routine) => {
                const isCurrent = assignTarget.assignedRoutine === routine.title;
                return (
                  <li key={routine.id}>
                    <button
                      onClick={() => handleAssign(routine.title)}
                      className={cn(
                        'flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-all',
                        isCurrent
                          ? 'border-[#FBBF24]/60 bg-[#FBBF24]/10'
                          : 'border-white/10 bg-white/5 hover:border-[#FBBF24]/40'
                      )}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{routine.title}</p>
                        <p className="mt-0.5 text-xs text-white/40">
                          {routine.days} días · Pantafit
                        </p>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                        <ChevronDown className="h-4 w-4 -rotate-90" />
                        {isCurrent ? 'Actual' : 'Asignar'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}