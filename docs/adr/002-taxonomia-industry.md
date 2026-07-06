# ADR-002: Taxonomía canónica de industria/rubro (tabla Industry)

## Estado

Aceptado. Implementación diferida a Fase 1 (no bloqueante para Fase 0).

## Contexto

`docs/ARCHITECTURE.md`, sección 8, define `Tenant.industry` como `String?` libre, deliberadamente sin enum:

```prisma
industry String? // 'kinesiologia' | 'retail' | ... (no enum para flexibilidad)
```

El manifest de módulo (sección 5.3) usa `recommendedFor: ['servicios', 'consultoria', 'inmobiliaria', 'salud', '*']` con claves propias. `docs/MODULES.md`, sección 9 (matriz módulo × rubro), usa nombres de rubro en español ("Kinesiología", "Retail / almacén", "Estudio jurídico") sin relación explícita con las claves anteriores.

No existe una fuente única de verdad que conecte: (a) el valor guardado en `Tenant.industry`, (b) las claves usadas en `recommendedFor` de cada manifest, y (c) los nombres visibles en la matriz de onboarding. Sin esto, el "onboarding inteligente" (sugerir módulos según el rubro elegido) no tiene una clave estable para hacer match, y cada módulo nuevo puede inventar su propia convención de nombres de rubro.

## Decisión

1. Crear una tabla `Industry` seedeada con claves canónicas en `snake_case` (`kinesiologia`, `retail`, `consultorio_medico`, `estudio_juridico`, etc.), una entrada por cada rubro de la matriz de `MODULES.md` sección 9 más los verticales de la sección 5.
2. `Tenant.industry` pasa a referenciar la clave canónica de `Industry` (se mantiene como string, sin FK obligatoria todavía, para no perder la flexibilidad buscada originalmente — ver alternativas).
3. `manifest.recommendedFor` de cada módulo usa exclusivamente estas claves canónicas.
4. Los nombres visibles en español (y otros idiomas a futuro) viven en un diccionario i18n dentro de `packages/modules-sdk`, nunca hardcodeados en componentes de UI de módulos individuales.

## Consecuencias

- Se agrega una tabla al modelo base no descrita en `ARCHITECTURE.md` sección 8; hay que actualizar esa sección al implementar esto en Fase 1.
- El onboarding inteligente (sugerencia de módulos por rubro) puede implementarse con un simple `WHERE industry = tenant.industry` o `recommendedFor.includes(tenant.industry)` sin lógica de matching difusa.
- No es bloqueante para Fase 0: durante Fase 0 no hay onboarding ni selección de rubro real.

## Alternativas consideradas

- **Enum de Postgres para `industry`:** rechazado. `ARCHITECTURE.md` ya había decidido explícitamente no usar enum para poder agregar rubros sin migración de schema. Una tabla seedeada logra la misma flexibilidad (agregar una fila, no una migración) sin perder tipado a nivel aplicación.
- **Mantener strings libres sin tabla canónica:** rechazado. Es el estado actual y es la causa raíz del problema — no permite match confiable rubro↔módulo ni consistencia entre `Tenant.industry`, `recommendedFor` y la matriz de `MODULES.md`.
