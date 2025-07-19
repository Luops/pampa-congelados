import { PrismaClient } from "@prisma/client";

// Garantir que o PrismaClient seja uma única instância global
const prismaGlobal = global as typeof global & {
  prisma?: PrismaClient;
};

export const prisma = prismaGlobal.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma;
}