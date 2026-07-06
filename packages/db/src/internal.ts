// USO INTERNO EXCLUSIVO (ver docs/adr/003-tenant-context-helper.md).
//
// Este subpath (`@app/db/internal`) solo puede importarse desde:
//   - packages/tenant-context (`withTenantContext`), que envuelve toda query de
//     tenant en una transacción con `SET LOCAL app.current_tenant` parametrizado.
//   - El wrapper explícito y auditado del rol BYPASSRLS para staff de la
//     plataforma (fuera del alcance de la Fase 0).
//
// NUNCA importar este módulo desde un módulo de negocio ni un router tRPC:
// hacerlo bypassea el contexto de tenant y rompe el aislamiento RLS.

import { PrismaClient } from '../generated/client';

// Singleton para evitar agotar conexiones con el hot-reload de Next.js en dev.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
