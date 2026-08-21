'use client';

import { cn } from '@/lib/utils';
import { Dumbbell, Users, ClipboardList, Trophy, Target, Search, CalendarPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  variant?: 'players' | 'routines' | 'gym' | 'coach' | 'sessions' | 'records' | 'generic';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ className?: string }>;
  };
  className?: string;
}

const variants = {
  players: {
    icon: Users,
    title: 'Aún no hay jugadores',
    description: 'Invita a tus atletas a unirse al gimnasio para empezar a gestionar sus entrenamientos y seguir su progreso.',
  },
  routines: {
    icon: ClipboardList,
    title: 'Sin rutinas asignadas',
    description: 'Crea una rutina desde la pestaña de Entrenador y asígnala a tus atletas para que aparezca aquí.',
  },
  gym: {
    icon: Dumbbell,
    title: 'Gimnasio no configurado',
    description: 'Selecciona tu gimnasio base durante el onboarding o contacta a tu entrenador.',
  },
  coach: {
    icon: Target,
    title: 'Sin entrenador asignado',
    description: 'Tu entrenador podrá asignarte rutinas y validar tus marcas una vez te vincules.',
  },
  sessions: {
    icon: CalendarPlus,
    title: 'No hay entrenamientos registrados',
    description: 'Inicia tu primera sesión de entrenamiento para ver tu historial aquí.',
  },
  records: {
    icon: Trophy,
    title: 'Sin récords personales aún',
    description: 'Completa series en tus entrenamientos para empezar a registrar tus mejores marcas.',
  },
  generic: {
    icon: Search,
    title: 'No hay datos disponibles',
    description: 'Parece que aún no hay información para mostrar.',
  },
};

export function EmptyState({
  variant = 'generic',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-6', className)}>
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0D0D0D] border border-white/5">
        <Icon className="h-10 w-10 text-white/20" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title ?? config.title}
      </h3>
      <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description ?? config.description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          className="w-auto min-w-[160px]"
          size="lg"
        >
          {action.icon && <action.icon className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  );
}