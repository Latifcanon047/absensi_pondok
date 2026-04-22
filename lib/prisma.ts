import { PrismaClient } from "@prisma/client";

// Buat instance PrismaClient dan simpan di globalThis untuk mencegah multiple instances saat hot reload di development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
