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
          <label htmlFor={id} className="block text-sm font-medium text-stone-700 mb-1">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={twMerge(
            'appearance-none block w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
