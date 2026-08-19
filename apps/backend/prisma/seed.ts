import { PrismaClient, MuscleGroup, ExerciseLevel, MetricType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { calculateExerciseFactor } from '@ranked-fitness/shared';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const exercises = [
  // PECHO
  { name: 'Press Banca Plana', muscleGroup: MuscleGroup.PECHO, level: ExerciseLevel.INTERMEDIO, M: 9, D: 8, C: 7, I: 8 },
  { name: 'Press Banca Inclinada', muscleGroup: MuscleGroup.PECHO, level: ExerciseLevel.INTERMEDIO, M: 8, D: 8, C: 7, I: 7 },
  { name: 'Press Banca Declinada', muscleGroup: MuscleGroup.PECHO, level: ExerciseLevel.INTERMEDIO, M: 7, D: 7, C: 6, I: 6 },
  { name: 'Aperturas con Mancuernas', muscleGroup: MuscleGroup.PECHO, level: ExerciseLevel.PRINCIPIANTE, M: 6, D: 5, C: 5, I: 4 },
  { name: 'Crossovers en Polea', muscleGroup: MuscleGroup.PECHO, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 5, C: 4, I: 3 },
  { name: 'Flexiones (Push-ups)', muscleGroup: MuscleGroup.PECHO, level: ExerciseLevel.PRINCIPIANTE, M: 7, D: 6, C: 4, I: 5 },
  { name: 'Press Banca Agarre Cerrado', muscleGroup: MuscleGroup.PECHO, level: ExerciseLevel.AVANZADO, M: 8, D: 8, C: 8, I: 8 },
  { name: 'Pec Deck Machine', muscleGroup: MuscleGroup.PECHO, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 4, C: 3, I: 3 },

  // ESPALDA
  { name: 'Dominadas (Pull-ups)', muscleGroup: MuscleGroup.ESPALDA, level: ExerciseLevel.INTERMEDIO, M: 9, D: 9, C: 8, I: 8 },
  { name: 'Jalón al Pecho (Lat Pulldown)', muscleGroup: MuscleGroup.ESPALDA, level: ExerciseLevel.PRINCIPIANTE, M: 8, D: 7, C: 5, I: 6 },
  { name: 'Remo con Barra', muscleGroup: MuscleGroup.ESPALDA, level: ExerciseLevel.INTERMEDIO, M: 9, D: 8, C: 7, I: 7 },
  { name: 'Remo con Mancuerna Unilateral', muscleGroup: MuscleGroup.ESPALDA, level: ExerciseLevel.INTERMEDIO, M: 8, D: 7, C: 6, I: 6 },
  { name: 'Remo en Polea Baja', muscleGroup: MuscleGroup.ESPALDA, level: ExerciseLevel.PRINCIPIANTE, M: 7, D: 6, C: 5, I: 5 },
  { name: 'Face Pulls', muscleGroup: MuscleGroup.ESPALDA, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 5, C: 4, I: 4 },
  { name: 'Peso Muerto (Deadlift)', muscleGroup: MuscleGroup.ESPALDA, level: ExerciseLevel.AVANZADO, M: 10, D: 10, C: 9, I: 10 },
  { name: 'Hiperextensiones', muscleGroup: MuscleGroup.ESPALDA, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 5, C: 4, I: 4 },

  // PIERNAS
  { name: 'Sentadilla Libre (Back Squat)', muscleGroup: MuscleGroup.PIERNAS, level: ExerciseLevel.AVANZADO, M: 10, D: 10, C: 9, I: 10 },
  { name: 'Sentadilla Frontal (Front Squat)', muscleGroup: MuscleGroup.PIERNAS, level: ExerciseLevel.AVANZADO, M: 9, D: 9, C: 9, I: 9 },
  { name: 'Prensa de Piernas (Leg Press)', muscleGroup: MuscleGroup.PIERNAS, level: ExerciseLevel.PRINCIPIANTE, M: 8, D: 7, C: 4, I: 6 },
  { name: 'Zancadas (Lunges)', muscleGroup: MuscleGroup.PIERNAS, level: ExerciseLevel.INTERMEDIO, M: 8, D: 7, C: 6, I: 6 },
  { name: 'Sentadilla Búlgara', muscleGroup: MuscleGroup.PIERNAS, level: ExerciseLevel.AVANZADO, M: 9, D: 8, C: 8, I: 8 },
  { name: 'Extensiones de Cuádriceps', muscleGroup: MuscleGroup.PIERNAS, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 4, C: 3, I: 3 },
  { name: 'Curl Femoral (Leg Curl)', muscleGroup: MuscleGroup.PIERNAS, level: ExerciseLevel.PRINCIPIANTE, M: 6, D: 5, C: 4, I: 4 },
  { name: 'Elevación de Talones (Calf Raises)', muscleGroup: MuscleGroup.PIERNAS, level: ExerciseLevel.PRINCIPIANTE, M: 4, D: 4, C: 3, I: 3 },
  { name: 'Hip Thrust', muscleGroup: MuscleGroup.PIERNAS, level: ExerciseLevel.INTERMEDIO, M: 9, D: 8, C: 6, I: 7 },
  { name: 'Peso Muerto Rumano (RDL)', muscleGroup: MuscleGroup.PIERNAS, level: ExerciseLevel.INTERMEDIO, M: 9, D: 9, C: 8, I: 9 },

  // HOMBROS
  { name: 'Press Militar (Overhead Press)', muscleGroup: MuscleGroup.HOMBROS, level: ExerciseLevel.INTERMEDIO, M: 9, D: 9, C: 8, I: 9 },
  { name: 'Press Arnold', muscleGroup: MuscleGroup.HOMBROS, level: ExerciseLevel.INTERMEDIO, M: 8, D: 8, C: 7, I: 7 },
  { name: 'Elevaciones Laterales', muscleGroup: MuscleGroup.HOMBROS, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 5, C: 4, I: 4 },
  { name: 'Elevaciones Frontales', muscleGroup: MuscleGroup.HOMBROS, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 4, C: 4, I: 3 },
  { name: 'Face Pulls', muscleGroup: MuscleGroup.HOMBROS, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 5, C: 4, I: 4 },
  { name: 'Pájaros (Rear Delt Fly)', muscleGroup: MuscleGroup.HOMBROS, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 4, C: 4, I: 3 },

  // BRAZOS
  { name: 'Curl Bíceps con Barra', muscleGroup: MuscleGroup.BRAZOS, level: ExerciseLevel.PRINCIPIANTE, M: 6, D: 5, C: 4, I: 4 },
  { name: 'Curl Martillo (Hammer Curl)', muscleGroup: MuscleGroup.BRAZOS, level: ExerciseLevel.PRINCIPIANTE, M: 6, D: 5, C: 4, I: 4 },
  { name: 'Curl Concentración', muscleGroup: MuscleGroup.BRAZOS, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 4, C: 5, I: 3 },
  { name: 'Extensiones Tríceps en Polea', muscleGroup: MuscleGroup.BRAZOS, level: ExerciseLevel.PRINCIPIANTE, M: 6, D: 5, C: 4, I: 4 },
  { name: 'Fondos en Paralelas (Dips)', muscleGroup: MuscleGroup.BRAZOS, level: ExerciseLevel.INTERMEDIO, M: 8, D: 8, C: 7, I: 7 },
  { name: 'Press Francés (Skull Crushers)', muscleGroup: MuscleGroup.BRAZOS, level: ExerciseLevel.INTERMEDIO, M: 7, D: 7, C: 6, I: 6 },

  // CORE
  { name: 'Plancha (Plank)', muscleGroup: MuscleGroup.CORE, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 6, C: 4, I: 4 },
  { name: 'Crunch Abdominal', muscleGroup: MuscleGroup.CORE, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 4, C: 3, I: 3 },
  { name: 'Elevación de Piernas Colgado', muscleGroup: MuscleGroup.CORE, level: ExerciseLevel.INTERMEDIO, M: 7, D: 7, C: 6, I: 6 },
  { name: 'Russian Twist', muscleGroup: MuscleGroup.CORE, level: ExerciseLevel.PRINCIPIANTE, M: 5, D: 5, C: 4, I: 4 },
  { name: 'Ab Wheel Rollout', muscleGroup: MuscleGroup.CORE, level: ExerciseLevel.AVANZADO, M: 8, D: 8, C: 8, I: 7 },

  // CARDIO
  { name: 'Correr en Cinta', muscleGroup: MuscleGroup.CARDIO, level: ExerciseLevel.PRINCIPIANTE, M: 4, D: 5, C: 2, I: 5 },
  { name: 'Remo Ergómetro', muscleGroup: MuscleGroup.CARDIO, level: ExerciseLevel.INTERMEDIO, M: 7, D: 7, C: 5, I: 7 },
  { name: 'Bicicleta Estática', muscleGroup: MuscleGroup.CARDIO, level: ExerciseLevel.PRINCIPIANTE, M: 4, D: 4, C: 2, I: 4 },
];

const metricByExercise: Record<string, MetricType> = {
  // Isométricos / cardio por tiempo
  'Plancha (Plank)': MetricType.TIME_ONLY,
  'Correr en Cinta': MetricType.TIME_ONLY,
  'Remo Ergómetro': MetricType.TIME_ONLY,
  'Bicicleta Estática': MetricType.TIME_ONLY,
  // Calistenia (solo repeticiones)
  'Flexiones (Push-ups)': MetricType.REPS_ONLY,
  'Dominadas (Pull-ups)': MetricType.REPS_ONLY,
  'Hiperextensiones': MetricType.REPS_ONLY,
  'Zancadas (Lunges)': MetricType.REPS_ONLY,
  'Sentadilla Búlgara': MetricType.REPS_ONLY,
  'Elevación de Talones (Calf Raises)': MetricType.REPS_ONLY,
  'Fondos en Paralelas (Dips)': MetricType.REPS_ONLY,
  'Crunch Abdominal': MetricType.REPS_ONLY,
  'Elevación de Piernas Colgado': MetricType.REPS_ONLY,
  'Russian Twist': MetricType.REPS_ONLY,
  'Ab Wheel Rollout': MetricType.REPS_ONLY,
};

async function main() {
  console.log('🌱 Iniciando seed de ejercicios...');

  for (const ex of exercises) {
    const exerciseFactor = calculateExerciseFactor(ex.M, ex.D, ex.C, ex.I);
    const metricType = metricByExercise[ex.name] ?? MetricType.REPS_WEIGHT;

    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {
        muscleGroup: ex.muscleGroup,
        level: ex.level,
        metricType,
        massValue: ex.M,
        demandValue: ex.D,
        complexityValue: ex.C,
        impactValue: ex.I,
        exerciseFactor,
        isActive: true,
      },
      create: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        level: ex.level,
        metricType,
        massValue: ex.M,
        demandValue: ex.D,
        complexityValue: ex.C,
        impactValue: ex.I,
        exerciseFactor,
        isActive: true,
      },
    });

    console.log(`  ✓ ${ex.name} (FE: ${exerciseFactor.toFixed(2)})`);
  }

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });