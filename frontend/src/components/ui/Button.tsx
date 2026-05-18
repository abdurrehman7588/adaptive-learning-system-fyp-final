import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

// Correct type definition to avoid conflicts
type MotionButtonProps = Omit<HTMLMotionProps<"button">, "ref"> & ButtonProps;

export const Button = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const { theme, ageGroup } = useTheme();

        const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: ageGroup === '4-7' ? 'px-8 py-4 text-xl' : 'px-6 py-3 text-lg',
        };

        const variants = {
            primary: cn('text-white shadow-md hover:shadow-lg', theme.primary),
            secondary: cn('text-gray-800 shadow-sm hover:bg-opacity-80', theme.secondary),
            outline: cn('border-2 bg-transparent', ageGroup === '4-7' ? 'border-orange-400 text-orange-600' : 'border-slate-300 text-slate-700'),
            ghost: 'hover:bg-slate-100 text-slate-600',
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                    baseStyles,
                    sizes[size],
                    variants[variant],
                    theme.borderRadius,
                    className
                )}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';
