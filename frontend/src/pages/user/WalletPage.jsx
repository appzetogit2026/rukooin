import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft,
    Receipt, TrendingUp, X, IndianRupee, Banknote,
    ChevronRight, Check, Smartphone, CircleDollarSign,
    Wallet, CreditCard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Data Mock
const allTransactions = [
    { id: 1, type: 'credit', title: 'Top-up UPI', date: 'Today, 10:45 AM', amount: 2000, status: 'Success', method: 'GPay' },
    { id: 2, type: 'debit', title: 'Rukko Premier', date: 'Yesterday, 8:30 PM', amount: 1499, status: 'Success', method: 'Wallet' },
    { id: 3, type: 'credit', title: 'Referral', date: '15 Dec, 2024', amount: 500, status: 'Success', method: 'Reward' },
    { id: 4, type: 'debit', title: 'Hotel Booking', date: '10 Dec, 2024', amount: 850, status: 'Success', method: 'Wallet' },
    { id: 5, type: 'credit', title: 'Refund', date: '05 Dec, 2024', amount: 1200, status: 'Success', method: 'Refund' },
    { id: 6, type: 'debit', title: 'Rukko Grand', date: '01 Dec, 2024', amount: 1899, status: 'Success', method: 'Wallet' },
];

const WalletPage = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(4500.00);
    const [activeTab, setActiveTab] = useState('home');
    const [showAddMoneySheet, setShowAddMoneySheet] = useState(false);
    const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
    const [addAmount, setAddAmount] = useState('');

    const quickAmounts = [500, 1000, 2000];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50 pb-24 font-sans"
        >
            {/* 1. Main Balance Card - Compact Header Style */}
            <div className="w-full relative z-10">
                <div className="bg-surface text-white rounded-b-[32px] px-5 pt-6 pb-6 shadow-xl shadow-surface/20 relative overflow-hidden">
                    {/* Abstract Background pattern */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col items-center text-center mb-5">
                            <h1 className="text-sm font-bold mb-4 opacity-90">My Wallet</h1>
                            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">Available Balance</p>
                            <div className="flex items-start justify-center gap-1">
                                <span className="text-xl mt-0.5 opacity-80">₹</span>
                                <h2 className="text-3xl font-black tracking-tight">{balance.toLocaleString('en-IN')}</h2>
                            </div>
                        </div>

                        {/* Action Buttons Row */}
                        <div className="flex gap-3 px-4">
                            <button
                                onClick={() => setShowAddMoneySheet(true)}
                                className="flex-1 bg-white text-surface py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-transform"
                            >
                                <Plus size={14} strokeWidth={3} /> Add Money
                            </button>
                            <button
                                onClick={() => setShowWithdrawSheet(true)}
                                className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 text-white py-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform hover:bg-white/20"
                            >
                                <ArrowUpRight size={14} strokeWidth={2.5} /> Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Quick Stats / Tabs - Compact Segment */}
            <div className="mt-5 mb-3 flex justify-center px-8">
                <div className="flex w-full max-w-[240px] bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                    {[
                        { id: 'home', label: 'Transactions' },
                        { id: 'analytics', label: 'Analytics' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-surface text-white shadow-md'
                                    : 'text-gray-400 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 4. Content Feed */}
            <div className="px-5 py-2 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'home' ? (
                        <motion.div
                            key="tx-list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {/* Date Header Example */}
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recent Activity</h3>
                            </div>

                            {allTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-1 active:opacity-70 transition-opacity cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900">{tx.title}</h4>
                                            <p className="text-[10px] text-gray-500 font-medium">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                                        </div>
                                        <p className="text-[10px] text-gray-400">{tx.status}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="analytics-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Total Spent</span>
                                <h3 className="text-xl font-black text-gray-900 mt-1">₹12,500</h3>
                                <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-400 w-[70%]"></div>
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Total Added</span>
                                <h3 className="text-xl font-black text-green-600 mt-1">₹18,000</h3>
                                <div className="mt-2 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[60%]"></div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals/Sheets (Simplified) */}
            <AnimatePresence>
                {(showAddMoneySheet || showWithdrawSheet) && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => { setShowAddMoneySheet(false); setShowWithdrawSheet(false) }} className="fixed inset-0 bg-black z-[60]" />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-white z-[70] rounded-t-3xl p-5 pb-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">{showAddMoneySheet ? 'Add Money' : 'Withdraw'}</h3>
                                <button onClick={() => { setShowAddMoneySheet(false); setShowWithdrawSheet(false) }} className="p-1 bg-gray-100 rounded-full"><X size={18} className="text-gray-500" /></button>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex items-center gap-3 border border-gray-100 focus-within:border-surface focus-within:ring-2 ring-surface/10 transition-all">
                                <IndianRupee size={20} className="text-gray-400" />
                                <input
                                    type="number"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    placeholder="0"
                                    className="flex-1 bg-transparent text-3xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
                                />
                            </div>

                            {showAddMoneySheet && (
                                <div className="flex gap-2 mb-6">
                                    {quickAmounts.map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setAddAmount(String(amt))}
                                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                                        >
                                            +₹{amt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    const val = Number(addAmount);
                                    if (showAddMoneySheet) setBalance(b => b + val);
                                    else setBalance(b => Math.max(0, b - val));
                                    setAddAmount('');
                                    setShowAddMoneySheet(false);
                                    setShowWithdrawSheet(false);
                                }}
                                className="w-full bg-surface text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-surface/20 active:scale-[0.98] transition-all"
                            >
                                {showAddMoneySheet ? 'Proceed to Add' : 'Confirm Withdraw'}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

export default WalletPage;
