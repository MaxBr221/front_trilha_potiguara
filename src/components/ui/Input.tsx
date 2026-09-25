import { InputHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={twMerge(
            'appearance-none block w-full px-3 py-2 border border-stone-300 dark:border-stone-700 rounded-lg shadow-sm placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-stone-900 dark:text-stone-100 bg-white dark:bg-stone-800',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'CampoTexto';
