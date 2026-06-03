import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type OnboardingShellProps = {
    step: number;
    totalSteps: number;
    title: string;
    subtitle: string;
    children: ReactNode;
};

export function OnboardingShell({
    step,
    totalSteps,
    title,
    subtitle,
    children,
}: OnboardingShellProps) {
    const progress = Math.round((step / totalSteps) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-4 py-10">
            <div className="mx-auto max-w-lg">
                <div className="mb-8">
                    <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                        Step {step} of {totalSteps}
                    </p>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-teal-100">
                        <div
                            className="h-full rounded-full bg-teal-600 transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-white/80 bg-white/95 p-8 shadow-xl shadow-teal-500/10"
                >
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    <p className="mt-2 text-slate-600">{subtitle}</p>
                    <div className="mt-8">{children}</div>
                </motion.div>
            </div>
        </div>
    );
}
