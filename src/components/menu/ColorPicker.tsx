import { Check } from 'lucide-react';
import { PLAYER_COLORS } from '@/lib/playerColors';

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  excludeHex?: string;
  label?: string;
}

export function ColorPicker({ value, onChange, excludeHex, label }: ColorPickerProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wide text-[var(--color-ivory)]/50 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {PLAYER_COLORS.map((c) => {
          const disabled = c.hex === excludeHex;
          const selected = c.hex === value;
          return (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(c.hex)}
              title={disabled ? `${c.name} (déjà pris)` : c.name}
              className={`relative w-9 h-9 rounded-full border-2 transition-transform ${
                selected ? 'border-[var(--color-ivory)] scale-110' : 'border-transparent'
              } ${disabled ? 'opacity-25 cursor-not-allowed' : 'hover:scale-105'}`}
              style={{ backgroundColor: c.hex }}
            >
              {selected && <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
