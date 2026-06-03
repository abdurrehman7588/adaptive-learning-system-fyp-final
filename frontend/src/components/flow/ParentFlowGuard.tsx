import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useParentFlow } from '../../context/ParentFlowContext';
import { isPathAllowedForDestination } from '../../flow/parentAppFlow';

function FlowLoadingScreen({ message }: { message: string }) {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-slate-600">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );
}

/**
 * Centralized parent route guard — redirects to the flow coordinator destination.
 */
export function ParentFlowGuard() {
    const { isLoading, error, destination, refreshFlow } = useParentFlow();
    const location = useLocation();

    if (isLoading) {
        return <FlowLoadingScreen message="Loading your account..." />;
    }

    if (error) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
                <p className="text-sm text-red-700">{error}</p>
                <button
                    type="button"
                    onClick={() => void refreshFlow()}
                    className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (destination === '/parent/login') {
        return <Navigate to="/parent/login" replace />;
    }

    if (!isPathAllowedForDestination(location.pathname, destination)) {
        return <Navigate to={destination} replace />;
    }

    return <Outlet />;
}
