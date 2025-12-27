import React, { useState, useEffect, useRef } from 'react';
import {
    Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft,
    CreditCard, Calendar, ChevronRight, DollarSign,
    Settings, Clock
} from 'lucide-react';
import gsap from 'gsap';
import PartnerHeader from '../components/PartnerHeader';

const TransactionItem = ({ txn, index }) => {
    const isCredit = txn.type === 'credit';

    return (
        <div className="transaction-item flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl mb-3 shadow-sm active:scale-[0.99] transition-transform">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 text-sm">{txn.title}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">{txn.date} • {txn.id}</p>
                </div>
            </div>
            <div className="text-right">
                <div className={`font-black text-sm ${isCredit ? 'text-green-600' : 'text-black'}`}>
                    {isCredit ? '+' : '-'}₹{txn.amount}
                </div>
                <div className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded-md inline-block mt-0.5 uppercase tracking-wide">
                    {txn.status}
                </div>
            </div>
        </div>
    );
};

const PartnerWallet = () => {
    const listRef = useRef(null);
    const cardRef = useRef(null);

    // Mock Data
    const transactions = [
        { id: 'TXN-9921', title: 'Booking Payment (BK-8821)', date: 'Today, 10:30 AM', amount: '2,400', type: 'credit', status: 'Settled' },
        { id: 'TXN-9920', title: 'Payout to Bank (HDFC)', date: 'Yesterday', amount: '15,000', type: 'debit', status: 'Processing' },
        { id: 'TXN-9919', title: 'Booking Payment (BK-8815)', date: '12 Aug 2024', amount: '4,500', type: 'credit', status: 'Settled' },
        { id: 'TXN-9918', title: 'Service Fee Deduction', date: '12 Aug 2024', amount: '450', type: 'debit', status: 'Settled' },
    ];

    useEffect(() => {
        const tl = gsap.timeline();

        // Card Entrance
        tl.fromTo(cardRef.current,
            { y: 20, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
        );

        // List Stagger
        if (listRef.current) {
            tl.fromTo(listRef.current.children,
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: 'power2.out' },
                '-=0.3'
            );
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PartnerHeader title="Wallet" subtitle="Earnings & Payouts" />

            <div className="max-w-3xl mx-auto px-4 pt-6">

                {/* Balance Card */}
                <div ref={cardRef} className="bg-black text-white rounded-[2rem] p-6 shadow-xl shadow-black/20 mb-8 relative overflow-hidden">
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/20 rounded-full blur-xl -ml-5 -mb-5"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-sm font-medium text-white/60 mb-1">Available to Withdraw</h3>
                                <div className="text-4xl font-black tracking-tight">₹12,450.00</div>
                            </div>
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Wallet size={20} className="text-white" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 bg-white text-black h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform">
                                Withdraw Now <ArrowUpRight size={16} />
                            </button>
                            <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 active:scale-95 transition-colors">
                                <Settings size={18} className="text-white" /> {/* Note: Settings not imported, fixing below */}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                                <TrendingUp size={12} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total Earnings</span>
                        </div>
                        <div className="text-xl font-black">₹45,200</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Clock size={12} /> {/* Note: Clock needs import */}
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pending</span>
                        </div>
                        <div className="text-xl font-black">₹15,000</div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                    <button className="text-xs font-bold text-blue-600">See All</button>
                </div>

                <div ref={listRef}>
                    {transactions.map((txn, idx) => (
                        <TransactionItem key={idx} txn={txn} />
                    ))}
                </div>

            </div>
        </div>
    );
};



export default PartnerWallet;
