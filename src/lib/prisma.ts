import { PrismaClient } from '@prisma/client';

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;


export default prisma;