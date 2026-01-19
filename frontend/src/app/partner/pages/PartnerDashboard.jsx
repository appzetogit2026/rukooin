import React from 'react';
import { useLenis } from '../../shared/hooks/useLenis';
import PartnerHeader from '../components/PartnerHeader';
import { Menu } from 'lucide-react';

const PartnerDashboard = () => {
    useLenis();

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
            <PartnerHeader />

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
