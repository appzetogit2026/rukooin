import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, Smartphone, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentPage = () => {
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [processing, setProcessing] = useState(false);

    const handlePayment = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            navigate('/booking-confirmation', { state: { paid: true } }); // Navigate back or to success
            // In reality, this would likely go to a "Payment Success" interstitial
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} className="text-surface" />
                </button>
                <h1 className="text-lg font-bold text-surface">Payment Options</h1>
            </div>

            <div className="p-5 max-w-lg mx-auto space-y-6">

                {/* Amount Summary */}
                <div className="bg-surface text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-sm text-white/70 font-medium">Total Amount to Pay</p>
                        <h2 className="text-4xl font-black mt-1">₹998</h2>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-lg">
                            <ShieldCheck size={14} /> Secure Payment
                        </div>
                    </div>
                    {/* Decor */}
                    <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                {/* Methods */}
                <div>
                    <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-3 ml-1">Recommended</h3>

                    <div className="space-y-3">
                        {/* UPI */}
                        <div
                            onClick={() => setSelectedMethod('upi')}
                            className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${selectedMethod === 'upi' ? 'border-surface bg-surface/5 ring-1 ring-surface' : 'border-gray-200 bg-white'}`}
                        >
                            <div className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center">
                                <Smartphone size={20} className="text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-surface">UPI Options</h4>
                                <p className="text-xs text-gray-400">Google Pay, PhonePe, Paytm</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMethod === 'upi' ? 'border-surface' : 'border-gray-300'}`}>
                                {selectedMethod === 'upi' && <div className="w-3 h-3 bg-surface rounded-full" />}
                            </div>
                        </div>

                        {/* Card */}
                        <div
                            onClick={() => setSelectedMethod('card')}
                            className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all ${selectedMethod === 'card' ? 'border-surface bg-surface/5 ring-1 ring-surface' : 'border-gray-200 bg-white'}`}
                        >
                            <div className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center">
                                <CreditCard size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-surface">Credit / Debit Card</h4>
                                <p className="text-xs text-gray-400">Visa, Mastercard, Rupay</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedMethod === 'card' ? 'border-surface' : 'border-gray-300'}`}>
                                {selectedMethod === 'card' && <div className="w-3 h-3 bg-surface rounded-full" />}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secure Footer */}
                <div className="text-center">
                    <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                        <ShieldCheck size={12} />
                        Your payment details are safe with us
                    </p>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-200 shadow-xl">
                <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-surface text-white font-bold py-3.5 rounded-xl shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        `Pay ₹998`
                    )}
                </button>
            </div>
        </div>
    );
};

export default PaymentPage;
