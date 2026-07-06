import { Badge, Input, Separator, cn } from '@app/ui';
import { Boxes, CalendarDays, LayoutDashboard, Receipt, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandSwitcher } from '../../components/theme/brand-switcher';
import { ThemeToggle } from '../../components/theme/theme-toggle';

// Shell de la app de tenant (route group "(app)", ver ADR-001). El tenant y
// sus módulos instalados son datos de demo hasta el ítem 4 del roadmap
// (middleware de subdominio) y Fase 1 (módulos reales desde ModuleInstall).
const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, enabled: true },
  { label: 'CRM', href: '/dashboard', icon: Users, enabled: false },
  { label: 'Agenda', href: '/dashboard', icon: CalendarDays, enabled: false },
  { label: 'Facturación', href: '/dashboard', icon: Receipt, enabled: false },
  { label: 'Stock', href: '/dashboard', icon: Boxes, enabled: false },
] as const;

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
            E
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-sm">Estudio Demo</p>
            <p className="text-muted-foreground text-xs">estudio-demo.miapp.com</p>
          </div>
        </div>
        <Separator />
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-disabled={!item.enabled}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                item.enabled
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'pointer-events-none text-muted-foreground',
              )}
            >
              <item.icon className="h-4 w-4" aria-hidden />
              <span className="flex-1">{item.label}</span>
              {!item.enabled && (
                <Badge variant="muted" className="text-[10px]">
                  Pronto
                </Badge>
              )}
            </Link>
          ))}
        </nav>
        <Separator />
        <div className="p-4">
          <Link
            href="/dashboard"
            aria-disabled
            className="pointer-events-none flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground text-sm"
          >
            <Settings className="h-4 w-4" aria-hidden />
            <span className="flex-1">Configuración</span>
            <Badge variant="muted" className="text-[10px]">
              Pronto
            </Badge>
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-border px-6">
          <Input placeholder="Buscar…" className="max-w-xs" aria-label="Buscar" />
          <div className="ml-auto flex items-center gap-4">
            <BrandSwitcher />
            <Separator orientation="vertical" className="h-6" />
            <ThemeToggle />
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground text-xs"
              aria-label="Usuaria demo: Tomasa Demo"
            >
              TD
            </div>
          </div>
        </header>
        <main className="flex-1 bg-muted/40 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
