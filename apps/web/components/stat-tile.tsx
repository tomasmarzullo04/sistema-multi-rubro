import { Card, CardContent, cn } from '@app/ui';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface StatTileProps {
  label: string;
  value: string;
  delta?: {
    text: string; // firmado y contra un período con nombre: "+12,5 % vs. mes anterior"
    direction: 'up' | 'down';
    // El color es dirección × si subir es bueno; nunca color solo (va con ícono + texto).
    upIsGood: boolean;
  };
}

export function StatTile({ label, value, delta }: StatTileProps) {
  const isGood = delta ? (delta.direction === 'up') === delta.upIsGood : false;
  const DeltaIcon = delta?.direction === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-muted-foreground text-sm">{label}</p>
        <p className="mt-2 font-semibold text-3xl tracking-tight">{value}</p>
        {delta && (
          <p
            className={cn(
              'mt-2 flex items-center gap-1 text-sm',
              isGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
            )}
          >
            <DeltaIcon className="h-4 w-4" aria-hidden />
            <span>{delta.text}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
