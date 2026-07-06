// Único punto de acceso a datos de tenant (ADR-003).
//
// `withTenantContext` garantiza que el `set_config('app.current_tenant', ...)`
// y las queries del callback corran en la MISMA conexión física, envolviéndolos
// en una transacción interactiva de Prisma. Fuera de este helper, las políticas
// RLS no ven contexto de tenant y no devuelven ninguna fila.

import { AsyncLocalStorage } from 'node:async_hooks';
import type { Prisma } from '@app/db';
// Import permitido SOLO acá (ADR-003): el client crudo nunca sale de este paquete.
import { prisma } from '@app/db/internal';
import { z } from 'zod';
import { InvalidTenantIdError, TenantContextMissingError } from './errors';

export { InvalidTenantIdError, TenantContextMissingError } from './errors';

export type TenantTransaction = Prisma.TransactionClient;

// Defensa en profundidad (ADR-000): aunque set_config va parametrizado,
// ningún tenantId malformado llega a tocar SQL.
const tenantIdSchema = z.string().cuid();

/**
 * Ejecuta `fn` dentro de una transacción con el contexto RLS del tenant seteado.
 *
 * `SET LOCAL` no acepta parámetros en Postgres; `set_config(key, value, true)`
 * es el equivalente parametrizable con alcance transaccional (ADR-000/004).
 */
export async function withTenantContext<T>(
  tenantId: string,
  fn: (tx: TenantTransaction) => Promise<T>,
): Promise<T> {
  const parsed = tenantIdSchema.safeParse(tenantId);
  if (!parsed.success) {
    throw new InvalidTenantIdError(tenantId);
  }

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_tenant', ${parsed.data}, true)`;
    return fn(tx);
  });
}

// ------------------------------------------------------------------
// Propagación implícita del tenantId a través de la request (ADR-003 §4).
// El middleware de subdominio (roadmap ítem 4) hace `runWithTenantId(...)`
// y las capas internas lo leen sin pasarlo por parámetro.
// NO reemplaza a `withTenantContext` para acceder a la DB.
// ------------------------------------------------------------------

const tenantIdStorage = new AsyncLocalStorage<string>();

export function runWithTenantId<T>(tenantId: string, fn: () => T): T {
  const parsed = tenantIdSchema.safeParse(tenantId);
  if (!parsed.success) {
    throw new InvalidTenantIdError(tenantId);
  }
  return tenantIdStorage.run(parsed.data, fn);
}

export function getCurrentTenantId(): string | undefined {
  return tenantIdStorage.getStore();
}

export function requireCurrentTenantId(): string {
  const tenantId = tenantIdStorage.getStore();
  if (!tenantId) {
    throw new TenantContextMissingError();
  }
  return tenantId;
}
