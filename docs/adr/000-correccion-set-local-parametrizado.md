# ADR-000: Corrección de seguridad — SET LOCAL parametrizado para tenant context

## Estado

Aceptado.

## Contexto

`docs/ARCHITECTURE.md`, sección 4.3, mostraba el siguiente ejemplo de middleware Prisma para setear el contexto de tenant antes de cada query:

```typescript
prisma.$use(async (params, next) => {
  const tenantId = getTenantIdFromContext(); // AsyncLocalStorage
  if (tenantId) {
    await prisma.$executeRawUnsafe(
      `SET LOCAL app.current_tenant = '${tenantId}'`
    );
  }
  return next(params);
});
```

Este ejemplo interpola `tenantId` directamente en un string SQL vía `$executeRawUnsafe`. Es un vector de SQL injection si `tenantId` no está estrictamente validado antes de llegar a esa línea, y contradice la regla dura #2 de `CLAUDE.md`: "NUNCA hagas `Prisma.raw` sin justificarlo. NUNCA bypasseés RLS."

Dado que este `SET LOCAL` es el mecanismo que garantiza el aislamiento entre tenants (la protección más crítica de toda la plataforma, ver sección 13.2 de `ARCHITECTURE.md`), no es aceptable que su propia implementación tenga una vulnerabilidad de inyección.

## Decisión

1. Reemplazar `$executeRawUnsafe` por `$executeRaw` con template tagged (parametrizado), que Prisma compila a una query preparada en vez de concatenar strings.
2. Como defensa en profundidad adicional (no como sustituto del punto 1), validar que `tenantId` matchea el formato CUID con Zod **antes** de usarlo en cualquier sentencia SQL, incluso parametrizada.
3. El ejemplo de la sección 4.3 de `ARCHITECTURE.md` queda desactualizado y debe corregirse para referenciar este ADR y el helper descrito en ADR-003.

## Consecuencias

- Ningún código del proyecto debe usar `$executeRawUnsafe` para setear tenant context. Un uso de `Prisma.raw`/`$executeRawUnsafe` en cualquier PR relacionado con multi-tenancy debe justificarse explícitamente en el code review (regla dura de `CLAUDE.md`).
- La validación Zod del `tenantId` se centraliza en el helper `withTenantContext` (ver ADR-003), no se reimplementa por módulo.

## Alternativas consideradas

- **Mantener `$executeRawUnsafe` con sanitización manual (escaping de comillas, etc.):** rechazado. La sanitización manual de SQL es frágil y propensa a errores; `$executeRaw` parametrizado resuelve el problema de raíz sin depender de que cada desarrollador recuerde escapar correctamente.
- **Confiar únicamente en la validación Zod sin cambiar el método de Prisma:** rechazado. Es una sola capa de defensa; si se agrega un path de código que no pasa por esa validación, la vulnerabilidad reaparece. Se requieren ambas capas.
