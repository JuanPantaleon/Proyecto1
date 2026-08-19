require('dotenv').config({ path: './.env' });
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('DB OK:', result);
    
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      take: 5,
    });
    console.log('Exercises found:', exercises.length);
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
}

test();