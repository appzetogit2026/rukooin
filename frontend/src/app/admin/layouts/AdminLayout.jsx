import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Users, Building2, Calendar, Wallet,
    Settings, Bell, Search, LogOut, Menu, X, DollarSign, ClipboardCheck, Star, Tag
} from 'lucide-react';
import logo from '../../../assets/rokologin-removebg-preview.png';
import useAdminStore from '../store/adminStore';
import toast from 'react-hot-toast';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAdminStore(state => state.logout);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/admin/login');
    };

    const MENU_ITEMS = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: Building2, label: 'Partner Management', path: '/admin/partners' },
        { icon: ClipboardCheck, label: 'Property Management', path: '/admin/properties' },
        { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
        { icon: DollarSign, label: 'My Earnings', path: '/admin/earnings' },
        { icon: Wallet, label: 'Finance & Payouts', path: '/admin/finance' },
        { icon: Tag, label: 'Offers & Coupons', path: '/admin/offers' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                className="bg-black text-white flex flex-col h-full border-r border-gray-800 shadow-2xl z-20 transition-all duration-300 relative"
            >
                <div className="py-2 flex items-center justify-center bg-white border-b border-gray-800 transition-all duration-300">
                    <img
                        src={logo}
                        alt="Rukkoo.in"
                        className={`object-contain transition-all duration-300 ${isSidebarOpen ? 'h-20 w-auto' : 'h-10 w-10'}`}
                    />
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    {MENU_ITEMS.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${isActive
                                    ? 'bg-white text-black shadow-lg font-medium'
                                    : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-black' : 'text-gray-400 group-hover:text-white'} />
                                {isSidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="whitespace-nowrap flex-1"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                                {item.badge && isSidebarOpen && (
                                    <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer / Toggle */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-900 text-gray-400 hover:text-white transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <button
                        onClick={handleLogout}
                        className={`mt-2 w-full flex items-center gap-3 p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors ${!isSidebarOpen && 'justify-center'}`}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-4 flex-1">
                        <h1 className="text-xl font-bold text-gray-800">
                            Rukkoo.in Admin
                        </h1>
                        <div className="hidden md:flex items-center relative max-w-md w-full ml-8">
                            <Search size={16} className="absolute left-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users, bookings, hotels..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 relative scroll-smooth bg-gray-50/50">
                    <div className="max-w-[1600px] mx-auto min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
