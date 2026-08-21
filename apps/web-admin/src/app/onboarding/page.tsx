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

const SPECIALTIES = [
  { value: 'strength', label: 'Fuerza y Potencia' },
  { value: 'hypertrophy', label: 'Hipertrofia' },
  { value: 'endurance', label: 'Resistencia' },
  { value: 'functional', label: 'Funcional' },
  { value: 'mobility', label: 'Movilidad' },
  { value: 'rehab', label: 'Rehabilitación' },
];

type OnboardingStep = 1 | 2;

function OnboardingForm() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { switchRole, updatePlayerProfile } = useRole();
  const { success } = useToastHelpers();

  const [step, setStep] = useState<OnboardingStep>(1);
  const [selected, setSelected] = useState<AppRole | null>(null);
  const [firstName, setFirstName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [selectedGym, setSelectedGym] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [gymName, setGymName] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  const handleBack = () => {
    setStep(1);
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

      if (selected === 'player') {
        payload.age = age ? parseInt(age) : undefined;
        payload.weightKg = weight ? parseFloat(weight) : undefined;
        payload.heightCm = height ? parseInt(height) : undefined;
        payload.location = location || undefined;
        if (selectedGym) payload.gymId = selectedGym;
      } else if (selected === 'coach') {
        payload.specialty = specialty || undefined;
        payload.location = location || undefined;
      } else if (selected === 'gym') {
        payload.gymName = gymName || undefined;
        payload.location = location || undefined;
      }

      if (token) {
        await api.post('/api/v1/auth/onboarding', payload);
      }

      localStorage.setItem('ranked_fitness_onboarded', 'true');
      switchRole(selected);

      if (firstName.trim() && selected === 'player') {
        updatePlayerProfile({ name: firstName.trim() });
      }

      success('¡Bienvenido a Ranked Fitness!', `Tu perfil como ${ROLE_OPTIONS.find(r => r.id === selected)?.label} está listo.`);
      router.push('/dashboard');
    } catch {
      localStorage.setItem('ranked_fitness_onboarded', 'true');
      switchRole(selected);
      success('¡Bienvenido a Ranked Fitness!', `Tu perfil como ${ROLE_OPTIONS.find(r => r.id === selected)?.label} está listo.`);
      router.push('/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  const getStepFields = () => {
    if (step === 1) return null;

    const commonFields = (
      <section className="space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          2 · Tu perfil
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
    );

    if (selected === 'player') {
      return (
        <>
          {commonFields}
          <section className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              3 · Datos físicos
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="age" className="block text-sm font-medium text-foreground">
                  Edad
                </Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Edad"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={10}
                  max={100}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weight" className="block text-sm font-medium text-foreground">
                  Peso (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min={20}
                  max={300}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="height" className="block text-sm font-medium text-foreground">
                  Altura (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min={100}
                  max={250}
                />
              </div>
            </div>
          </section>
          <section className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              4 · Ubicación
            </span>
            <div className="space-y-1.5">
              <Label htmlFor="location" className="block text-sm font-medium text-foreground">
                Ciudad, Provincia
              </Label>
              <Input
                id="location"
                placeholder="Ej: San Salvador de Jujuy, Jujuy"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </section>
          <section className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              5 · Gimnasio base (opcional)
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
        </>
      );
    }

    if (selected === 'coach') {
      return (
        <>
          {commonFields}
          <section className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              3 · Especialidad
            </span>
            <Label htmlFor="specialty" className="block text-sm font-medium text-foreground">
              Área de especialización
            </Label>
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="h-12 w-full" id="specialty">
                <SelectValue placeholder="Selecciona tu especialidad" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>
          <section className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              4 · Ubicación
            </span>
            <div className="space-y-1.5">
              <Label htmlFor="location" className="block text-sm font-medium text-foreground">
                Ciudad, Provincia
              </Label>
              <Input
                id="location"
                placeholder="Ej: San Salvador de Jujuy, Jujuy"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </section>
        </>
      );
    }

    if (selected === 'gym') {
      return (
        <>
          <section className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              2 · Datos del gimnasio
            </span>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="gymName" className="block text-sm font-medium text-foreground">
                  Nombre del gimnasio
                </Label>
                <Input
                  id="gymName"
                  placeholder="Nombre del establecimiento"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location" className="block text-sm font-medium text-foreground">
                  Ubicación
                </Label>
                <Input
                  id="location"
                  placeholder="Ej: San Salvador de Jujuy, Jujuy"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </section>
        </>
      );
    }

    return null;
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

      {step === 1 && (
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
      )}

      {step === 2 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="self-start gap-1 text-white/50 hover:text-white"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Volver
          </Button>
          {getStepFields()}
        </>
      )}

      {step === 2 && (
        <Button
          onClick={complete}
          disabled={!selected || submitting}
          loading={submitting}
          className="w-full"
          size="lg"
        >
          Completar registro
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
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