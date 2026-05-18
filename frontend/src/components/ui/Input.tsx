import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        const { theme } = useTheme();

        return (
            <div className="space-y-1">
                {label && (
                    <label className="text-sm font-medium text-gray-700 block">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={cn(
                        "w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow",
                        theme.borderRadius,
                        // Theme specific focus ring
                        `focus:ring-${theme.primary.replace('bg-', '')}`,
                        className
                    )}
                    {...props}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);
Input.displayName = 'Input';
