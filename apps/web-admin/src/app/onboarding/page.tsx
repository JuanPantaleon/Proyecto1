'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { User, Building2, GraduationCap, ImagePlus, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { z } from 'zod';
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

const COUNTRIES = [
  'Argentina',
  'Bolivia',
  'Chile',
  'Colombia',
  'Ecuador',
  'Paraguay',
  'Perú',
  'Uruguay',
  'España',
  'México',
  'Otro',
];

const ARGENTINE_PROVINCES = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

const SPECIALTIES = [
  { value: 'strength', label: 'Fuerza y Potencia' },
  { value: 'hypertrophy', label: 'Hipertrofia' },
  { value: 'endurance', label: 'Resistencia' },
  { value: 'functional', label: 'Funcional' },
  { value: 'mobility', label: 'Movilidad' },
  { value: 'rehab', label: 'Rehabilitación' },
];

const STEPS = [
  { n: 1, label: 'Rol' },
  { n: 2, label: 'Perfil' },
  { n: 3, label: 'Detalles' },
  { n: 4, label: 'Confirmar' },
];

type Step = 1 | 2 | 3 | 4;

const step2Schema = z.object({
  firstName: z.string().trim().min(1, 'Ingresa tu nombre').max(100),
});

const playerStep3Schema = z.object({
  age: z.coerce.number().int().min(10, 'Edad mínima 10 años').max(100, 'Edad máxima 100 años'),
  weight: z.coerce.number().positive('Peso inválido').max(300, 'Peso máximo 300 kg'),
  height: z.coerce.number().int().min(100, 'Altura mínima 100 cm').max(250, 'Altura máxima 250 cm'),
});

const coachStep3Schema = z.object({
  specialty: z.string().min(1, 'Selecciona una especialidad'),
});

const gymStep3Schema = z.object({
  gymName: z.string().trim().min(1, 'Ingresa el nombre del gimnasio').max(100),
});

