# Arquitectura Técnica — Plataforma SaaS Multi-Tenant Multi-Rubro

> **Estado:** Documento vivo, versión 1.0
> **Autor:** Equipo del proyecto
> **Uso:** Este documento es la fuente de verdad de la arquitectura. Cada vez que se abra una sesión de Claude Code para trabajar en el proyecto, debe pasarse este archivo (o el fragmento relevante) como contexto. Esto asegura que todo el código generado sea coherente con las decisiones de diseño.

---

## Índice

1. [Visión y Objetivos](#1-visión-y-objetivos)
2. [Principios de Arquitectura](#2-principios-de-arquitectura)
3. [Stack Técnico](#3-stack-técnico)
4. [Arquitectura Multi-Tenant](#4-arquitectura-multi-tenant)
5. [Arquitectura de Módulos](#5-arquitectura-de-módulos)
6. [Sistema de Branding y Theming](#6-sistema-de-branding-y-theming)
7. [Autenticación y Autorización](#7-autenticación-y-autorización)
8. [Modelo de Datos Base](#8-modelo-de-datos-base)
9. [Estructura del Monorepo](#9-estructura-del-monorepo)
10. [Capa de IA](#10-capa-de-ia)
11. [Integración con n8n](#11-integración-con-n8n)
12. [Facturación y Planes](#12-facturación-y-planes)
13. [Seguridad](#13-seguridad)
14. [Rendimiento y Escalabilidad](#14-rendimiento-y-escalabilidad)
15. [Observabilidad](#15-observabilidad)
16. [Testing](#16-testing)
17. [CI/CD](#17-cicd)
18. [Roadmap por Fases](#18-roadmap-por-fases)
19. [Guía para Trabajar con Claude Code](#19-guía-para-trabajar-con-claude-code)
20. [Glosario](#20-glosario)

---

## 1. Visión y Objetivos

### 1.1 Qué es

Una plataforma SaaS multi-tenant que permite a empresas de cualquier rubro construir su sistema de gestión personalizado eligiendo y combinando módulos preconstruidos (CRM, stock, agenda, facturación, HR, etc.), con branding propio, y con capacidades de IA y automatización integradas de fábrica.

### 1.2 Para quién es

- **Primario:** Pymes latinoamericanas (5 a 100 empleados) que hoy usan planillas de Excel, WhatsApp y sistemas fragmentados.
- **Secundario:** Estudios profesionales, consultorios, comercios, agencias.
- **Ignorar por ahora:** Enterprise (>500 empleados) y microemprendimientos unipersonales.

### 1.3 Diferenciales de mercado

1. **Onboarding y branding como experiencia central.** El cliente ve su marca en vivo desde el minuto uno.
2. **IA nativa, no bolt-on.** Cada módulo declara sus capacidades a la IA; el asistente puede operar el sistema por lenguaje natural.
3. **Automatizaciones con n8n integradas.** Templates prearmados por rubro.
4. **Modelo de módulos activables.** Pagás y activás sólo lo que usás.
5. **Enfoque LATAM.** Español nativo, integraciones con MercadoPago, AFIP, WhatsApp Business.

### 1.4 Modelo de negocio (hipótesis inicial)

- **Plan base:** Precio fijo mensual por tenant + límite de usuarios.
- **Módulos adicionales:** Precio por módulo activado.
- **Add-ons de IA:** Cuota mensual de tokens/mensajes.
- **Automatizaciones premium:** Templates n8n avanzados como add-on.

---

## 2. Principios de Arquitectura

Estos principios rigen todas las decisiones técnicas. Cualquier decisión que los contradiga debe justificarse explícitamente.

1. **Multi-tenant desde el día 1.** Nunca hardcodear datos globales que deberían ser por tenant.
2. **Modular y con contratos claros.** Cada módulo se puede desarrollar, testear y desplegar aislado.
3. **Type-safety end-to-end.** Desde la DB hasta el frontend, TypeScript en todo.
4. **Server-first, edge cuando aporta.** Render en servidor por default, client cuando la interactividad lo justifica.
5. **Escalabilidad horizontal.** Cero estado local que impida correr N instancias en paralelo.
6. **Seguridad por defecto.** RLS en DB, validación en API, sanitización en UI. Defensa en profundidad.
7. **Simple > clever.** Preferir soluciones aburridas y probadas. Innovar sólo donde es el diferencial.
8. **DRY, SOLID, KISS.** Sin dogmatismo, pero como norte.
9. **Documentar decisiones, no código obvio.** ADRs (Architecture Decision Records) para todo cambio arquitectónico grande.
10. **Costo cero al inicio, escalable al éxito.** Todo el stack tiene tier gratuito hasta primeros clientes.

---

## 3. Stack Técnico

### 3.1 Frontend

| Área | Tecnología | Justificación |
|------|-----------|---------------|
| Framework | **Next.js 15 (App Router)** | Server components, streaming, middleware para multi-tenant, edge runtime |
| Lenguaje | **TypeScript 5.x (strict)** | Type-safety obligatoria |
| Estilos | **Tailwind CSS 4** | Variables CSS nativas, ideal para theming dinámico por tenant |
| Componentes | **shadcn/ui** | No es librería, es código copiable → personalización total sin pelearte con overrides |
| Iconos | **Lucide React** | Ligera, coherente con shadcn |
| Formularios | **React Hook Form + Zod** | Validación compartida cliente/servidor |
| Tablas | **TanStack Table** | Headless, potente para dashboards |
| Charts | **Recharts** | Suficiente para el 90% de casos |
| Fechas | **date-fns** o **Day.js** | Ligero, i18n |
| Estado cliente | **Zustand** cuando haga falta | Server state → RSC/tRPC, no Redux |
| Notificaciones | **Sonner** | Toasts modernos |

### 3.2 Backend

| Área | Tecnología | Justificación |
|------|-----------|---------------|
| Runtime | **Node.js 22 LTS** | Estable, ecosistema, edge cuando conviene |
| API | **tRPC v11** | Type-safety end-to-end sin generar SDK; migración a REST/GraphQL viable después |
| Validación | **Zod** | Reutilizada en frontend/backend |
| ORM | **Prisma 6** | DX excelente, soporta RLS de Postgres con extensiones |
| Background jobs | **Inngest** (o BullMQ + Redis en autohost) | Serverless jobs con retries y observabilidad |
| Cache | **Redis (Upstash)** | Tier gratuito serverless, ideal para inicio |
| Storage de archivos | **Cloudflare R2** o **UploadThing** | R2 sin costo de egreso, UploadThing para MVP rápido |
| Email transaccional | **Resend** | DX moderna, buena entregabilidad |
| Notificaciones push | **Novu** (opcional Fase 2) | Multi-canal (email, SMS, push, in-app) |

### 3.3 Base de datos

| Área | Tecnología | Justificación |
|------|-----------|---------------|
| Principal | **PostgreSQL 16** | RLS nativo, extensiones, madurez |
| Provider inicial | **Neon** o **Supabase** | Serverless, branching, tier gratuito |
| Búsqueda full-text | **Postgres tsvector** al inicio → **Meilisearch** al escalar | Evitar Elasticsearch temprano |
| Analytics | **PostgreSQL** al inicio → **ClickHouse** o **Tinybird** al escalar | No sobrediseñar |

### 3.4 Autenticación

- **Better Auth** — Open source, moderno, funciona nativo con Prisma y Next.js. Soporta multi-tenant, magic links, OAuth, 2FA, passkeys.
- Alternativa comercial: Clerk (más rápido de setup, pero cobra por MAU).

### 3.5 Hosting inicial (costo ~$0)

| Componente | Servicio | Free tier |
|-----------|----------|-----------|
| App Next.js | **Vercel** | Hobby plan hasta primeros clientes |
| Base de datos | **Neon** | 0.5 GB, autosleep |
| Redis | **Upstash** | 10k comandos/día |
| Storage | **Cloudflare R2** | 10 GB gratis, sin egreso |
| Email | **Resend** | 3k emails/mes gratis |
| Errores | **Sentry** | 5k eventos/mes gratis |

### 3.6 Hosting a escala (post-tracción)

- **App:** Vercel Pro o Fly.io / Railway si el costo de Vercel duele.
- **DB:** Neon Pro con branching, o Postgres self-managed en Hetzner con backups.
- **Redis:** Upstash Pay-as-you-go o Redis self-hosted.
- **n8n:** Self-hosted en VPS (Hetzner, ~€5/mes) o n8n Cloud.

### 3.7 Herramientas de desarrollo

| Área | Tecnología |
|------|-----------|
| Monorepo | **Turborepo** con **pnpm** |
| Linter | **Biome** (más rápido que ESLint+Prettier) |
| Migraciones | **Prisma Migrate** |
| Testing unit | **Vitest** |
| Testing E2E | **Playwright** |
| Git hooks | **Lefthook** |
| CI/CD | **GitHub Actions** |
| Docs | **Fumadocs** o **Nextra** |

---

## 4. Arquitectura Multi-Tenant

### 4.1 Modelo elegido: Shared DB + Row-Level Security

Todos los tenants comparten una única base de datos y las mismas tablas. El aislamiento se garantiza mediante:

1. **Columna `tenant_id`** en cada tabla que contiene datos de cliente.
2. **Row-Level Security (RLS)** de Postgres: políticas que filtran automáticamente por `tenant_id` según el contexto de la sesión.
3. **Middleware de aplicación** que setea el contexto de tenant en cada request.

**Por qué este modelo:**
- Costo mínimo (una DB para miles de tenants).
- Simple para arrancar y migrar.
- Escala a decenas de miles de tenants sin cambios de arquitectura (patrón usado por Notion, Linear, Vercel).
- El riesgo de "leak" entre tenants se mitiga con RLS + revisiones de código estrictas.

**Cuándo migrar a otro modelo:**
- Un tenant enterprise pide DB dedicada por compliance → schema-per-tenant o DB-per-tenant para ese cliente puntual.
- Un tenant grande satura recursos → sharding por `tenant_id`.

### 4.2 Ruteo por subdominio

- **URL:** `<tenant-slug>.miapp.com` (ej: `estudiokinesio.miapp.com`)
- **Landing pública:** `miapp.com` (marketing, registro)
- **Admin de la plataforma:** `admin.miapp.com` (staff interno)
- **DNS:** Wildcard `*.miapp.com` apuntando a Vercel/hosting.
- **Middleware Next.js:** Extrae el subdominio, resuelve el tenant, lo pone en headers para downstream.

```typescript
// middleware.ts (esquema conceptual)
export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const subdomain = extractSubdomain(host); // 'estudiokinesio'

  if (!subdomain || subdomain === 'www') {
    // Landing pública
    return NextResponse.next();
  }

  if (subdomain === 'admin') {
    // Panel de administración interno
    return handleAdminRoute(req);
  }

  const tenant = await getTenantBySlug(subdomain); // Cacheado en Redis
  if (!tenant) return NextResponse.redirect(new URL('/404', req.url));

  const headers = new Headers(req.headers);
  headers.set('x-tenant-id', tenant.id);
  headers.set('x-tenant-slug', tenant.slug);

  return NextResponse.next({ request: { headers } });
}
```

### 4.3 Row-Level Security en Postgres

Cada request debe setear el `tenant_id` en la sesión de Postgres. Prisma soporta esto mediante middleware.

**Política ejemplo para tabla `contacts`:**

```sql
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON contacts
  USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
```

**Middleware Prisma que setea el contexto:**

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

**Regla dura:** ninguna query bypasea RLS excepto trabajos del propio staff de la plataforma (usando un rol de Postgres separado con `BYPASSRLS`).

> **Corrección (ver `docs/adr/000-correccion-set-local-parametrizado.md` y `docs/adr/003-tenant-context-helper.md`):** el ejemplo de middleware anterior queda **superado**. `$executeRawUnsafe` con interpolación de string es un vector de SQL injection y viola la regla dura #2 de `CLAUDE.md`. La implementación real usa `$executeRaw` parametrizado + validación Zod del `tenantId` como CUID, envuelto en `prisma.$transaction()` dentro del helper `withTenantContext` de `packages/tenant-context`, para garantizar que el `SET LOCAL` y las queries subsiguientes corran en la misma conexión física bajo pooling serverless (Neon/PgBouncer). El `PrismaClient` crudo no se exporta desde `packages/db`.

### 4.4 Dominios custom (Fase 3+)

Cuando un tenant quiera usar `sistema.suempresa.com`:

1. El tenant apunta un CNAME a `cname.miapp.com`.
2. Vercel/Cloudflare emite certificado automáticamente.
3. La tabla `tenant_domains` mapea dominios custom a `tenant_id`.
4. Middleware verifica primero `custom_domain`, después `subdomain`.

---

## 5. Arquitectura de Módulos

Este es el corazón del proyecto. Un módulo bien diseñado = uno más fácil de mantener, activar, facturar, extender.

### 5.1 Concepto de Módulo

Un **Módulo** es una unidad autónoma que:
- Aporta funcionalidad vertical (CRM, stock, agenda, etc.).
- Se puede activar/desactivar por tenant sin afectar al resto.
- Declara sus recursos (tablas, rutas, permisos, componentes UI, acciones de IA).
- Sigue un contrato estandarizado (interfaz `Module`).

### 5.2 Estructura de carpetas de un módulo

```
packages/modules/crm/
├── manifest.ts           # Metadatos del módulo
├── schema.prisma         # Sus tablas propias
├── permissions.ts        # Permisos que declara
├── api/                  # Routers tRPC del módulo
│   ├── contacts.router.ts
│   ├── deals.router.ts
│   └── index.ts
├── ui/                   # Componentes React
│   ├── pages/            # Páginas (routing)
│   ├── components/       # Componentes reutilizables
│   └── widgets/          # Widgets para dashboard global
├── ai/                   # Acciones que la IA puede ejecutar
│   ├── actions.ts
│   └── prompts.ts
├── automations/          # Webhooks y triggers para n8n
│   └── events.ts
├── seed/                 # Datos demo para onboarding
│   └── seed.ts
└── tests/
```

### 5.3 El `manifest` de un módulo

```typescript
// packages/modules/crm/manifest.ts
import type { ModuleManifest } from '@app/modules-sdk';

export const crmManifest: ModuleManifest = {
  id: 'crm',
  version: '1.0.0',
  name: 'CRM',
  description: 'Gestión de contactos, oportunidades y pipeline de ventas',
  category: 'sales',
  icon: 'Users',

  // Dependencias con otros módulos
  dependencies: [],

  // Rubros donde este módulo es "recomendado" en el onboarding
  recommendedFor: ['servicios', 'consultoria', 'inmobiliaria', 'salud', '*'],

  // Precio (o null si viene con el plan base)
  pricing: {
    type: 'per_module',
    monthlyUSD: 15,
  },

  // Ítems que se enchufan al menú global
  menuItems: [
    { path: '/crm/contactos', label: 'Contactos', icon: 'Users', permission: 'crm:contacts.read' },
    { path: '/crm/oportunidades', label: 'Oportunidades', icon: 'Target', permission: 'crm:deals.read' },
    { path: '/crm/pipeline', label: 'Pipeline', icon: 'GitBranch', permission: 'crm:deals.read' },
  ],

  // Widgets para el dashboard global
  dashboardWidgets: [
    { id: 'crm.top-deals', size: 'md', permission: 'crm:deals.read' },
    { id: 'crm.recent-contacts', size: 'sm', permission: 'crm:contacts.read' },
  ],

  // Permisos que este módulo declara
  permissions: [
    'crm:contacts.read',
    'crm:contacts.write',
    'crm:contacts.delete',
    'crm:deals.read',
    'crm:deals.write',
    'crm:deals.delete',
    'crm:pipeline.configure',
  ],

  // Eventos que emite este módulo (para n8n y auditoría)
  events: [
    'crm.contact.created',
    'crm.contact.updated',
    'crm.deal.created',
    'crm.deal.stage_changed',
    'crm.deal.won',
    'crm.deal.lost',
  ],

  // Acciones que la IA puede ejecutar
  aiActions: [
    'crm.searchContacts',
    'crm.createContact',
    'crm.moveDeal',
    'crm.summarizePipeline',
  ],

  // Hook lifecycle
  hooks: {
    onEnable: 'seed', // Corre seed.ts al activar
    onDisable: 'archive', // No borra datos, los archiva
  },
};
```

### 5.4 Module Registry

Un registro central que carga todos los módulos disponibles y expone su información.

```typescript
// packages/modules-sdk/registry.ts
class ModuleRegistry {
  private modules = new Map<string, LoadedModule>();

  register(manifest: ModuleManifest, impl: ModuleImplementation) { ... }

  getEnabledFor(tenantId: string): LoadedModule[] { ... }

  resolveDependencies(moduleIds: string[]): string[] { ... }

  buildMenuFor(tenantId: string, userPermissions: string[]): MenuItem[] { ... }

  getAIActionsFor(tenantId: string): AIAction[] { ... }
}

export const moduleRegistry = new ModuleRegistry();
```

### 5.5 Ciclo de vida de un módulo por tenant

```
[No instalado] → activar → [Activo] → desactivar → [Suspendido]
                             ↓                        ↓
                          desinstalar             reactivar
                             ↓
                        [Datos archivados 90 días → borrado]
```

- **Activar:** ejecuta migraciones si es primera vez, corre seed opcional, registra permisos, agrega al menú.
- **Desactivar:** oculta del menú, deja datos intactos. Reactivable en cualquier momento.
- **Desinstalar:** archiva datos (soft delete con retención), después de 90 días purga.

### 5.6 Reglas de oro para módulos

1. **Un módulo NO importa código de otro módulo directamente.** Sólo puede comunicarse mediante eventos o interfaces públicas del `sdk`.
2. **Un módulo puede depender de otro** vía `dependencies` en el manifest, pero eso implica activación en cascada.
3. **Todo dato del módulo tiene `tenant_id`.**
4. **Ningún módulo puede modificar el schema de otro módulo.**
5. **Todo módulo declara sus permisos.** No hay permisos hardcoded en la UI.
6. **Toda operación sensible emite evento** (para auditoría y automatizaciones).

---

## 6. Sistema de Branding y Theming

### 6.1 Datos de branding por tenant

```typescript
interface TenantBranding {
  logoUrl: string;
  logoDarkUrl?: string;
  faviconUrl: string;
  companyName: string;

  // Paleta
  colors: {
    primary: string;    // Hex, ej: '#6366F1'
    accent?: string;
    background?: string;
    foreground?: string;
  };

  // Tipografía
  fontFamily?: 'Inter' | 'Roboto' | 'Poppins' | 'Manrope' | 'custom';
  fontUrl?: string; // Para custom

  // Social/contacto (opcional, útiles para módulos públicos como bookings)
  socials?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    website?: string;
  };

  // Branding de emails
  emailHeaderColor?: string;
  emailFooterText?: string;
}
```

### 6.2 Aplicación en runtime

En el root layout, se inyectan variables CSS derivadas del branding:

```tsx
// app/layout.tsx (esquema)
export default async function RootLayout({ children }: Props) {
  const tenant = await getTenantFromRequest();
  const cssVars = generateCSSVarsFromBranding(tenant.branding);

  return (
    <html>
      <head>
        <style>{`:root { ${cssVars} }`}</style>
        <link rel="icon" href={tenant.branding.faviconUrl} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

Y en `tailwind.config` (o CSS global con Tailwind 4):

```css
@theme {
  --color-primary: var(--brand-primary);
  --color-primary-foreground: var(--brand-primary-foreground);
  /* ... */
}
```

Toda la UI usa `bg-primary`, `text-primary`, etc. Cambiar el color del tenant cambia toda la app sin tocar código.

### 6.3 Vista previa en tiempo real (feature de venta)

Durante el onboarding y en configuración, el cliente puede:
- Subir logo y ver cómo queda en el header en vivo.
- Cambiar color y ver botones, links, header, sidebar actualizar sin recarga.
- Alternar entre "previews" (dashboard, formulario, listado) para ver cómo queda su marca.

Implementación: el picker de color actualiza variables CSS del `<html>` en el cliente, sin refetch. Al guardar, se persiste.

### 6.4 Generación de paleta

- Recibimos color primario del cliente.
- Generamos automáticamente escala (50→950) usando **culori** o **chroma.js**.
- Detectamos si el color es claro/oscuro → seteamos `foreground` para contraste WCAG AA.
- Ofrecemos paletas sugeridas (Notion-style, Stripe-style, warm, cool).

### 6.5 Assets

- Logos y favicons se suben a **Cloudflare R2**.
- Se generan variantes automáticas (favicon multi-tamaño, logo optimizado WebP).
- URLs versionadas (`logo-v3.webp`) para invalidar caché.

---

## 7. Autenticación y Autorización

### 7.1 Autenticación (Better Auth)

Métodos soportados desde el día 1:
- Email + password
- Magic link (email)
- Google OAuth
- Microsoft OAuth (útil para B2B)

Fase 2:
- Passkeys / WebAuthn
- 2FA con TOTP
- SSO SAML (para clientes enterprise)

### 7.2 Estructura de sesión

Una sesión no está atada a un tenant específico. Un usuario puede pertenecer a varios tenants (ej: contador que atiende a varias empresas).

```
User (id, email, name, avatar)
   |
   1..N Membership (userId, tenantId, roleId, status)
   |
   Tenant (id, slug, branding, plan)
```

### 7.3 Autorización: RBAC + permisos granulares

**Roles predefinidos por tenant:**

| Rol | Descripción |
|-----|-------------|
| Owner | Dueño, todos los permisos, único que gestiona billing |
| Admin | Todos los permisos excepto billing y eliminar tenant |
| Manager | Permisos operativos amplios por módulo |
| Member | Permisos operativos limitados |
| Viewer | Solo lectura |

**Roles custom:** El owner/admin puede crear roles con combinaciones específicas de permisos.

**Formato de permiso:** `<módulo>:<recurso>.<acción>`
- `crm:contacts.read`
- `crm:contacts.write`
- `stock:products.delete`
- `settings:branding.write`

**Chequeos:**
- En el backend (tRPC middleware): valida permiso antes de ejecutar procedimiento.
- En el frontend (hook `usePermission`): esconde/deshabilita UI. Nunca es fuente de verdad, solo UX.

### 7.4 Invitaciones

- Owner/admin invita por email.
- Se crea `Membership` con `status='invited'`.
- El invitado recibe magic link, completa registro si es nuevo usuario, se activa la membership.
- Los invitados pueden ser removidos, y sus datos se anonimizan pero no se borran (auditoría).

---

## 8. Modelo de Datos Base

Schema Prisma inicial. Los módulos agregan sus propias tablas.

```prisma
// prisma/schema.prisma (fragmento base)

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions", "views"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgcrypto, citext]
}

// ============================================================
// USERS
// ============================================================

model User {
  id            String       @id @default(cuid())
  email         String       @unique @db.Citext
  emailVerified DateTime?
  name          String?
  avatarUrl     String?
  passwordHash  String?      // Null si usa OAuth/magic link
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  memberships   Membership[]
  sessions      Session[]

  @@index([email])
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// ============================================================
// TENANTS
// ============================================================

model Tenant {
  id             String         @id @default(cuid())
  slug           String         @unique
  name           String
  industry       String?        // 'kinesiologia' | 'retail' | ... (no enum para flexibilidad)
  status         TenantStatus   @default(ACTIVE)
  branding       Json           @default("{}")
  settings       Json           @default("{}")
  planId         String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  memberships    Membership[]
  moduleInstalls ModuleInstall[]
  domains        TenantDomain[]
  plan           Plan?          @relation(fields: [planId], references: [id])

  @@index([slug])
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  TRIAL
  CANCELLED
}

model TenantDomain {
  id        String   @id @default(cuid())
  tenantId  String
  domain    String   @unique
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())

  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}

// ============================================================
// MEMBERSHIPS (usuario ↔ tenant)
// ============================================================

model Membership {
  id        String           @id @default(cuid())
  userId    String
  tenantId  String
  roleId    String
  status    MembershipStatus @default(ACTIVE)
  invitedAt DateTime?
  joinedAt  DateTime?
  createdAt DateTime         @default(now())

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant    Tenant           @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  role      Role             @relation(fields: [roleId], references: [id])

  @@unique([userId, tenantId])
  @@index([tenantId])
}

enum MembershipStatus {
  INVITED
  ACTIVE
  SUSPENDED
  REMOVED
}

// ============================================================
// ROLES & PERMISSIONS
// ============================================================

model Role {
  id          String       @id @default(cuid())
  tenantId    String?      // null = rol global (Owner, Admin, etc)
  key         String       // 'owner' | 'admin' | ... o custom
  name        String
  description String?
  isSystem    Boolean      @default(false)
  createdAt   DateTime     @default(now())

  permissions RolePermission[]
  memberships Membership[]

  @@unique([tenantId, key])
}

model Permission {
  id          String           @id @default(cuid())
  key         String           @unique // 'crm:contacts.read'
  module      String           // 'crm'
  resource    String           // 'contacts'
  action      String           // 'read'
  description String?

  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String

  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

// ============================================================
// MODULES (instalados por tenant)
// ============================================================

model ModuleInstall {
  id          String    @id @default(cuid())
  tenantId    String
  moduleId    String    // 'crm', 'stock', etc.
  version     String
  status      ModuleStatus @default(ACTIVE)
  config      Json      @default("{}")
  installedAt DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  tenant      Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, moduleId])
  @@index([tenantId])
}

enum ModuleStatus {
  ACTIVE
  SUSPENDED
  UNINSTALLING
}

// ============================================================
// BILLING
// ============================================================

model Plan {
  id             String   @id @default(cuid())
  key            String   @unique   // 'free' | 'starter' | 'pro'
  name           String
  monthlyPriceUSD Decimal @db.Decimal(10, 2)
  maxUsers       Int
  includedModules String[] @default([])
  features       Json     @default("{}")

  tenants        Tenant[]
}

model Subscription {
  id               String   @id @default(cuid())
  tenantId         String   @unique
  planId           String
  status           String
  stripeSubId      String?  @unique
  currentPeriodEnd DateTime
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// ============================================================
// AUDIT LOG
// ============================================================

model AuditLog {
  id         String   @id @default(cuid())
  tenantId   String
  userId     String?
  action     String   // 'crm.contact.created'
  entityType String?
  entityId   String?
  metadata   Json     @default("{}")
  ipAddress  String?
  createdAt  DateTime @default(now())

  @@index([tenantId, createdAt])
  @@index([userId])
}
```

**Notas:**
- Toda tabla de módulos tiene `tenantId` con FK a `Tenant`.
- Todas las tablas con datos de tenant tienen políticas RLS.
- Índice compuesto `(tenantId, createdAt)` es el patrón más común para listados.

---

## 9. Estructura del Monorepo

Turborepo + pnpm workspaces.

> **Nota (ver `docs/adr/001-single-nextjs-app.md`):** para Fase 0-2, `apps/web` es la **única** app Next.js del monorepo. Sirve landing, admin y la app de tenant mediante route groups (`(marketing)`, `(admin)`, `(app)`) resueltos por `middleware.ts` según subdominio. `apps/landing` y `apps/admin` como apps Next.js separadas quedan diferidas a Fase 3+, cuando haya una razón concreta (equipos/deploys independientes) que justifique la separación.

```
mi-proyecto/
├── apps/
│   ├── web/                    # App principal (Next.js) — única app en Fase 0-2, ver ADR-001
│   ├── landing/                # Diferido a Fase 3+ (ADR-001)
│   ├── admin/                  # Diferido a Fase 3+ (ADR-001)
│   └── docs/                   # Documentación técnica (Fumadocs)
│
├── packages/
│   ├── db/                     # Prisma + acceso a DB compartido
│   ├── auth/                   # Wrapper de Better Auth
│   ├── ui/                     # shadcn components + design system
│   ├── modules-sdk/            # Contratos e interfaces para módulos
│   ├── tenant-context/         # AsyncLocalStorage para tenant actual
│   ├── ai/                     # SDK unificado para Claude + otros LLMs
│   ├── automations/            # Cliente n8n, tipos de eventos
│   ├── config/                 # Config compartida (tsconfig, biome, etc.)
│   └── utils/                  # Helpers generales
│
├── packages/modules/
│   ├── crm/
│   ├── stock/
│   ├── billing/
│   ├── scheduling/
│   ├── hr/
│   └── ...                     # Un paquete por módulo
│
├── tools/
│   ├── module-generator/       # CLI para scaffold de nuevos módulos
│   └── seed/                   # Datos demo para dev
│
├── .github/workflows/
├── docker-compose.yml          # Postgres + Redis para dev local
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

**Comandos clave:**
```bash
pnpm dev            # Levanta app + landing en paralelo
pnpm db:migrate     # Aplica migraciones
pnpm db:studio      # Prisma Studio
pnpm module:new crm # Scaffold de nuevo módulo
pnpm test           # Corre todos los tests
pnpm lint           # Biome
pnpm build          # Build producción
```

---

## 10. Capa de IA

### 10.1 Enfoque

Cada módulo declara **acciones** que la IA puede ejecutar. El asistente global recibe la lista de acciones disponibles según los módulos activos del tenant y el rol del usuario, y las ejecuta vía **tool use** (function calling).

Esto significa que la IA no "sabe" del negocio: sabe qué herramientas tiene disponibles y elige cuáles usar.

### 10.2 Ejemplo de acción

```typescript
// packages/modules/crm/ai/actions.ts
export const createContactAction: AIAction = {
  id: 'crm.createContact',
  description: 'Crea un nuevo contacto en el CRM',
  requiredPermission: 'crm:contacts.write',
  parameters: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  }),
  execute: async ({ parameters, ctx }) => {
    const contact = await ctx.prisma.contact.create({
      data: { ...parameters, tenantId: ctx.tenantId },
    });
    return { success: true, contactId: contact.id };
  },
};
```

### 10.3 Chatbot por tenant

- Endpoint `/api/ai/chat` que:
  1. Autentica al usuario y resuelve el tenant.
  2. Carga las acciones disponibles según módulos activos + permisos.
  3. Llama a Claude (Sonnet 4.6 o Haiku 4.5 según nivel del plan) con las tools.
  4. Ejecuta las tools que Claude decida, con validación estricta.
  5. Devuelve respuesta streaming.

### 10.4 RAG por tenant (Fase 2)

- Los tenants pueden subir documentos (políticas, catálogos, FAQs).
- Se indexan con embeddings (**pgvector** en Postgres).
- El chatbot puede consultar la base vectorial del tenant como una tool adicional.
- **Aislamiento por tenant es obligatorio en pgvector también** (mismo RLS).

### 10.5 Chatbot público (Fase 3)

- Widget embebible en el sitio del tenant.
- Conectado a los módulos que el tenant elija exponer (agenda para reservar, catálogo para consultar stock, etc.).
- Facturación por mensaje.

### 10.6 Modelos y costos

| Uso | Modelo sugerido | Racional |
|-----|-----------------|----------|
| Chat interno (staff del tenant) | Claude Sonnet 4.6 | Balance calidad/costo |
| Chat público (clientes finales) | Claude Haiku 4.5 | Costo bajo, latencia baja |
| Generación de documentos | Claude Sonnet 4.6 | Calidad |
| Clasificación / extracción | Claude Haiku 4.5 | Costo bajo |

**Guardrails obligatorios:**
- Rate limit por tenant y por usuario.
- Cuota mensual de tokens según plan.
- Prompt injection detection (validar inputs sospechosos antes de mandarlos al LLM).
- Filtro de PII en logs.
- Los prompts del sistema nunca revelan el `tenant_id` u otras claves internas.

### 10.7 SDK interno de IA

`packages/ai/` expone una interfaz agnóstica de proveedor:

```typescript
import { chat } from '@app/ai';

const response = await chat({
  model: 'sonnet',
  system: buildSystemPrompt(ctx),
  messages: history,
  tools: getToolsForTenant(ctx),
  metadata: { tenantId: ctx.tenantId, userId: ctx.userId },
});
```

Ventaja: si mañana cambiamos de proveedor o agregamos fallback (OpenAI, Gemini), sólo tocamos este paquete.

---

## 11. Integración con n8n

### 11.1 Modelo

n8n corre como servicio separado (self-hosted en un VPS o n8n Cloud). La plataforma se comunica con n8n mediante:

- **Webhooks salientes:** cada evento de módulo (`crm.deal.won`, `stock.item.low`, etc.) puede disparar un webhook a n8n.
- **API entrante:** n8n puede llamar a nuestra API para leer/escribir datos.

### 11.2 Templates por rubro

Cada rubro tiene workflows n8n prearmados que el tenant puede "instalar" con un clic:

- **Kinesiología:** recordatorio de turno 24hs antes por WhatsApp.
- **Retail:** notificar stock bajo por email.
- **Servicios:** enviar cotización PDF cuando un deal pasa a "enviado".
- **Genérico:** sincronizar contactos CRM ↔ Mailchimp.

Los templates viven en el repo como JSON exportado de n8n, y se importan vía API de n8n al activarse en el tenant.

### 11.3 Credenciales por tenant

- Cada tenant tiene credenciales n8n separadas (para conectar SUS cuentas de WhatsApp, Gmail, etc.).
- Nunca compartir credenciales entre tenants.
- Guardar en n8n, no en nuestra DB (n8n cifra credenciales).

### 11.4 Cuándo NO usar n8n

n8n es para **automatizaciones del cliente** (customer-facing). No lo uses para:
- Jobs internos de la plataforma (usar Inngest o BullMQ).
- Lógica de negocio core (debe estar en el código de los módulos).
- Cálculos que necesitan transaccionalidad estricta.

### 11.5 Deploy sugerido de n8n

- VPS Hetzner CX22 (€5/mes) con Docker Compose.
- Postgres separado del principal (no mezclar).
- HTTPS con Caddy o Traefik.
- Backups automáticos a R2.

---

## 12. Facturación y Planes

### 12.1 Modelo híbrido

**Precio base** por plan + **precio por módulo activado** + **add-ons**.

| Plan | Precio base | Usuarios | Módulos incluidos | AI |
|------|-------------|----------|-------------------|-----|
| Starter | USD 19/mes | 3 | Core + 1 módulo | No |
| Growth | USD 49/mes | 10 | Core + 3 módulos | 500 mensajes/mes |
| Business | USD 129/mes | 30 | Core + todos | 5000 mensajes/mes |
| Enterprise | Custom | Custom | Todos + dominios custom + SLA | Custom |

**Add-ons:**
- Módulo adicional fuera del plan: USD 10-20/mes según módulo.
- Pack extra de mensajes IA: USD 15 / 1000 mensajes.
- Templates premium de n8n: USD 5-15 c/u.

### 12.2 Providers

- **Stripe:** para clientes internacionales y suscripciones.
- **MercadoPago:** para Argentina (esencial LATAM).
- Abstracción interna: `packages/billing` con interfaz común.

### 12.3 Períodos de prueba

- 14 días gratis con todos los módulos habilitados.
- Al finalizar, el tenant elige plan o pasa a modo "read-only" (los datos siguen visibles pero no puede modificar).

### 12.4 Feature flags por plan

Un helper `canUseFeature(tenant, 'aiChat')` consulta el plan y decide.

---

## 13. Seguridad

### 13.1 Checklist mandatoria (OWASP-based)

- [x] RLS en Postgres para todo dato de tenant.
- [x] Validación con Zod en cada entrada (nunca confiar en el cliente).
- [x] Passwords con Argon2 o bcrypt (nunca MD5/SHA1).
- [x] Rate limiting por IP y por usuario (Upstash Ratelimit).
- [x] CSRF tokens en formularios.
- [x] CSP headers estrictos.
- [x] HttpOnly + Secure + SameSite en cookies de sesión.
- [x] Secrets en variables de entorno (Vercel/1Password).
- [x] Nunca loggear passwords, tokens, ni PII.
- [x] Sanitización de inputs para prevenir XSS (React lo hace, pero cuidado con `dangerouslySetInnerHTML`).
- [x] Actualizaciones automáticas de dependencias (Renovate o Dependabot).
- [x] Escaneo de secretos en commits (gitleaks).

### 13.2 Aislamiento entre tenants (crítico)

- **Test automatizado en CI:** por cada tabla con `tenant_id`, correr query como tenant A pidiendo datos de tenant B y verificar que NO devuelva nada.
- **Code review obligatorio** para cualquier query que use `Prisma.raw` o bypass de RLS.
- **Auditoría trimestral** de logs de acceso cross-tenant.

### 13.3 Manejo de secrets

- Ambiente local: `.env.local` (gitignored).
- Ambiente producción: variables de Vercel + Doppler/Infisical si crece el equipo.
- Rotación de secrets cada 90 días para producción.

### 13.4 Backups

- Neon/Supabase: PITR habilitado (point-in-time recovery).
- Backup diario adicional a R2 (cifrado).
- Simulacro de restore trimestral.

### 13.5 GDPR / privacidad

- Export de datos por tenant (Data Portability).
- Delete cascade real al eliminar tenant (con 30 días de retención en soft-delete).
- Política de privacidad y ToS revisados con abogado antes de vender.

---

## 14. Rendimiento y Escalabilidad

### 14.1 Reglas de queries

- Nunca `SELECT *` en producción.
- Todo listado paginado (cursor-based, no offset).
- Índices compuestos con `tenant_id` primero.
- N+1 → detectado con `prisma-query-log` en dev.
- Queries pesadas → analizar con `EXPLAIN ANALYZE`.

### 14.2 Caching

| Qué | Dónde | TTL |
|-----|-------|-----|
| Resolución tenant slug → id | Redis + memoria | 5 min |
| Permisos por membership | Memoria (Map + LRU) | 60 seg |
| Branding del tenant | Redis | 15 min, invalidación al editar |
| Módulos activos por tenant | Redis | 5 min |
| Configuración de plan | Redis | 1 hora |

### 14.3 Estrategia de scale-up

**0 – 100 tenants:** stack descrito, Vercel Hobby + Neon Free.

**100 – 1000 tenants:** Vercel Pro + Neon Pro. Redis Upstash paid. Empezar a monitorear queries lentas.

**1000 – 10.000 tenants:** Considerar dedicar workers para background jobs (Fly.io o servidor propio). Sharding aún no necesario si RLS + índices bien.

**10.000+ tenants:** Sharding por `tenant_id` en Postgres. Read replicas para reports. Considerar ClickHouse/Tinybird para analytics.

### 14.4 Edge vs Node

- Middleware de tenant resolution → **Edge** (rapidísimo).
- Renderizado de páginas → **Node** (Prisma no corre en edge por ahora).
- APIs simples de lectura → **Edge** si es viable.
- Mutaciones y jobs → **Node**.

---

## 15. Observabilidad

### 15.1 Logs

- Estructurados (JSON) con `pino`.
- Cada log incluye `tenantId`, `userId`, `traceId`.
- Nivel `info` en producción, `debug` sólo temporal.
- Nunca loggear PII, tokens ni passwords.

### 15.2 Errores

- **Sentry** para errores no manejados en frontend y backend.
- Configurar `beforeSend` para strippear datos sensibles.
- Alertas a Slack/Discord para errores críticos.

### 15.3 Métricas

- **Vercel Analytics** para performance básica.
- **PostHog** (self-hosted o cloud) para producto: qué módulos usan, funnels de onboarding.
- Métricas custom: tenants activos, MRR, churn, uso de IA.

### 15.4 Uptime

- **BetterStack** o **UptimeRobot** monitoreando endpoints clave cada minuto.
- Status page pública en `status.miapp.com`.

---

## 16. Testing

### 16.1 Pirámide

- **Unit (Vitest):** utils, transformaciones, lógica pura. Target: 80% coverage en `packages/utils` y core de módulos.
- **Integration (Vitest + testcontainers-node):** routers tRPC contra Postgres real. Target: happy path + edge cases de cada endpoint público.
- **E2E (Playwright):** flujos críticos completos.

### 16.2 Flujos E2E críticos

1. Registro de nuevo tenant → onboarding → primer módulo activo.
2. Login + acceso a datos filtrados por tenant.
3. Invitación de usuario y aceptación.
4. Activación/desactivación de módulo.
5. Cambio de branding en vivo.
6. Chat de IA ejecutando una acción (crear contacto).
7. Cambio de plan y facturación.

### 16.3 Test de aislamiento multi-tenant

Test automático que verifica: siendo usuario de tenant A, ninguna query devuelve datos de tenant B. Corre en CI en cada PR.

---

## 17. CI/CD

### 17.1 Pipeline GitHub Actions

Por cada PR:
1. Instalar deps (pnpm cache).
2. Lint (Biome).
3. Type-check.
4. Tests unit + integration.
5. Build.
6. Deploy preview (Vercel).
7. E2E contra preview (Playwright).
8. Comment en PR con link y resultados.

### 17.2 Migraciones DB

- **Nunca** editar una migración ya aplicada.
- En PR: revisar el `.sql` generado por Prisma.
- Deploy: `prisma migrate deploy` en step separado antes de deploy de app.
- Rollback: forward-only (nunca rollback, se corrige con nueva migración).

### 17.3 Branching

- `main` → producción (deploy automático).
- `dev` → staging (deploy automático).
- Feature branches → preview per PR.

---

## 18. Roadmap por Fases

### Fase 0 — Fundaciones (semanas 1-3)

**Meta:** repo funcional con arquitectura base y "hola mundo" multi-tenant.

- [ ] Setup monorepo Turborepo + pnpm
- [ ] Prisma + Postgres local (Docker Compose)
- [ ] Better Auth funcionando con email + Google
- [ ] Middleware de resolución de subdominio
- [ ] RLS habilitado en tabla dummy con test de aislamiento
- [ ] shadcn/ui integrado + theme dinámico funcional
- [ ] Deploy inicial a Vercel + Neon
- [ ] CI/CD básico

### Fase 1 — MVP (semanas 4-10)

**Meta:** un tenant puede registrarse, brandearse, invitar usuarios y usar CRM completo.

- [ ] Landing pública con registro
- [ ] Onboarding paso a paso (empresa, branding, elección de módulos, invitaciones)
- [ ] Dashboard base con widgets
- [ ] Módulo CRM completo (contactos, deals, pipeline)
- [ ] Sistema de permisos y roles funcional
- [ ] Panel de settings (branding, usuarios, roles, módulos)
- [ ] Panel de administración interno (staff)
- [ ] Emails transaccionales (Resend)
- [ ] Testing E2E de flujos críticos

**Criterio de "listo":** un amigo puede registrar su empresa, invitar a un socio, brandearla y cargar 20 contactos y 5 deals sin ayuda tuya.

### Fase 2 — Múltiples módulos + facturación (semanas 11-18)

**Meta:** cuatro módulos operativos + cobrar plata de verdad.

- [ ] Módulo de Agenda / Turnos
- [ ] Módulo de Facturación
- [ ] Módulo de Stock / Productos
- [ ] Integración Stripe + MercadoPago
- [ ] Planes y feature flags
- [ ] Panel de billing (facturas, cambio de plan, cancelación)
- [ ] Período de prueba automatizado
- [ ] Primeros 3-5 clientes beta reales

### Fase 3 — IA y automatización (semanas 19-28)

**Meta:** el diferencial en producción.

- [ ] SDK interno de IA (`packages/ai`)
- [ ] Chatbot interno para staff del tenant
- [ ] Acciones IA en CRM, Agenda, Stock
- [ ] Integración con n8n self-hosted
- [ ] Primer template de workflow (recordatorio de turno por WhatsApp)
- [ ] Cuotas y facturación de IA
- [ ] RAG por tenant (documentos)

### Fase 4 — Escala y marketplace (semanas 29+)

**Meta:** que la plataforma se extienda sin que vos toques todo.

- [ ] Módulos verticales adicionales (ver `MODULES.md`)
- [ ] Marketplace de módulos y templates
- [ ] Dominios custom
- [ ] SSO SAML para enterprise
- [ ] API pública para integradores
- [ ] SDK para desarrolladores externos que quieran hacer módulos
- [ ] Programa de partners / integradores

---

## 19. Guía para Trabajar con Claude Code

### 19.1 Contexto por sesión

Al iniciar cualquier sesión de Claude Code, asegurate de que tenga:
- Este archivo (`ARCHITECTURE.md`) leído.
- `MODULES.md` si vas a trabajar en módulos.
- El `CLAUDE.md` del proyecto (setealo en el root con instrucciones específicas del proyecto).

### 19.2 CLAUDE.md sugerido

Creá un `CLAUDE.md` en la raíz del repo con este contenido:

```markdown
# Instrucciones para Claude Code

Este es un SaaS multi-tenant multi-rubro. Leé ARCHITECTURE.md antes de tocar código.

## Reglas duras
1. TODO dato de negocio tiene tenantId. Toda query lo respeta.
2. NUNCA hagas Prisma.raw sin justificarlo. NUNCA bypasseés RLS.
3. Usá los patrones establecidos: tRPC + Zod + Prisma. No traigas Express, ni Redux, ni axios.
4. Componentes UI: shadcn/ui. Estilos: Tailwind con variables CSS del theme.
5. Todo módulo sigue la estructura de packages/modules/*.
6. Tests obligatorios para routers tRPC y utils de negocio.

## Antes de generar código
- Si la tarea toca multi-tenant, releé la sección 4 de ARCHITECTURE.md.
- Si es un módulo nuevo, releé la sección 5.
- Si tenés dudas de scope, preguntá antes de codear.

## Convenciones
- Commits: Conventional Commits (feat:, fix:, chore:, etc.)
- Nombres: camelCase para variables, PascalCase para componentes/tipos, kebab-case para archivos.
- Errores: siempre con clases custom (`TenantNotFoundError`, etc.), no strings sueltos.
- Estilo de código: Biome se encarga. No pelees con el linter.
```

### 19.3 Cómo pedirle un nuevo módulo

Estructura de prompt sugerida:

```
Necesito crear el módulo "Agenda" para reservas de turnos.
Contexto: [pegar sección 5 de ARCHITECTURE.md + MODULES.md sección de Agenda]

Requerimientos funcionales:
- Recursos: cita (patient/cliente, profesional, servicio, inicio, fin, estado)
- Pipeline de estados: [pendiente, confirmado, completado, cancelado, no-show]
- Vista calendario semanal
- Recordatorio automático 24hs antes (evento para n8n)

Requerimientos técnicos:
- Seguir la estructura de packages/modules/agenda
- Manifest completo con permisos, menú, eventos, acciones IA
- Router tRPC con validación Zod
- Componentes UI con shadcn
- Seed con datos demo
- Tests para el router

Empezá por el manifest y el schema Prisma. Después vamos por partes.
```

### 19.4 Chequeos manuales antes de merge

- ¿Toda query filtra por tenant?
- ¿Los permisos están declarados en el manifest?
- ¿Hay tests?
- ¿La UI usa componentes del design system?
- ¿Emite eventos para auditoría?

---

## 20. Glosario

| Término | Significado |
|---------|-------------|
| **Tenant** | Cliente de la plataforma. Una empresa que se registra. |
| **Membership** | Relación entre un usuario y un tenant. Un usuario puede tener varias. |
| **Módulo** | Unidad funcional que un tenant activa (CRM, Stock, etc.) |
| **Manifest** | Descriptor de metadatos y capacidades de un módulo. |
| **RLS** | Row-Level Security de Postgres. Filtrado automático por tenant. |
| **RBAC** | Role-Based Access Control. Permisos vía roles. |
| **ABAC** | Attribute-Based Access Control. Permisos vía atributos (ej: dueño del recurso). |
| **Tool use** | Capacidad de un LLM de invocar funciones. Base del chatbot. |
| **RAG** | Retrieval-Augmented Generation. LLM + búsqueda vectorial. |
| **ADR** | Architecture Decision Record. Documento corto que registra una decisión y su racional. |
| **Feature flag** | Interruptor que habilita/deshabilita una feature. |
| **MRR** | Monthly Recurring Revenue. |
| **MAU** | Monthly Active Users. |

---

## Cierre

Este documento va a cambiar. Toda decisión importante que altere lo escrito debe registrarse como un **ADR** en `docs/adr/`.

**Próximo paso sugerido:** leer `MODULES.md` para ver el catálogo completo de módulos planificados y las guías para crear nuevos.
