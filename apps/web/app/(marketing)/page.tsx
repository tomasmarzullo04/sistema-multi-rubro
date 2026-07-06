import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/ui';
import { Blocks, Palette, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/theme/theme-toggle';

// Landing pública (route group "(marketing)", ver ADR-001). En el ítem 4 del
// roadmap el middleware de subdominios va a rutear miapp.com acá.
export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-bold text-primary-foreground">
              M
            </div>
            <span className="font-semibold">Sistema Multi-Rubro</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#caracteristicas" className="transition-colors hover:text-foreground">
              Características
            </a>
            <a href="#caracteristicas" className="transition-colors hover:text-foreground">
              Módulos
            </a>
            <a href="#caracteristicas" className="transition-colors hover:text-foreground">
              Precios
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              Ingresar
            </Button>
            <Button size="sm">Crear cuenta</Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center">
          <Badge variant="secondary" className="mb-6">
            Fase 0 — preview de la plataforma
          </Badge>
          <h1 className="max-w-3xl text-balance font-bold text-5xl tracking-tight md:text-6xl">
            El sistema de gestión que se adapta a <span className="text-primary">tu rubro</span>
          </h1>
          <p className="mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Una sola plataforma, con tu marca y tus módulos: CRM, agenda, facturación y stock.
            Activás lo que tu negocio necesita, y nada más.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Button size="lg" asChild>
              <Link href="/dashboard">Ver demo del dashboard</Link>
            </Button>
            <Button size="lg" variant="outline">
              Conocer más
            </Button>
          </div>
        </section>

        <section id="caracteristicas" className="border-t border-border bg-muted/40">
          <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
            <Card>
              <CardHeader>
                <ShieldCheck className="mb-2 h-8 w-8 text-primary" aria-hidden />
                <CardTitle>Aislamiento real entre clientes</CardTitle>
                <CardDescription>Multi-tenant con Row-Level Security</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Los datos de cada empresa viven aislados a nivel base de datos. Ninguna query cruza
                de un tenant a otro: está garantizado por Postgres, no por convención.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Blocks className="mb-2 h-8 w-8 text-primary" aria-hidden />
                <CardTitle>Módulos por rubro</CardTitle>
                <CardDescription>Activás solo lo que usás</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Un kinesiólogo necesita agenda y turnos; un comercio, stock y facturación. Cada
                tenant instala sus módulos y el sistema se arma a medida.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Palette className="mb-2 h-8 w-8 text-primary" aria-hidden />
                <CardTitle>Tu marca, en serio</CardTitle>
                <CardDescription>Branding dinámico por tenant</CardDescription>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Logo, colores y tipografía propios, con vista previa en vivo. Probalo ahora: el
                selector de color del dashboard cambia toda la interfaz al instante.
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-muted-foreground text-sm">
          <span>Sistema Multi-Rubro — Fase 0</span>
          <span>Hecho con Next.js + shadcn/ui</span>
        </div>
      </footer>
    </div>
  );
}
