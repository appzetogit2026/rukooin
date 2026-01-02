import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Settings, Shield, Bell, CreditCard, ToggleLeft,
    ToggleRight, Save, Globe, Lock
} from 'lucide-react';

const ToggleSwitch = ({ enabled, onChange }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${enabled ? 'bg-black' : 'bg-gray-300'}`}
    >
        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
);

const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-700">
                <Icon size={18} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </div>
);

const AdminSettings = () => {
    const [platformOpen, setPlatformOpen] = useState(true);
    const [maintenance, setMaintenance] = useState(false);
    const [autoPayout, setAutoPayout] = useState(false);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
                <p className="text-gray-500 text-sm">Configure global rules, commission rates, and system preferences.</p>
            </div>

            <Section title="General Configuration" icon={Globe}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Platform Status</p>
                        <p className="text-sm text-gray-500">Enable or disable booking capability globally.</p>
                    </div>
                    <ToggleSwitch enabled={platformOpen} onChange={setPlatformOpen} />
                </div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Maintenance Mode</p>
                        <p className="text-sm text-gray-500">Show maintenance screen to all users.</p>
                    </div>
                    <ToggleSwitch enabled={maintenance} onChange={setMaintenance} />
                </div>
            </Section>

            <Section title="Subscription Management" icon={CreditCard}>
                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-4">Platform Access Plans</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Basic Plan (₹)</label>
                                <input type="number" defaultValue={5000} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Premium Plan (₹)</label>
                                <input type="number" defaultValue={15000} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black" />
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-bold text-orange-600 mb-4">Market Intelligence Plans</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Market Lite (₹)</label>
                                <input type="number" defaultValue={3000} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Market Pro (₹)</label>
                                <input type="number" defaultValue={8000} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black" />
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="Financial Rules" icon={Globe}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Commission (%)</label>
                        <input type="number" defaultValue={15} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">GST / Tax Rate (%)</label>
                        <input type="number" defaultValue={18} className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black" />
                    </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                    <div>
                        <p className="font-medium text-gray-900">Automatic Payouts</p>
                        <p className="text-sm text-gray-500">Automatically release payments to hotels every Monday.</p>
                    </div>
                    <ToggleSwitch enabled={autoPayout} onChange={setAutoPayout} />
                </div>
            </Section>

            <Section title="Security & Access" icon={Shield}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-900">Two-Factor Auth (Admin)</p>
                        <p className="text-sm text-gray-500">Force 2FA for all admin accounts.</p>
                    </div>
                    <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">ENABLED</span>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Session Timeout (Minutes)</label>
                    <select className="w-full p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black bg-white">
                        <option>15 Minutes</option>
                        <option>30 Minutes</option>
                        <option>1 Hour</option>
                    </select>
                </div>
            </Section>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <button className="flex items-center gap-2 px-8 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl active:scale-95">
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
