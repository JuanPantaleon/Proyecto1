import {
  PrismaClient,
  MuscleGroup,
  ExerciseLevel,
  MetricType,
  Role,
  RoutineDayOfWeek,
  RoutineBlockType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { calculateExerciseFactor } from '@ranked-fitness/shared';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const { PECHO: P, ESPALDA: E, PIERNAS: L, HOMBROS: H, BRAZOS: B, CORE: C, CARDIO: K, OTROS: O } = MuscleGroup;
const { PRINCIPIANTE: PR, INTERMEDIO: IN, AVANZADO: AV } = ExerciseLevel;
const RW = MetricType.REPS_WEIGHT;
const RO = MetricType.REPS_ONLY;
const TO = MetricType.TIME_ONLY;

interface SeedExercise {
  name: string;
  muscleGroup: MuscleGroup;
  level: ExerciseLevel;
  metricType: MetricType;
  M: number;
  D: number;
  C: number;
  I: number;
  description: string;
}

function ex(
  name: string,
  muscleGroup: MuscleGroup,
  level: ExerciseLevel,
  metricType: MetricType,
  M: number,
  D: number,
  C: number,
  I: number,
  description: string
): SeedExercise {
  return { name, muscleGroup, level, metricType, M, D, C, I, description };
}

const exercises: SeedExercise[] = [
  // ==================== PECHO ====================
  ex('Press Banca Plano', P, IN, RW, 9, 8, 7, 8, 'Cómo hacerlo:\n1. Acostate boca arriba con los pies firmes y la barra sobre el pecho.\n2. Bajá la barra con control hasta tocar el pecho.\n3. Empujá hacia arriba hasta extender los brazos sin bloquear los codos.'),
  ex('Press Banca Inclinado', P, IN, RW, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Ajustá el banco a unos 30-45°.\n2. Bajá la barra a la parte alta del pecho.\n3. Empujá en diagonal hacia arriba manteniendo los hombros fijos.'),
  ex('Press Banca Declinado', P, IN, RW, 7, 7, 6, 6, 'Cómo hacerlo:\n1. Fijá el banco en declive y apoyá las piernas.\n2. Bajá la barra a la parte baja del pecho.\n3. Empujá hacia arriba y atrás con control.'),
  ex('Press Banca con Mancuernas', P, IN, RW, 8, 7, 6, 7, 'Cómo hacerlo:\n1. Sostené las mancuernas a la altura del pecho.\n2. Bajá abriendo los codos hacia los costados.\n3. Empujá hacia arriba juntando las mancuernas al final.'),
  ex('Press Inclinado con Mancuernas', P, IN, RW, 7, 7, 6, 6, 'Cómo hacerlo:\n1. Con el banco inclinado, llevá las mancuernas al pecho.\n2. Bajá con control hasta sentir el estiramiento.\n3. Empujá en diagonal sin golpear las mancuernas.'),
  ex('Press Declinado con Mancuernas', P, PR, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. En banco declinado, sostén las mancuernas sobre el pecho.\n2. Bajá de forma controlada.\n3. Empujá hacia arriba y adentro.'),
  ex('Press Banca Agarre Cerrado', P, AV, RW, 8, 8, 8, 8, 'Cómo hacerlo:\n1. Agarrá la barra a ancho de hombros o más angosto.\n2. Mantené los codos pegados al torso.\n3. Bajá y presioná enfocando en tríceps y pecho interno.'),
  ex('Press en Máquina (Chest Press)', P, PR, RW, 6, 5, 3, 4, 'Cómo hacerlo:\n1. Ajustá el asiento para que las manijas queden a la altura del pecho.\n2. Empujá hacia adelante hasta estirar los brazos.\n3. Volvé lento sin soltar tensión.'),
  ex('Press Banca en Smith', P, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Ubicate bajo la barra guiada a la altura del pecho.\n2. Bajá la barra con la guía fija.\n3. Empujá hacia arriba y controla el descenso.'),
  ex('Pec Deck', P, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Ajustá el asiento y apoyá los antebrazos en los acolchados.\n2. Juntá las manos por delante del pecho.\n3. Volvé lento al punto inicial.'),
  ex('Aperturas con Mancuernas', P, PR, RW, 6, 5, 5, 4, 'Cómo hacerlo:\n1. Acostate con las mancuernas sobre el pecho, palmas enfrentadas.\n2. Abrí los brazos con los codos levemente flexionados.\n3. Volvé a juntar en arco sin estirar del todo.'),
  ex('Aperturas en Polea Baja', P, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Ubicate entre dos poleas bajas.\n2. Llevá las manos por delante hasta juntarlas.\n3. Volvé con control manteniendo el pecho alto.'),
  ex('Cruce de Poleas (Crossovers)', P, PR, RW, 5, 5, 4, 3, 'Cómo hacerlo:\n1. Agarrá las poleas altas e inclinate levemente.\n2. Llevá las manos hacia el frente del cuerpo.\n3. Juntá las manos y volvé abriendo los brazos.'),
  ex('Cruce de Polea Alta', P, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Con polea alta, agarre neutro y paso al frente.\n2. Empujá hacia abajo y adentro del pecho.\n3. Subí con control y pecho firme.'),
  ex('Pullover con Mancuerna', P, IN, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Acostate transversal en el banco, mancuerna sobre el pecho.\n2. Bajá la mancuerna por detrás de la cabeza con codos suaves.\n3. Volvé tirando con el pecho y el dorsal.'),
  ex('Pullover con Barra', P, PR, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Acostate con la barra extendida sobre el pecho.\n2. Bajá la barra por detrás de la cabeza con codos fijos.\n3. Subí de vuelta con control.'),
  ex('Pullover en Polea', P, PR, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Parado frente a la polea alta, sujetá la cuerda.\n2. Traccioná desde arriba hacia el abdomen.\n3. Volvé lento estirando los dorsales.'),
  ex('Flexiones', P, PR, RO, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Manos a la altura de los hombros y cuerpo en línea recta.\n2. Bajá el pecho hasta cerca del piso.\n3. Empujá hasta estirar los brazos por completo.'),
  ex('Flexiones Declinadas', P, IN, RO, 8, 7, 5, 6, 'Cómo hacerlo:\n1. Apoyá los pies sobre un banco elevado.\n2. Bajá el pecho controlado con el core firme.\n3. Empujá hacia arriba sin arquear la cadera.'),
  ex('Flexiones Inclinadas', P, PR, RO, 5, 5, 3, 4, 'Cómo hacerlo:\n1. Apoyá las manos en un banco o pared.\n2. Bajá el pecho hacia el apoyo.\n3. Empujá hasta estirar los brazos.'),
  ex('Flexiones Diamante', P, IN, RO, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Formá un rombo con los dedos bajo el pecho.\n2. Bajá manteniendo los codos pegados.\n3. Empujá enfocando en pecho interno y tríceps.'),
  ex('Flexiones con Palmas', P, AV, RO, 9, 8, 7, 8, 'Cómo hacerlo:\n1. Bajá una flexión con impulso.\n2. Empujá con fuerza para despegar las manos.\n3. Aterrizá con codos suaves y repetí.'),
  ex('Flexiones con Banda', P, PR, RW, 6, 6, 4, 5, 'Cómo hacerlo:\n1. Pasá una banda por la espalda y sujetala con las manos.\n2. Bajá la flexión con resistencia extra.\n3. Empujá contra la banda hasta estirar.'),
  ex('Press con Bandas de Resistencia', P, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Anclá la banda a la altura del pecho.\n2. Empujá hacia adelante contra la resistencia.\n3. Volvé lento controlando la banda.'),
  ex('Aperturas con Bandas', P, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Anclá la banda detrás de vos.\n2. Abrí los brazos hacia los costados.\n3. Juntá las manos por delante con control.'),
  ex('Fondos en Paralelas (Pecho)', P, IN, RO, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Sostenete en las paralelas con el cuerpo inclinado.\n2. Bajá hasta que los brazos queden a 90°.\n3. Empujá hacia arriba sin balancearte.'),
  ex('Fondos en Máquina Asistida', P, PR, RO, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Apoyá las rodillas en el contrapeso.\n2. Bajá doblando los codos.\n3. Empujá hacia arriba con la ayuda del peso.'),
  ex('Press con Balón Medicinal', P, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Acostate y sostené el balón sobre el pecho.\n2. Bajá el balón controlado.\n3. Empujá hacia arriba de forma explosiva.'),
  ex('Lanzamiento de Balón contra Pared', P, IN, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Parate frente a una pared con el balón al pecho.\n2. Lanzalo con fuerza empujando el pecho.\n3. Recibilo y repetí sin pausa.'),
  ex('Flexiones con Balón Medicinal', P, IN, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Apoyá una mano sobre el balón y otra en el piso.\n2. Bajá la flexión con el core firme.\n3. Alterná el lado al subir.'),
  ex('Press de Pecho en Smith Inclinado', P, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Con banco inclinado bajo la guía.\n2. Bajá la barra a la parte alta del pecho.\n3. Empujá en diagonal con la guía fija.'),
  ex('Cruce de Poleas Unilateral', P, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Tomá una sola polea.\n2. Traccioná hacia el pecho opuesto.\n3. Volvé lento manteniendo el torso firme.'),
  ex('Aperturas en Banco Declinado', P, PR, RW, 6, 5, 5, 4, 'Cómo hacerlo:\n1. En banco declinado, sostené las mancuernas arriba.\n2. Abrí los brazos con codos suaves.\n3. Juntá las mancuernas en el centro.'),
  ex('Flexiones con Foco en Pecho', P, PR, RO, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Manos más anchas que los hombros.\n2. Bajá abriendo los codos hacia los costados.\n3. Empujá activando el pecho.'),
  ex('Press con Mancuernas Unilateral', P, PR, RW, 6, 5, 5, 4, 'Cómo hacerlo:\n1. Trabajá un brazo por vez con una mancuerna.\n2. Bajá controlado.\n3. Empujá arriba sin girar el torso.'),
  ex('Aperturas con Mancuernas Unilateral', P, PR, RW, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Acostate y abrí un solo brazo.\n2. Volvé a juntar en arco.\n3. Alterná el brazo en cada serie.'),
  ex('Press de Banca con Pausa', P, AV, RW, 9, 8, 7, 8, 'Cómo hacerlo:\n1. Bajá la barra al pecho.\n2. Pausá 2-3 segundos sin rebote.\n3. Empujá explosivo hacia arriba.'),
  ex('Press de Banca con Cadenas', P, AV, RW, 9, 9, 8, 8, 'Cómo hacerlo:\n1. Colgá cadenas de la barra.\n2. Bajá con mayor carga al final.\n3. Empujá mientras la cadena se despega del piso.'),
  ex('Flexiones con Apoyo en Silla', P, PR, RO, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Apoyá las manos en una silla.\n2. Bajá el pecho hacia el borde.\n3. Empujá hasta estirar los brazos.'),
  ex('Press Declinado en Smith', P, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Con banco declinado bajo la guía.\n2. Bajá la barra a la parte baja del pecho.\n3. Empujá hacia arriba con control.'),
  ex('Press de Banca con Mancuernas en Piso', P, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Acostate en el piso con mancuernas.\n2. Bajá hasta que los codos toquen el piso.\n3. Empujá hacia arriba y adentro.'),
  ex('Flexiones con Elevación de Rodilla', P, PR, RO, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Subí una rodilla al pecho durante la flexión.\n2. Volvé a apoyar y cambiá de pierna.\n3. Mantené el core firme todo el tiempo.'),
  ex('Aperturas en Polea Cruzada Alta', P, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Tomá las poleas en posición alta.\n2. Abrí y cerrá los brazos con el pecho firme.\n3. Controlá la vuelta sin tensión.'),
  ex('Press Declinado con Mancuernas Unilateral', P, PR, RW, 6, 5, 5, 4, 'Cómo hacerlo:\n1. En banco declinado, presioná un brazo por vez.\n2. Bajá controlado.\n3. Empujá sin mover el torso.'),
  ex('Flexiones en Aro', P, AV, RO, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Sostenete en anillas con las palmas enfrentadas.\n2. Bajá la flexión controlando la rotación.\n3. Empujá y volvé a la posición inicial.'),
  ex('Press de Pecho en Máquina de Empuje', P, PR, RW, 6, 5, 3, 4, 'Cómo hacerlo:\n1. Ajustá el asiento y las manijas.\n2. Empujá hacia adelante.\n3. Volvé lento sin soltar tensión.'),

  // ==================== ESPALDA ====================
  ex('Dominadas Pronas', E, IN, RO, 9, 9, 8, 8, 'Cómo hacerlo:\n1. Colgate con agarre prono y brazos extendidos.\n2. Subí llevando el pecho a la barra.\n3. Bajá controlado hasta colgar por completo.'),
  ex('Dominadas Supinas', E, IN, RO, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Agarrá la barra con palmas hacia vos.\n2. Subí llevando el pecho hacia la barra.\n3. Bajá con control hasta extender los brazos.'),
  ex('Dominadas Neutras', E, IN, RO, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Usá un agarre neutro con las palmas enfrentadas.\n2. Subí manteniendo los codos cerca.\n3. Bajá controlado.'),
  ex('Dominadas Asistidas', E, PR, RO, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Apoyá las rodillas en el contrapeso.\n2. Subí llevando el pecho a la barra.\n3. Bajá lento con la ayuda de la máquina.'),
  ex('Jalón al Pecho (Lat Pulldown)', E, PR, RW, 8, 7, 5, 6, 'Cómo hacerlo:\n1. Sentate con las rodillas trabadas y agarre ancho.\n2. Bajá la barra hacia la parte alta del pecho.\n3. Subí lento controlando el peso.'),
  ex('Jalón Agarre Cerrado', E, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Usá el agarre cerrado en V.\n2. Bajá la barra al pecho con los codos pegados.\n3. Volvé lento.'),
  ex('Jalón Tras Nuca', E, IN, RW, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Llevá la barra por detrás de la cabeza.\n2. Bajá hasta la base del cuello.\n3. Subí sin arquear la espalda.'),
  ex('Jalón en V', E, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Usá el agarre en V.\n2. Traccioná hacia el pecho.\n3. Subí lento estirando los dorsales.'),
  ex('Remo con Barra', E, IN, RW, 9, 8, 7, 7, 'Cómo hacerlo:\n1. Incliná el torso a 45° con la espalda recta.\n2. Traccioná la barra hacia el abdomen.\n3. Bajá controlado sin balancear.'),
  ex('Remo Pendlay', E, AV, RW, 9, 8, 7, 8, 'Cómo hacerlo:\n1. Partí de la barra en el piso.\n2. Traccioná explosivo hacia el pecho.\n3. Devolvé la barra al piso y repetí.'),
  ex('Remo con Mancuerna', E, IN, RW, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Apoyá una mano y rodilla en el banco.\n2. Traccioná la mancuerna hacia la cadera.\n3. Bajá lento estirando el dorsal.'),
  ex('Remo en Polea Baja', E, PR, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Sentate con la espalda recta y piernas apoyadas.\n2. Traccioná el agarre hacia el abdomen.\n3. Volvé lento sin encorvarte.'),
  ex('Remo en Polea Alta (Face Pull)', E, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Tomá la cuerda de la polea alta.\n2. Traccioná hacia la cara abriendo los codos.\n3. Volvé lento trabajando el deltoide posterior.'),
  ex('Remo T-Bar', E, IN, RW, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Montate sobre la máquina T-Bar.\n2. Traccioná el agarre hacia el pecho.\n3. Bajá controlado sin arquear.'),
  ex('Remo con Agarre Inverso', E, IN, RW, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Agarrá la barra con palmas hacia vos.\n2. Traccioná hacia el abdomen.\n3. Bajá controlado con la espalda firme.'),
  ex('Remo con Mancuerna a Una Mano Apoyado', E, IN, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Apoyá una mano en un punto fijo.\n2. Traccioná la mancuerna con el brazo contrario.\n3. Bajá lento sin girar el torso.'),
  ex('Remo Invertido', E, IN, RO, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Colgate debajo de una barra fija con el cuerpo recto.\n2. Traccioná el pecho hacia la barra.\n3. Bajá lento hasta colgar.'),
  ex('Remo en Máquina', E, PR, RW, 6, 5, 3, 4, 'Cómo hacerlo:\n1. Ajustá el asiento y el agarre.\n2. Traccioná hacia el pecho con el torso fijo.\n3. Volvé lento.'),
  ex('Pullover en Polea Alta', E, PR, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Parado frente a la polea alta.\n2. Traccioná desde arriba hacia el abdomen.\n3. Volvé estirando el dorsal.'),
  ex('Jalón en Polea Recta', E, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Usá la barra recta en la polea.\n2. Traccioná hacia el pecho.\n3. Subí lento.'),
  ex('Peso Muerto', E, AV, RW, 10, 10, 9, 10, 'Cómo hacerlo:\n1. Pies bajo la barra y espalda neutra.\n2. Empujá el piso levantando la barra pegada al cuerpo.\n3. Bloqueá con glúteos y bajá controlado.'),
  ex('Peso Muerto Sumo', E, AV, RW, 9, 9, 8, 9, 'Cómo hacerlo:\n1. Parate con los pies bien abiertos.\n2. Bajá con el torso erguido entre las piernas.\n3. Empujá el piso y bloqueá con glúteos.'),
  ex('Peso Muerto con Piernas Rígidas', E, IN, RW, 8, 8, 7, 8, 'Cómo hacerlo:\n1. Con piernas casi rectas, incliná el torso.\n2. Bajá la barra cerca del cuerpo sintiendo el femural.\n3. Subí activando glúteos y espalda.'),
  ex('Peso Muerto con Mancuernas', E, IN, RW, 8, 7, 6, 7, 'Cómo hacerlo:\n1. Sostené mancuernas frente a los muslos.\n2. Bajá empujando la cadera atrás.\n3. Subí con glúteos y espalda firme.'),
  ex('Hiperextensiones', E, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Ubicate en el banco de hiperextensiones.\n2. Bajá el torso con la espalda recta.\n3. Subí hasta alinear el cuerpo.'),
  ex('Buenos Días', E, AV, RW, 9, 9, 8, 9, 'Cómo hacerlo:\n1. Con la barra en el trapecio, empujá la cadera atrás.\n2. Bajá el torso con piernas casi rectas.\n3. Subí activando la cadena posterior.'),
  ex('Encogimientos de Hombros', E, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Con la barra al frente, subí los hombros.\n2. Mantené la contracción 1 segundo.\n3. Bajá lento.'),
  ex('Encogimientos con Mancuernas', E, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Sostené mancuernas a los costados.\n2. Subí los hombros hacia las orejas.\n3. Bajá controlado.'),
  ex('Remo con Banda', E, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Anclá la banda y traccioná hacia el abdomen.\n2. Mantené la espalda recta.\n3. Volvé lento contra la resistencia.'),
  ex('Jalón con Banda', E, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Anclá la banda arriba y tirá hacia el pecho.\n2. Mantené el torso erguido.\n3. Subí lento.'),
  ex('Dominadas con Banda', E, IN, RO, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Anclá una banda a la barra y apoyá el pie.\n2. Subí con asistencia de la banda.\n3. Bajá controlado.'),
  ex('Supermán', E, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Acostate boca abajo con brazos al frente.\n2. Elevá brazos y piernas del piso.\n3. Mantené 1 segundo y bajá.'),
  ex('Nadador en el Piso', E, PR, RO, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Acostate boca abajo.\n2. Alterná brazos y piernas como al nadar.\n3. Mantené el abdomen contraído.'),
  ex('Remo en Máquina Smith', E, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Ubicate debajo de la barra guiada.\n2. Traccioná hacia el abdomen con el torso inclinado.\n3. Bajá lento.'),
  ex('Peso Muerto Rack Pull', E, AV, RW, 9, 9, 8, 8, 'Cómo hacerlo:\n1. Colocá la barra en el rack a media altura.\n2. Bloqueá la cadera y levantá.\n3. Bajá controlado hasta la altura del rack.'),
  ex('Pull-up con Peso', E, AV, RO, 10, 9, 8, 9, 'Cómo hacerlo:\n1. Agregá peso con un cinturón o chaleco.\n2. Subí llevando el pecho a la barra.\n3. Bajá controlado.'),
  ex('Jalón Ancho Tras Nuca', E, IN, RW, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Agarre ancho en la polea.\n2. Llevá la barra detrás de la cabeza.\n3. Subí sin arquear.'),
  ex('Remo Sellado con Mancuernas', E, IN, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Acostate boca abajo en el banco.\n2. Traccioná las mancuernas hacia los costados.\n3. Bajá lento sin apoyar del todo.'),
  ex('Jalón Unilateral en Polea', E, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Traccioná con un brazo por vez.\n2. Mantené el torso firme.\n3. Volvé lento.'),
  ex('Remo en Polea Alta Agarre Ancho', E, IN, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Agarre ancho en la polea alta.\n2. Traccioná hacia el pecho.\n3. Subí lento.'),
  ex('Tracción de Trineo', E, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Sujetá el arnés y tirá del trineo caminando.\n2. Mantené la espalda recta.\n3. Avanzá con pasos controlados.'),
  ex('Caminata del Granjero', E, IN, RW, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Sostené pesas pesadas a los costados.\n2. Caminá erguido con el core firme.\n3. Mantené los hombros hacia atrás.'),
  ex('Remo con Balón Medicinal', E, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Con el balón en el pecho, incliná el torso.\n2. Traccioná el balón hacia el abdomen.\n3. Bajá controlado.'),
  ex('Extensión de Espalda en Máquina', E, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Ajustá el asiento a la altura de la cadera.\n2. Extendé el torso contra la resistencia.\n3. Volvé lento.'),
  ex('Hiperextensiones con Peso', E, IN, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Sostené un disco contra el pecho.\n2. Bajá el torso con la espalda recta.\n3. Subí manteniendo la tensión.'),

  // ==================== HOMBROS ====================
  ex('Press Militar', H, IN, RW, 9, 9, 8, 9, 'Cómo hacerlo:\n1. Barra a la altura del mentón y core firme.\n2. Presioná hacia arriba pasando la cabeza.\n3. Bajá hasta el mentón con control.'),
  ex('Press Militar con Mancuernas', H, IN, RW, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Mancuernas a la altura de los hombros.\n2. Presioná hacia arriba.\n3. Bajá controlado sin balancear.'),
  ex('Press Arnold', H, IN, RW, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Mancuernas al frente con palmas hacia vos.\n2. Presioná arriba rotando las palmas.\n3. Bajá invirtiendo la rotación.'),
  ex('Press en Máquina de Hombros', H, PR, RW, 6, 5, 3, 4, 'Cómo hacerlo:\n1. Ajustá el asiento y las manijas.\n2. Empujá hacia arriba.\n3. Bajá lento.'),
  ex('Press con Barra Tras la Nuca', H, AV, RW, 9, 9, 8, 9, 'Cómo hacerlo:\n1. Llevá la barra detrás de la cabeza.\n2. Presioná hacia arriba.\n3. Bajá controlado con movilidad de hombro.'),
  ex('Press con Mancuerna Unilateral', H, PR, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Presioná un brazo por vez.\n2. Mantené el core firme.\n3. Bajá controlado.'),
  ex('Elevaciones Laterales', H, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Mancuernas a los costados.\n2. Subí los brazos hasta la altura del hombro.\n3. Bajá lento sin balancear.'),
  ex('Elevaciones Frontales', H, PR, RW, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Subí una mancuerna al frente hasta la altura del hombro.\n2. Bajá controlado.\n3. Alterná el brazo.'),
  ex('Pájaros (Rear Delt Fly)', H, PR, RW, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Incliná el torso con la espalda recta.\n2. Abrí los brazos hacia los costados.\n3. Juntá las escápulas y bajá lento.'),
  ex('Pájaros en Máquina', H, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Ajustá el asiento y apoyá el pecho.\n2. Abrí los brazos hacia atrás.\n3. Volvé lento.'),
  ex('Cruce de Poleas para Deltoides Trasero', H, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Cruzá las poleas a la altura del pecho.\n2. Tirá hacia atrás abriendo los brazos.\n3. Volvé lento.'),
  ex('Elevación Lateral en Polea', H, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Parate de costado a la polea baja.\n2. Elevá el brazo hasta la altura del hombro.\n3. Bajá lento.'),
  ex('Elevación Lateral Inclinada', H, PR, RW, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Incliná el torso apoyado en el banco.\n2. Elevá el brazo hacia el costado.\n3. Bajá controlado.'),
  ex('Press con Banda', H, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Parate sobre la banda y llevá los extremos a los hombros.\n2. Presioná hacia arriba.\n3. Bajá lento contra la resistencia.'),
  ex('Elevaciones Laterales con Banda', H, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Parate sobre la banda.\n2. Elevá los brazos a los costados.\n3. Bajá lento.'),
  ex('Elevaciones con Bandas Traseras', H, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Sostené la banda al frente.\n2. Abrí los brazos hacia atrás.\n3. Volvé lento.'),
  ex('Plancha de Hombro (Handstand Hold)', H, AV, TO, 8, 8, 7, 8, 'Cómo hacerlo:\n1. Apoyate contra la pared en posición de pino.\n2. Mantené el cuerpo en línea recta.\n3. Sostené el tiempo indicado sin arquear.'),
  ex('Fondos con Hombros (Pike Push-up)', H, IN, RO, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Formá una V con las caderas arriba.\n2. Bajá la cabeza hacia el piso.\n3. Empujá hacia arriba.'),
  ex('Flexiones de Pino contra Pared', H, AV, RO, 9, 9, 8, 8, 'Cómo hacerlo:\n1. Entrá al pino apoyando los pies en la pared.\n2. Bajá la cabeza hacia el piso.\n3. Empujá hasta estirar los brazos.'),
  ex('Press de Hombros en Smith', H, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Con la barra guiada a la altura del mentón.\n2. Presioná hacia arriba.\n3. Bajá controlado.'),
  ex('Elevación Frontal en Polea', H, PR, RW, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Parate de espaldas a la polea baja.\n2. Elevá el brazo al frente.\n3. Bajá lento.'),
  ex('Lanzamiento por Encima de la Cabeza', H, IN, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Sostené el balón detrás de la cabeza.\n2. Lanzalo hacia adelante con fuerza.\n3. Recibilo y repetí.'),
  ex('Rotaciones Externas con Banda', H, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Codo pegado al costado a 90°.\n2. Rotá el antebrazo hacia afuera.\n3. Volvé lento.'),
  ex('Rotaciones Internas con Banda', H, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Codo pegado al costado a 90°.\n2. Rotá el antebrazo hacia adentro.\n3. Volvé lento.'),
  ex('YTWL en el Piso', H, PR, RO, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Acostate boca abajo con los brazos extendidos.\n2. Formá las letras Y, T, W y L con los brazos.\n3. Mantené el abdomen contraído.'),
  ex('Press de Push-Press', H, AV, RW, 9, 9, 8, 8, 'Cómo hacerlo:\n1. Con la barra al pecho, flexioná levemente las piernas.\n2. Empujá con las piernas y presioná arriba.\n3. Bajá controlado.'),
  ex('Empuje de Peso Muerto hacia el Cielo', H, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Con un disco pequeño, empujá hacia arriba.\n2. Mantené el core firme.\n3. Bajá controlado.'),
  ex('Press de Hombro con Mancuernas Sentado', H, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Sentate con respaldo para proteger la espalda.\n2. Presioná las mancuernas hacia arriba.\n3. Bajá lento.'),
  ex('Elevación Lateral en Banco Inclinado', H, PR, RW, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Acostate de costado en el banco.\n2. Elevá el brazo hacia el techo.\n3. Bajá lento.'),
  ex('Crucifijo Invertido en Máquina', H, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Ajustá el asiento.\n2. Abrí los brazos hacia atrás.\n3. Volvé lento.'),
  ex('Press con Banda Overhead', H, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Anclá la banda abajo.\n2. Presioná hacia arriba contra la resistencia.\n3. Bajá lento.'),
  ex('Flexiones en Pino con Apoyo', H, IN, RO, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Apoyá los pies en la pared.\n2. Bajá la cabeza al piso.\n3. Empujá hasta estirar.'),
  ex('Desplazamiento de Caminata de Manos', H, IN, RO, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Andá hacia adelante caminando con las manos.\n2. Mantené la cadera baja y el cuerpo alineado.\n3. Controlá cada paso.'),
  ex('Press de Hombros con Kettlebell', H, IN, RW, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Sostené la kettlebell al hombro.\n2. Presioná hacia arriba.\n3. Bajá controlado.'),
  ex('Press de Hombro en Polea', H, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Parate de espaldas a la polea baja.\n2. Presioná hacia arriba.\n3. Bajá lento.'),
  ex('Elevación Frontal con Banda', H, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Parate sobre la banda.\n2. Elevá el brazo al frente.\n3. Bajá lento.'),
  ex('Press de Hombro con Banda de Potencia', H, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Con banda de resistencia alta.\n2. Presioná explosivo hacia arriba.\n3. Bajá controlado.'),
  ex('Círculos de Hombro con Mancuernas', H, PR, RW, 4, 3, 3, 3, 'Cómo hacerlo:\n1. Brazos a los costados con mancuernas livianas.\n2. Hacé círculos pequeños hacia adelante.\n3. Repetí hacia atrás.'),
  ex('Flexiones de Pino con Banda', H, IN, RO, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Apoyá los pies contra la pared.\n2. Bajá la cabeza al piso con la banda.\n3. Empujá hacia arriba.'),

  // ==================== BRAZOS ====================
  ex('Curl con Barra', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Sostené la barra con agarre supino a ancho de hombros.\n2. Curlá sin mover los codos.\n3. Bajá lento hasta estirar.'),
  ex('Curl con Barra Z', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Usá la barra Z para aliviar las muñecas.\n2. Curlá manteniendo los codos fijos.\n3. Bajá controlado.'),
  ex('Curl con Mancuernas', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Mancuernas a los costados con palmas al frente.\n2. Curlá sin balancear el torso.\n3. Bajá lento.'),
  ex('Curl Alternado', B, PR, RW, 5, 5, 4, 3, 'Cómo hacerlo:\n1. Curlá un brazo por vez.\n2. Rotá la palma al subir.\n3. Bajá controlado y cambiá.'),
  ex('Curl Martillo', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Palmas enfrentadas con agarre neutro.\n2. Curlá manteniendo el antebrazo vertical.\n3. Bajá lento.'),
  ex('Curl Concentración', B, PR, RW, 5, 4, 5, 3, 'Cómo hacerlo:\n1. Sentate apoyando el codo en el muslo interno.\n2. Curlá con contracción máxima arriba.\n3. Bajá lento.'),
  ex('Curl en Banco Scott', B, PR, RW, 6, 5, 5, 4, 'Cómo hacerlo:\n1. Apoyá los brazos en el banco inclinado.\n2. Curlá sin despegar los codos.\n3. Bajá lento.'),
  ex('Curl en Polea Baja', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Tomá la barra de la polea baja.\n2. Curlá manteniendo los codos fijos.\n3. Bajá lento contra la resistencia.'),
  ex('Curl con Banda', B, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Parate sobre la banda.\n2. Curlá contra la resistencia.\n3. Bajá lento.'),
  ex('Curl de Araña', B, IN, RW, 6, 5, 5, 4, 'Cómo hacerlo:\n1. Acostate boca abajo en un banco inclinado.\n2. Curlá con los brazos colgando.\n3. Bajá lento.'),
  ex('Curl con Barra Inclinado', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. En banco inclinado con la barra.\n2. Curlá sin mover los codos.\n3. Bajá lento.'),
  ex('Curl 21s', B, IN, RW, 6, 5, 5, 4, 'Cómo hacerlo:\n1. Hacé 7 repeticiones de la mitad inferior.\n2. Luego 7 de la mitad superior.\n3. Terminá con 7 completas.'),
  ex('Extensiones de Tríceps en Polea', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Tomá la barra de la polea alta.\n2. Empujá hacia abajo estirando los codos.\n3. Subí lento.'),
  ex('Extensiones de Tríceps con Mancuerna', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Sostené la mancuerna detrás de la cabeza.\n2. Extendé los codos hacia arriba.\n3. Bajá lento.'),
  ex('Press Francés', B, IN, RW, 7, 7, 6, 6, 'Cómo hacerlo:\n1. Acostate con la barra sobre el pecho.\n2. Bajá la barra hacia la frente doblando codos.\n3. Extendé los codos hacia arriba.'),
  ex('Press Francés con Mancuernas', B, IN, RW, 7, 7, 6, 6, 'Cómo hacerlo:\n1. Acostate con mancuernas sobre el pecho.\n2. Bajá hacia la cabeza doblando los codos.\n3. Extendé hacia arriba.'),
  ex('Fondos en Paralelas (Tríceps)', B, IN, RO, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Sostenete en las paralelas con el cuerpo erguido.\n2. Bajá con los codos pegados.\n3. Empujá enfocando en tríceps.'),
  ex('Fondos en Banco', B, PR, RO, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Apoyá las manos en un banco detrás.\n2. Bajá doblando los codos.\n3. Empujá hacia arriba.'),
  ex('Extensión de Tríceps sobre la Cabeza', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Mancuerna o polea por detrás de la cabeza.\n2. Extendé los codos hacia arriba.\n3. Bajá lento.'),
  ex('Kickback de Tríceps', B, PR, RW, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Incliná el torso con el brazo al costado.\n2. Extendé el codo hacia atrás.\n3. Bajá lento.'),
  ex('Flexiones de Tríceps en Pared', B, PR, RO, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Manos en la pared con codos pegados.\n2. Bajá el pecho hacia la pared.\n3. Empujá hacia atrás.'),
  ex('Extensión de Tríceps en Polea con Soga', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Tomá la soga de la polea alta.\n2. Empujá hacia abajo abriendo la soga al final.\n3. Subí lento.'),
  ex('Press de Tríceps con Banda', B, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Anclá la banda arriba.\n2. Empujá hacia abajo contra la resistencia.\n3. Subí lento.'),
  ex('Curl con Mancuernas en Banco Inclinado', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. En banco inclinado con mancuernas.\n2. Curlá sin mover los codos.\n3. Bajá lento.'),
  ex('Curl con Máquina de Poleas Cruzadas', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Curlá con una polea baja de frente.\n2. Mantené los codos fijos.\n3. Bajá lento.'),
  ex('Zottman Curl', B, IN, RW, 6, 5, 5, 4, 'Cómo hacerlo:\n1. Curlá con palmas hacia arriba.\n2. Al bajar, rotá las palmas hacia abajo.\n3. Bajá controlado.'),
  ex('Curl de Antebrazo (Muñeca)', B, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Antebrazos apoyados con muñecas fuera del banco.\n2. Flexioná las muñecas hacia arriba.\n3. Bajá lento.'),
  ex('Curl de Muñeca con Barra', B, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Apoyá los antebrazos en el banco.\n2. Subí y bajá la barra con las muñecas.\n3. Controlá el rango completo.'),
  ex('Extensión de Muñeca con Barra', B, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Antebrazos apoyados con palmas hacia abajo.\n2. Extendé las muñecas hacia arriba.\n3. Bajá lento.'),
  ex('Flexión de Antebrazos con Banda', B, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Sostené la banda con los antebrazos apoyados.\n2. Flexioná la muñeca contra la banda.\n3. Volvé lento.'),
  ex('Tríceps en Máquina', B, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Ajustá el asiento y el agarre.\n2. Empujá hacia abajo estirando los codos.\n3. Volvé lento.'),
  ex('Curl con Barra y Banda', B, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Agregá banda a la barra para más tensión arriba.\n2. Curlá manteniendo los codos fijos.\n3. Bajá lento.'),
  ex('Martillo con Polea', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Tomá la cuerda de la polea baja.\n2. Curlá con agarre neutro.\n3. Bajá lento.'),
  ex('Curl con Máquina Biceps', B, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Ajustá el asiento y apoyá los brazos.\n2. Curlá contra la resistencia.\n3. Bajá lento.'),
  ex('Extensión de Tríceps en Polea Tras Nuca', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. De espaldas a la polea baja.\n2. Extendé los codos hacia adelante-arriba.\n3. Bajá lento.'),
  ex('Curl de Araña en Banco', B, IN, RW, 6, 5, 5, 4, 'Cómo hacerlo:\n1. Acostate boca abajo en el banco.\n2. Curlá con los brazos colgando.\n3. Bajá lento.'),
  ex('Curl con Barra de Pie Agarre Ancho', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Agarre más ancho que los hombros.\n2. Curlá enfocando la cabeza del bíceps.\n3. Bajá lento.'),
  ex('Tríceps en Polea con Barra Recta', B, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Tomá la barra recta de la polea alta.\n2. Empujá hacia abajo.\n3. Subí lento.'),

  // ==================== PIERNAS ====================
  ex('Sentadilla Libre', L, AV, RW, 10, 10, 9, 10, 'Cómo hacerlo:\n1. Pies al ancho de hombros y barra en el trapecio.\n2. Bajá empujando la cadera atrás y atrás.\n3. Subí extendiendo piernas con el pecho alto.'),
  ex('Sentadilla Frontal', L, AV, RW, 9, 9, 9, 9, 'Cómo hacerlo:\n1. Barra sobre los hombros con los codos altos.\n2. Bajá manteniendo el torso erguido.\n3. Subí con fuerza de piernas.'),
  ex('Sentadilla con Mancuernas', L, PR, RW, 8, 7, 5, 6, 'Cómo hacerlo:\n1. Sostené las mancuernas a los costados.\n2. Bajá hasta el paralelo.\n3. Subí con el pecho alto.'),
  ex('Sentadilla Goblet', L, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Sostené la mancuerna contra el pecho.\n2. Bajá profundo con el torso erguido.\n3. Subí empujando el piso.'),
  ex('Sentadilla Sumo', L, IN, RW, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Pies bien abiertos con puntas hacia afuera.\n2. Bajá con las rodillas abiertas.\n3. Subí activando el interno del muslo.'),
  ex('Sentadilla Hack', L, IN, RW, 8, 7, 5, 6, 'Cómo hacerlo:\n1. Ubicate en la máquina con los hombros apoyados.\n2. Bajá hasta el paralelo.\n3. Empujá hacia arriba.'),
  ex('Sentadilla en Máquina Smith', L, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Con la barra guiada en el trapecio.\n2. Bajá con la guía vertical.\n3. Empujá hacia arriba.'),
  ex('Prensa de Piernas', L, PR, RW, 8, 7, 4, 6, 'Cómo hacerlo:\n1. Apoyá los pies en la plataforma al ancho de hombros.\n2. Bajá la plataforma flexionando rodillas.\n3. Empujá sin bloquear las rodillas.'),
  ex('Prensa Unilateral', L, IN, RW, 8, 7, 5, 6, 'Cómo hacerlo:\n1. Trabajá una pierna por vez.\n2. Bajá controlado.\n3. Empujá enfocando en el cuádriceps.'),
  ex('Prensa Inclinada', L, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Con el torso inclinado hacia atrás.\n2. Bajá la plataforma con control.\n3. Empujá sin despegar la cadera.'),
  ex('Zancadas', L, IN, RO, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Paso largo al frente.\n2. Bajá hasta que ambas rodillas queden a 90°.\n3. Empujá con el talón y volvé.'),
  ex('Zancadas Caminando', L, IN, RO, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Avanzá con una zancada al frente.\n2. Bajá a 90°.\n3. Empujá y continuá caminando.'),
  ex('Zancada Lateral', L, IN, RO, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Paso lateral amplio.\n2. Bajá flexionando la pierna que se mueve.\n3. Empujá y volvé al centro.'),
  ex('Zancada Reversa', L, PR, RO, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Paso hacia atrás.\n2. Bajá hasta 90°.\n3. Empujá con el talón delantero.'),
  ex('Sentadilla Búlgara', L, AV, RO, 9, 8, 8, 8, 'Cómo hacerlo:\n1. Apoyá el pie trasero en el banco.\n2. Bajá con la pierna delantera a 90°.\n3. Empujá con el talón delantero.'),
  ex('Step-ups', L, PR, RO, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Subí a un cajón con una pierna.\n2. Empujá con el talón y subí el cuerpo.\n3. Bajá controlado.'),
  ex('Extensiones de Cuádriceps', L, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Ajustá el asiento y el acolchado.\n2. Extendé las rodillas hacia arriba.\n3. Bajá lento.'),
  ex('Curl Femoral Acostado', L, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Acostate boca abajo en la máquina.\n2. Curlá los talones hacia los glúteos.\n3. Bajá lento.'),
  ex('Curl Femoral Sentado', L, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Sentate con el acolchado sobre los muslos.\n2. Flexioná las rodillas.\n3. Volvé lento.'),
  ex('Curl Femoral de Pie', L, IN, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Parado en la máquina, flexioná una rodilla por vez.\n2. Llevá el talón al glúteo.\n3. Bajá lento.'),
  ex('Peso Muerto Rumano', L, IN, RW, 9, 9, 8, 9, 'Cómo hacerlo:\n1. Con la barra en los muslos, empujá la cadera atrás.\n2. Bajá la barra pegada al cuerpo.\n3. Subí activando glúteos y femorales.'),
  ex('RDL con Mancuernas', L, IN, RW, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Mancuernas al frente de los muslos.\n2. Empujá la cadera atrás bajando el torso.\n3. Subí con glúteos y espalda firme.'),
  ex('Abducción de Cadera en Máquina', L, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Sentate con las piernas sobre los acolchados.\n2. Abrí las piernas contra la resistencia.\n3. Volvé lento.'),
  ex('Aducción de Cadera en Máquina', L, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Sentate con las piernas abiertas.\n2. Juntá las piernas contra la resistencia.\n3. Volvé lento.'),
  ex('Elevación de Talones de Pie', L, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Parate con la punta de los pies en un escalón.\n2. Subí de puntillas.\n3. Bajá estirando la pantorrilla.'),
  ex('Elevación de Talones Sentado', L, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Sentate con las rodillas flexionadas.\n2. Subí de puntillas.\n3. Bajá controlado.'),
  ex('Elevación de Talones en Prensa', L, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Apoyá la punta de los pies en la plataforma.\n2. Empujá con los dedos.\n3. Bajá estirando la pantorrilla.'),
  ex('Elevación de Talones Unilateral', L, IN, RW, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Trabajá una pantorrilla por vez.\n2. Subí de puntillas.\n3. Bajá lento.'),
  ex('Hip Thrust', L, IN, RW, 9, 8, 6, 7, 'Cómo hacerlo:\n1. Con la espalda apoyada en el banco y la barra en la cadera.\n2. Elevá la cadera apretando los glúteos.\n3. Bajá controlado.'),
  ex('Hip Thrust con Banda', L, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Con banda en las rodillas o cadera.\n2. Elevá la cadera contra la resistencia.\n3. Bajá lento.'),
  ex('Puente de Glúteo', L, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Acostate boca arriba con las rodillas flexionadas.\n2. Elevá la cadera apretando los glúteos.\n3. Bajá lento.'),
  ex('Patada de Glúteo en Polea', L, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Con la polea baja en el tobillo.\n2. Estirá la pierna hacia atrás.\n3. Volvé controlado.'),
  ex('Puente con Pierna Elevada', L, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Con una pierna extendida.\n2. Elevá la cadera con una sola pierna.\n3. Bajá lento y cambiá.'),
  ex('Glute Kickback con Banda', L, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Con la banda en el tobillo.\n2. Pateá la pierna hacia atrás.\n3. Volvé controlado.'),
  ex('Sentadilla Isométrica contra Pared', L, PR, TO, 5, 6, 3, 4, 'Cómo hacerlo:\n1. Espalda contra la pared y rodillas a 90°.\n2. Mantené la posición.\n3. Sostené el tiempo indicado.'),
  ex('Sentadilla Sissy', L, AV, RO, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Sujetate de un punto fijo.\n2. Incliná el torso atrás flexionando las rodillas.\n3. Subí con cuádriceps.'),
  ex('Landmine Squat', L, IN, RW, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Sostené la barra en un extremo con anclaje.\n2. Bajá en sentadilla con el peso al frente.\n3. Subí empujando el piso.'),
  ex('Pistol Squat', L, AV, RO, 10, 9, 9, 9, 'Cómo hacerlo:\n1. Extendé una pierna al frente.\n2. Bajá en una pierna hasta el fondo.\n3. Empujá con el talón y subí.'),
  ex('Sentadilla con Salto', L, IN, RO, 8, 7, 6, 7, 'Cómo hacerlo:\n1. Bajá una sentadilla.\n2. Saltá explosivo hacia arriba.\n3. Aterrizá suave y repetí.'),
  ex('Saltos al Cajón', L, IN, RO, 8, 7, 6, 7, 'Cómo hacerlo:\n1. Parate frente al cajón.\n2. Saltá con fuerza aterrizando suave.\n3. Bajá controlado y repetí.'),
  ex('Zancada con Salto', L, IN, RO, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Bajá una zancada.\n2. Saltá cambiando de pierna en el aire.\n3. Aterrizá en zancada y repetí.'),
  ex('Peso Muerto a una Pierna', L, IN, RO, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Con una pierna levantada atrás.\n2. Bajá el torso manteniendo la espalda recta.\n3. Subí con glúteos y femorales.'),
  ex('Curl de Pierna en Polea', L, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Con la polea baja en el tobillo.\n2. Curlá la pierna hacia los glúteos.\n3. Volvé lento.'),
  ex('Extensión de Pierna Unilateral', L, PR, RW, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Trabajá una pierna por vez en la máquina.\n2. Extendé la rodilla.\n3. Bajá lento.'),
  ex('Sentadilla con Banda', L, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Parate sobre la banda y sostenela al pecho.\n2. Bajá en sentadilla contra la resistencia.\n3. Subí empujando.'),
  ex('Prensa con los Pies Altos', L, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Apoyá los pies arriba en la plataforma.\n2. Bajá la plataforma.\n3. Empujá enfocando en glúteos y femorales.'),
  ex('Levantamiento de Cadera con Barra', L, IN, RW, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Espalda en el banco y barra en la cadera.\n2. Elevá la cadera apretando glúteos.\n3. Bajá lento.'),
  ex('Sumo Deadlift High Pull', L, AV, RW, 9, 8, 7, 7, 'Cómo hacerlo:\n1. Posición sumo con la barra en el piso.\n2. Tirá explosivo hasta el mentón.\n3. Bajá controlado.'),
  ex('Nordic Curl', L, AV, RO, 9, 8, 8, 8, 'Cómo hacerlo:\n1. Anclá los tobillos y arrodillate.\n2. Bajá el torso al frente controlando.\n3. Empujá con los femorales y volvé.'),
  ex('Caminata Lateral con Banda', L, PR, RO, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Banda en los tobillos o rodillas.\n2. Caminá lateralmente manteniendo tensión.\n3. Mantené la posición de sentadilla.'),
  ex('Sentadilla con Pausa', L, AV, RW, 10, 9, 8, 9, 'Cómo hacerlo:\n1. Bajá en sentadilla.\n2. Pausá 2 segundos en el fondo.\n3. Subí explosivo.'),
  ex('Prensa de Piernas con Pies Bajos', L, PR, RW, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Apoyá los pies bajos en la plataforma.\n2. Bajá controlado.\n3. Empujá enfocando en cuádriceps.'),
  ex('Zancada Cruzada', L, IN, RO, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Cruzá una pierna por detrás de la otra.\n2. Bajá flexionando ambas rodillas.\n3. Empujá y volvé.'),
  ex('Hip Thrust en Máquina', L, IN, RW, 8, 7, 5, 6, 'Cómo hacerlo:\n1. Ajustá la máquina de empuje de cadera.\n2. Elevá la cadera contra la resistencia.\n3. Bajá lento.'),
  ex('Elevación de Talones con Barra', L, IN, RW, 5, 4, 4, 4, 'Cómo hacerlo:\n1. Con la barra en la espalda.\n2. Subí de puntillas.\n3. Bajá estirando la pantorrilla.'),
  ex('Puente de Glúteo con Barra', L, IN, RW, 8, 7, 5, 6, 'Cómo hacerlo:\n1. Con la barra en la cadera.\n2. Elevá la cadera apretando glúteos.\n3. Bajá controlado.'),
  ex('Step-up con Mancuernas', L, PR, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Con mancuernas a los costados.\n2. Subí al cajón con una pierna.\n3. Bajá controlado.'),
  ex('Sentadilla con Banda en Rodillas', L, PR, RW, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Banda por encima de las rodillas.\n2. Bajá en sentadilla manteniendo la tensión.\n3. Subí sin dejar que las rodillas caigan.'),

  // ==================== CORE ====================
  ex('Plancha (Plank)', C, PR, TO, 5, 6, 4, 4, 'Cómo hacerlo:\n1. Antebrazos en el piso y cuerpo en línea recta.\n2. Apretá glúteos y abdomen.\n3. Sostené sin hundir la cadera.'),
  ex('Plancha Lateral', C, PR, TO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Apoyate en un antebrazo con el cuerpo alineado.\n2. Elevá la cadera.\n3. Sostené el tiempo de cada lado.'),
  ex('Plancha con Elevación de Pierna', C, IN, TO, 6, 6, 5, 5, 'Cómo hacerlo:\n1. En plancha, elevá una pierna.\n2. Mantené la cadera estable.\n3. Alterná la pierna.'),
  ex('Plancha con Brazo Extendido', C, IN, TO, 7, 6, 5, 5, 'Cómo hacerlo:\n1. En plancha, extendé un brazo al frente.\n2. Mantené el equilibrio.\n3. Alterná el brazo.'),
  ex('Crunch Abdominal', C, PR, RO, 5, 4, 3, 3, 'Cómo hacerlo:\n1. Acostate con las rodillas flexionadas.\n2. Elevá los hombros del piso.\n3. Bajá controlado sin tirar del cuello.'),
  ex('Crunch Inverso', C, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Acostate y llevá las rodillas al pecho.\n2. Elevá la cadera del piso.\n3. Bajá lento.'),
  ex('Elevación de Piernas Colgado', C, IN, RO, 7, 7, 6, 6, 'Cómo hacerlo:\n1. Colgate de la barra.\n2. Elevá las piernas rectas hasta la horizontal.\n3. Bajá controlado sin balancearte.'),
  ex('Elevación de Rodillas Colgado', C, PR, RO, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Colgate de la barra.\n2. Elevá las rodillas al pecho.\n3. Bajá lento.'),
  ex('Russian Twist', C, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Sentate con las rodillas flexionadas.\n2. Rotá el torso a cada lado.\n3. Mantené el pecho alto.'),
  ex('Russian Twist con Peso', C, IN, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Sostené un disco o balón.\n2. Rotá el torso de lado a lado.\n3. Mantené la espalda recta.'),
  ex('Ab Wheel Rollout', C, AV, RW, 8, 8, 8, 7, 'Cómo hacerlo:\n1. Arrodillate con la rueda al frente.\n2. Avanzá extendiendo el cuerpo.\n3. Volvé contrayendo el abdomen.'),
  ex('Rueda Abdominal de Rodillas', C, IN, RW, 7, 7, 6, 6, 'Cómo hacerlo:\n1. Arrodillate con la rueda al frente.\n2. Avanzá hasta estirar.\n3. Volvé con control.'),
  ex('Mountain Climbers', C, PR, RO, 6, 6, 5, 5, 'Cómo hacerlo:\n1. En posición de plancha alta.\n2. Llevá las rodillas al pecho alternando.\n3. Mantené la cadera baja.'),
  ex('Burpees', C, IN, RO, 9, 8, 7, 8, 'Cómo hacerlo:\n1. Bajá al piso y estirá las piernas.\n2. Hacé una flexión y volvé a la cuclilla.\n3. Saltá arriba con las manos.'),
  ex('V-ups', C, IN, RO, 7, 7, 6, 6, 'Cómo hacerlo:\n1. Acostate con brazos y piernas extendidos.\n2. Elevá piernas y torso juntos.\n3. Bajá controlado.'),
  ex('Hollow Hold', C, IN, TO, 7, 7, 6, 6, 'Cómo hacerlo:\n1. Acostate y despegá hombros y piernas del piso.\n2. Mantené la zona lumbar pegada.\n3. Sostené el tiempo indicado.'),
  ex('Dead Bug', C, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Acostate con brazos y piernas arriba.\n2. Bajá un brazo y la pierna opuesta.\n3. Volvé y alterná.'),
  ex('Bird Dog', C, PR, RO, 5, 4, 4, 3, 'Cómo hacerlo:\n1. En cuatro patas.\n2. Extendé un brazo y la pierna opuesta.\n3. Volvé y alterná.'),
  ex('Bicycle Crunch', C, PR, RO, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Acostate con las manos en la nuca.\n2. Llevá el codo a la rodilla opuesta.\n3. Alterná pedaleando.'),
  ex('Sit-up', C, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Acostate con las rodillas flexionadas.\n2. Elevá el torso hasta sentarte.\n3. Bajá controlado.'),
  ex('Sit-up en Banco Declinado', C, IN, RO, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Fijá los pies en el banco declinado.\n2. Elevá el torso.\n3. Bajá controlado.'),
  ex('Plancha con Toques de Hombro', C, PR, RO, 6, 5, 4, 4, 'Cómo hacerlo:\n1. En plancha alta.\n2. Tocá el hombro opuesto con una mano.\n3. Alterná manteniendo la cadera firme.'),
  ex('Supermán Hold', C, PR, TO, 5, 6, 4, 4, 'Cómo hacerlo:\n1. Boca abajo con brazos al frente.\n2. Elevá brazos y piernas.\n3. Sostené la posición.'),
  ex('Puente Frontal sobre Codos', C, PR, TO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Antebrazos y puntas de pies apoyadas.\n2. Mantené el cuerpo en línea recta.\n3. Sostené el tiempo indicado.'),
  ex('Rotación con Balón Medicinal', C, IN, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Sentate con el balón al pecho.\n2. Rotá de lado a lado.\n3. Mantené la espalda recta.'),
  ex('Slams con Balón Medicinal', C, IN, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Sostené el balón arriba.\n2. Golpealo fuerte contra el piso.\n3. Recibilo y repetí.'),
  ex('Lanzamiento de Balón Medicinal Sentado', C, IN, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Sentate con el balón al pecho.\n2. Lanzalo al frente con los abdominales.\n3. Recibilo y repetí.'),
  ex('Abdominales con Banda', C, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Anclá la banda y apoyate.\n2. Contrá el abdomen contra la resistencia.\n3. Volvé lento.'),
  ex('Pierna Elevada Isométrica', C, IN, TO, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Acostate y elevá las piernas rectas.\n2. Mantené la zona lumbar pegada.\n3. Sostené el tiempo indicado.'),
  ex('Flutter Kicks', C, PR, TO, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Acostate con las piernas elevadas.\n2. Movelas alternando como tijera.\n3. Mantené la espalda pegada.'),
  ex('Escaladores Laterales', C, PR, RO, 6, 5, 4, 4, 'Cómo hacerlo:\n1. En plancha alta.\n2. Llevá la rodilla al codo opuesto.\n3. Alterná con ritmo.'),
  ex('Twists con Disco', C, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Sentate con un disco al pecho.\n2. Rotá el torso de lado a lado.\n3. Mantené el pecho alto.'),
  ex('Palof Press', C, IN, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. De costado a la polea.\n2. Empujá hacia adelante resistiendo la rotación.\n3. Volvé lento.'),
  ex('Palof Press de Pie con Banda', C, IN, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Anclá la banda y empujá hacia adelante.\n2. Resistí la rotación del torso.\n3. Volvé lento.'),
  ex('Levantamiento de Piernas en Máquina', C, IN, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Apoyá los antebrazos en la máquina.\n2. Elevá las piernas hacia el pecho.\n3. Bajá lento.'),
  ex('Flexiones con Torso Giratorio', C, IN, RO, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Hacé una flexión.\n2. Al subir, girá el torso y apuntá al techo.\n3. Volvé y alterná.'),
  ex('Plancha Lateral con Elevación de Pierna', C, IN, TO, 6, 6, 5, 5, 'Cómo hacerlo:\n1. En plancha lateral.\n2. Elevá la pierna superior.\n3. Sostené y alterná de lado.'),
  ex('Gato-Activo', C, PR, RO, 5, 4, 4, 3, 'Cómo hacerlo:\n1. En cuatro patas.\n2. Contrá el abdomen llevando la rodilla al pecho.\n3. Alterná con ritmo.'),
  ex('Cruce de Piernas Colgado', C, IN, RO, 7, 7, 6, 6, 'Cómo hacerlo:\n1. Colgate de la barra.\n2. Elevá las piernas y cruzálas.\n3. Bajá controlado.'),
  ex('Plancha con Banda en Tobillos', C, IN, TO, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Banda en los tobillos en posición de plancha.\n2. Mantené la tensión sin separar.\n3. Sostené el tiempo indicado.'),
  ex('Plancha Alta con Brazos Extendidos', C, PR, TO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Manos apoyadas y brazos extendidos.\n2. Mantené el cuerpo en línea recta.\n3. Sostené el tiempo indicado.'),
  ex('Crunch con Piernas Elevadas', C, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Acostate con las piernas a 90°.\n2. Elevá los hombros.\n3. Bajá controlado.'),
  ex('Russian Twist en Banco', C, IN, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Sentate en el banco con el torso inclinado.\n2. Rotá el torso con un disco.\n3. Mantené la espalda recta.'),
  ex('Rueda Abdominal de Pie', C, AV, RW, 9, 9, 8, 8, 'Cómo hacerlo:\n1. Parate con la rueda al frente.\n2. Bajá controlando hasta el piso.\n3. Volvé con el abdomen contraído.'),
  ex('Giro con Banda y Rodillas', C, IN, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Con la banda anclada a un costado.\n2. Rotá el torso contra la resistencia.\n3. Volvé lento.'),
  ex('Levantamiento de Cadera en Máquina', C, IN, RW, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Apoyá los antebrazos y pies.\n2. Elevá la cadera contra la resistencia.\n3. Bajá lento.'),

  // ==================== CARDIO ====================
  ex('Correr en Cinta', K, PR, TO, 4, 5, 2, 5, 'Cómo hacerlo:\n1. Arrancá caminando y aumentá el ritmo progresivo.\n2. Mantené el torso erguido.\n3. Sostené el tiempo indicado a un ritmo constante.'),
  ex('Caminata en Cinta Inclinada', K, PR, TO, 3, 4, 2, 3, 'Cómo hacerlo:\n1. Subí la inclinación de la cinta.\n2. Caminá a paso firme.\n3. Mantené el ritmo el tiempo indicado.'),
  ex('Remo Ergómetro', K, IN, TO, 7, 7, 5, 7, 'Cómo hacerlo:\n1. Sentate y fijá los pies.\n2. Empujá con piernas, luego torso y brazos.\n3. Volvé en orden inverso.'),
  ex('Bicicleta Estática', K, PR, TO, 4, 4, 2, 4, 'Cómo hacerlo:\n1. Ajustá el asiento a la altura de la cadera.\n2. Pedaleá con ritmo constante.\n3. Mantené la resistencia elegida.'),
  ex('Bicicleta Reclinada', K, PR, TO, 4, 4, 2, 3, 'Cómo hacerlo:\n1. Ajustá el asiento reclinado.\n2. Pedaleá con las piernas extendidas.\n3. Mantené el tiempo indicado.'),
  ex('Elíptica', K, PR, TO, 4, 4, 2, 3, 'Cómo hacerlo:\n1. Apoyá los pies y manos en los manubrios.\n2. Mové piernas y brazos en forma coordinada.\n3. Mantené la resistencia y el ritmo.'),
  ex('Escaladora', K, IN, TO, 5, 5, 3, 5, 'Cómo hacerlo:\n1. Parate erguido en los peldaños.\n2. Mové los pies en forma continua.\n3. Mantené la cadera estable.'),
  ex('Saltar la Soga', K, IN, TO, 7, 6, 4, 6, 'Cómo hacerlo:\n1. Sostené la soga con los codos cerca.\n2. Saltá con los pies juntos.\n3. Mantené el ritmo con las muñecas.'),
  ex('Battle Ropes', K, IN, TO, 7, 7, 5, 6, 'Cómo hacerlo:\n1. Sostené los extremos de las cuerdas.\n2. Golpeá el piso con ondas alternas.\n3. Mantené la intensidad el tiempo indicado.'),
  ex('Cuerda de Batalla a una Mano', K, IN, TO, 7, 6, 4, 5, 'Cómo hacerlo:\n1. Sostené un extremo con una mano.\n2. Generá ondas con fuerza.\n3. Cambiá de mano.'),
  ex('Sprints en Cinta', K, AV, TO, 8, 8, 5, 8, 'Cómo hacerlo:\n1. Aumentá la velocidad de la cinta.\n2. Corré a máxima velocidad corta.\n3. Recuperá caminando entre series.'),
  ex('Correr al Aire Libre', K, PR, TO, 5, 6, 2, 6, 'Cómo hacerlo:\n1. Calentá caminando.\n2. Corré a ritmo sostenido.\n3. Enfriá caminando al final.'),
  ex('Caminata Rápida', K, PR, TO, 3, 4, 2, 3, 'Cómo hacerlo:\n1. Caminá a paso rápido.\n2. Mové los brazos.\n3. Mantené el ritmo el tiempo indicado.'),
  ex('Spinning', K, IN, TO, 5, 5, 3, 5, 'Cómo hacerlo:\n1. Ajustá el asiento y el manubrio.\n2. Pedaleá con resistencia.\n3. Variá ritmo y resistencia.'),
  ex('Burpees con Salto', K, IN, RO, 9, 8, 7, 8, 'Cómo hacerlo:\n1. Bajá al piso con flexión.\n2. Volvé a la cuclilla y saltá.\n3. Repetí con ritmo.'),
  ex('Saltos Tijera (Jumping Jacks)', K, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Parate con los pies juntos.\n2. Saltá abriendo piernas y brazos.\n3. Volvé y repetí.'),
  ex('High Knees', K, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Corré en el lugar.\n2. Elevá las rodillas a la cintura.\n3. Mantené el ritmo rápido.'),
  ex('Skaters', K, IN, RO, 6, 6, 5, 5, 'Cómo hacerlo:\n1. Saltá de lado a lado.\n2. Tocá el piso con la mano en cada lado.\n3. Mantené el ritmo.'),
  ex('Mountain Climbers Rápidos', K, IN, RO, 7, 7, 5, 6, 'Cómo hacerlo:\n1. En plancha alta.\n2. Llevá las rodillas al pecho rápido.\n3. Mantené la cadera baja.'),
  ex('Sprints en Escalera', K, IN, RO, 8, 7, 5, 7, 'Cómo hacerlo:\n1. Corré escaleras arriba.\n2. Bajá caminando para recuperar.\n3. Repetí las series.'),
  ex('Sprints con Trineo Empujado', K, AV, RW, 9, 9, 7, 9, 'Cómo hacerlo:\n1. Empujá el trineo con el cuerpo inclinado.\n2. Avanzá con pasos explosivos.\n3. Mantené la tensión del torso.'),
  ex('Remo en Piscina', K, IN, TO, 7, 7, 5, 7, 'Cómo hacerlo:\n1. En la piscina, traccioná con los brazos.\n2. Mové el agua con las palmas.\n3. Mantené la intensidad el tiempo indicado.'),
  ex('Natación', K, IN, TO, 8, 8, 6, 8, 'Cómo hacerlo:\n1. Entrá al agua y calentá.\n2. Nadá con técnica de brazada.\n3. Mantené el ritmo respirando correctamente.'),
  ex('Caminata con Manos en las Caderas', K, PR, TO, 3, 3, 2, 3, 'Cómo hacerlo:\n1. Caminá con las manos en las caderas.\n2. Mantené el pecho alto.\n3. Mantené el ritmo el tiempo indicado.'),
  ex('Intervalos en Cinta', K, IN, TO, 6, 6, 4, 6, 'Cómo hacerlo:\n1. Alterná sprints cortos con recuperación.\n2. Variá velocidad e inclinación.\n3. Mantené la técnica de carrera.'),
  ex('Correr en Cinta con Inclinación', K, IN, TO, 6, 6, 4, 6, 'Cómo hacerlo:\n1. Subí la inclinación.\n2. Corré a ritmo moderado.\n3. Mantené la cadencia constante.'),
  ex('Saltos en Cajón', K, IN, RO, 8, 7, 6, 7, 'Cómo hacerlo:\n1. Parate frente al cajón.\n2. Saltá con ambas piernas.\n3. Aterrizá suave y bajá.'),
  ex('Bicicleta de Montaña', K, IN, TO, 6, 6, 4, 6, 'Cómo hacerlo:\n1. Ajustá la bicicleta.\n2. Pedaleá en terrenos variados.\n3. Mantené la hidratación.'),
  ex('Bicicleta de Spinning HIIT', K, IN, TO, 7, 7, 5, 7, 'Cómo hacerlo:\n1. Calentá 5 minutos.\n2. Alterná sprints con recuperación.\n3. Enfriá pedaleando suave.'),
  ex('Remo Intervalos', K, IN, TO, 7, 7, 5, 7, 'Cómo hacerlo:\n1. Remá fuerte por 20-30 segundos.\n2. Recuperá remando suave.\n3. Repetí los intervalos.'),
  ex('Sprints en Lugar', K, IN, RO, 6, 6, 4, 5, 'Cómo hacerlo:\n1. Corré en el lugar a máxima velocidad.\n2. Elevá bien las rodillas.\n3. Recuperá y repetí.'),
  ex('Saltos de Rodilla al Pecho', K, PR, RO, 6, 5, 4, 4, 'Cómo hacerlo:\n1. Saltá llevando las rodillas al pecho.\n2. Aterrizá suave.\n3. Repetí con ritmo.'),
  ex('Bicicleta con Banda en Manos', K, PR, TO, 5, 5, 4, 5, 'Cómo hacerlo:\n1. En la bici estática, sostené una banda.\n2. Mové los brazos remando.\n3. Mantené el pedaleo constante.'),

  // ==================== FULL BODY / OTROS ====================
  ex('Clean and Press', O, AV, RW, 10, 9, 9, 10, 'Cómo hacerlo:\n1. Levantá la barra del piso explosivo.\n2. Recibila en los hombros.\n3. Presioná hacia arriba y bajá controlado.'),
  ex('Power Clean', O, AV, RW, 10, 10, 10, 10, 'Cómo hacerlo:\n1. Partí de la barra en el piso.\n2. Tirá explosivo con piernas y espalda.\n3. Recibí la barra en los hombros.'),
  ex('Thruster con Mancuernas', O, IN, RW, 9, 8, 7, 8, 'Cómo hacerlo:\n1. Mancuernas en los hombros.\n2. Bajá en sentadilla.\n3. Subí presionando las mancuernas arriba.'),
  ex('Kettlebell Swing', O, IN, RW, 8, 7, 6, 7, 'Cómo hacerlo:\n1. Sostené la kettlebell con ambas manos.\n2. Balanceala entre las piernas.\n3. Empujá la cadera al frente y elevá el peso.'),
  ex('Turkish Get-up', O, AV, RW, 9, 8, 9, 8, 'Cómo hacerlo:\n1. Acostate con la kettlebell arriba.\n2. Parate en pasos controlados.\n3. Bajá en orden inverso.'),
  ex('Burpee con Dominada', O, AV, RO, 10, 9, 8, 9, 'Cómo hacerlo:\n1. Hacé un burpee.\n2. Al saltar, colgate y hacé una dominada.\n3. Bajá controlado y repetí.'),
  ex('Cargada de Balón Medicinal', O, IN, RW, 8, 7, 6, 7, 'Cómo hacerlo:\n1. Bajá en cuclilla con el balón.\n2. Subí explosivo elevando el balón.\n3. Recibilo y repetí.'),
  ex('Trineo Empujado', O, IN, RW, 8, 8, 6, 8, 'Cómo hacerlo:\n1. Empujá el trineo con las manos.\n2. Avanzá con pasos cortos.\n3. Mantené el torso firme.'),
  ex('Trineo Tirando', O, IN, RW, 8, 8, 6, 8, 'Cómo hacerlo:\n1. Tirá del trineo con el arnés.\n2. Caminá hacia atrás con pasos controlados.\n3. Mantené la espalda recta.'),
  ex('Bear Crawl', O, PR, RO, 6, 5, 5, 4, 'Cómo hacerlo:\n1. En cuatro patas con rodillas elevadas.\n2. Avanzá con mano y pie opuestos.\n3. Mantené la cadera baja.'),
  ex('Spider Crawl', O, IN, RO, 7, 6, 5, 5, 'Cómo hacerlo:\n1. En posición de plancha alta.\n2. Llevá la rodilla al codo opuesto.\n3. Avanzá alternando.'),
  ex('Burpee Básico', O, IN, RO, 9, 8, 7, 8, 'Cómo hacerlo:\n1. Bajá en cuclilla y apoyá las manos.\n2. Estirá las piernas atrás.\n3. Volvé a la cuclilla y saltá.'),
  ex('Deadlift con Trineo', O, IN, RW, 8, 8, 6, 7, 'Cómo hacerlo:\n1. Levantá el trineo con la cadera.\n2. Avanzá unos pasos con el peso.\n3. Bajá controlado.'),
  ex('Burpee con Flexión', O, IN, RO, 9, 8, 7, 8, 'Cómo hacerlo:\n1. Hacé una flexión en el piso.\n2. Volvé a la cuclilla y saltá.\n3. Repetí con ritmo.'),
  ex('Thruster con Barra', O, AV, RW, 10, 9, 8, 9, 'Cómo hacerlo:\n1. Barra en los hombros.\n2. Bajá en sentadilla frontal.\n3. Subí presionando la barra arriba.'),
  ex('Kettlebell Clean', O, AV, RW, 9, 8, 8, 8, 'Cómo hacerlo:\n1. Levantá la kettlebell del piso.\n2. Recibila en la posición de rack.\n3. Bajá controlado.'),
  ex('Combo de Fuerza con Balón', O, IN, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Combiná slams y lanzamientos.\n2. Mantené el ritmo.\n3. Controlá cada repetición.'),
  ex('Snatch con Mancuerna', O, AV, RW, 9, 9, 9, 9, 'Cómo hacerlo:\n1. Levantá la mancuerna del piso explosivo.\n2. Llevala directo arriba de la cabeza.\n3. Bajá controlado.'),

  // ============ NUEVOS (movilidad / accesorios de la Rutina Líder) ============
  ex('Angelitos', H, PR, RO, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Acostate boca abajo con los brazos extendidos en Y.\n2. Deslizá los brazos hacia los costados formando una W.\n3. Volvé a la Y manteniendo el abdomen contraído.'),
  ex('Rotación de Hombros con Banda Elástica', H, PR, RW, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Sostené la banda con los brazos al frente.\n2. Rotá los brazos hacia atrás manteniéndolos rectos.\n3. Volvé lento controlando la tensión.'),
  ex('Remo con Kettlebell', E, PR, RW, 7, 6, 5, 5, 'Cómo hacerlo:\n1. Con la espalda recta, incliná el torso a 45°.\n2. Traccioná la kettlebell hacia la cadera con un brazo.\n3. Bajá lento y cambiá de lado.'),
  ex('Halo', H, PR, RW, 5, 4, 4, 3, 'Cómo hacerlo:\n1. Sostené la kettlebell frente al pecho.\n2. Giralá alrededor de la cabeza manteniendo el core firme.\n3. Invertí el sentido en cada vuelta.'),
  ex('Press con Kettlebell', P, IN, RW, 8, 7, 6, 6, 'Cómo hacerlo:\n1. Sostené la kettlebell en posición de rack.\n2. Presioná hacia arriba extendiendo el brazo.\n3. Bajá controlado y cambiá de brazo.'),
  ex('Hombro Posterior Unilateral en Polea', H, PR, RW, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Parate de costado a la polea alta.\n2. Traccioná hacia el hombro opuesto con un brazo.\n3. Volvé lento y cambiá de lado.'),
  ex('90/90', C, PR, RO, 5, 5, 4, 4, 'Cómo hacerlo:\n1. Sentate con ambas rodillas flexionadas a 90°.\n2. Rotá el torso manteniendo la pierna de atrás firme.\n3. Volvé y cambiá de lado.'),
  ex('Flexo-Extensión de Rodilla', L, PR, RO, 4, 4, 3, 3, 'Cómo hacerlo:\n1. Parate y elevá una rodilla al pecho.\n2. Extendé la pierna hacia adelante.\n3. Bajá controlado y cambiá de pierna.'),
  ex('Dorsiflexión de Tobillo', L, PR, RO, 3, 3, 2, 2, 'Cómo hacerlo:\n1. Parate con una pierna adelantada.\n2. Empujá la rodilla hacia adelante sobre el tobillo.\n3. Mantené el talón apoyado y repetí.'),
  ex('Sentadilla con Kettlebell', L, PR, RW, 8, 7, 5, 6, 'Cómo hacerlo:\n1. Sostené la kettlebell contra el pecho.\n2. Bajá en sentadilla profunda con el torso erguido.\n3. Subí empujando el piso.'),
  ex('Peso Muerto con Kettlebell', L, PR, RW, 8, 8, 7, 7, 'Cómo hacerlo:\n1. Con las kettlebells frente a los muslos.\n2. Empujá la cadera atrás bajando el torso.\n3. Subí con glúteos y espalda firme.'),
];

async function main() {
  console.log('🌱 Seed Ranked Fitness');
  console.log(`   ${exercises.length} ejercicios en el catálogo.`);

  // ============ 1) CATÁLOGO DE EJERCICIOS (upsert: NUNCA elimina, preserva y agrega) ============
  for (const ex of exercises) {
    const exerciseFactor = calculateExerciseFactor(ex.M, ex.D, ex.C, ex.I);

    await prisma.exercise.upsert({
      where: { name: ex.name },
      update: {
        muscleGroup: ex.muscleGroup,
        level: ex.level,
        metricType: ex.metricType,
        massValue: ex.M,
        demandValue: ex.D,
        complexityValue: ex.C,
        impactValue: ex.I,
        exerciseFactor,
        description: ex.description,
        isActive: true,
      },
      create: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        level: ex.level,
        metricType: ex.metricType,
        massValue: ex.M,
        demandValue: ex.D,
        complexityValue: ex.C,
        impactValue: ex.I,
        exerciseFactor,
        description: ex.description,
        isActive: true,
      },
    });
  }
  console.log('  ✓ Catálogo de ejercicios asegurado (intacto + nuevos).');

  // ============ 2) GIMNASIO OFICIAL: únicamente Pantafit ============
  const otherGyms = await prisma.gym.findMany({ where: { name: { not: GYM_NAME } } });
  if (otherGyms.length) {
    await prisma.gym.deleteMany({ where: { id: { in: otherGyms.map((g) => g.id) } } });
    console.log(`  🗑 ${otherGyms.length} gimnasio(s) no oficial(es) eliminado(s).`);
  }

  let gym = await prisma.gym.findFirst({ where: { name: GYM_NAME } });
  if (gym) {
    gym = await prisma.gym.update({
      where: { id: gym.id },
      data: { verified: true, country: 'Argentina', province: 'Jujuy' },
    });
  } else {
    gym = await prisma.gym.create({
      data: { id: 'gym_pantafit', name: GYM_NAME, verified: true, country: 'Argentina', province: 'Jujuy' },
    });
  }
  console.log(`  ✓ Gimnasio oficial: "${GYM_NAME}".`);

  // ============ 3) USUARIOS: eliminar mocks, mantener solo al OWNER (y otros OWNER por seguridad) ============
  const owners = await prisma.user.findMany({ where: { role: Role.OWNER } });
  const ownerByEmail = await prisma.user.findFirst({
    where: { email: { equals: OWNER_EMAIL, mode: 'insensitive' } },
  });

  const kept = new Map<string, string>();
  if (ownerByEmail) kept.set(ownerByEmail.id, ownerByEmail.email);
  for (const o of owners) if (!kept.has(o.id)) kept.set(o.id, o.email);

  const toDelete = await prisma.user.findMany({
    where: { id: { notIn: [...kept.keys()] } },
  });

  if (toDelete.length) {
    const ids = toDelete.map((u) => u.id);
    await prisma.auditLog.deleteMany({ where: { userId: { in: ids } } });
    await prisma.connection.deleteMany({
      where: { OR: [{ requesterId: { in: ids } }, { addresseeId: { in: ids } }] },
    });
    await prisma.chatRoom.deleteMany({
      where: { OR: [{ createdById: { in: ids } }, { members: { some: { userId: { in: ids } } } }] },
    });
    await prisma.post.deleteMany({ where: { authorId: { in: ids } } });
    await prisma.session.deleteMany({ where: { userId: { in: ids } } });
    await prisma.user.deleteMany({ where: { id: { in: ids } } });
    console.log(`  🗑 ${toDelete.length} usuario(s) mock eliminado(s).`);
  }

  // ============ 4) OWNER estricto: juanpantaleon06@gmail.com con rol OWNER ============
  let owner = ownerByEmail;
  if (owner) {
    owner = await prisma.user.update({
      where: { id: owner.id },
      data: { role: Role.OWNER, isOnboarded: true, gymId: gym.id },
    });
  } else {
    owner = await prisma.user.create({
      data: {
        clerkId: `clerk_seed_owner_${OWNER_EMAIL}`,
        email: OWNER_EMAIL,
        firstName: 'Juan',
        lastName: 'Pantaleón',
        role: Role.OWNER,
        isOnboarded: true,
        currentWeightKg: 0,
        heightCm: 0,
        streakDays: 0,
        gymId: gym.id,
      },
    });
  }
  console.log(`  ✓ Owner configurado: ${owner.email} (${owner.role}).`);

  // ============ 5) RUTINA LÍDER (pública, oficial, con la estructura semanal completa) ============
  const routine = await prisma.routine.upsert({
    where: { name: 'Rutina Líder' },
    update: {
      description: 'Rutina oficial semanal del ecosistema Ranked Fitness (Pantafit).',
      goal: 'Estructura semanal oficial: Lunes (espalda/bíceps/deltoides anterior), Martes (pecho/tríceps/deltoides lateral y posterior), Miércoles (pierna), Viernes (torso fuerza), Sábado (pierna fuerza).',
      level: ExerciseLevel.INTERMEDIO,
      isPublic: true,
      isOfficial: true,
      createdById: owner.id,
    },
    create: {
      name: 'Rutina Líder',
      description: 'Rutina oficial semanal del ecosistema Ranked Fitness (Pantafit).',
      goal: 'Estructura semanal oficial: Lunes (espalda/bíceps/deltoides anterior), Martes (pecho/tríceps/deltoides lateral y posterior), Miércoles (pierna), Viernes (torso fuerza), Sábado (pierna fuerza).',
      level: ExerciseLevel.INTERMEDIO,
      isPublic: true,
      isOfficial: true,
      createdById: owner.id,
    },
  });

  await prisma.routineDay.deleteMany({ where: { routineId: routine.id } });

  for (const [dayIdx, daySpec] of RUTINA_LIDER.entries()) {
    const day = await prisma.routineDay.create({
      data: {
        routineId: routine.id,
        dayOfWeek: daySpec.dayOfWeek,
        title: daySpec.title,
        focus: daySpec.focus,
        goal: daySpec.goal,
        order: dayIdx,
      },
    });

    for (const [blockIdx, blockSpec] of daySpec.blocks.entries()) {
      const block = await prisma.routineBlock.create({
        data: {
          dayId: day.id,
          type: blockSpec.type,
          name: blockSpec.name,
          rounds: blockSpec.rounds ?? null,
          order: blockIdx,
        },
      });

      for (const [setIdx, setSpec] of blockSpec.sets.entries()) {
        const exercise = await prisma.exercise.findUnique({ where: { name: setSpec.name } });
        if (!exercise) throw new Error(`Ejercicio no encontrado en el catálogo: ${setSpec.name}`);

        await prisma.routineSet.create({
          data: {
            blockId: block.id,
            exerciseId: exercise.id,
            targetSets: setSpec.targetSets ?? null,
            targetReps: setSpec.targetReps ?? null,
            weightKg: setSpec.weightKg ?? null,
            tempo: setSpec.tempo ?? null,
            notes: setSpec.notes ?? null,
            order: setIdx,
          },
        });
      }
    }
  }
  console.log(`  ✓ "Rutina Líder" creada/actualizada (${RUTINA_LIDER.length} días, pública).`);

  // ============ 6) VERIFICACIÓN ============
  const exerciseCount = await prisma.exercise.count();
  const gymCount = await prisma.gym.count();
  const userCount = await prisma.user.count();
  const routineSets = await prisma.routineSet.count();
  console.log(`\n✅ Seed completado:`);
  console.log(`   Ejercicios: ${exerciseCount} · Gimnasios: ${gymCount} · Usuarios: ${userCount}`);
  console.log(`   Rutina Líder: ${RUTINA_LIDER.length} días · ${routineSets} series registradas.`);
}

// =====================================================================================
// RUTINA LÍDER — estructura semanal oficial
// =====================================================================================

interface SeedRoutineSet {
  name: string;
  targetSets?: number;
  targetReps?: string;
  weightKg?: number;
  tempo?: string;
  notes?: string;
}

interface SeedRoutineBlock {
  type: RoutineBlockType;
  name: string;
  rounds?: number;
  sets: SeedRoutineSet[];
}

interface SeedRoutineDay {
  dayOfWeek: RoutineDayOfWeek;
  title: string;
  focus: string;
  goal: string;
  blocks: SeedRoutineBlock[];
}

const GYM_NAME = 'Pantafit';
const OWNER_EMAIL =
  process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase() ?? 'juanpantaleon06@gmail.com';

const RUTINA_LIDER: SeedRoutineDay[] = [
  {
    dayOfWeek: RoutineDayOfWeek.MONDAY,
    title: 'Lunes — Espalda, bíceps y deltoides anterior',
    focus: 'Espalda, bíceps y deltoides anterior',
    goal: 'Hipertrofia',
    blocks: [
      {
        type: RoutineBlockType.CIRCUIT,
        name: 'Movilidad / Activación — Circuito A',
        rounds: 4,
        sets: [
          { name: 'Angelitos', targetSets: 1, targetReps: '10' },
          { name: 'Rotación de Hombros con Banda Elástica', targetSets: 1, targetReps: '10' },
        ],
      },
      {
        type: RoutineBlockType.CIRCUIT,
        name: 'Movilidad / Activación — Circuito B',
        rounds: 3,
        sets: [
          { name: 'Remo con Kettlebell', targetSets: 1, targetReps: '8 c/lado', notes: 'Peso muy liviano o banda' },
          { name: 'Rueda Abdominal de Rodillas', targetSets: 1, targetReps: '8' },
        ],
      },
      {
        type: RoutineBlockType.TRAINING,
        name: 'Entrenamiento — Potencia e Hipertrofia (Descanso 2\u0027 a 2\u002730", Concéntrica 3s / Excéntrica 1s)',
        sets: [
          { name: 'Dominadas Pronas', targetSets: 3, targetReps: '5', notes: 'Potencia: subida rápida con banda elástica' },
          { name: 'Jalón al Pecho (Lat Pulldown)', targetSets: 3, targetReps: '10-8-6' },
          { name: 'Pullover en Polea', targetSets: 3, targetReps: '12-8-6' },
          { name: 'Dominadas Supinas', targetSets: 3, targetReps: '6 a 12', notes: 'Chins en rack — al fallo' },
          { name: 'Remo con Barra', targetSets: 3, targetReps: '12-10-8', notes: 'Agarre cerrado' },
          { name: 'Remo en Polea Baja', targetSets: 3, targetReps: '10-8-6', notes: 'Agarre abierto neutro' },
          { name: 'Press Militar con Mancuernas', targetSets: 3, targetReps: '10-8-6' },
          { name: 'Curl con Barra Z', targetSets: 3, targetReps: '10-8-fallo c/u', notes: 'Parado con barra W' },
          { name: 'Martillo con Polea', targetSets: 3, targetReps: '12-12-10', notes: 'Con soga' },
        ],
      },
    ],
  },
  {
    dayOfWeek: RoutineDayOfWeek.TUESDAY,
    title: 'Martes — Pecho, tríceps y deltoides lateral y posterior',
    focus: 'Pecho, tríceps y deltoides lateral y posterior',
    goal: 'Hipertrofia',
    blocks: [
      {
        type: RoutineBlockType.CIRCUIT,
        name: 'Movilidad / Activación — Circuito A',
        rounds: 3,
        sets: [
          { name: 'Halo', targetSets: 1, targetReps: '7 y 7' },
          { name: 'Rotaciones Internas con Banda', targetSets: 1, targetReps: '10 y 10' },
        ],
      },
      {
        type: RoutineBlockType.CIRCUIT,
        name: 'Movilidad / Activación — Circuito B',
        rounds: 3,
        sets: [
          { name: 'Press con Kettlebell', targetSets: 1, targetReps: '10' },
          { name: 'Flexiones', targetSets: 1, targetReps: '6' },
        ],
      },
      {
        type: RoutineBlockType.TRAINING,
        name: 'Entrenamiento — Hipertrofia (Descanso 1\u002730" a 2\u002730", Excéntrica 1s / Concéntrica 3s)',
        sets: [
          { name: 'Press Banca Plano', targetSets: 1, targetReps: '6', notes: 'Serie de aproximación' },
          { name: 'Press Banca Plano', targetSets: 1, targetReps: 'Al fallo', weightKg: 45, notes: 'Serie estilo Bilbo al fallo con 45 kg — anotar reps' },
          { name: 'Press Banca Plano', targetSets: 3, targetReps: '8-6-6', notes: 'Anotar' },
          { name: 'Press de Pecho en Smith Inclinado', targetSets: 3, targetReps: '8-7-6', notes: 'Sobrecarga progresiva' },
          { name: 'Pec Deck', targetSets: 3, targetReps: '10-8-8', notes: 'Apertura en máquina mariposa' },
          { name: 'Elevaciones Frontales', targetSets: 3, targetReps: '12-10-8', notes: 'Con disco' },
          { name: 'Hombro Posterior Unilateral en Polea', targetSets: 3, targetReps: '12-10-8 c/u' },
          { name: 'Fondos en Paralelas (Tríceps)', targetSets: 3, targetReps: '12-10-8', notes: 'Agarre cerrado' },
          { name: 'Press Francés', targetSets: 3, targetReps: '8-8-6 c/u', notes: 'Acostado con barra Z o W' },
        ],
      },
    ],
  },
  {
    dayOfWeek: RoutineDayOfWeek.WEDNESDAY,
    title: 'Miércoles — Pierna',
    focus: 'Pierna',
    goal: 'Hipertrofia',
    blocks: [
      {
        type: RoutineBlockType.CIRCUIT,
        name: 'Movilidad / Activación — Circuito A',
        rounds: 3,
        sets: [
          { name: '90/90', targetSets: 1, targetReps: '10 y 10' },
          { name: 'Flexo-Extensión de Rodilla', targetSets: 1, targetReps: '7 y 7' },
          { name: 'Dorsiflexión de Tobillo', targetSets: 1, targetReps: '10 y 10' },
        ],
      },
      {
        type: RoutineBlockType.CIRCUIT,
        name: 'Movilidad / Activación — Circuito B',
        rounds: 2,
        sets: [
          { name: 'Sentadilla con Kettlebell', targetSets: 1, targetReps: '10' },
          { name: 'Peso Muerto con Kettlebell', targetSets: 1, targetReps: '10' },
        ],
      },
      {
        type: RoutineBlockType.TRAINING,
        name: 'Entrenamiento — Pierna (Hipertrofia)',
        sets: [
          { name: 'Sentadilla Libre', targetSets: 5, targetReps: '6-5-5-5-4', notes: 'Potencia' },
          { name: 'Sentadilla Hack', targetSets: 2, targetReps: '10-8' },
          { name: 'Extensiones de Cuádriceps', targetSets: 3, targetReps: '15-20' },
          { name: 'Peso Muerto', targetSets: 3, targetReps: '8-12', notes: 'Convencional' },
          { name: 'Curl Femoral Acostado', targetSets: 2, targetReps: '12-15', notes: 'Tumbado' },
          { name: 'Patada de Glúteo en Polea', targetSets: 3, targetReps: '12-10-8', notes: 'Polea o máquina' },
          { name: 'Elevación de Talones Sentado', targetSets: 4, targetReps: '12-12-10-10', notes: 'Gemelos sentado (sóleo)' },
          { name: 'Elevación de Talones de Pie', targetSets: 3, targetReps: '12-10-10' },
          { name: 'Pájaros (Rear Delt Fly)', targetSets: 3, targetReps: '12-10-10', notes: 'Vuelos para hombro posterior con mancuernas' },
        ],
      },
    ],
  },
  {
    dayOfWeek: RoutineDayOfWeek.FRIDAY,
    title: 'Viernes — Torso',
    focus: 'Torso',
    goal: 'Fuerza',
    blocks: [
      {
        type: RoutineBlockType.CIRCUIT,
        name: 'Movilidad / Activación — Circuito A (igual al lunes)',
        rounds: 4,
        sets: [
          { name: 'Angelitos', targetSets: 1, targetReps: '10' },
          { name: 'Rotación de Hombros con Banda Elástica', targetSets: 1, targetReps: '10' },
        ],
      },
      {
        type: RoutineBlockType.CIRCUIT,
        name: 'Movilidad / Activación — Circuito B',
        rounds: 3,
        sets: [
          { name: 'Remo con Kettlebell', targetSets: 1, targetReps: '8 c/lado', notes: 'Muy liviano o banda' },
          { name: 'Rueda Abdominal de Rodillas', targetSets: 1, targetReps: '8' },
          { name: 'Press con Kettlebell', targetSets: 1, targetReps: '8' },
        ],
      },
      {
        type: RoutineBlockType.TRAINING,
        name: 'Entrenamiento — Fuerza (Descanso aprox. 3 min al 100%, máximo peso sin comprometer técnica)',
        sets: [
          { name: 'Remo con Barra', targetSets: 3, targetReps: '5-4-3', weightKg: 85, notes: '80kg - 82kg - 85kg' },
          { name: 'Dominadas Pronas', targetSets: 2, targetReps: '8-6', notes: 'Con o sin lastre' },
          { name: 'Dominadas Supinas', targetSets: 2, targetReps: '10-8', notes: 'Chins en rack' },
          { name: 'Press Banca Plano', targetSets: 3, targetReps: '5-4-3', weightKg: 65, notes: '60kg - 62kg - 65kg' },
          { name: 'Fondos en Paralelas (Tríceps)', targetSets: 2, targetReps: '6-10', notes: 'Con o sin lastre' },
          { name: 'Press Militar', targetSets: 3, targetReps: '10-8-7', notes: 'Con barra' },
          { name: 'Curl con Barra', targetSets: 3, targetReps: '10-8-8' },
          { name: 'Press Francés', targetSets: 3, targetReps: '10-8-7', notes: 'Press francés o press copa' },
        ],
      },
    ],
  },
  {
    dayOfWeek: RoutineDayOfWeek.SATURDAY,
    title: 'Sábado — Pierna',
    focus: 'Pierna',
    goal: 'Fuerza',
    blocks: [
      {
        type: RoutineBlockType.CIRCUIT,
        name: 'Movilidad / Activación — Circuito A (igual al miércoles)',
        rounds: 3,
        sets: [
          { name: '90/90', targetSets: 1, targetReps: '10 y 10' },
          { name: 'Flexo-Extensión de Rodilla', targetSets: 1, targetReps: '7 y 7' },
          { name: 'Dorsiflexión de Tobillo', targetSets: 1, targetReps: '10 y 10' },
        ],
      },
      {
        type: RoutineBlockType.CIRCUIT,
        name: 'Movilidad / Activación — Circuito B',
        rounds: 2,
        sets: [
          { name: 'Sentadilla con Kettlebell', targetSets: 1, targetReps: '10' },
          { name: 'Peso Muerto con Kettlebell', targetSets: 1, targetReps: '10' },
        ],
      },
      {
        type: RoutineBlockType.TRAINING,
        name: 'Entrenamiento — Pierna (Fuerza)',
        sets: [
          { name: 'Sentadilla Libre', targetSets: 3, targetReps: '5-5-4', weightKg: 80, notes: '75kg - 77.5kg - 80kg — Fuerza' },
          { name: 'Sentadilla Hack', targetSets: 2, targetReps: '10-8', notes: 'Hipertrofia' },
          { name: 'Peso Muerto', targetSets: 3, targetReps: '5-4-3', weightKg: 92.5, notes: '85kg - 87kg - 92.5kg — Fuerza' },
          { name: 'Extensiones de Cuádriceps', targetSets: 2, targetReps: '10-6' },
          { name: 'Curl Femoral Acostado', targetSets: 3, targetReps: '10-8-8' },
          { name: 'Elevación de Talones de Pie', targetSets: 3, targetReps: '10-8-8 c/u', notes: 'En step' },
          { name: 'Elevación de Talones Sentado', targetSets: 3, targetReps: '10-8-8' },
        ],
      },
    ],
  },
];

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });