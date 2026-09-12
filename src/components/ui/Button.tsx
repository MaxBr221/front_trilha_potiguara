import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-70';
    
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary shadow-sm',
      outline: 'border border-stone-200 bg-white text-foreground hover:bg-stone-50 focus:ring-stone-200',
      ghost: 'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(baseStyles, variants[variant], 'py-3 px-4', className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
