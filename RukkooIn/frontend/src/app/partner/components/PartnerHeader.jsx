import React, { useState } from 'react';
import { Menu, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../../assets/rokologin-removebg-preview.png';
import PartnerSidebar from './PartnerSidebar';

const PartnerHeader = ({ title, subtitle }) => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between relative h-14 px-4 pt-2 bg-white/50 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100/50">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-1.5 rounded-full bg-white hover:bg-gray-100 transition shadow-sm border border-gray-100"
                >
                    <Menu size={18} className="text-[#003836]" />
                </button>

                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1">
                    <img src={logo} alt="Rukko" className="h-7 object-contain drop-shadow-sm" />
                </div>

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

            {/* Render Sidebar Global to Header */}
            <PartnerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
};

export default PartnerHeader;
