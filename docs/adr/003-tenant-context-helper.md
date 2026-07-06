# ADR-003: `withTenantContext` como único punto de acceso a Prisma para datos de tenant

## Estado

Aceptado.

## Contexto

`docs/ARCHITECTURE.md`, sección 4.3, propone setear el contexto de tenant vía middleware de Prisma (`prisma.$use`) ejecutando `SET LOCAL app.current_tenant = ...` antes de cada query. `SET LOCAL` solo tiene efecto dentro de la transacción/conexión en la que se ejecuta: es válido hasta el `COMMIT`/`ROLLBACK` de esa transacción, en esa conexión física específica.

En un entorno serverless con pooling de conexiones —Neon con PgBouncer en modo transacción, o el propio pool interno de Prisma— no hay garantía de que el `SET LOCAL` ejecutado en el middleware y la query subsiguiente del mismo request corran sobre la misma conexión física, salvo que se fuerce explícitamente con una transacción interactiva. Si esa garantía no existe, el `SET LOCAL` puede no tener efecto sobre la query real, y la política RLS puede terminar evaluando `current_setting('app.current_tenant')` como vacío o con el valor de otro request — rompiendo silenciosamente el aislamiento entre tenants. `ARCHITECTURE.md` sección 13.2 marca este aislamiento como el riesgo crítico #1 del proyecto.

## Decisión

1. Toda operación que lea o escriba datos con `tenantId` se ejecuta obligatoriamente dentro de `prisma.$transaction(async (tx) => { ... })`, nunca sobre el `PrismaClient` de nivel módulo directamente.
2. Esto se abstrae en un helper único: `withTenantContext(tenantId, async (tx) => { ... })`, exportado desde `packages/tenant-context/`. El helper:
   - Valida `tenantId` como CUID con Zod (defensa en profundidad, ver ADR-000).
   - Abre una transacción interactiva de Prisma.
   - Ejecuta `SET LOCAL app.current_tenant = ...` parametrizado (`$executeRaw`, ADR-000) **dentro de esa misma transacción**, garantizando que corre en la misma conexión física que las queries posteriores.
   - Ejecuta el callback recibido con el `tx` resultante.
3. El `PrismaClient` "crudo" (sin pasar por este wrapper) **no se exporta públicamente** desde `packages/db`. Solo se usa internamente dentro de `withTenantContext`, y para el rol de Postgres separado con `BYPASSRLS` reservado a trabajos de staff de la plataforma (sección 4.3 de `ARCHITECTURE.md`), que tiene su propio wrapper explícito y auditado (`withPlatformContext` o equivalente, fuera del alcance de este ADR).
4. `AsyncLocalStorage` (mencionado en `ARCHITECTURE.md` sección 9 para `packages/tenant-context`) se usa para propagar el `tenantId` implícitamente a través de la request (ej. desde el middleware de subdominio hasta el router tRPC), pero **no** reemplaza el uso de `withTenantContext` para acceder a la DB — sigue siendo el único punto de entrada.

## Consecuencias

- Ningún módulo ni router tRPC puede llamar a `prisma` directamente para datos de tenant; deben pasar por `withTenantContext`. Esto es lo que hace cumplible en la práctica la regla dura #1 de `CLAUDE.md` ("todo dato de negocio tiene tenantId, toda query lo respeta") bajo un entorno de conexiones pooleadas.
- Agrega una capa de indirección obligatoria (todas las queries de negocio quedan un nivel más anidadas), aceptada como costo necesario dado que es la única forma de garantizar la atomicidad conexión-SET LOCAL-query bajo pooling serverless.
- El test de aislamiento multi-tenant de la Fase 0 (roadmap, ítem 3) debe validar específicamente este helper, no el middleware `$use` original de `ARCHITECTURE.md` sección 4.3, que queda deprecado por este ADR.
- `ARCHITECTURE.md` sección 4.3 y sección 9 (descripción de `packages/tenant-context`) deben actualizarse para referenciar este ADR.

## Alternativas consideradas

- **Middleware clásico `prisma.$use` seteando `SET LOCAL` fuera de una transacción explícita, confiando en que el pool reutiliza la misma conexión para el resto del request:** rechazado. No hay garantía documentada de esto bajo PgBouncer en modo transacción (el modo recomendado para serverless por costo de conexiones); es el bug de aislamiento más peligroso posible porque falla silenciosamente, no con un error.
- **Un rol de Postgres por tenant, usando RLS basado en el rol de conexión en vez de `current_setting`:** rechazado. No escala a miles de tenants (creación/gestión de rol por tenant es operacionalmente inviable) y contradice la justificación de "shared DB" (sección 4.1: costo mínimo, una DB para miles de tenants).
- **Mover la resolución de tenant a nivel de conexión completa (una conexión dedicada por tenant, sin pooling):** rechazado. Anula el beneficio de pooling serverless y no escala en Neon con miles de tenants concurrentes.
