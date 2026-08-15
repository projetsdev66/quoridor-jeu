import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        brass: 'border-[var(--color-brass)]/35 bg-[var(--color-brass)]/10 text-[var(--color-brass)]',
        wood: 'border-[#5c3a24] bg-[var(--color-wood-medium)] text-[var(--color-ivory)]/75',
        success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
        warning: 'border-amber-300/30 bg-amber-500/10 text-amber-200',
        danger: 'border-red-400/30 bg-red-500/10 text-red-200',
      },
    },
    defaultVariants: { variant: 'wood' },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
