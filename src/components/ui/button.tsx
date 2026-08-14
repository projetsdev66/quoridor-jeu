import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brass)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-wood-dark)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        brass: 'bg-gradient-to-br from-[var(--color-brass)] to-[#a8793a] text-[#180f0a] shadow-[0_10px_30px_-8px_rgba(201,154,82,0.55)] hover:-translate-y-0.5 hover:brightness-105',
        wood: 'border border-transparent bg-[var(--color-wood-medium)] text-[var(--color-ivory)] hover:-translate-y-0.5 hover:border-[#5c3a24] hover:bg-[#4a2e1b]',
        outline: 'border border-[var(--color-brass)]/35 bg-[var(--color-brass)]/10 text-[var(--color-brass)] hover:-translate-y-0.5 hover:bg-[var(--color-brass)]/20',
        ghost: 'text-[var(--color-ivory)]/65 hover:bg-[var(--color-wood-medium)]/60 hover:text-[var(--color-ivory)]',
        destructive: 'border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20',
      },
      size: {
        sm: 'min-h-9 px-3',
        md: 'min-h-10 px-4',
        lg: 'min-h-12 px-5 text-base',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'wood',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
