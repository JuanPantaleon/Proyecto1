'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, GraduationCap, ImagePlus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleProvider, useRole, type AppRole } from '@/lib/roles';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ROLE_OPTIONS: {
  id: AppRole;
  label: string;
  description: string;
  icon: typeof User;
}[] = [
  {
    id: 'player',
    label: 'Jugador',
    description: 'Entrena, suma puntos ISG y sube en el ranking.',
    icon: User,
  },
  {
    id: 'coach',
    label: 'Entrenador',
    description: 'Diseña rutinas, valida ejercicios y sigue a tus atletas.',
    icon: GraduationCap,
  },
  {
    id: 'gym',
    label: 'Gimnasio',
    description: 'Gestiona el centro, sus jugadores y su comunidad.',
    icon: Building2,
  },
];

function OnboardingForm() {
  const router = useRouter();
  const { switchRole, updatePlayerProfile } = useRole();
  const [selected, setSelected] = useState<AppRole | null>(null);
  const [firstName, setFirstName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const complete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        await api.post('/api/v1/auth/onboarding', {
          role: selected.toUpperCase(),
          firstName: firstName.trim() || undefined,
          imageUrl: photo || '',
        });
      }
      localStorage.setItem('ranked_fitness_onboarded', 'true');
      switchRole(selected);
      if (firstName.trim() && selected === 'player') {
        updatePlayerProfile({ name: firstName.trim() });
      }
      router.push('/dashboard');
    } catch {
      // Sin backend: completar onboarding en modo demo local
      localStorage.setItem('ranked_fitness_onboarded', 'true');
      switchRole(selected);
      router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6 py-8">
      <header className="text-center space-y-1.5">
        <h1 className="text-2xl font-bold text-foreground">¡Bienvenido a Ranked Fitness!</h1>
        <p className="text-sm text-muted-foreground">
          Cuéntanos quién eres para personalizar tu experiencia.
        </p>
      </header>

      <section aria-label="Rol base" className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          1 · Elige tu rol base
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {ROLE_OPTIONS.map(({ id, label, description, icon: Icon }) => {
            const isActive = selected === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelected(id)}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-2xl border bg-[#0D0D0D] p-4 text-left transition-all duration-200',
                  isActive
                    ? 'border-[#EF4444] ring-2 ring-[#EF4444]/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                    : 'border-border hover:border-border-hover hover:bg-background-hover'
                )}
                aria-pressed={isActive}
              >
                <Icon
                  className={cn('h-5 w-5', isActive ? 'text-[#EF4444]' : 'text-muted-foreground')}
                />
                <span className="text-sm font-semibold text-foreground">{label}</span>
                <span className="text-xs leading-snug text-muted-foreground">{description}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          2 · Tu perfil (opcional)
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className={cn(
              'relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-all duration-200',
              photo ? 'border-[#FBBF24]' : 'border-dashed border-border hover:border-border-hover'
            )}
            aria-label="Subir foto de perfil"
          >
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Foto de perfil" className="h-full w-full object-cover" />
            ) : (
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            )}
          </button>
          <div className="flex-1">
            <Input
              label="Nombre"
              placeholder="Tu nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>
        </div>
      </section>

      <Button
        onClick={complete}
        disabled={!selected}
        loading={submitting}
        className="w-full"
        size="lg"
      >
        Continuar
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <RoleProvider>
      <main className="flex min-h-[100dvh] flex-col items-center bg-black px-4">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-[#EF4444]/5 via-transparent to-[#FBBF24]/5" />
        <div className="relative w-full flex-1 overflow-y-auto">
          <OnboardingForm />
        </div>
      </main>
    </RoleProvider>
  );
}