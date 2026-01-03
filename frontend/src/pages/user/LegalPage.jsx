import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Shield } from 'lucide-react';

const LegalPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-surface text-white p-6 pb-12 rounded-b-[30px] shadow-lg sticky top-0 z-20">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Legal</h1>
                </div>
                <h2 className="text-2xl font-black">Terms & Policies</h2>
            </div>

            <div className="px-5 -mt-6 relative z-10 space-y-4 pb-24">

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 text-surface border-b border-gray-100 pb-3">
                        <Shield size={24} />
                        <h3 className="font-bold text-lg">Privacy Policy</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                        <p>At Rukko, we take your privacy seriously. This policy describes how we collect, use, and handle your data.</p>
                        <p><strong>1. Data Collection:</strong> We collect basic profile information and booking history to improve your experience.</p>
                        <p><strong>2. Usage:</strong> Your data is used to process bookings and send relevant offers.</p>
                        <p><strong>3. Protection:</strong> We use industry-standard encryption to protect your personal information.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4 text-surface border-b border-gray-100 pb-3">
                        <FileText size={24} />
                        <h3 className="font-bold text-lg">Terms & Conditions</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                        <p>By using Rukko, you agree to the following terms:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Bookings are subject to hotel availability.</li>
                            <li>Cancellation policies vary by property.</li>
                            <li>Users must be at least 18 years old.</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LegalPage;
