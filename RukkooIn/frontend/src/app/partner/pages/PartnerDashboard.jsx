import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Wallet } from 'lucide-react';
import { useLenis } from '../../shared/hooks/useLenis';
import PartnerSidebar from '../components/PartnerSidebar';
import logo from '../../../assets/rokologin-removebg-preview.png';

const PartnerDashboard = () => {
    useLenis();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">

            {/* Custom Header (User-Style) */}
            <div className="flex items-center justify-between relative h-14 px-4 pt-2 bg-white/50 backdrop-blur-sm sticky top-0 z-30">
                {/* Menu Button */}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-1.5 rounded-full bg-white hover:bg-gray-100 transition shadow-sm border border-gray-100"
                >
                    <Menu size={18} className="text-[#003836]" />
                </button>

                {/* Logo */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1">
                    <img
                        src={logo}
                        alt="Rukko Logo"
                        className="h-7 object-contain drop-shadow-sm"
                    />
                </div>

                {/* Wallet Button */}
                <button
                    onClick={() => navigate('/hotel/wallet')}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform"
                >
                    <div className="w-5 h-5 bg-[#004F4D] rounded-full flex items-center justify-center">
                        <Wallet size={10} className="text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-none mr-0.5">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Wallet</span>
                        <span className="text-[10px] font-bold text-[#003836]">₹0</span>
                    </div>
                </button>
            </div>

            {/* Sidebar */}
            <PartnerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center -mt-16">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center max-w-xs w-full">
                    <div className="w-16 h-16 bg-[#004F4D]/5 rounded-2xl flex items-center justify-center mb-6 rotate-3">
                        <div className="w-16 h-16 bg-[#004F4D]/10 rounded-2xl flex items-center justify-center -rotate-6">
                            <Menu size={32} className="text-[#004F4D]" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-black text-[#003836] mb-2 leading-tight">
                        Welcome to <br /> Partner Dashboard
                    </h1>
                    <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[200px]">
                        Manage your property, bookings, and earnings from one place.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PartnerDashboard;
