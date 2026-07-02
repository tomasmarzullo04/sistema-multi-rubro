# ADR-001: Una sola app Next.js (apps/web) para Fase 0-2

## Estado

Aceptado.

## Contexto

`docs/ARCHITECTURE.md`, sección 9, define la estructura del monorepo con tres apps Next.js separadas:

```
apps/
├── web/        # App principal
├── landing/     # Landing pública + registro
├── admin/       # Panel de administración interno
└── docs/
```

Sin embargo, la sección 4.2 describe un único `middleware.ts` que decide entre landing pública, panel admin y app de tenant según el subdominio del request:

```typescript
export async function middleware(req: NextRequest) {
  const subdomain = extractSubdomain(host);
  if (!subdomain || subdomain === 'www') { /* landing */ }
  if (subdomain === 'admin') { /* admin */ }
  /* tenant */
}
```

Un único middleware que decide entre tres experiencias solo tiene sentido operando dentro de una misma app Next.js desplegada. Desplegar `apps/web`, `apps/landing` y `apps/admin` como tres proyectos Vercel independientes bajo un mismo dominio wildcard (`*.miapp.com`) requiere routing multi-zona (Next.js multi-zone rewrites) o dominios/subpaths dedicados por proyecto — complejidad de infraestructura no justificada para Fase 0/1, donde el objetivo es "hola mundo multi-tenant" funcional.

## Decisión

Para Fase 0 y Fase 1:

1. `apps/web/` es la **única** app Next.js del monorepo con lógica de producto.
2. Su `middleware.ts` resuelve el subdominio y rutea internamente usando **route groups** de Next.js App Router:
   - `(marketing)` → `miapp.com` / `www.miapp.com` (landing pública, registro).
   - `(admin)` → `admin.miapp.com` (panel interno de staff).
   - `(app)` → `<slug>.miapp.com` (app del tenant).
3. Un solo proyecto en Vercel, con el dominio apex `miapp.com` y el wildcard `*.miapp.com` apuntando al mismo deployment.
4. `apps/landing/` y `apps/admin/` **no se crean** en Fase 0/1. Quedan como estado objetivo documentado para Fase 3+, cuando exista una razón concreta (equipos distintos, ciclos de deploy independientes, necesidad de aislar el blast radius de un bug en admin del resto de la app) que justifique la separación.

## Consecuencias

- Simplifica drásticamente el deploy y el DX inicial: un solo `pnpm dev`, un solo build, un solo proyecto Vercel.
- `docs/ARCHITECTURE.md` sección 9 debe actualizarse para reflejar que `apps/landing` y `apps/admin` son estado objetivo de Fase 3+, no estructura de Fase 0.
- Cuando se migre a apps separadas, habrá que resolver el problema de sesión compartida entre subdominios/dominios distintos (hoy resuelto vía `cookieDomain: '.miapp.com'`, ver decisión de sesión en el kickoff) y decidir el mecanismo de routing entre proyectos (multi-zone rewrites de Next.js es la opción más directa).

## Alternativas consideradas

- **Tres apps Next.js desde el día 1 con Next.js multi-zone rewrites:** rechazado por complejidad prematura, contradice el principio "simple > clever" de `ARCHITECTURE.md` sección 2.
- **Tres apps con dominios completamente independientes (sin wildcard compartido):** rechazado porque complica la experiencia de marca unificada bajo `miapp.com` y duplica configuración de CI/CD desde el inicio, sin beneficio en esta etapa.
