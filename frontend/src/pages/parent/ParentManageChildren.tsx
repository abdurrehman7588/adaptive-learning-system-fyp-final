import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { ManageChildrenSection } from '../../components/child/ManageChildrenSection';

export function ParentManageChildren() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 lg:p-10 max-w-3xl mx-auto space-y-6"
        >
            <Link
                to="/parent/settings"
                className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-900"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Settings
            </Link>

            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Manage Children</h1>
                    <p className="text-slate-500 text-sm mt-0.5">
                        View, add, edit, and remove learner profiles for your household.
                    </p>
                </div>
            </div>

            <Card className="p-6 md:p-8">
                <ManageChildrenSection variant="settings" />
            </Card>
        </motion.div>
    );
}
