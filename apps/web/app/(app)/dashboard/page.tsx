import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@app/ui';
import { StatTile } from '../../../components/stat-tile';

// Dashboard base con datos de DEMO (hardcodeados). En Fase 1 los widgets se
// alimentan de los módulos instalados del tenant (docs/MODULES.md).
const ACTIVIDAD_DEMO = [
  { quien: 'ML', detalle: 'María López agendó un turno para el jueves 10:30', hace: 'hace 12 min' },
  { quien: 'JP', detalle: 'Juan Pérez pasó a la etapa "Propuesta enviada"', hace: 'hace 1 h' },
  { quien: 'TD', detalle: 'Tomasa Demo actualizó el branding del espacio', hace: 'hace 3 h' },
  { quien: 'AC', detalle: 'Ana Castro se registró desde el formulario público', hace: 'ayer' },
] as const;

const MODULOS_DEMO = [
  { nombre: 'CRM', descripcion: 'Contactos, deals y pipeline', activo: true },
  { nombre: 'Agenda', descripcion: 'Turnos y disponibilidad', activo: false },
  { nombre: 'Facturación', descripcion: 'Comprobantes y cobros', activo: false },
  { nombre: 'Stock', descripcion: 'Productos y depósitos', activo: false },
] as const;

export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-semibold text-2xl tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Resumen de Estudio Demo — datos de demostración (Fase 0)
          </p>
        </div>
        <Badge variant="outline">Plan Starter</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Contactos nuevos"
          value="128"
          delta={{ text: '+12,5 % vs. mes anterior', direction: 'up', upIsGood: true }}
        />
        <StatTile
          label="Turnos esta semana"
          value="42"
          delta={{ text: '-8,7 % vs. semana anterior', direction: 'down', upIsGood: true }}
        />
        <StatTile
          label="Facturación del mes"
          value="$ 1,24 M"
          delta={{ text: '+8,1 % vs. mes anterior', direction: 'up', upIsGood: true }}
        />
        <StatTile
          label="Tareas vencidas"
          value="3"
          delta={{ text: '-2 vs. semana anterior', direction: 'down', upIsGood: false }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>Últimos movimientos del espacio</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {ACTIVIDAD_DEMO.map((item, i) => (
              <div key={item.detalle}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary font-medium text-secondary-foreground text-xs">
                    {item.quien}
                  </div>
                  <p className="min-w-0 flex-1 truncate text-sm">{item.detalle}</p>
                  <span className="shrink-0 text-muted-foreground text-xs">{item.hace}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Módulos</CardTitle>
            <CardDescription>Instalados en este espacio</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {MODULOS_DEMO.map((mod, i) => (
              <div key={mod.nombre}>
                {i > 0 && <Separator className="my-3" />}
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{mod.nombre}</p>
                    <p className="truncate text-muted-foreground text-xs">{mod.descripcion}</p>
                  </div>
                  {mod.activo ? <Badge>Activo</Badge> : <Badge variant="muted">Próximamente</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
