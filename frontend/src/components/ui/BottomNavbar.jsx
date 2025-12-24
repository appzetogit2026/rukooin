import React, { useState, useEffect } from 'react';
import { Home, Briefcase, Search, Wallet, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('Home');

    // Sync internal state with current route on mount/change
    useEffect(() => {
        const path = location.pathname;
        if (path === '/') setActiveTab('Home');
        else if (path.includes('bookings')) setActiveTab('Bookings');
        else if (path.includes('listings') || path.includes('search')) setActiveTab('Search');
        else if (path.includes('wallet')) setActiveTab('Wallet');
        else if (path.includes('refer')) setActiveTab('Refer & Earn');
    }, [location]);

    const navItems = [
        { name: 'Home', icon: Home, route: '/' },
        { name: 'Bookings', icon: Briefcase, route: '/bookings' },
        { name: 'Search', icon: Search, route: '/listings' },
        { name: 'Wallet', icon: Wallet, route: '/wallet' },
        { name: 'Refer & Earn', icon: Gift, route: '/refer' },
    ];

    const handleNavClick = (item) => {
        setActiveTab(item.name);
        navigate(item.route);
    };

    return (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
            <div className="
        bg-white/95 backdrop-blur-2xl 
        border border-white/40 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)]
        rounded-[24px]
        flex justify-between items-center 
        px-3 py-3
      ">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.name;

                    return (
                        <button
                            key={item.name}
                            onClick={() => handleNavClick(item)}
                            className="relative flex flex-col items-center justify-center w-full gap-1 p-1"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-x-2 inset-y-0 bg-accent/15 rounded-xl -z-10"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}

                            <Icon
                                size={22}
                                className={`transition-colors duration-200 ${isActive ? 'text-surface fill-surface/10' : 'text-gray-400'}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />

                            <span className={`text-[9px] font-bold tracking-wide transition-colors duration-200 ${isActive ? 'text-surface' : 'text-gray-400'}`}>
                                {item.name === 'Refer & Earn' ? 'Refer' : item.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomNavbar;
