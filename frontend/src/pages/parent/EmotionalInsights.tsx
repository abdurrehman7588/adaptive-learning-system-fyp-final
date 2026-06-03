import { useCallback, useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Loader2 } from 'lucide-react';
import { fetchChildAnalytics, getAnalyticsErrorMessage } from '../../api/analytics';
import { resolveActiveChildId } from '../../lib/activeChild';
import { getToken } from '../../lib/tokenStorage';

export const EmotionalInsights = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [childName, setChildName] = useState('your child');
    const [moodSummary, setMoodSummary] = useState('');
    const [focusAreas, setFocusAreas] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);

    const loadInsights = useCallback(async () => {
        if (!getToken()) {
            setError('Sign in as a parent to view insights.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const childId = await resolveActiveChildId();
            if (!childId) {
                setError('Add a learner profile in Settings to see insights.');
                setLoading(false);
                return;
            }
            const bundle = await fetchChildAnalytics(childId);
            const { analytics } = bundle;
            setChildName(bundle.child.name);

            const avg = analytics.summary.averageScorePercent;
            const speed = analytics.summary.learningSpeed;
            const recent = analytics.recentHistory[0];

            if (analytics.summary.completedAttempts === 0) {
                setMoodSummary(
                    `${bundle.child.name} has not completed a quiz yet. Encourage a short session to establish a baseline.`,
                );
                setFocusAreas(['Engagement (not started)', 'Confidence (unknown)']);
                setSuggestions([
                    'Start with a short recommended quiz',
                    'Celebrate the first completed attempt',
                ]);
            } else if (avg >= 75 && speed.signals.strong_understanding > speed.signals.weak_concept) {
                setMoodSummary(
                    `${bundle.child.name} shows steady confidence this week. Strong understanding signals outpace weak-concept flags.`,
                );
                setFocusAreas([
                    'Self-Motivation (High)',
                    `Resilience (${recent && recent.percentage < 60 ? 'Medium' : 'High'})`,
                ]);
                setSuggestions([
                    'Keep sessions under 20 minutes for focus',
                    'Introduce slightly harder recommended quizzes',
                ]);
            } else {
                setMoodSummary(
                    `${bundle.child.name} may need encouragement after tougher questions. Practice signals suggest revisiting weaker topics.`,
                );
                setFocusAreas([
                    'Persistence (Medium)',
                    `Concept clarity (${analytics.summary.weakestSubject?.label ?? 'mixed subjects'})`,
                ]);
                setSuggestions(
                    speed.weakConceptsFromTiming.slice(0, 2).map(
                        (c) => `Review ${c.label} with a short practice quiz`,
                    ).concat(['Take a break after two incorrect answers in a row']),
                );
            }
        } catch (err) {
            setError(getAnalyticsErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadInsights();
    }, [loadInsights]);

    return (
        <div className="space-y-6 p-6 lg:p-10 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold">Emotional Intelligence Insights</h1>
            <p className="text-gray-500">
                Inferred from quiz pace, accuracy, and recent performance for {childName}
            </p>

            {loading && (
                <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Loading insights...
                </div>
            )}
            {error && <p className="text-sm text-orange-600">{error}</p>}

            {!loading && !error && (
                <div className="grid gap-6">
                    <Card className="p-6 border-l-4 border-yellow-400">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-lg">Weekly Learning Mood</h3>
                            <span className="text-yellow-500 font-bold">📊 Live</span>
                        </div>
                        <p className="text-gray-600 mt-2">{moodSummary}</p>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-4">
                        <Card className="p-4 bg-blue-50">
                            <h4 className="font-bold text-blue-700 mb-2">Focus Areas</h4>
                            <ul className="list-disc ml-4 text-sm text-blue-800 space-y-1">
                                {focusAreas.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </Card>
                        <Card className="p-4 bg-green-50">
                            <h4 className="font-bold text-green-700 mb-2">Suggestions</h4>
                            <ul className="list-disc ml-4 text-sm text-green-800 space-y-1">
                                {suggestions.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};
