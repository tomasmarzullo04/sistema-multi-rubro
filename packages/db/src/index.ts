// Fase 0: stub del paquete. El schema de Prisma y el PrismaClient se agregan
// en el ítem 2 del roadmap (Prisma + Postgres local).
//
// Ver docs/adr/003-tenant-context-helper.md: el PrismaClient "crudo" nunca se
// exporta públicamente desde este paquete. El único punto de acceso a datos
// de tenant es `withTenantContext` en `packages/tenant-context`.

export {};
