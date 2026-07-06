-- CreateTable
CREATE TABLE "RlsProbe" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RlsProbe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RlsProbe_tenantId_idx" ON "RlsProbe"("tenantId");

-- ============================================================
-- Rol de aplicación `app`: SIN BYPASSRLS, las políticas RLS le
-- aplican siempre. Ver docs/adr/004-rol-app-sin-bypassrls.md.
-- El password es solo para desarrollo local (docker-compose);
-- en cualquier entorno remoto se gestiona fuera del repo.
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app') THEN
    CREATE ROLE "app" LOGIN PASSWORD 'app';
  END IF;
END
$$;

GRANT USAGE ON SCHEMA "public" TO "app";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "public" TO "app";
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA "public" TO "app";

-- Las migraciones siempre corren como `postgres` (directUrl): los objetos
-- que cree en el futuro quedan accesibles para `app` automáticamente.
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "app";
ALTER DEFAULT PRIVILEGES IN SCHEMA "public"
  GRANT USAGE, SELECT ON SEQUENCES TO "app";

-- ============================================================
-- RLS sobre la tabla dummy (roadmap Fase 0, ítem 3).
-- La política compara contra el setting transaccional que setea
-- `withTenantContext` (set_config con is_local = true, ADR-000/003/004).
-- `current_setting(..., true)` devuelve NULL si no hay contexto:
-- sin contexto de tenant no se ve NINGUNA fila.
-- Nota: los IDs son cuid (texto), no uuid — la comparación es texto = texto.
-- ============================================================
ALTER TABLE "RlsProbe" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation" ON "RlsProbe"
  USING ("tenantId" = current_setting('app.current_tenant', true));
