import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Phone, Mail, ChevronRight, HelpCircle } from 'lucide-react';

const SupportPage = () => {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        { q: "How do I cancel my booking?", a: "You can cancel your booking from the 'My Bookings' section. Cancellation fees may apply depending on the policy." },
        { q: "Can I adjust my check-in time?", a: "Standard check-in is at 12:00 PM. For early check-in, please contact the hotel directly." },
        { q: "Where can I find my booking ID?", a: "Your booking ID is sent to your registered mobile number and email. You can also find it in the 'My Bookings' section." }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-surface text-white p-6 pb-12 rounded-b-[30px] shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold">Help & Support</h1>
                </div>
                <h2 className="text-2xl font-black">How can we help you?</h2>
                <p className="text-sm text-white/70">Find answers or contact our support team.</p>
            </div>

            <div className="px-5 -mt-8 relative z-10 space-y-6 pb-20">

                {/* Contact Options */}
                <div className="bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-white">
                    <h3 className="font-bold text-surface text-sm mb-4">Contact Us</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-blue-50 border border-blue-100 group active:scale-95 transition-transform">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                                <MessageSquare size={20} />
                            </div>
                            <span className="text-xs font-bold text-blue-700">Chat with Us</span>
                        </button>
                        <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-green-50 border border-green-100 group active:scale-95 transition-transform">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm">
                                <Phone size={20} />
                            </div>
                            <span className="text-xs font-bold text-green-700">Call Support</span>
                        </button>
                    </div>
                </div>

                {/* FAQs */}
                <div>
                    <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-3 ml-1">Frequently Asked Questions</h3>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                        {faqs.map((faq, i) => (
                            <div key={i} className="group">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <span className="text-sm font-bold text-surface pr-4">{faq.q}</span>
                                    <ChevronRight size={16} className={`text-gray-400 transition-transform duration-300 ${openFaq === i ? 'rotate-90' : ''}`} />
                                </button>
                                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <p className="text-xs text-gray-500 p-4 pt-0 leading-relaxed">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-4">
                    <button className="text-xs font-bold text-surface underline">View all FAQs</button>
                </div>

            </div>
        </div>
    );
};

export default SupportPage;
