// Design system de la plataforma: componentes shadcn/ui sobre Tailwind v4.
// Los tokens de color viven como variables CSS en la app (ver
// docs/ARCHITECTURE.md §6): la capa `--brand-*` es la que muta el theming
// dinámico por tenant, y estos componentes solo consumen tokens semánticos
// (bg-primary, text-muted-foreground, etc.). Nunca colores hardcodeados.

export { Badge, type BadgeProps, badgeVariants } from './components/badge';
export { Button, type ButtonProps, buttonVariants } from './components/button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './components/card';
export { Input } from './components/input';
export { Separator } from './components/separator';
export { cn } from './lib/cn';
