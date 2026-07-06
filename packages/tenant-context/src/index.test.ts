// Test de aislamiento multi-tenant (roadmap Fase 0, ítem 3 + ARCHITECTURE.md §16.3).
//
// Valida específicamente `withTenantContext` (ADR-003) contra Postgres real con
// RLS activo sobre la tabla dummy `RlsProbe`. Requiere la DB local corriendo
// (`pnpm db:up` + `pnpm db:migrate` desde la raíz).

import type { Tenant } from '@app/db';
// Import permitido en este paquete (ADR-003): setup/teardown de datos de
// plataforma (Tenant no tiene RLS) y verificación de acceso SIN contexto.
import { prisma } from '@app/db/internal';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  InvalidTenantIdError,
  TenantContextMissingError,
  getCurrentTenantId,
  requireCurrentTenantId,
  runWithTenantId,
  withTenantContext,
} from './index';

const runId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

let tenantA: Tenant;
let tenantB: Tenant;

beforeAll(async () => {
  tenantA = await prisma.tenant.create({
    data: { slug: `test-a-${runId}`, name: 'Tenant A (test aislamiento)' },
  });
  tenantB = await prisma.tenant.create({
    data: { slug: `test-b-${runId}`, name: 'Tenant B (test aislamiento)' },
  });
});

afterAll(async () => {
  for (const tenant of [tenantA, tenantB]) {
    await withTenantContext(tenant.id, async (tx) => {
      await tx.rlsProbe.deleteMany({ where: { tenantId: tenant.id } });
    });
  }
  await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });
  await prisma.$disconnect();
});

describe('withTenantContext + RLS (aislamiento entre tenants)', () => {
  it('cada tenant ve solo sus propias filas', async () => {
    const probeA = await withTenantContext(tenantA.id, (tx) =>
      tx.rlsProbe.create({ data: { tenantId: tenantA.id, note: `nota-a-${runId}` } }),
    );
    const probeB = await withTenantContext(tenantB.id, (tx) =>
      tx.rlsProbe.create({ data: { tenantId: tenantB.id, note: `nota-b-${runId}` } }),
    );

    const visiblesParaA = await withTenantContext(tenantA.id, (tx) => tx.rlsProbe.findMany());
    expect(visiblesParaA.every((p) => p.tenantId === tenantA.id)).toBe(true);
    expect(visiblesParaA.some((p) => p.id === probeA.id)).toBe(true);
    expect(visiblesParaA.some((p) => p.id === probeB.id)).toBe(false);

    const visiblesParaB = await withTenantContext(tenantB.id, (tx) => tx.rlsProbe.findMany());
    expect(visiblesParaB.every((p) => p.tenantId === tenantB.id)).toBe(true);
    expect(visiblesParaB.some((p) => p.id === probeB.id)).toBe(true);
    expect(visiblesParaB.some((p) => p.id === probeA.id)).toBe(false);
  });

  it('un findUnique por id de otro tenant devuelve null', async () => {
    const probeB = await withTenantContext(tenantB.id, (tx) =>
      tx.rlsProbe.create({ data: { tenantId: tenantB.id, note: `secreta-b-${runId}` } }),
    );

    const robo = await withTenantContext(tenantA.id, (tx) =>
      tx.rlsProbe.findUnique({ where: { id: probeB.id } }),
    );
    expect(robo).toBeNull();
  });

  it('no permite insertar filas para OTRO tenant (WITH CHECK de la política)', async () => {
    await expect(
      withTenantContext(tenantA.id, (tx) =>
        tx.rlsProbe.create({ data: { tenantId: tenantB.id, note: `inyectada-${runId}` } }),
      ),
    ).rejects.toThrow();
  });

  it('no permite updates que muevan una fila a otro tenant', async () => {
    const probeA = await withTenantContext(tenantA.id, (tx) =>
      tx.rlsProbe.create({ data: { tenantId: tenantA.id, note: `movible-${runId}` } }),
    );

    await expect(
      withTenantContext(tenantA.id, (tx) =>
        tx.rlsProbe.update({ where: { id: probeA.id }, data: { tenantId: tenantB.id } }),
      ),
    ).rejects.toThrow();
  });

  it('sin contexto de tenant no se ve NINGUNA fila (rol app, sin BYPASSRLS)', async () => {
    const sinContexto = await prisma.rlsProbe.findMany();
    expect(sinContexto).toHaveLength(0);
  });

  it('rechaza tenantIds que no son CUID antes de tocar SQL', async () => {
    await expect(
      withTenantContext('\'; DROP TABLE "RlsProbe"; --', (tx) => tx.rlsProbe.findMany()),
    ).rejects.toThrow(InvalidTenantIdError);
    await expect(withTenantContext('', (tx) => tx.rlsProbe.findMany())).rejects.toThrow(
      InvalidTenantIdError,
    );
  });
});

describe('runWithTenantId (AsyncLocalStorage)', () => {
  it('propaga el tenantId dentro del callback y lo limpia afuera', () => {
    expect(getCurrentTenantId()).toBeUndefined();
    runWithTenantId(tenantA.id, () => {
      expect(getCurrentTenantId()).toBe(tenantA.id);
      expect(requireCurrentTenantId()).toBe(tenantA.id);
    });
    expect(getCurrentTenantId()).toBeUndefined();
  });

  it('requireCurrentTenantId lanza si no hay contexto', () => {
    expect(() => requireCurrentTenantId()).toThrow(TenantContextMissingError);
  });

  it('rechaza tenantIds inválidos', () => {
    expect(() => runWithTenantId('no-es-cuid', () => null)).toThrow(InvalidTenantIdError);
  });
});
