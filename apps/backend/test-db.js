const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:postgres@localhost:5432/ranked_fitness?schema=public' });
const prisma = new PrismaClient({ adapter });
prisma.$queryRaw`SELECT 1 as test`.then(r => { console.log('DB OK:', r); process.exit(0); }).catch(e => { console.error('DB ERROR:', e.message); process.exit(1); });