'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronDown, Dumbbell, Clock, History as HistoryIcon, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  loadHistory,
  groupHistory,
  formatScore,
  formatDurationShort,
  formatSetMeasure,
  setTypeLabel,
  toNumber,
  type HistoryRecord,
  type HistoryMonth,
  type HistoryDay,
} from '@/lib/training';
import { useCurrentUser, useSessions } from '@/lib/hooks';
import type { Session } from '@/lib/api';
import type { MetricType } from '@ranked-fitness/shared';

interface HistorialTabProps {
  refreshKey: number;
}

function apiSessionToRecord(session: Session): HistoryRecord {
  const grouped = new Map<string, HistoryRecord['exercises'][number]>();
  for (const set of session.sets ?? []) {
    const name = set.exercise?.name ?? 'Ejercicio';
    let block = grouped.get(name);
    if (!block) {
      block = {
        name,
        metricType: (set.exercise?.metricType ?? 'REPS_WEIGHT') as MetricType,
        sets: [],
      };
      grouped.set(name, block);
    }
    block.sets.push({
      weightKg: toNumber(set.weightKg) ?? undefined,
      reps: set.reps ?? undefined,
      durationSec: set.durationSec ?? undefined,
      setType: set.setType,
      isgScore: toNumber(set.isgScore),
    });
  }
  const started = Date.parse(session.startedAt);
  const ended = session.endedAt ? Date.parse(session.endedAt) : started;
  const totalIsg = (session.sets ?? []).reduce((acc, s) => acc + (toNumber(s.isgScore) ?? 0), 0);
  return {
    id: session.id,
    sessionId: session.id,
    title: 'Sesión de entrenamiento',
    date: session.startedAt,
    durationSec: Math.max(0, Math.floor((ended - started) / 1000)),
    totalIsg,
    exercises: Array.from(grouped.values()),
  };
}

