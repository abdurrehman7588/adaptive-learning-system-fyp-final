import { Card } from '../../components/ui/Card';

export const EmotionalInsights = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Emotional Intelligence Insights</h1>
            <p className="text-gray-500">Based on student check-ins (Mock Data)</p>

            <div className="grid gap-6">
                <Card className="p-6 border-l-4 border-yellow-400">
                    <div className="flex justify-between">
                        <h3 className="font-bold text-lg">Weekly Mood Pattern</h3>
                        <span className="text-yellow-500 font-bold">😊 Happy</span>
                    </div>
                    <p className="text-gray-600 mt-2">
                        Your child has been consistently positive this week. High engagement during Math quizzes correlates with better mood.
                    </p>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-blue-50">
                        <h4 className="font-bold text-blue-700 mb-2">Focus Areas</h4>
                        <ul className="list-disc ml-4 text-sm text-blue-800 space-y-1">
                            <li>Self-Motivation (High)</li>
                            <li>Resilience (Medium - Needs encouragement after wrong answers)</li>
                        </ul>
                    </Card>
                    <Card className="p-4 bg-green-50">
                        <h4 className="font-bold text-green-700 mb-2">Suggestions</h4>
                        <ul className="list-disc ml-4 text-sm text-green-800 space-y-1">
                            <li>Encourage breaks after 20 mins</li>
                            <li>Celebrate small wins in Logic puzzles</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};
