import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchChildProfile, type ChildProfile } from '../api/children';
import { resolveActiveChildId } from '../lib/activeChild';
import { getToken } from '../lib/tokenStorage';

export type ActiveLearnerProfileState = {
    profile: ChildProfile | null;
    /** Child.name — use for all student-facing copy */
    learnerName: string;
    learnerFirstName: string;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
};

const FALLBACK_NAME = 'Learner';

/**
 * Resolves the active Child profile for student UI (greetings, headers, profile).
 * Do not use AuthContext user.name for learner-facing text.
 */
export function useActiveLearnerProfile(): ActiveLearnerProfileState {
    const [profile, setProfile] = useState<ChildProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!getToken()) {
            setProfile(null);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const childId = await resolveActiveChildId();
            if (!childId) {
                setProfile(null);
                return;
            }
            const child = await fetchChildProfile(childId);
            setProfile(child);
        } catch (err) {
            setProfile(null);
            setError(err instanceof Error ? err.message : 'Could not load learner profile.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const learnerName = useMemo(() => {
        const raw = profile?.name?.trim();
        return raw && raw.length > 0 ? raw : FALLBACK_NAME;
    }, [profile?.name]);

    const learnerFirstName = useMemo(
        () => learnerName.split(/\s+/)[0] ?? FALLBACK_NAME,
        [learnerName],
    );

    return {
        profile,
        learnerName,
        learnerFirstName,
        loading,
        error,
        refresh,
    };
}
