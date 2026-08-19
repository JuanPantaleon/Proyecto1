import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function createTestUser() {
  const user = await prisma.user.upsert({
    where: { clerkId: 'test-clerk-id-123' },
    update: {},
    create: {
      clerkId: 'test-clerk-id-123',
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      currentWeightKg: 80,
      heightCm: 175,
      streakDays: 0,
      role: 'USER',
    },
  });
  console.log('User created:', user.id);
  await prisma.$disconnect();
}

createTestUser().catch(e => { console.error(e); process.exit(1); });