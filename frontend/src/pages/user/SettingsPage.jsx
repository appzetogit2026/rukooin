import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Lock, Globe, Moon, CreditCard, ChevronRight, LogOut } from 'lucide-react';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState(true);

    const sections = [
        {
            title: "Preferences",
            items: [
                { icon: Bell, label: "Push Notifications", type: "toggle", value: notifications, onToggle: () => setNotifications(!notifications) },
                { icon: Globe, label: "Language", type: "link", value: "English (US)" },
                { icon: Moon, label: "Dark Mode", type: "toggle", value: false }, // Mocked
            ]
        },
        {
            title: "Security & Payments",
            items: [
                { icon: Lock, label: "Privacy Settings", type: "link" },
                { icon: CreditCard, label: "Saved Cards", type: "link" },
            ]
        }
    ];

    const handleLogout = () => {
        // Clear local storage or session tokens
        localStorage.clear();
        // Navigate to login
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-surface text-white p-6 pb-12 rounded-b-[30px] shadow-lg sticky top-0 z-20">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Settings</h1>
                </div>
                <h2 className="text-2xl font-black">App Preferences</h2>
            </div>

            <div className="px-5 -mt-6 relative z-10 space-y-6 pb-24">

                {sections.map((section, idx) => (
                    <div key={idx}>
                        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3 ml-2">{section.title}</h3>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {section.items.map((item, i) => (
                                <div key={i} className={`flex items-center justify-between p-4 ${i !== section.items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surface/5 flex items-center justify-center text-surface">
                                            <item.icon size={16} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                    </div>

                                    {item.type === 'toggle' ? (
                                        <button
                                            onClick={item.onToggle}
                                            className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${item.value ? 'bg-surface' : 'bg-gray-200'}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${item.value ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            {item.value && <span className="text-xs text-gray-400 font-medium">{item.value}</span>}
                                            <ChevronRight size={16} className="text-gray-300" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 hover:bg-red-100 transition"
                >
                    <LogOut size={18} />
                    Log Out
                </button>

                <p className="text-center text-xs text-gray-400 mt-4">App Version 1.0.2</p>
            </div>
        </div>
    );
};

export default SettingsPage;
