import React from 'react';
import { cn } from '../../lib/utils';

export interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, placeholder, value, ...props }, ref) => {
        const showPlaceholder = placeholder && (value === '' || value === undefined);

        return (
            <div className="space-y-1">
                {label && (
                    <label className="text-sm font-medium text-slate-700 block">{label}</label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        value={value ?? ''}
                        className={cn(
                            'w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-slate-200',
                            'bg-white text-slate-900 text-base',
                            'focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500',
                            'transition-all disabled:bg-slate-50 disabled:text-slate-400',
                            showPlaceholder ? 'text-slate-400' : '',
                            className,
                        )}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <span
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        aria-hidden
                    >
                        ▾
                    </span>
                </div>
                {error && (
                    <p className="text-sm text-red-600" role="alert">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);

Select.displayName = 'Select';
