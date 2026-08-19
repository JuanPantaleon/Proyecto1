export type DivisionName = 'Platino' | 'Oro' | 'Plata' | 'Bronce';

export interface AthleteStats {
  prs: number;
  sessions: number;
  streakDays: number;
  winRate: number;
  bestLift: string;
}

export interface Athlete {
  id: number;
  name: string;
  division: DivisionName;
  country: string;
  province: string;
  gym: string;
  isg: number;
  stats: AthleteStats;
  medals: DivisionName[];
}

const baseAthletes: Omit<Athlete, 'stats' | 'medals'>[] = [
  { id: 1, name: 'Lautaro Díaz', division: 'Platino', country: 'Argentina', province: 'Jujuy', gym: 'Pantafit', isg: 2450 },
  { id: 2, name: 'Valentina Ríos', division: 'Oro', country: 'Argentina', province: 'Jujuy', gym: 'Pantafit', isg: 2210 },
  { id: 3, name: 'Martín Quispe', division: 'Oro', country: 'Argentina', province: 'Salta', gym: 'Pantafit', isg: 2085 },
  { id: 4, name: 'Camila Sosa', division: 'Plata', country: 'Argentina', province: 'Jujuy', gym: 'Pantafit', isg: 1890 },
  { id: 5, name: 'Nicolás Fernández', division: 'Plata', country: 'Argentina', province: 'Tucumán', gym: 'Pantafit', isg: 1745 },
  { id: 6, name: 'Agustina Ledesma', division: 'Plata', country: 'Argentina', province: 'Jujuy', gym: 'Pantafit', isg: 1620 },
  { id: 7, name: 'Bruno Mamani', division: 'Bronce', country: 'Argentina', province: 'Salta', gym: 'Pantafit', isg: 1480 },
  { id: 8, name: 'Sofía Condorí', division: 'Bronce', country: 'Argentina', province: 'Jujuy', gym: 'Pantafit', isg: 1315 },
  { id: 9, name: 'Joaquín Arce', division: 'Bronce', country: 'Argentina', province: 'Jujuy', gym: 'Pantafit', isg: 1190 },
  { id: 10, name: 'Fernando Castro', division: 'Plata', country: 'Argentina', province: 'Buenos Aires', gym: 'Titan Gym', isg: 1680 },
  { id: 11, name: 'Milagros Paz', division: 'Bronce', country: 'Argentina', province: 'Córdoba', gym: 'Andes Fit', isg: 1290 },
  { id: 12, name: 'Diego Alarcón', division: 'Platino', country: 'Chile', province: 'Santiago', gym: 'Power House', isg: 2320 },
  { id: 13, name: 'Renata Vidal', division: 'Oro', country: 'Chile', province: 'Valparaíso', gym: 'Power House', isg: 1960 },
  { id: 14, name: 'Mateo Paredes', division: 'Plata', country: 'Bolivia', province: 'La Paz', gym: 'Andes Fit', isg: 1670 },
  { id: 15, name: 'Ana Beltrán', division: 'Oro', country: 'Colombia', province: 'Antioquia', gym: 'Titan Gym', isg: 2040 },
  { id: 16, name: 'Santiago Robles', division: 'Plata', country: 'México', province: 'CDMX', gym: 'Titan Gym', isg: 1715 },
  { id: 17, name: 'Lucía Herrera', division: 'Bronce', country: 'Colombia', province: 'Bogotá', gym: 'Andes Fit', isg: 1260 },
];

export const athletes: Athlete[] = baseAthletes.map((a) => {
  const seed = a.id * 7919 + a.name.length * 31;
  return {
    ...a,
    stats: {
      prs: 4 + (seed % 18),
      sessions: 40 + (seed % 120),
      streakDays: 1 + (seed % 12),
      winRate: 40 + (seed % 55),
      bestLift: ['Sentadilla 180 kg', 'Peso Muerto 220 kg', 'Press de Banca 120 kg', 'Dominadas 25 reps'][seed % 4],
    },
    medals: (['Platino', 'Oro', 'Plata', 'Bronce'] as DivisionName[]).slice(
      ['Platino', 'Oro', 'Plata', 'Bronce'].indexOf(a.division)
    ),
  };
});

export function getAthleteById(id: number): Athlete | null {
  return athletes.find((a) => a.id === id) ?? null;
}

export const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();