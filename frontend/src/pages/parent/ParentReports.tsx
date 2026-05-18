import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Calendar, Download, Filter, Award, TrendingUp, AlertCircle } from 'lucide-react';

const SUBJECTS = ['All Subjects', 'Mathematics', 'Science', 'Language Arts', 'History'];
const RANGES = ['Last 7 Days', 'Last 30 Days', 'This Month', 'Last Month'];

const MOCK_DATA = {
    weekly: [
        { day: 'Mon', math: 85, science: 70, history: 90 },
        { day: 'Tue', math: 88, science: 75, history: 85 },
        { day: 'Wed', math: 92, science: 72, history: 88 },
        { day: 'Thu', math: 80, science: 85, history: 92 },
        { day: 'Fri', math: 95, science: 90, history: 85 },
        { day: 'Sat', math: 85, science: 88, history: 95 },
        { day: 'Sun', math: 90, science: 92, history: 90 },
    ],
    skills: [
        { subject: 'Logic', A: 120, fullMark: 150 },
        { subject: 'Memory', A: 98, fullMark: 150 },
        { subject: 'Creativity', A: 86, fullMark: 150 },
        { subject: 'Focus', A: 99, fullMark: 150 },
        { subject: 'Speed', A: 85, fullMark: 150 },
        { subject: 'Accuracy', A: 65, fullMark: 150 },
    ]
};

export const ParentReports = () => {
    const [selectedSubject, setSelectedSubject] = useState('All Subjects');
    const [selectedRange, setSelectedRange] = useState('Last 7 Days');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => setIsExporting(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto"
        >
            {/* Header with Filters */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Performance Reports</h1>
                    <p className="text-slate-500 mt-2">Deep dive into learning patterns and achievements.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <select
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer shadow-sm"
                        >
                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <Filter className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={selectedRange}
                            onChange={(e) => setSelectedRange(e.target.value)}
                            className="appearance-none bg-white border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer shadow-sm"
                        >
                            {RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-teal-700 active:scale-95 transition-all shadow-lg shadow-teal-500/25"
                    >
                        {isExporting ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            >
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                            </motion.div>
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-3 gap-6">
                <MetricCard
                    title="Average Score"
                    value="92%"
                    trend="+4%"
                    icon={Award}
                    color="teal"
                />
                <MetricCard
                    title="Study Time"
                    value="14h 30m"
                    trend="+1.5h"
                    icon={TrendingUp}
                    color="cyan"
                />
                <MetricCard
                    title="Areas to Improve"
                    value="Geometry"
                    trend="Needs Focus"
                    icon={AlertCircle}
                    color="amber"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Trends Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Subject Performance Trends</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={MOCK_DATA.weekly}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Line type="monotone" dataKey="math" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: '#0d9488' }} activeDot={{ r: 6 }} name="Math" />
                                <Line type="monotone" dataKey="science" stroke="#0891b2" strokeWidth={3} dot={{ r: 4, strokeWidth: 0, fill: '#0891b2' }} activeDot={{ r: 6 }} name="Science" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Skills Radar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Cognitive Skills</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MOCK_DATA.skills}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skills"
                                    dataKey="A"
                                    stroke="#0d9488"
                                    strokeWidth={3}
                                    fill="#0d9488"
                                    fillOpacity={0.2}
                                />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

// Helper Component for Metrics
const MetricCard = ({ title, value, trend, icon: Icon, color }: any) => {
    const colors: any = {
        teal: "text-teal-600 bg-teal-50",
        cyan: "text-cyan-600 bg-cyan-50",
        amber: "text-amber-600 bg-amber-50"
    };

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-bold text-slate-900">{value}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>
                        {trend}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}
