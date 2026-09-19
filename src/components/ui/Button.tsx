'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "size" | "children"> {
  isLoading?: boolean;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-full text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary shadow-sm',
      outline: 'border border-stone-200 bg-white text-foreground hover:bg-stone-50 focus:ring-stone-200',
      ghost: 'bg-transparent text-primary hover:bg-primary/10 focus:ring-primary',
    };

    const sizes = {
      sm: 'py-2 px-3 text-xs',
      md: 'py-3 px-4 text-sm',
      lg: 'py-4 px-8 text-base',
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(baseStyles, variants[variant], sizes[size], className)}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        {...props}
      >
        {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Botao';
