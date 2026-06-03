const PREFS_PREFIX = 'klp-parent-prefs';

export type ParentPreferences = {
    emailNotifications: boolean;
};

const defaultPreferences = (): ParentPreferences => ({
    emailNotifications: true,
});

export function loadParentPreferences(userId: string | number): ParentPreferences {
    const raw = localStorage.getItem(`${PREFS_PREFIX}-${userId}`);
    if (!raw) return defaultPreferences();
    try {
        const parsed = JSON.parse(raw) as Partial<ParentPreferences>;
        return {
            emailNotifications:
                typeof parsed.emailNotifications === 'boolean'
                    ? parsed.emailNotifications
                    : true,
        };
    } catch {
        return defaultPreferences();
    }
}

export function saveParentPreferences(
    userId: string | number,
    prefs: ParentPreferences,
): void {
    localStorage.setItem(`${PREFS_PREFIX}-${userId}`, JSON.stringify(prefs));
}
