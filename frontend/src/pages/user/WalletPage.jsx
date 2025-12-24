import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft, History, Wallet as WalletIcon,
    Receipt, CreditCard, ChevronRight, TrendingUp, X, IndianRupee, Banknote,
    PieChart, Settings, Shield, Bell, HelpCircle, ChevronDown, Check, Smartphone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock Transaction Data
const allTransactions = [
    { id: 1, type: 'credit', title: 'Top-up from UPI', date: 'Today, 10:45 AM', amount: 2000, status: 'Success', method: 'GPay' },
    { id: 2, type: 'debit', title: 'Rukko Premier: Skyline', date: 'Yesterday, 8:30 PM', amount: 1499, status: 'Success', method: 'Wallet' },
    { id: 3, type: 'credit', title: 'Referral Bonus', date: '15 Dec, 2024', amount: 500, status: 'Success', method: 'Reward' },
    { id: 4, type: 'debit', title: 'Booking: Rukko Stay', date: '10 Dec, 2024', amount: 850, status: 'Success', method: 'Wallet' },
    { id: 5, type: 'credit', title: 'Refund: Cancelled Booking', date: '05 Dec, 2024', amount: 1200, status: 'Success', method: 'Refund' },
    { id: 6, type: 'debit', title: 'Rukko Grand: Central', date: '01 Dec, 2024', amount: 1899, status: 'Success', method: 'Wallet' },
    { id: 7, type: 'credit', title: 'Added via Card', date: '28 Nov, 2024', amount: 5000, status: 'Success', method: 'Card' },
];

// Mock Saved Cards
const savedCards = [
    { id: 1, type: 'visa', last4: '4242', expiry: '12/26', name: 'Personal Card', color: 'from-blue-600 to-blue-800' },
    { id: 2, type: 'mastercard', last4: '8888', expiry: '09/25', name: 'Business Card', color: 'from-gray-700 to-gray-900' },
];

// Mock UPI IDs
const savedUPI = [
    { id: 1, upiId: 'user@oksbi', bank: 'SBI' },
    { id: 2, upiId: 'user@okicici', bank: 'ICICI' },
];