function RecordCard({ record }: { record: HistoryRecord }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h4 className="truncate text-sm font-bold text-white">{record.title}</h4>
          <p className="text-[11px] text-white/40">{formatDurationShort(record.durationSec)}</p>
        </div>
        <span className="flex flex-shrink-0 items-center gap-1 text-sm font-black text-[#FBBF24]">
          <Zap className="h-3.5 w-3.5" />
          +{formatScore(record.totalIsg)}
        </span>
      </div>

      <div className="mt-3 space-y-2.5">
        {record.exercises.map((ex) => (
          <div key={ex.name} className="rounded-xl border border-white/5 bg-[#0D0D0D] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-semibold text-white">{ex.name}</p>
              <span
                className={cn(
                  'flex-shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest',
                  ex.metricType === 'TIME_ONLY'
                    ? 'border-[#FBBF24]/40 text-[#FBBF24]'
                    : ex.metricType === 'REPS_ONLY'
                      ? 'border-green-500/40 text-green-400'
                      : 'border-[#EF4444]/40 text-[#EF4444]'
                )}
              >
                {ex.metricType === 'TIME_ONLY'
                  ? 'SEG'
                  : ex.metricType === 'REPS_ONLY'
                    ? 'REPS'
                    : ex.metricType === 'TO_FAILURE'
                      ? 'FALLO'
                      : 'KG×REPS'}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {ex.sets.map((set, i) => {
                const failure = set.setType === 'FAILURE';
                const label =
                  ex.metricType === 'TO_FAILURE'
                    ? formatSetMeasure('TO_FAILURE', set)
                    : formatSetMeasure(ex.metricType, set);
                return (
                  <span
                    key={i}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-[11px] font-semibold',
                      failure
                        ? 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]'
                        : 'border-white/10 bg-white/5 text-white/60'
                    )}
                  >
                    {label}
                    {failure && ` · ${setTypeLabel('FAILURE')}`}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DaySection({ day, open, onToggle }: { day: HistoryDay; open: boolean; onToggle: () => void }) {
  const totalIsg = day.records.reduce((acc, r) => acc + r.totalIsg, 0);
  const duration = day.records.reduce((acc, r) => acc + r.durationSec, 0);
  return (
    <div className="rounded-2xl border border-white/5 bg-black/40">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 text-white/40">
            <Dumbbell className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">{day.label}</p>
            <p className="flex items-center gap-2 text-[11px] text-white/40">
              <Clock className="h-3 w-3" />
              {formatDurationShort(duration)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-[#FBBF24]">+{formatScore(totalIsg)}</span>
          <ChevronDown
            className={cn('h-4 w-4 text-white/40 transition-transform duration-200', open && 'rotate-180')}
          />
        </div>
      </button>
      {open && (
        <div className="space-y-2.5 px-4 pb-4 animate-fade-slide">
          {day.records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}

function MonthSection({
  month,
  open,
  onToggle,
  openDays,
  onToggleDay,
}: {
  month: HistoryMonth;
  open: boolean;
  onToggle: () => void;
  openDays: Set<string>;
  onToggleDay: (key: string) => void;
}) {
  const totalIsg = month.days.reduce((acc, d) => acc + d.records.reduce((s, r) => s + r.totalIsg, 0), 0);
  const sessionCount = month.days.reduce((acc, d) => acc + d.records.length, 0);
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0D0D0D]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white/50">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-base font-black tracking-tight text-white">{month.label}</h3>
            <p className="text-xs text-white/40">
              {sessionCount} sesión{sessionCount === 1 ? '' : 'es'} · +{formatScore(totalIsg)} ISG
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn('h-5 w-5 text-white/40 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4 pt-1 animate-fade-slide">
          {month.days.map((day) => (
            <DaySection
              key={day.key}
              day={day}
              open={openDays.has(day.key)}
              onToggle={() => onToggleDay(day.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistorialTab({ refreshKey }: HistorialTabProps) {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());
  const [openDays, setOpenDays] = useState<Set<string>>(new Set());

  const [hasToken] = useState<boolean>(
    () => typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
  );
  const { data: user } = useCurrentUser(hasToken);
  const { data: apiSessions, isLoading: apiLoading } = useSessions(
    user?.id,
    50,
    0,
    hasToken && !!user
  );

  useEffect(() => {
    setRecords(loadHistory());
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setOpenMonths(new Set([monthKey]));
  }, [refreshKey]);

  const merged = useMemo(() => {
    const apiRecords = (apiSessions ?? []).map(apiSessionToRecord);
    const apiIds = new Set(apiRecords.map((r) => r.id));
    const local = records.filter((r) => !r.sessionId || !apiIds.has(r.sessionId));
    const all = [...apiRecords, ...local].sort(
      (a, b) => Date.parse(b.date) - Date.parse(a.date)
    );
    return groupHistory(all);
  }, [records, apiSessions]);

  const toggleMonth = (key: string) =>
    setOpenMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const toggleDay = (key: string) =>
    setOpenDays((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const loading = apiLoading && merged.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div>
        <h2 className="text-lg font-black tracking-tight text-white">Historial</h2>
        <p className="text-xs text-white/40">Tu bitácora de entrenamiento, sesión a sesión</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-3xl skeleton" />
          ))}
        </div>
      ) : merged.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 rounded-[2rem] border border-dashed border-white/10 px-6 py-14 text-center animate-fade-slide">
          <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/10 bg-white/5">
            <HistoryIcon className="h-9 w-9 text-white/30" />
          </div>
          <div className="max-w-xs">
            <h3 className="text-lg font-semibold text-white">Aún no hay sesiones registradas</h3>
            <p className="mt-1 text-sm text-white/40">
              Completá tu primera sesión en «En Curso» y su ISG aparecerá aquí, agrupado por mes.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto pb-32 scrollbar-hide">
          {merged.map((month) => (
            <MonthSection
              key={month.key}
              month={month}
              open={openMonths.has(month.key)}
              onToggle={() => toggleMonth(month.key)}
              openDays={openDays}
              onToggleDay={toggleDay}
            />
          ))}
        </div>
      )}
    </div>
  );
}