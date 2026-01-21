import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Plus, ArrowUpRight, ArrowDownLeft,
    Receipt, TrendingUp, X, IndianRupee, Banknote,
    ChevronRight, Check, Smartphone, CircleDollarSign,
    Wallet, CreditCard, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/apiService';
import toast, { Toaster } from 'react-hot-toast';

const WalletPage = () => {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(0);
    const [stats, setStats] = useState({
        totalEarnings: 0,
        totalWithdrawals: 0,
        pendingClearance: 0,
        thisMonthEarnings: 0
    });
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('home');
    const [showAddMoneySheet, setShowAddMoneySheet] = useState(false);
    const [showWithdrawSheet, setShowWithdrawSheet] = useState(false);
    const [addAmount, setAddAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    const quickAmounts = [500, 1000, 2000];

    useEffect(() => {
        fetchWalletData();
        fetchTransactions();
    }, []);

    const fetchWalletData = async () => {
        try {
            const res = await api.get('/wallet/stats');
            if (res.data.success) {
                setStats(res.data.stats);
                setBalance(res.data.stats.currentBalance);
            }
        } catch (error) {
            console.error('Fetch Wallet Error:', error);
            // toast.error('Failed to load wallet balance');
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/wallet/transactions');
            if (res.data.success) {
                setTransactions(res.data.transactions);
            }
        } catch (error) {
            console.error('Fetch Transactions Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleAddMoney = async () => {
        const amount = Number(addAmount);
        if (!amount || amount < 10) {
            toast.error('Minimum amount is ₹10');
            return;
        }

        try {
            setProcessing(true);
            const res = await loadRazorpay();
            if (!res) {
                toast.error('Razorpay SDK failed to load');
                setProcessing(false);
                return;
            }

            // Create Order
            const { data } = await api.post('/wallet/add-money', { amount });
            if (!data.success) throw new Error('Order creation failed');

            const options = {
                key: data.order.key,
                amount: data.order.amount,
                currency: data.order.currency,
                name: 'Rukkoin',
                description: 'Wallet Top-up',
                order_id: data.order.id,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/wallet/verify-add-money', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: amount
                        });

                        if (verifyRes.data.success) {
                            toast.success('Money added successfully!');
                            setBalance(verifyRes.data.newBalance);
                            fetchTransactions();
                            fetchWalletData();
                            setShowAddMoneySheet(false);
                            setAddAmount('');
                        }
                    } catch (err) {
                        toast.error('Payment verification failed');
                    }
                },
                theme: {
                    color: '#000000'
                }
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();
            
        } catch (error) {
            console.error('Add Money Error:', error);
            toast.error(error.response?.data?.message || 'Failed to initiate payment');
        } finally {
            setProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = Number(addAmount);
        if (!amount) return;

        try {
            setProcessing(true);
            const res = await api.post('/wallet/withdraw', { amount });
            if (res.data.success) {
                toast.success('Withdrawal request submitted');
                fetchWalletData();
                fetchTransactions();
                setShowWithdrawSheet(false);
                setAddAmount('');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Withdrawal failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gray-50 pb-24 font-sans"
        >
            <Toaster position="top-center" />
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

                            {transactions.length === 0 && (
                                <div className="text-center py-10 text-gray-400 text-sm">
                                    No transactions yet
                                </div>
                            )}

                            {transactions.map((tx) => (
                                <div key={tx._id} className="flex items-center justify-between p-1 active:opacity-70 transition-opacity cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {tx.type === 'credit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{tx.description}</h4>
                                            <p className="text-[10px] text-gray-500 font-medium">
                                                {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className={`font-bold text-sm ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                                        </div>
                                        <p className="text-[10px] text-gray-400 capitalize">{tx.status}</p>
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
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Total Earnings</span>
                                <h3 className="text-xl font-black text-green-600 mt-1">₹{stats.totalEarnings.toLocaleString('en-IN')}</h3>
                            </div>
                             <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">This Month</span>
                                <h3 className="text-xl font-black text-gray-900 mt-1">₹{stats.thisMonthEarnings.toLocaleString('en-IN')}</h3>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Withdrawals</span>
                                <h3 className="text-xl font-black text-orange-600 mt-1">₹{stats.totalWithdrawals.toLocaleString('en-IN')}</h3>
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Pending</span>
                                <h3 className="text-xl font-black text-gray-500 mt-1">₹{stats.pendingClearance.toLocaleString('en-IN')}</h3>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals/Sheets */}
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
                                onClick={showAddMoneySheet ? handleAddMoney : handleWithdraw}
                                disabled={processing}
                                className="w-full bg-surface text-white py-3.5 rounded-xl font-bold text-sm shadow-md shadow-surface/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing && <Loader2 size={16} className="animate-spin" />}
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