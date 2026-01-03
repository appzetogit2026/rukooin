import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Wallet, Heart, Gift, HelpCircle, FileText, Shield, ChevronRight, LogOut, Settings, BookOpen, Building, Briefcase, Bell } from 'lucide-react';
import logo from '../../assets/rokologin-removebg-preview.png';

import { useNavigate } from 'react-router-dom';

const MobileMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    // Grouped Menu Items
    const bookingItems = [
        { icon: BookOpen, label: 'My Bookings', path: '/bookings' },
        { icon: Heart, label: 'Saved Places', path: '/saved-places' },
        { icon: Wallet, label: 'View Wallet', path: '/wallet' },
    ];

    const growthItems = [
        { icon: Building, label: 'List your property', path: '/partner-landing' },
        { icon: Briefcase, label: 'Corporates / Partner', path: '/partner-landing' },
        { icon: Gift, label: 'Refer & Earn', path: '/refer' },
    ];

    const settingItems = [
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
        { icon: HelpCircle, label: 'Need Help?', path: '/support' },
    ];

    const legalItems = [
        { icon: Shield, label: 'Privacy Policy', path: '/legal' },
        { icon: FileText, label: 'Terms & Conditions', path: '/legal' },
    ];

    const handleNavigation = (path) => {
        if (path) {
            navigate(path);
            onClose();
        }
    };

    const MenuItem = ({ icon: Icon, label, path, onClick }) => (
        <button
            onClick={() => handleNavigation(path)}
            className="flex items-center gap-4 w-full p-2.5 hover:bg-gray-50 rounded-xl transition-all group active:scale-95"
        >
            <div className="w-8 h-8 rounded-full bg-surface/5 flex items-center justify-center group-hover:bg-surface/10 transition-colors">
                <Icon size={16} className="text-surface" />
            </div>
            <span className="flex-1 text-left font-medium text-gray-700 text-sm">{label}</span>
            <ChevronRight size={14} className="text-gray-300 group-hover:text-surface transition-colors" />
        </button>
    );

    const handleLogout = () => {
        // Clear local storage or session tokens
        localStorage.clear();
        // Close menu
        onClose();
        // Navigate to login
        navigate('/login');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] md:hidden"
                    />

                    {/* Slide-in Panel */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'tween', ease: 'circOut', duration: 0.4 }}
                        className="fixed top-0 left-0 h-full w-[85%] max-w-[300px] bg-white z-[100] overflow-y-auto md:hidden shadow-2xl"
                    >
                        {/* Header & Close */}
                        <div className="flex items-center justify-between p-5 pb-2">
                            <img src={logo} alt="Rukko" className="h-14 object-contain" />
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition border border-gray-100"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* User Profile Card */}
                        <div className="px-5 mb-4">
                            <div className="bg-surface rounded-2xl p-4 text-white shadow-lg shadow-surface/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>

                                <div className="flex items-center gap-3 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                                        <User size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base leading-tight">Guest User</h3>
                                        <p className="text-[10px] text-white/70">Sign in for better experience</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => handleNavigation('/login')} className="flex-1 py-2 bg-white text-surface text-xs font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                                        Login
                                    </button>
                                    <button onClick={() => handleNavigation('/signup')} className="flex-1 py-2 bg-white/10 text-white border border-white/20 text-xs font-bold rounded-lg hover:bg-white/20 transition-colors">
                                        Signup
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Menu Sections */}
                        <div className="px-5 space-y-4 pb-10">
                            {/* Section 1: Travel */}
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">Travel & Stays</h4>
                                <div className="flex flex-col gap-1">
                                    {bookingItems.map((item, idx) => <MenuItem key={idx} {...item} />)}
                                </div>
                            </div>

                            {/* Section 2: Growth */}
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">Grow with Rukko</h4>
                                <div className="flex flex-col gap-1">
                                    {growthItems.map((item, idx) => <MenuItem key={idx} {...item} />)}
                                </div>
                            </div>

                            {/* Section 3: App Settings */}
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 pl-2">App Settings</h4>
                                <div className="flex flex-col gap-1">
                                    {settingItems.map((item, idx) => <MenuItem key={idx} {...item} />)}
                                </div>
                            </div>

                            {/* Section 4: Legal */}
                            <div className="pt-2 border-t border-gray-100">
                                {legalItems.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleNavigation(item.path)}
                                        className="flex items-center gap-3 w-full p-2 hover:text-surface transition-colors"
                                    >
                                        <span className="text-xs font-medium text-gray-400 hover:text-surface">{item.label}</span>
                                    </button>
                                ))}
                                <button
                                    onClick={handleLogout}
                                    className="mt-4 flex items-center gap-2 text-red-500 font-medium text-xs px-2 hover:opacity-80"
                                >
                                    <LogOut size={14} /> Log Out
                                </button>
                            </div>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileMenu;
