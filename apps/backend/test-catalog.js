const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:postgres@localhost:5432/ranked_fitness?schema=public' });
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    console.log('Exercises found:', exercises.length);
    if (exercises.length > 0) {
      console.log('First exercise:', JSON.stringify(exercises[0], null, 2));
    }
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

test();