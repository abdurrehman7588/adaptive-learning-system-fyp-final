import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
    User,
    Bell,
    Shield,
    CreditCard,
    Moon,
    Check,
    Camera,
    Loader2,
    Users,
    ChevronRight,
} from 'lucide-react';
import { updateParentProfileName, getLoginErrorMessage } from '../../api/auth';
import {
    fetchChildAnalytics,
    formatRelativeTime,
    type RecentAttempt,
} from '../../api/analytics';
import { resolveActiveChildId } from '../../lib/activeChild';
import { loadParentPreferences, saveParentPreferences } from '../../lib/parentPreferences';
import { fetchParentProfile, updateParentPreferences, getParentApiErrorMessage } from '../../api/parent';
import { getToken } from '../../lib/tokenStorage';
import { mobileTabButton, mobileTabStrip, pageShell } from '../../lib/responsive';
import { cn } from '../../lib/utils';

export const ParentSettings = () => {
    const { user, patchUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [profileName, setProfileName] = useState(user?.name ?? '');
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [recentActivity, setRecentActivity] = useState<RecentAttempt[]>([]);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState<string | null>(null);
    const [prefsMessage, setPrefsMessage] = useState<string | null>(null);

    useEffect(() => {
        setProfileName(user?.name ?? '');
    }, [user?.name]);

    useEffect(() => {
        if (!user?.id) return;

        const loadPrefs = async () => {
            if (getToken()) {
                try {
                    const profile = await fetchParentProfile();
                    setEmailNotifications(profile.preferences.emailNotifications);
                    saveParentPreferences(user.id, {
                        emailNotifications: profile.preferences.emailNotifications,
                    });
                    return;
                } catch {
                    // Fall back to local storage when API unavailable
                }
            }
            const prefs = loadParentPreferences(user.id);
            setEmailNotifications(prefs.emailNotifications);
        };

        void loadPrefs();
    }, [user?.id]);

    const loadRecentActivity = useCallback(async () => {
        if (!getToken()) {
            setRecentActivity([]);
            return;
        }
        try {
            const childId = await resolveActiveChildId();
            if (!childId) {
                setRecentActivity([]);
                return;
            }
            const bundle = await fetchChildAnalytics(childId);
            setRecentActivity(bundle.analytics.recentHistory.slice(0, 6));
        } catch {
            setRecentActivity([]);
        }
    }, []);

    useEffect(() => {
        void loadRecentActivity();
    }, [loadRecentActivity]);

    const handleSaveProfile = async () => {
        if (!profileName.trim()) {
            setProfileMessage('Name is required.');
            return;
        }
        setProfileSaving(true);
        setProfileMessage(null);
        try {
            if (getToken()) {
                const updated = await updateParentProfileName(profileName.trim());
                patchUser({ name: updated.name, email: updated.email });
                setProfileMessage('Profile saved successfully.');
            } else {
                patchUser({ name: profileName.trim() });
                setProfileMessage('Profile updated locally.');
            }
        } catch (err) {
            setProfileMessage(getLoginErrorMessage(err));
        } finally {
            setProfileSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        if (!user?.id) return;
        setPrefsMessage(null);
        try {
            if (getToken()) {
                await updateParentPreferences({ emailNotifications });
                saveParentPreferences(user.id, { emailNotifications });
                setPrefsMessage('Notification preferences saved.');
                return;
            }
            saveParentPreferences(user.id, { emailNotifications });
            setPrefsMessage('Notification preferences saved on this device.');
        } catch (err) {
            setPrefsMessage(getParentApiErrorMessage(err));
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Bell },
        { id: 'subscription', label: 'Subscription', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(pageShell, 'space-y-6 sm:space-y-8 max-w-5xl')}
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 break-words">Account Settings</h1>
                    <p className="text-slate-500 mt-2">Manage your profile, preferences, and billing.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-w-0">
                <div className={cn(mobileTabStrip, 'md:flex-col md:overflow-visible md:space-y-2 md:w-64 md:flex-shrink-0 md:pb-0 md:mx-0 md:px-0')}>
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    mobileTabButton,
                                    'md:w-full md:flex md:items-center md:gap-3 md:px-4 md:py-3 md:rounded-xl md:snap-none',
                                    isActive
                                        ? 'bg-teal-50 text-teal-600 font-bold shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 bg-white border border-slate-100 md:border-0',
                                )}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span className="whitespace-nowrap">{tab.label}</span>
                                {isActive && <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-teal-600" />}
                            </button>
                        );
                    })}
                </div>

                <div className="flex-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <Card className="p-5 sm:p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-3xl font-bold border-4 border-white shadow-lg">
                                                {profileName?.[0] || user?.name?.[0] || 'P'}
                                            </div>
                                            <button
                                                type="button"
                                                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 hover:bg-slate-50 transition-colors"
                                                aria-label="Profile photo"
                                            >
                                                <Camera className="w-4 h-4 text-slate-600" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{profileName || user?.name}</h3>
                                            <p className="text-slate-500">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                                            <input
                                                type="text"
                                                value={profileName}
                                                onChange={(e) => setProfileName(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                                            <input
                                                type="email"
                                                value={user?.email ?? ''}
                                                readOnly
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                                            />
                                        </div>
                                    </div>

                                    {profileMessage && (
                                        <p className="mt-4 text-sm text-teal-700 font-medium">{profileMessage}</p>
                                    )}

                                    <div className="mt-8 flex justify-end">
                                        <Button
                                            className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20"
                                            onClick={() => void handleSaveProfile()}
                                            disabled={profileSaving}
                                        >
                                            {profileSaving ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="p-8">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100">
                                            <Users className="w-6 h-6 text-teal-700" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-slate-900">Manage Children</h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Add, edit, or remove learner profiles. Choose which child is
                                                active for quizzes and reports.
                                            </p>
                                            <Link
                                                to="/parent/settings/children"
                                                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                                            >
                                                Open Manage Children
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'preferences' && (
                            <div className="space-y-6">
                                <Card className="p-8">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6">Notifications</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Bell className="w-5 h-5 text-slate-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">Email Notifications</p>
                                                    <p className="text-sm text-slate-500">Receive weekly progress reports</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setEmailNotifications(!emailNotifications)}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${emailNotifications ? 'bg-teal-600' : 'bg-slate-300'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${emailNotifications ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {prefsMessage && (
                                        <p className="mt-4 text-sm text-teal-700">{prefsMessage}</p>
                                    )}
                                    <div className="mt-6 flex justify-end">
                                        <Button
                                            variant="outline"
                                            onClick={handleSavePreferences}
                                        >
                                            Save Preferences
                                        </Button>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-4 mt-10">Recent Activity</h3>
                                    {recentActivity.length === 0 ? (
                                        <p className="text-sm text-slate-500">
                                            No quiz activity yet for the active learner. Complete a quiz to see updates here.
                                        </p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {recentActivity.map((item) => (
                                                <li
                                                    key={item.attemptId}
                                                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100"
                                                >
                                                    <div>
                                                        <p className="font-medium text-slate-800">{item.quizTitle}</p>
                                                        <p className="text-xs text-slate-500">
                                                            {item.subjectLabel} · {item.percentage}% score
                                                        </p>
                                                    </div>
                                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                                        {formatRelativeTime(item.completedAt)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    <h3 className="text-lg font-bold text-slate-900 mb-6 mt-10">Appearance</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <button type="button" className="p-4 rounded-xl border-2 border-teal-600 bg-teal-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Moon className="w-5 h-5 text-teal-600" />
                                                <span className="font-medium text-teal-900">Light Mode</span>
                                            </div>
                                            <Check className="w-5 h-5 text-teal-600" />
                                        </button>
                                        <button type="button" className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Moon className="w-5 h-5 text-slate-400" />
                                                <span className="font-medium text-slate-600">Dark Mode</span>
                                            </div>
                                        </button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'subscription' && (
                            <div className="space-y-6">
                                <Card className="p-8 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-8">
                                            <div>
                                                <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Current Plan</span>
                                                <h3 className="text-3xl font-bold text-slate-900 mt-3">Pro Family</h3>
                                                <p className="text-slate-500 mt-1">FYP demo plan · Billing not connected</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-3xl font-bold text-slate-900">$12<span className="text-lg text-slate-400 font-normal">/mo</span></span>
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-8">
                                            {['Unlimited Student Profiles', 'Advanced Analytics & Reports', 'Priority Support', 'Offline Access'].map((feature) => (
                                                <div key={feature} className="flex items-center gap-2 text-slate-700">
                                                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                                        <Check className="w-3 h-3 text-emerald-600" />
                                                    </div>
                                                    <span className="text-sm font-medium">{feature}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-4">
                                            <Button variant="outline" disabled title="Demo only">
                                                View Invoices
                                            </Button>
                                            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20" disabled title="Demo only">
                                                Manage Subscription
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                        {activeTab === 'security' && (
                            <Card className="p-8">
                                <div className="text-center py-12">
                                    <Shield className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-900">Security Settings</h3>
                                    <p className="text-slate-500">Password changes use the login flow in this FYP build.</p>
                                </div>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
