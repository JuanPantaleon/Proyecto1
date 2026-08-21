'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { User, Building2, GraduationCap, ImagePlus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoleProvider, useRole, type AppRole } from '@/lib/roles';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton, SkeletonAvatar, SkeletonButton, SkeletonGrid, SkeletonInput } from '@/components/ui/skeleton';
import { ISGMetricsModal } from '@/components/onboarding/isg-metrics-modal';
import { useToastHelpers } from '@/lib/toast';

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

const GYM_OPTIONS = [
  { id: 'gym-pantafit', name: 'Pantafit', country: 'Argentina', province: 'Jujuy' },
];

function OnboardingForm() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { switchRole, updatePlayerProfile } = useRole();
  const { success } = useToastHelpers();

  const [selected, setSelected] = useState<AppRole | null>(null);
  const [firstName, setFirstName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedGym, setSelectedGym] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showISGModal, setShowISGModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (userLoaded && user) {
      if (user.fullName && !firstName) {
        setFirstName(user.fullName.split(' ')[0]);
      }
      if (user.imageUrl && !photo) {
        setPhoto(user.imageUrl);
      }
    }
  }, [user, userLoaded, firstName, photo]);

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
      const payload: Record<string, unknown> = {
        role: selected.toUpperCase(),
        firstName: firstName.trim() || undefined,
        imageUrl: photo || '',
      };

      if (selected === 'player' && selectedGym) {
        payload.gymId = selectedGym;
      }

      if (token) {
        await api.post('/api/v1/auth/onboarding', payload);
      }

      localStorage.setItem('ranked_fitness_onboarded', 'true');
      switchRole(selected);

      if (firstName.trim() && selected === 'player') {
        updatePlayerProfile({ name: firstName.trim() });
      }

      if (selected === 'player') {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
        if (token) {
          try {
            const me = await api.get<{ currentWeightKg?: number; heightCm?: number }>('/api/v1/auth/me');
            if (!me.currentWeightKg || !me.heightCm) {
              setShowISGModal(true);
              return;
            }
          } catch {
            setShowISGModal(true);
            return;
          }
        } else {
          setShowISGModal(true);
          return;
        }
      }

      success('¡Bienvenido a Ranked Fitness!', `Tu perfil como ${ROLE_OPTIONS.find(r => r.id === selected)?.label} está listo.`);
      router.push('/dashboard');
    } catch {
      localStorage.setItem('ranked_fitness_onboarded', 'true');
      switchRole(selected);
      if (selected === 'player') {
        setShowISGModal(true);
        return;
      }
      success('¡Bienvenido a Ranked Fitness!', `Tu perfil como ${ROLE_OPTIONS.find(r => r.id === selected)?.label} está listo.`);
      router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const handleISGComplete = () => {
    router.push('/dashboard');
  };

  if (!userLoaded) {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col gap-6 py-8">
        <Skeleton className="h-8 w-3/4 mx-auto rounded" />
        <Skeleton className="h-4 w-1/2 mx-auto rounded" />
        <SkeletonGrid columns={3} rows={1} gap="gap-3" />
        <SkeletonAvatar className="mx-auto" />
        <SkeletonInput className="w-full" />
        <SkeletonButton className="mx-auto w-full max-w-lg" />
      </div>
    );
  }

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

      {selected === 'player' && (
        <section className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            2 · Tu gimnasio base (opcional)
          </span>
          <Label htmlFor="gym" className="block text-sm font-medium text-foreground">
            Gimnasio
          </Label>
          <Select value={selectedGym} onValueChange={setSelectedGym}>
            <SelectTrigger className="h-12 w-full" id="gym">
              <SelectValue placeholder="Selecciona tu gimnasio" />
            </SelectTrigger>
            <SelectContent>
              {GYM_OPTIONS.map((gym) => (
                <SelectItem key={gym.id} value={gym.id}>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">{gym.name}</span>
                    <span className="text-xs text-muted-foreground">{gym.country} - {gym.province}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>
      )}

      <section className="space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {selected === 'player' ? '3' : '2'} · Tu perfil (opcional)
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

      <ISGMetricsModal
        open={showISGModal}
        onOpenChange={setShowISGModal}
        onComplete={handleISGComplete}
      />
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