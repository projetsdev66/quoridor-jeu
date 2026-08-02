import { type Wall } from '@/lib/gameLogic';

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
  onClick
}: WallSlotProps) {
  const cellPct = 9.0909;
  const gapPct = 2.2727;

  const lengthPct = cellPct * 2 + gapPct;
  const widthPct = gapPct;

  // We add some touch padding using calc()
  const hitPadding = '12px';

  const top = orientation === 'H' 
    ? `${r * (cellPct + gapPct) + cellPct}%` 
    : `${r * (cellPct + gapPct)}%`;
    
  const left = orientation === 'V'
    ? `${c * (cellPct + gapPct) + cellPct}%`
    : `${c * (cellPct + gapPct)}%`;

  if (!isValid && !isHovered) return null;

  return (
    <div
      className="absolute z-30 cursor-pointer touch-manipulation"
      style={{
        top: orientation === 'H' ? `calc(${top} - ${hitPadding})` : top,
        left: orientation === 'V' ? `calc(${left} - ${hitPadding})` : left,
        width: orientation === 'H' ? `${lengthPct}%` : `calc(${widthPct}% + ${hitPadding} * 2)`,
        height: orientation === 'H' ? `calc(${widthPct}% + ${hitPadding} * 2)` : `${lengthPct}%`,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    />
  );
}
