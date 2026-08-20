'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Activity, Dumbbell, History as HistoryIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExercises } from '@/lib/hooks';
import {
  loadActiveSession,
  saveActiveSession,
  clearActiveSession,
  pushHistoryRecord,
  sessionToHistoryRecord,
  createActiveSession,
  type ActiveSession,
  type SessionExercise,
  type TemplateRoutine,
} from '@/lib/training';
import EnCursoTab, {
  sessionFromTemplate,
  toCatalogEntries,
  FALLBACK_CATALOG,
  type CatalogEntry,
  type PendingRegister,
} from '@/components/training/en-curso';
import MisRutinasTab from '@/components/training/mis-rutinas';
import HistorialTab from '@/components/training/historial';
import RoutinePreviewModal from '@/components/training/routine-preview';

type Tab = 'encurso' | 'rutinas' | 'historial';

interface RoutinePreview {
  title: string;
  templateId?: number;
  exercises: SessionExercise[];
}

const TABS: { key: Tab; label: string; icon: typeof Activity }[] = [
  { key: 'encurso', label: 'En Curso', icon: Activity },
  { key: 'rutinas', label: 'Mis Rutinas', icon: Dumbbell },
  { key: 'historial', label: 'Historial', icon: HistoryIcon },
];

function EntrenamientoPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>('encurso');
  const [session, setSession] = useState<ActiveSession | null>(() => loadActiveSession());
  const [historyVersion, setHistoryVersion] = useState(0);
  const [preview, setPreview] = useState<RoutinePreview | null>(null);
  const [pendingRegister, setPendingRegister] = useState<PendingRegister | null>(null);
  const [pendingOpenBlock, setPendingOpenBlock] = useState<string | null>(null);

  const [hasToken] = useState<boolean>(
    () => typeof window !== 'undefined' && !!localStorage.getItem('auth_token')
  );
  const { data: catalog, isLoading: catalogLoading } = useExercises({}, hasToken);

  useEffect(() => {
    if (session) saveActiveSession(session);
    else clearActiveSession();
  }, [session]);

  useEffect(() => {
    const exKey = searchParams.get('registrarSerie');
    const secondsRaw = searchParams.get('segundos');
    if (exKey && secondsRaw) {
      const seconds = Number(secondsRaw);
      if (Number.isFinite(seconds) && seconds > 0) {
        setPendingRegister({ exKey, seconds, failure: searchParams.get('fallo') === '1' });
        router.replace('/dashboard/entrenamiento', { scroll: false });
        return;
      }
    }
    const openKey = searchParams.get('abrirBloque');
    if (openKey) {
      setPendingOpenBlock(openKey);
      router.replace('/dashboard/entrenamiento', { scroll: false });
    }
  }, [searchParams, router]);

  const catalogEntries = toCatalogEntries(catalog ?? []);
  const previewEntries: CatalogEntry[] =
    catalogEntries.length > 0 ? catalogEntries : FALLBACK_CATALOG;

  const handleStartSession = (next: ActiveSession) => setSession(next);

  const handleStartTemplate = (template: TemplateRoutine) => {
    setPreview({
      title: template.title,
      templateId: template.id,
      exercises: sessionFromTemplate(template, catalogEntries).exercises,
    });
  };

  const handlePreviewConfirm = (exercises: SessionExercise[]) => {
    if (!preview) return;
    setSession(createActiveSession(preview.title, exercises, preview.templateId));
    setPreview(null);
    setTab('encurso');
  };

  const handleCompleteSession = (completed: ActiveSession) => {
    pushHistoryRecord(sessionToHistoryRecord(completed));
    setHistoryVersion((v) => v + 1);
    setSession(completed);
  };

  const handleCancelSession = () => {
    setSession(null);
    setTab('encurso');
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Encabezado */}
      <header className="flex flex-shrink-0 items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Entrenamiento</h1>
          <p className="text-sm font-medium text-white/40">
            Tu sesión del día, plantillas y bitácora
          </p>
        </div>
        <Link
          href="/dashboard/entrenamiento/crear"
          className="flex items-center gap-2 rounded-2xl bg-[#EF4444] px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all hover:bg-[#EF4444]/90"
        >
          <Plus className="h-4 w-4" />
          Crear Rutina
        </Link>
      </header>

      {/* Tabs superiores */}
      <div className="flex flex-shrink-0 items-center gap-1 rounded-2xl border border-white/10 bg-[#0D0D0D] p-1.5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200',
              tab === key
                ? 'bg-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                : 'text-white/50 hover:bg-white/5 hover:text-white'
            )}
            aria-current={tab === key ? 'page' : undefined}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="min-h-0 flex-1">
        {tab === 'encurso' && (
          <EnCursoTab
            session={session}
            catalog={catalog ?? []}
            catalogLoading={catalogLoading}
            onStartSession={handleStartSession}
            onUpdateSession={handleStartSession}
            onCompleteSession={handleCompleteSession}
            onCancelSession={handleCancelSession}
            onGoToTemplates={() => setTab('rutinas')}
            pendingRegister={pendingRegister}
            onConsumedRegister={() => setPendingRegister(null)}
            pendingOpenBlock={pendingOpenBlock}
            onConsumedOpenBlock={() => setPendingOpenBlock(null)}
          />
        )}
        {tab === 'rutinas' && (
          <MisRutinasTab
            activeTemplateId={session?.templateId}
            hasActiveSession={session?.status === 'active'}
            onStartTemplate={handleStartTemplate}
          />
        )}
        {tab === 'historial' && <HistorialTab refreshKey={historyVersion} />}
      </div>

      {/* Previsualización y ajuste de la sesión de hoy */}
      {preview && (
        <RoutinePreviewModal
          title={preview.title}
          exercises={preview.exercises}
          entries={previewEntries}
          loading={catalogLoading}
          onConfirm={handlePreviewConfirm}
          onCancel={() => setPreview(null)}
        />
      )}
    </div>
  );
}

export default function EntrenamientoPage() {
  return (
    <Suspense fallback={null}>
      <EntrenamientoPageInner />
    </Suspense>
  );
}