'use client';

import { cn } from '@app/ui';
import { useState } from 'react';

// Demo de theming dinámico por tenant (docs/ARCHITECTURE.md §6.3): el picker
// actualiza las variables CSS `--brand-*` del <html> en el cliente, sin refetch
// ni recarga. En Fase 1 estos valores salen de `Tenant.branding` y el picker
// vive en onboarding/settings; la generación de paleta + contraste automático
// (§6.4, culori) reemplaza a los presets fijos.
const BRAND_PRESETS = [
  { key: 'indigo', label: 'Índigo', primary: '#6366f1', foreground: '#ffffff' },
  { key: 'esmeralda', label: 'Esmeralda', primary: '#059669', foreground: '#ffffff' },
  { key: 'rosa', label: 'Rosa', primary: '#e11d48', foreground: '#ffffff' },
  { key: 'cian', label: 'Cian', primary: '#0891b2', foreground: '#ffffff' },
] as const;

export function BrandSwitcher() {
  const [active, setActive] = useState<string>(BRAND_PRESETS[0].key);

  function applyPreset(preset: (typeof BRAND_PRESETS)[number]) {
    const root = document.documentElement.style;
    root.setProperty('--brand-primary', preset.primary);
    root.setProperty('--brand-primary-foreground', preset.foreground);
    setActive(preset.key);
  }

  return (
    <div
      className="flex items-center gap-1.5"
      role="radiogroup"
      aria-label="Color primario del tenant (demo de branding)"
    >
      {BRAND_PRESETS.map((preset) => (
        <button
          key={preset.key}
          type="button"
          role="radio"
          aria-checked={active === preset.key}
          aria-label={`Marca ${preset.label}`}
          title={preset.label}
          onClick={() => applyPreset(preset)}
          className={cn(
            'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            active === preset.key ? 'border-foreground' : 'border-transparent',
          )}
          style={{ backgroundColor: preset.primary }}
        />
      ))}
    </div>
  );
}
