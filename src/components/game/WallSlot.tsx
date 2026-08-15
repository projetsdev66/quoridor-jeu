import { type KeyboardEvent, type PointerEvent } from 'react';
interface WallSlotProps {
  r: number;
  c: number;
  orientation: 'H' | 'V';
  isValid: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

export function WallSlot({
  r,
  c,
  orientation,
  isValid,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: WallSlotProps) {
  const cellPct = 9.0909;
  const gapPct = 2.2727;
  const lengthPct = cellPct * 2 + gapPct;
  const widthPct = gapPct;
  const hitPadding = 'clamp(8px, 2.5vw, 14px)';

  const top = orientation === 'H'
    ? `${r * (cellPct + gapPct) + cellPct}%`
    : `${r * (cellPct + gapPct)}%`;
  const left = orientation === 'V'
    ? `${c * (cellPct + gapPct) + cellPct}%`
    : `${c * (cellPct + gapPct)}%`;

  if (!isValid && !isHovered) return null;

  const label = `Placer un mur ${orientation === 'H' ? 'horizontal' : 'vertical'} ligne ${r + 1}, colonne ${c + 1}`;

  const activate = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  };

  const activateFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    onClick();
  };

  return (
    <div
      role="button"
      tabIndex={isValid ? 0 : -1}
      aria-label={label}
      aria-disabled={!isValid}
      className="absolute z-30 cursor-pointer touch-manipulation select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-wood-dark)]"
      style={{
        top: orientation === 'H' ? `calc(${top} - ${hitPadding})` : top,
        left: orientation === 'V' ? `calc(${left} - ${hitPadding})` : left,
        width: orientation === 'H' ? `${lengthPct}%` : `calc(${widthPct}% + ${hitPadding} * 2)`,
        height: orientation === 'H' ? `calc(${widthPct}% + ${hitPadding} * 2)` : `${lengthPct}%`,
      }}
      onPointerEnter={onHover}
      onPointerLeave={onLeave}
      onPointerUp={activate}
      onKeyDown={activateFromKeyboard}
    />
  );
}