const WalletPage = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(4500.00);

    // UI State
    const [activeTab, setActiveTab] = useState('home'); // home, history, cards, analytics, settings
    const [showAddMoneySheet, setShowAddMoneySheet] = useState(false);
    const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
    const [addAmount, setAddAmount] = useState('');

    const quickAmounts = [500, 1000, 2000, 5000];

    // Analytics Data
    const analyticsData = {
        totalSpent: 12500,
        totalAdded: 18000,
        bookings: 8,
        avgBooking: 1562,
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50 pb-24"
        >
            {/* Header */}
            <div className="bg-surface text-white pt-safe-top sticky top-0 z-30 shadow-lg">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 backdrop-blur hover:bg-white/20 active:scale-95 transition-all"
                        >
                            <ArrowLeft size={18} className="text-white" />
                        </button>
                        <h1 className="text-lg font-bold">My Wallet</h1>
                    </div>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`p-2 rounded-full transition-all ${activeTab === 'history' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <History size={18} className="text-white" />
                    </button>
                </div>

                {/* Balance Card Section */}
                <div className="px-5 pb-6">
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-medium text-gray-300 uppercase tracking-wider mb-1">Total Balance</span>
                        <h2 className="text-4xl font-bold tracking-tight mb-4">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</h2>

                        {/* Primary Buttons */}
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowAddMoneySheet(true)}
                                className="flex-1 bg-white text-surface py-3 rounded-xl font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={18} strokeWidth={3} /> Add Money
                            </button>
                            <button
                                onClick={() => setShowWithdrawSheet(true)}
                                className="flex-1 bg-white/10 backdrop-blur border border-white/10 text-white py-3 rounded-xl font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowUpRight size={18} strokeWidth={2.5} /> Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-4 pt-4 relative z-10 space-y-6">

                {/* Quick Features Grid */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 grid grid-cols-4 gap-2"
                >
                    {[
                        { icon: Receipt, label: "History", color: "text-blue-600", bg: "bg-blue-50", tab: 'history' },
                        { icon: CreditCard, label: "Cards", color: "text-purple-600", bg: "bg-purple-50", tab: 'cards' },
                        { icon: TrendingUp, label: "Analytics", color: "text-orange-600", bg: "bg-orange-50", tab: 'analytics' },
                        { icon: Settings, label: "Settings", color: "text-gray-600", bg: "bg-gray-100", tab: 'settings' }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            onClick={() => setActiveTab(item.tab)}
                            className={`flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform p-2 rounded-xl ${activeTab === item.tab ? 'bg-gray-50 ring-2 ring-surface/10' : ''}`}
                        >
                            <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center`}>
                                <item.icon size={20} className={item.color} />
                            </div>
                            <span className={`text-[10px] font-bold ${activeTab === item.tab ? 'text-surface' : 'text-gray-600'}`}>{item.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Dynamic Content Based on Active Tab */}
                <AnimatePresence mode="wait">
                    {activeTab === 'home' && (
                        <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                            {/* Recent Transactions */}
                            <div>
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h3 className="font-bold text-base text-gray-800">Recent Activity</h3>
                                    <button onClick={() => setActiveTab('history')} className="text-xs font-bold text-accent">See All</button>
                                </div>
                                <TransactionList transactions={allTransactions.slice(0, 4)} />
                            </div>

                            {/* Promo Banner */}
                            <PromoBanner navigate={navigate} />
                        </motion.div>
                    )}

                    {activeTab === 'history' && (
                        <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                            <div className="flex items-center justify-between mb-3 px-1">
                                <h3 className="font-bold text-base text-gray-800">All Transactions</h3>
                                <button onClick={() => setActiveTab('home')} className="text-xs font-bold text-gray-500">Back</button>
                            </div>
                            <TransactionList transactions={allTransactions} />
                        </motion.div>
                    )}

                    {activeTab === 'cards' && (
                        <motion.div key="cards" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                            <div className="flex items-center justify-between mb-1 px-1">
                                <h3 className="font-bold text-base text-gray-800">Payment Methods</h3>
                                <button onClick={() => setActiveTab('home')} className="text-xs font-bold text-gray-500">Back</button>
                            </div>

                            {/* Saved Cards */}
                            <div className="space-y-3">
                                <span className="text-xs font-bold text-gray-500 px-1">SAVED CARDS</span>
                                {savedCards.map(card => (
                                    <div key={card.id} className={`bg-gradient-to-br ${card.color} p-4 rounded-2xl text-white shadow-lg`}>
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="text-xs font-medium opacity-80">{card.name}</span>
                                            <span className="text-xs font-bold uppercase">{card.type}</span>
                                        </div>
                                        <div className="text-lg font-mono tracking-widest mb-2">•••• •••• •••• {card.last4}</div>
                                        <div className="text-xs opacity-70">Expires {card.expiry}</div>
                                    </div>
                                ))}
                                <button className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-4 flex items-center justify-center gap-2 text-gray-500 font-bold text-sm hover:border-surface hover:text-surface transition-colors">
                                    <Plus size={18} /> Add New Card
                                </button>
                            </div>

                            {/* Saved UPI */}
                            <div className="space-y-3">
                                <span className="text-xs font-bold text-gray-500 px-1">UPI IDs</span>
                                {savedUPI.map(upi => (
                                    <div key={upi.id} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                                                <Smartphone size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-800">{upi.upiId}</h4>
                                                <p className="text-[10px] text-gray-400">{upi.bank}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                            <div className="flex items-center justify-between mb-1 px-1">
                                <h3 className="font-bold text-base text-gray-800">Spending Insights</h3>
                                <button onClick={() => setActiveTab('home')} className="text-xs font-bold text-gray-500">Back</button>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 mb-3">
                                        <ArrowUpRight size={20} />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Total Spent</span>
                                    <h4 className="text-xl font-bold text-gray-800">₹{analyticsData.totalSpent.toLocaleString()}</h4>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-3">
                                        <ArrowDownLeft size={20} />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Total Added</span>
                                    <h4 className="text-xl font-bold text-gray-800">₹{analyticsData.totalAdded.toLocaleString()}</h4>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                                        <Receipt size={20} />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Total Bookings</span>
                                    <h4 className="text-xl font-bold text-gray-800">{analyticsData.bookings}</h4>
                                </div>
                                <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-3">
                                        <PieChart size={20} />
                                    </div>
                                    <span className="text-xs text-gray-500 font-medium">Avg. Booking</span>
                                    <h4 className="text-xl font-bold text-gray-800">₹{analyticsData.avgBooking.toLocaleString()}</h4>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                            <div className="flex items-center justify-between mb-1 px-1">
                                <h3 className="font-bold text-base text-gray-800">Wallet Settings</h3>
                                <button onClick={() => setActiveTab('home')} className="text-xs font-bold text-gray-500">Back</button>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                                {[
                                    { icon: Shield, label: "Security & PIN", desc: "Manage wallet PIN" },
                                    { icon: Bell, label: "Notifications", desc: "Transaction alerts" },
                                    { icon: Banknote, label: "Bank Accounts", desc: "Linked accounts" },
                                    { icon: HelpCircle, label: "Help & Support", desc: "Get assistance" },
                                ].map((item, idx, arr) => (
                                    <div key={idx} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer ${idx !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                                                <item.icon size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-gray-800">{item.label}</h4>
                                                <p className="text-[10px] text-gray-400">{item.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Add Money Bottom Sheet */}
            <AnimatePresence>
                {showAddMoneySheet && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowAddMoneySheet(false)} className="fixed inset-0 bg-black z-[60]" />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-white z-[70] rounded-t-3xl p-5 pb-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-surface">Add Money</h3>
                                <button onClick={() => setShowAddMoneySheet(false)} className="p-1"><X size={22} className="text-gray-500" /></button>
                            </div>

                            {/* Amount Input */}
                            <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex items-center gap-3">
                                <IndianRupee size={24} className="text-gray-400" />
                                <input
                                    type="number"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="flex-1 bg-transparent text-2xl font-bold text-surface outline-none placeholder:text-gray-300"
                                />
                            </div>

                            {/* Quick Amounts */}
                            <div className="flex gap-2 mb-6 flex-wrap">
                                {quickAmounts.map(amt => (
                                    <button
                                        key={amt}
                                        onClick={() => setAddAmount(String(amt))}
                                        className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${addAmount === String(amt) ? 'bg-surface text-white border-surface' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        +₹{amt}
                                    </button>
                                ))}
                            </div>

                            {/* Payment Methods */}
                            <div className="space-y-3 mb-6">
                                <span className="text-xs font-bold text-gray-500">PAY VIA</span>
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:border-surface transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center"><Smartphone size={18} className="text-green-600" /></div>
                                        <span className="font-bold text-sm text-gray-800">UPI</span>
                                    </div>
                                    <Check size={18} className="text-green-600" />
                                </div>
                            </div>

                            <button
                                onClick={() => { setBalance(b => b + Number(addAmount || 0)); setAddAmount(''); setShowAddMoneySheet(false); }}
                                className="w-full bg-surface text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-all"
                            >
                                Add ₹{addAmount || 0}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Withdraw Bottom Sheet */}
            <AnimatePresence>
                {showWithdrawSheet && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} onClick={() => setShowWithdrawSheet(false)} className="fixed inset-0 bg-black z-[60]" />
                        <motion.div
                            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-white z-[70] rounded-t-3xl p-5 pb-10 shadow-2xl"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-lg font-bold text-surface">Withdraw to Bank</h3>
                                <button onClick={() => setShowWithdrawSheet(false)} className="p-1"><X size={22} className="text-gray-500" /></button>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-4 flex items-center gap-3">
                                <IndianRupee size={24} className="text-gray-400" />
                                <input
                                    type="number"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="flex-1 bg-transparent text-2xl font-bold text-surface outline-none placeholder:text-gray-300"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mb-6 px-1">Available balance: ₹{balance.toLocaleString()}</p>

                            <div className="space-y-3 mb-6">
                                <span className="text-xs font-bold text-gray-500">WITHDRAW TO</span>
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer hover:border-surface transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center"><Banknote size={18} className="text-blue-600" /></div>
                                        <div>
                                            <span className="font-bold text-sm text-gray-800 block">SBI Savings Account</span>
                                            <span className="text-[10px] text-gray-400">XXXX1234</span>
                                        </div>
                                    </div>
                                    <Check size={18} className="text-green-600" />
                                </div>
                            </div>

                            <button
                                onClick={() => { setBalance(b => Math.max(0, b - Number(addAmount || 0))); setAddAmount(''); setShowWithdrawSheet(false); }}
                                className="w-full bg-surface text-white py-4 rounded-xl font-bold text-base shadow-lg active:scale-[0.98] transition-all"
                            >
                                Withdraw ₹{addAmount || 0}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

// Transaction List Component
const TransactionList = ({ transactions }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {transactions.map((tx, i) => (
            <div key={tx.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${i !== transactions.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{tx.title}</h4>
                        <p className="text-[10px] text-gray-400 font-medium">{tx.date} • {tx.method}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-800'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{tx.status}</span>
                </div>
            </div>
        ))}
    </div>
);

// Promo Banner Component
const PromoBanner = ({ navigate }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden bg-black rounded-2xl p-5 text-white shadow-lg"
    >
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl opacity-50" />
        <div className="relative z-10 flex items-center justify-between">
            <div>
                <div className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-0.5 rounded w-fit mb-2 border border-accent/20">SPECIAL OFFER</div>
                <h4 className="font-bold text-lg mb-1">Get 5% Cashback</h4>
                <p className="text-xs text-gray-400 max-w-[200px]">On your next booking when you pay using Rukko Wallet.</p>
            </div>
            <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm cursor-pointer" onClick={() => navigate('/listings')}>
                <ChevronRight size={20} className="text-white" />
            </div>
        </div>
    </motion.div>
);

export default WalletPage;
