import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  // 1. Create a PostgreSQL connection pool using your URL from .env
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  
  // 2. Wrap it in the Prisma 7 adapter
  const adapter = new PrismaPg(pool);
  
  // 3. Create the PrismaClient with the adapter
  globalForPrisma.prisma = new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma;