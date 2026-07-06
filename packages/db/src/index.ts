// Punto de acceso público de @app/db: SOLO tipos y enums generados por Prisma.
//
// El PrismaClient crudo NO se exporta desde acá (ver docs/adr/003-tenant-context-helper.md):
// el único punto de acceso a datos de tenant es `withTenantContext` en
// packages/tenant-context, que importa el client vía el subpath `@app/db/internal`.

export { MembershipStatus, ModuleStatus, Prisma, TenantStatus } from '../generated/client';
export type {
  AuditLog,
  Membership,
  ModuleInstall,
  Permission,
  Plan,
  RlsProbe,
  Role,
  RolePermission,
  Session,
  Subscription,
  Tenant,
  TenantDomain,
  User,
} from '../generated/client';
