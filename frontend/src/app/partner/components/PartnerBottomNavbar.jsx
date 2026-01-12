import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Briefcase, Wallet, UserCircle, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const PartnerBottomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Sync internal state with current route on mount/change
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('dashboard') || path === '/hotel') setActiveTab('Dashboard');
    else if (path.includes('properties')) setActiveTab('Properties');
    else if (path.includes('bookings')) setActiveTab('Bookings');
    else if (path.includes('wallet')) setActiveTab('Wallet');
    else if (path.includes('profile')) setActiveTab('Profile');
  }, [location]);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, route: '/hotel/dashboard' },
    { name: 'Properties', icon: Building, route: '/hotel/properties' },
    { name: 'Bookings', icon: Briefcase, route: '/hotel/bookings' },
    // { name: 'Wallet', icon: Wallet, route: '/hotel/wallet' }, // Hiding Wallet if space is tight, but actually 5 items fit usually. Let's keep 5 or remove one?
    // User image shows 4 items. Adding one makes 5.
    // Let's keep Wallet and Profile. 5 items is standard mobile pattern.
    { name: 'Wallet', icon: Wallet, route: '/hotel/wallet' },
    { name: 'Profile', icon: UserCircle, route: '/hotel/profile' },
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
                  layoutId="partner-active-pill"
                  className="absolute inset-x-1 inset-y-0 bg-[#003836]/10 rounded-xl -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <Icon
                size={22}
                className={`transition-colors duration-200 ${isActive ? 'text-[#003836] fill-[#003836]/10' : 'text-gray-400'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />

              <span className={`text-[9px] font-bold tracking-wide transition-colors duration-200 ${isActive ? 'text-[#003836]' : 'text-gray-400'}`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PartnerBottomNavbar;
