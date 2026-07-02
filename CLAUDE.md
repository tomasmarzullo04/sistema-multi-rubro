# Instrucciones para Claude Code

Este es un SaaS multi-tenant multi-rubro. Leé `docs/ARCHITECTURE.md` y `docs/MODULES.md` antes de tocar código.

## Reglas duras

1. TODO dato de negocio tiene `tenantId`. Toda query lo respeta.
2. NUNCA hagas `Prisma.raw` sin justificarlo. NUNCA bypasseés RLS.
3. Usá los patrones establecidos: tRPC + Zod + Prisma. No traigas Express, ni Redux, ni axios.
4. Componentes UI: shadcn/ui. Estilos: Tailwind con variables CSS del theme.
5. Todo módulo sigue la estructura de `packages/modules/*`.
6. Tests obligatorios para routers tRPC y utils de negocio.
7. Nunca hardcodear un rubro específico en un módulo transversal.
8. Todo módulo declara sus permisos en el manifest. No hay permisos hardcoded en la UI.

## Antes de generar código

- Si la tarea toca multi-tenant, releé la sección 4 de `docs/ARCHITECTURE.md`.
- Si es un módulo nuevo, releé la sección 5 de `docs/ARCHITECTURE.md` y las secciones 1 y 8 de `docs/MODULES.md`.
- Si tenés dudas de scope, preguntá antes de codear.
- No inventes decisiones que no están documentadas. Preguntá.

## Convenciones

- Commits: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
- Nombres: `camelCase` para variables/funciones, `PascalCase` para componentes/tipos, `kebab-case` para archivos.
- Errores: siempre con clases custom (`TenantNotFoundError`, `PermissionDeniedError`, etc.), no strings sueltos.
- Estilo de código: Biome se encarga. No pelees con el linter.
- Tipos estrictos: `strict: true` en TypeScript. No `any` sin justificación.

## Estructura del proyecto

Ver sección 9 de `docs/ARCHITECTURE.md` para la estructura completa del monorepo.

## Flujo de trabajo

- Trabajá en branches, nunca directo en `main`.
- Para tareas grandes, primero mostrame un plan antes de codear.
- Al terminar una tarea, asegurate de haber hecho commit + push.
- Si dejás algo a medias, aclará en el commit qué queda pendiente.

## Documentación viva

- Cualquier decisión arquitectónica nueva se agrega como ADR en `docs/adr/`.
- Actualizar `docs/ARCHITECTURE.md` cuando cambia algo estructural.
- Actualizar `docs/MODULES.md` al crear/modificar módulos.
