import { useState } from 'react';
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
    Camera
} from 'lucide-react';

export const ParentSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [emailNotifications, setEmailNotifications] = useState(true);

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
            className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                    <p className="text-slate-500 mt-2">Manage your profile, preferences, and billing.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-teal-50 text-teal-600 font-bold shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-600" />}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
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
                                <Card className="p-8">
                                    <div className="flex items-center gap-6 mb-8">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-3xl font-bold border-4 border-white shadow-lg">
                                                {user?.name?.[0] || 'P'}
                                            </div>
                                            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-slate-100 hover:bg-slate-50 transition-colors">
                                                <Camera className="w-4 h-4 text-slate-600" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
                                            <p className="text-slate-500">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Full Name</label>
                                            <input
                                                type="text"
                                                defaultValue={user?.name}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                                            <input
                                                type="email"
                                                defaultValue={user?.email}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20">Save Changes</Button>
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
                                                onClick={() => setEmailNotifications(!emailNotifications)}
                                                className={`w-12 h-6 rounded-full transition-colors relative ${emailNotifications ? 'bg-teal-600' : 'bg-slate-300'}`}
                                            >
                                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${emailNotifications ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-6 mt-10">Appearance</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <button className="p-4 rounded-xl border-2 border-teal-600 bg-teal-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Moon className="w-5 h-5 text-teal-600" />
                                                <span className="font-medium text-teal-900">Light Mode</span>
                                            </div>
                                            <Check className="w-5 h-5 text-teal-600" />
                                        </button>
                                        <button className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between">
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
                                                <p className="text-slate-500 mt-1">Billed annually • Next billing on Dec 2026</p>
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
                                            <Button variant="outline">View Invoices</Button>
                                            <Button className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20">Manage Subscription</Button>
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
                                    <p className="text-slate-500">Password and 2FA settings would go here.</p>
                                </div>
                            </Card>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