function ProgressIndicator({ current }: { current: Step }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((s, idx) => {
        const isActive = s.n === current;
        const isDone = s.n < current;
        return (
          <div key={s.n} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300',
                  isDone && 'border-[#EF4444] bg-[#EF4444] text-black',
                  isActive && 'border-[#FBBF24] text-[#FBBF24] shadow-[0_0_16px_rgba(251,191,36,0.25)]',
                  !isDone && !isActive && 'border-white/15 text-white/30',
                )}
              >
                {isDone ? <Check className="h-4 w-4" /> : s.n}
              </div>
              <span
                className={cn(
                  'text-[10px] font-semibold uppercase tracking-wider',
                  isActive ? 'text-[#FBBF24]' : 'text-white/30',
                )}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-6 sm:w-10 transition-colors duration-300',
                  s.n < current ? 'bg-[#EF4444]' : 'bg-white/10',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OnboardingForm() {
  const router = useRouter();
  const { user, isLoaded: userLoaded } = useUser();
  const { switchRole, updatePlayerProfile } = useRole();
  const { success, error: toastError } = useToastHelpers();

  const [step, setStep] = useState<Step>(1);
  const [selected, setSelected] = useState<AppRole | null>(null);
  const [firstName, setFirstName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [country, setCountry] = useState('Argentina');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [selectedGym, setSelectedGym] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [gymName, setGymName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const clearError = (key: string) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const validateStep = (): boolean => {
    const errs: Record<string, string> = {};
    if (step === 2) {
      const r = step2Schema.safeParse({ firstName: firstName.trim() });
      if (!r.success) errs.firstName = r.error.issues[0].message;
    } else if (step === 3) {
      if (selected === 'player') {
        const r = playerStep3Schema.safeParse({ age, weight, height });
        if (!r.success) r.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message; });
      } else if (selected === 'coach') {
        const r = coachStep3Schema.safeParse({ specialty });
        if (!r.success) errs.specialty = r.error.issues[0].message;
      } else if (selected === 'gym') {
        const r = gymStep3Schema.safeParse({ gymName: gymName.trim() });
        if (!r.success) errs.gymName = r.error.issues[0].message;
      }
    }
    setErrors(errs);
    return Object.values(errs).every((v) => !v);
  };

  const goNext = () => {
    if (step === 1) {
      if (!selected) return;
      setStep(2);
      return;
    }
    if (validateStep() && step < 4) {
      setStep((s) => (s + 1) as Step);
    }
  };

  const goBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  const submit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        role: selected.toUpperCase(),
        firstName: firstName.trim() || undefined,
        // El backend valida imageUrl como URL; un data: URL (subida local) no pasaría.
        // Solo enviamos la URL http(s) de Clerk.
        imageUrl: photo && photo.startsWith('http') ? photo : undefined,
      };

      if (selected === 'player') {
        payload.age = age ? parseInt(age, 10) : undefined;
        // CRÍTICO: el backend espera 'currentWeightKg', NO 'weightKg'.
        payload.currentWeightKg = weight ? parseFloat(weight) : undefined;
        payload.heightCm = height ? parseInt(height, 10) : undefined;
        payload.country = country.trim() || undefined;
        payload.province = province.trim() || undefined;
        payload.city = city.trim() || undefined;
        if (selectedGym) payload.gymId = selectedGym;
      } else if (selected === 'coach') {
        payload.specialty = specialty || undefined;
        payload.country = country.trim() || undefined;
        payload.province = province.trim() || undefined;
        payload.city = city.trim() || undefined;
      } else if (selected === 'gym') {
        payload.gymName = gymName.trim() || undefined;
        payload.country = country.trim() || undefined;
        payload.province = province.trim() || undefined;
        payload.city = city.trim() || undefined;
      }

      await api.post('/api/v1/auth/onboarding', payload);

      localStorage.setItem('ranked_fitness_onboarded', 'true');
      switchRole(selected);

      if (firstName.trim() && selected === 'player') {
        updatePlayerProfile({ name: firstName.trim() });
      }

      const label = ROLE_OPTIONS.find((r) => r.id === selected)?.label ?? selected;
      success('¡Bienvenido a Ranked Fitness!', `Tu perfil como ${label} está listo.`);
      router.push('/dashboard');
    } catch (e: any) {
      const raw = e?.response?.data?.message ?? e?.message ?? 'Intenta nuevamente.';
      const msg = Array.isArray(raw) ? raw[0] : raw;
      toastError('No pudimos completar el registro', String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabel = ROLE_OPTIONS.find((r) => r.id === selected)?.label ?? '';

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

      <ProgressIndicator current={step} />

      {/* STEP 1 — Rol */}
      {step === 1 && (
        <section aria-label="Rol base" className="space-y-3">
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
                  onClick={() => { setSelected(id); clearError('role'); }}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-2xl border bg-[#0D0D0D] p-4 text-left transition-all duration-200',
                    isActive
                      ? 'border-[#EF4444] ring-2 ring-[#EF4444]/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                      : 'border-border hover:border-border-hover hover:bg-background-hover',
                  )}
                  aria-pressed={isActive}
                >
                  <Icon className={cn('h-5 w-5', isActive ? 'text-[#EF4444]' : 'text-muted-foreground')} />
                  <span className="text-sm font-semibold text-foreground">{label}</span>
                  <span className="text-xs leading-snug text-muted-foreground">{description}</span>
                </button>
              );
            })}
          </div>

          <Button
            onClick={goNext}
            disabled={!selected}
            loading={false}
            className="w-full"
            size="lg"
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </Button>
        </section>
      )}

      {/* STEP 2 — Perfil */}
      {step === 2 && (
        <section aria-label="Perfil" className="space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            2 · Tu perfil
          </span>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                'relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-all duration-200',
                photo ? 'border-[#FBBF24]' : 'border-dashed border-border hover:border-border-hover',
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
                onChange={(e) => { setFirstName(e.target.value); clearError('firstName'); }}
                error={!!errors.firstName}
              />
              {errors.firstName && <p className="text-xs text-[#EF4444]">{errors.firstName}</p>}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="country" className="block text-sm font-medium text-foreground">
              País
            </Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Selecciona país" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="province" className="block text-sm font-medium text-foreground">
              Provincia
            </Label>
            {country === 'Argentina' ? (
              <Select
                value={province}
                onValueChange={setProvince}
              >
                <SelectTrigger id="province">
                  <SelectValue placeholder="Selecciona provincia" />
                </SelectTrigger>
                <SelectContent>
                  {ARGENTINE_PROVINCES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="province"
                placeholder="Provincia"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
              />
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="city" className="block text-sm font-medium text-foreground">
              Ciudad
            </Label>
            <Input
              id="city"
              placeholder="Ej: San Salvador de Jujuy"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={goBack} className="gap-1 text-white/50 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button onClick={goNext} className="flex-1" size="lg">
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {/* STEP 3 — Detalles por rol */}
      {step === 3 && (
        <section aria-label="Detalles" className="space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            3 · Detalles de {roleLabel}
          </span>

          {selected === 'player' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="age" className="block text-sm font-medium text-foreground">Edad</Label>
                  <Input id="age" type="number" placeholder="Edad" value={age}
                    onChange={(e) => { setAge(e.target.value); clearError('age'); }}
                    error={!!errors.age} min={10} max={100} />
                  {errors.age && <p className="text-xs text-[#EF4444]">{errors.age}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="block text-sm font-medium text-foreground">Peso (kg)</Label>
                  <Input id="weight" type="number" step="0.1" placeholder="70.5" value={weight}
                    onChange={(e) => { setWeight(e.target.value); clearError('weight'); }}
                    error={!!errors.weight} min={20} max={300} />
                  {errors.weight && <p className="text-xs text-[#EF4444]">{errors.weight}</p>}
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label htmlFor="height" className="block text-sm font-medium text-foreground">Altura (cm)</Label>
                  <Input id="height" type="number" placeholder="175" value={height}
                    onChange={(e) => { setHeight(e.target.value); clearError('height'); }}
                    error={!!errors.height} min={100} max={250} />
                  {errors.height && <p className="text-xs text-[#EF4444]">{errors.height}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gym" className="block text-sm font-medium text-foreground">Gimnasio base (opcional)</Label>
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
              </div>
            </>
          )}

          {selected === 'coach' && (
            <div className="space-y-1.5">
              <Label htmlFor="specialty" className="block text-sm font-medium text-foreground">Área de especialización</Label>
              <Select value={specialty} onValueChange={(v) => { setSpecialty(v); clearError('specialty'); }}>
                <SelectTrigger className="h-12 w-full" id="specialty">
                  <SelectValue placeholder="Selecciona tu especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALTIES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.specialty && <p className="text-xs text-[#EF4444]">{errors.specialty}</p>}
            </div>
          )}

          {selected === 'gym' && (
            <div className="space-y-1.5">
              <Label htmlFor="gymName" className="block text-sm font-medium text-foreground">Nombre del gimnasio</Label>
              <Input id="gymName" placeholder="Nombre del establecimiento" value={gymName}
                onChange={(e) => { setGymName(e.target.value); clearError('gymName'); }}
                error={!!errors.gymName} />
              {errors.gymName && <p className="text-xs text-[#EF4444]">{errors.gymName}</p>}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={goBack} className="gap-1 text-white/50 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button onClick={goNext} className="flex-1" size="lg">
              Continuar
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      )}

      {/* STEP 4 — Confirmar */}
      {step === 4 && (
        <section aria-label="Confirmar" className="space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            4 · Confirma tu información
          </span>

          <div className="rounded-2xl border border-border bg-[#0D0D0D] p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#FBBF24] bg-black">
                {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <p className="font-semibold text-foreground">{firstName || '—'}</p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
            <dl className="space-y-1.5 text-sm">
              {(country || province || city) && (
                <div className="flex justify-between"><dt className="text-muted-foreground">Ubicación</dt><dd className="text-foreground">{[city, province, country].filter(Boolean).join(', ')}</dd></div>
              )}
              {selected === 'player' && (
                <>
                  {age && <div className="flex justify-between"><dt className="text-muted-foreground">Edad</dt><dd className="text-foreground">{age}</dd></div>}
                  {weight && <div className="flex justify-between"><dt className="text-muted-foreground">Peso</dt><dd className="text-foreground">{weight} kg</dd></div>}
                  {height && <div className="flex justify-between"><dt className="text-muted-foreground">Altura</dt><dd className="text-foreground">{height} cm</dd></div>}
                  {selectedGym && <div className="flex justify-between"><dt className="text-muted-foreground">Gimnasio</dt><dd className="text-foreground">{GYM_OPTIONS.find((g) => g.id === selectedGym)?.name}</dd></div>}
                </>
              )}
              {selected === 'coach' && specialty && (
                <div className="flex justify-between"><dt className="text-muted-foreground">Especialidad</dt><dd className="text-foreground">{SPECIALTIES.find((s) => s.value === specialty)?.label}</dd></div>
              )}
              {selected === 'gym' && gymName && (
                <div className="flex justify-between"><dt className="text-muted-foreground">Gimnasio</dt><dd className="text-foreground">{gymName}</dd></div>
              )}
            </dl>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={goBack} disabled={submitting} className="gap-1 text-white/50 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            <Button onClick={submit} disabled={submitting} loading={submitting} className="flex-1" size="lg">
              Completar registro
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </section>
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
