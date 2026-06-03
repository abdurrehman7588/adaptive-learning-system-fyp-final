import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AVATARS } from '../../data/mockData';
import { motion } from 'framer-motion';
import { LogOut, Loader2, User, Users, Award } from 'lucide-react';
import {
    fetchStudentProfileBundle,
    formatLearnerAge,
    formatMemberSince,
    getStudentProfileErrorMessage,
    updateStudentAvatar,
    type StudentProfileBundle,
} from '../../api/studentProfile';
import { getToken } from '../../lib/tokenStorage';
import { useActiveLearnerProfile } from '../../hooks/useActiveLearnerProfile';

function ProfileRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
            <span className="text-sm font-semibold text-slate-500">{label}</span>
            <span className="text-sm font-bold text-slate-800 text-right">{value}</span>
        </div>
    );
}

export const StudentProfile = () => {
    const { logout } = useAuth();
    const { refresh: refreshLearner } = useActiveLearnerProfile();
    const [bundle, setBundle] = useState<StudentProfileBundle | null>(null);
    const [avatar, setAvatar] = useState('👤');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [savingAvatar, setSavingAvatar] = useState(false);
    const [avatarMessage, setAvatarMessage] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        if (!getToken()) {
            setBundle(null);
            setLoading(false);
            setError('Please sign in to view your profile.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await fetchStudentProfileBundle();
            setBundle(data);
            setAvatar(data.learner.avatar_url || '👤');
        } catch (err) {
            setError(getStudentProfileErrorMessage(err));
            setBundle(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    const handleAvatarSelect = async (emoji: string) => {
        setAvatar(emoji);
        setSavingAvatar(true);
        setAvatarMessage(null);
        try {
            await updateStudentAvatar(emoji);
            await refreshLearner();
            await loadProfile();
            setAvatarMessage('Avatar saved!');
        } catch (err) {
            setAvatarMessage(getStudentProfileErrorMessage(err));
        } finally {
            setSavingAvatar(false);
        }
    };

    const learner = bundle?.learner;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-6 font-sans pb-10 p-6 md:p-8"
        >
            <header className="text-center">
                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">
                    My Profile
                </h1>
                <p className="text-slate-500 font-medium mt-1">Your account and learner information</p>
            </header>

            {error && (
                <Card className="p-4 border-orange-200 bg-orange-50 text-orange-800">
                    <p className="text-sm font-medium">{error}</p>
                    <button
                        type="button"
                        onClick={() => void loadProfile()}
                        className="text-sm font-bold underline mt-2"
                    >
                        Try again
                    </button>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                </div>
            ) : bundle && learner ? (
                <>
                    <Card className="p-6 rounded-3xl border-2 border-teal-100 bg-white shadow-sm">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-24 h-24 rounded-2xl bg-teal-50 border-2 border-teal-100 flex items-center justify-center text-5xl mb-3">
                                {avatar}
                            </div>
                            <h2 className="text-2xl font-black text-slate-800">{learner.name}</h2>
                            <p className="text-xs text-slate-400 mt-1">Child ID: {learner.id}</p>
                        </div>

                        <section className="mb-6">
                            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-teal-700 mb-3">
                                <User className="w-4 h-4" />
                                Learner information
                            </h3>
                            <ProfileRow label="Name" value={learner.name} />
                            <ProfileRow
                                label="Username"
                                value={learner.username ? `@${learner.username}` : '—'}
                            />
                            <ProfileRow label="Age" value={formatLearnerAge(learner.age)} />
                            <ProfileRow label="Grade" value={learner.grade_level ?? '—'} />
                        </section>

                        <section className="mb-6">
                            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-cyan-700 mb-3">
                                <Users className="w-4 h-4" />
                                Parent information
                            </h3>
                            <ProfileRow label="Parent name" value={bundle.parent.name} />
                            <ProfileRow
                                label="Account"
                                value={
                                    bundle.parent.account_linked
                                        ? 'Parent account linked ✓'
                                        : '—'
                                }
                            />
                        </section>

                        <section>
                            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-amber-700 mb-3">
                                <Award className="w-4 h-4" />
                                Account information
                            </h3>
                            <ProfileRow
                                label="Level"
                                value={String(bundle.account.current_level)}
                            />
                            <ProfileRow label="XP" value={String(bundle.account.total_xp)} />
                            <ProfileRow
                                label="Badges earned"
                                value={String(bundle.account.badges_earned)}
                            />
                            <ProfileRow
                                label="Member since"
                                value={formatMemberSince(bundle.account.member_since)}
                            />
                            <p className="text-xs text-slate-400 mt-2 text-center">
                                {bundle.account.level_title}
                            </p>
                        </section>
                    </Card>

                    <Card className="p-6 rounded-3xl border-2 border-slate-100 bg-white">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            🎭 Choose your avatar
                            {savingAvatar && (
                                <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                            )}
                        </h3>
                        <div className="flex gap-3 flex-wrap justify-center">
                            {AVATARS.map((emoji, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => void handleAvatarSelect(emoji)}
                                    disabled={savingAvatar}
                                    className={`text-3xl p-3 bg-white rounded-2xl shadow-sm border transition-all disabled:opacity-50 ${
                                        avatar === emoji
                                            ? 'border-teal-400 ring-2 ring-teal-200'
                                            : 'border-slate-100 hover:border-teal-300'
                                    }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                        {avatarMessage && (
                            <p className="text-center text-sm text-teal-600 font-medium mt-3">
                                {avatarMessage}
                            </p>
                        )}
                    </Card>

                    <Card className="p-5 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/80 text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                            Learning preferences
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                            Difficulty preview — <span className="font-semibold">Coming soon</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Adaptive difficulty is set automatically from your quiz progress.
                        </p>
                    </Card>
                </>
            ) : null}

            <Button
                className="w-full border-red-100 bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 rounded-xl py-6 font-bold text-lg"
                onClick={logout}
            >
                <LogOut className="w-5 h-5 mr-2 inline" />
                Sign out
            </Button>
        </motion.div>
    );
};
