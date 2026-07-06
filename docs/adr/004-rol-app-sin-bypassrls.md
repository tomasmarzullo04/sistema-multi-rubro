# ADR-004: Rol de aplicación sin BYPASSRLS + `directUrl` para migraciones

## Estado

Aceptado.

## Contexto

Postgres **nunca** aplica políticas RLS a un superusuario, y `ENABLE ROW LEVEL
SECURITY` tampoco aplica al dueño de la tabla salvo `FORCE`. Si la app se
conecta como `postgres` (superusuario, como venía del ítem 2 del roadmap), las
políticas RLS existen pero no filtran nada: el aislamiento entre tenants sería
decorativo y el test del ítem 3 pasaría en falso o fallaría siempre.

Además, `SET LOCAL app.current_tenant = $1` no existe en Postgres: `SET` no
acepta parámetros de query. El ADR-000 exige que el seteo del contexto sea
parametrizado.

## Decisión

1. **Dos roles de Postgres:**
   - `app`: rol de runtime, `LOGIN`, **sin** `BYPASSRLS` y sin ser dueño de las
     tablas → toda política RLS le aplica siempre. Se crea de forma idempotente
     en la migración `20260706132002_rls_probe_and_app_role`, con grants sobre
     tablas/secuencias existentes y `ALTER DEFAULT PRIVILEGES` para las futuras.
   - `postgres`: superusuario, reservado para migraciones y CLI de Prisma.
2. **Mapeo a Prisma con el mecanismo nativo `directUrl`:**
   - `url = env("DATABASE_URL")` → rol `app` (runtime, RLS aplica).
   - `directUrl = env("DIRECT_DATABASE_URL")` → rol `postgres` (usado
     automáticamente por `prisma migrate`/CLI). Es el mismo mecanismo que se
     usará con Neon + pooler en el deploy (roadmap ítem 7).
3. **`set_config(key, value, true)` como implementación del "SET LOCAL
   parametrizado" del ADR-000:** es funcionalmente equivalente a `SET LOCAL`
   (alcance transaccional) y sí acepta parámetros vía `$executeRaw` tagged.
4. Las políticas comparan `"tenantId" = current_setting('app.current_tenant', true)`
   como **texto** (los IDs son cuid, no uuid — corrige el ejemplo `::uuid` de
   `ARCHITECTURE.md` §4.3). Con `missing_ok = true`, sin contexto el setting es
   NULL y no se ve ninguna fila: fail-closed.

## Consecuencias

- El password del rol `app` en la migración es fijo (`app`) y solo válido para
  desarrollo local con docker-compose. En entornos remotos las credenciales se
  gestionan fuera del repo (variables de entorno del proveedor); la migración
  no pisa el password si el rol ya existe.
- El rol `BYPASSRLS` para staff de plataforma (ARCHITECTURE.md §4.3) queda
  pendiente; cuando exista, tendrá su propio wrapper auditado (ADR-003 §3).
- Toda tabla nueva con datos de tenant debe agregar su `ENABLE ROW LEVEL
  SECURITY` + política en la migración que la crea, siguiendo el patrón de
  `RlsProbe`.

## Alternativas consideradas

- **`FORCE ROW LEVEL SECURITY` conectando siempre como `postgres`:** rechazado.
  Los superusuarios bypassean RLS incluso con `FORCE`; habría que degradar el
  usuario de migraciones, complicando el flujo sin ganar nada.
- **Un único rol no-superusuario para todo (runtime + migraciones):** rechazado.
  Las migraciones necesitan DDL amplio (crear extensiones, roles, policies); un
  rol con esos privilegios corriendo el runtime anula el beneficio de separar
  privilegios.
- **Interpolar el tenantId en `SET LOCAL` con sanitización manual:** rechazado
  en ADR-000 (vector de SQL injection).
