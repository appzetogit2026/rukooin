import React, { useState } from 'react';
import usePartnerStore from '../store/partnerStore';
import PartnerSidebar from './PartnerSidebar';

const PartnerHeader = ({ title = "Partner Panel", subtitle = "Manage your listings" }) => {
    const { formData } = usePartnerStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <header className="bg-white sticky top-0 z-40 border-b border-gray-100 px-6 py-4 flex items-center justify-between transition-colors duration-300">
                <div>
                    <h1 className="text-xl font-black text-black tracking-tight">{title}</h1>
                    {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-90 shadow-sm"
                >
                    <span className="font-bold text-gray-600 hover:text-white text-sm">
                        {formData?.propertyName ? formData.propertyName.substring(0, 2).toUpperCase() : 'JD'}
                    </span>
                </button>
            </header>

            <PartnerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </>
    );
};

export default PartnerHeader;
