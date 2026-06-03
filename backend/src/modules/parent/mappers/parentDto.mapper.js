const defaultPreferences = () => ({
  emailNotifications: true,
  weeklyReportEmail: false,
  learningGoals: [],
  childInterests: [],
  preferredLanguage: null,
});

export function normalizePreferences(raw) {
  const base = defaultPreferences();
  if (!raw || typeof raw !== 'object') return base;
  return {
    emailNotifications:
      typeof raw.emailNotifications === 'boolean'
        ? raw.emailNotifications
        : base.emailNotifications,
    weeklyReportEmail:
      typeof raw.weeklyReportEmail === 'boolean'
        ? raw.weeklyReportEmail
        : base.weeklyReportEmail,
    learningGoals: Array.isArray(raw.learningGoals)
      ? raw.learningGoals.filter((x) => typeof x === 'string').slice(0, 10)
      : base.learningGoals,
    childInterests: Array.isArray(raw.childInterests)
      ? raw.childInterests.filter((x) => typeof x === 'string').slice(0, 10)
      : base.childInterests,
    preferredLanguage:
      typeof raw.preferredLanguage === 'string' ? raw.preferredLanguage : base.preferredLanguage,
  };
}

export function buildOnboardingStatus(profileRow, childCount) {
  const completed = profileRow?.onboardingCompleted ?? false;
  const skipped = profileRow?.onboardingSkipped ?? false;
  const hasChildren = childCount > 0;

  let suggestedNextStep = 'set_preferences';
  if (hasChildren && (completed || skipped)) {
    suggestedNextStep = 'done';
  } else if (hasChildren) {
    suggestedNextStep = 'done';
  } else if (completed || skipped) {
    suggestedNextStep = 'create_child';
  }

  return {
    completed,
    skipped,
    hasChildren,
    suggestedNextStep,
  };
}

export function buildParentProfileResponse(user, profileRow, childCount) {
  const preferences = normalizePreferences(profileRow?.preferences);

  return {
    parentId: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? null,
    preferredLanguage: profileRow?.preferredLanguage ?? preferences.preferredLanguage ?? null,
    preferences,
    onboarding: buildOnboardingStatus(profileRow, childCount),
  };
}
