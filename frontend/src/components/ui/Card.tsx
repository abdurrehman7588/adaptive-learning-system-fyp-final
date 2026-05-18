import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

// Combine HTMLDivElement props with HTMLMotionProps
type CardProps = React.HTMLAttributes<HTMLDivElement> & HTMLMotionProps<"div">;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, children, ...props }, ref) => {
        const { theme } = useTheme();

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                    'bg-white shadow-sm border border-slate-100 overflow-hidden',
                    theme.borderRadius,
                    className
                )}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';
