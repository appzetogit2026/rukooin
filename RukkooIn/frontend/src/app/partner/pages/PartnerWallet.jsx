import React, { useState, useEffect } from 'react';
import {
    Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft,
    Plus, Clock, Loader2, AlertCircle, RefreshCw, Menu
} from 'lucide-react';
import walletService from '../../../services/walletService';
import { toast } from 'react-hot-toast';
import { useRazorpay } from 'react-razorpay';

// --- Transaction Item (Compact) ---
const TransactionItem = ({ txn }) => {
    const isCredit = txn.type === 'credit';
    const isCompleted = txn.status === 'completed';

    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 active:bg-gray-50/50 transition-colors">
            {/* Left Side: Icon + Text */}
            <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isCredit ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#F5F5F5] text-gray-600'}`}>
                    {isCredit ? <ArrowDownLeft size={18} strokeWidth={2.5} /> : <ArrowUpRight size={18} className="stroke-gray-500" strokeWidth={2.5} />}
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-[#003836] text-xs sm:text-sm truncate leading-tight">{txn.description}</h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5 truncate">
                        {new Date(txn.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Right Side: Amount + Status */}
            <div className="text-right flex-shrink-0">
                <div className={`font-black text-sm sm:text-base ${isCredit ? 'text-[#2E7D32]' : 'text-[#003836]'}`}>
                    {isCredit ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN')}
                </div>
                <div className={`text-[9px] font-bold uppercase tracking-wide mt-1 ${txn.status === 'completed' ? 'text-green-600' :
                    txn.status === 'pending' ? 'text-yellow-600' : 'text-red-500'
                    }`}>
                    {txn.status === 'completed' ? 'Success' : txn.status}
                </div>
            </div>
        </div>
    );
};

const PartnerWallet = () => {
    const { Razorpay } = useRazorpay();
    const [wallet, setWallet] = useState(null);
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal States
    const [activeModal, setActiveModal] = useState(null); // 'withdraw' | 'add_money' | null
    const [amountInput, setAmountInput] = useState('');

    // Fetch wallet data
    const fetchWalletData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [walletRes, statsRes, txnRes] = await Promise.all([
                walletService.getWallet({ viewAs: 'partner' }),
                walletService.getWalletStats({ viewAs: 'partner' }),
                walletService.getTransactions({ limit: 10, viewAs: 'partner' })
            ]);

            setWallet(walletRes.wallet);
            setStats(statsRes.stats);
            setTransactions(txnRes.transactions);

        } catch (err) {
            console.error('Error fetching wallet:', err);
            setError(err.response?.data?.message || 'Failed to load wallet data');
            toast.error('Failed to load wallet details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    const handleTransaction = async () => {
        const amount = parseFloat(amountInput);
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            if (activeModal === 'withdraw') {
                if (amount < 500) { toast.error('Minimum withdrawal is ₹500'); return; }
                if (amount > wallet?.balance) { toast.error('Insufficient balance'); return; }

                await walletService.requestWithdrawal(amount);
                toast.success('Withdrawal request submitted');
            } else if (activeModal === 'add_money') {
                // 1. Create Order
                const { order } = await walletService.addMoney(amount);

                // 2. Open Razorpay
                const options = {
                    key: order.key,
                    amount: order.amount,
                    currency: order.currency,
                    name: "Rukkoin Partner",
                    description: "Wallet Top-up",
                    order_id: order.id,
                    handler: async (response) => {
                        try {
                            // 3. Verify Payment
                            await walletService.verifyAddMoney({
                                ...response,
                                amount // Pass amount for reference
                            });
                            toast.success('Money added successfully!');
                            setActiveModal(null);
                            setAmountInput('');
                            fetchWalletData();
                        } catch (err) {
                            toast.error('Payment verification failed');
                            console.error(err);
                        }
                    },
                    prefill: {
                        name: "Partner",
                        contact: "",
                    },
                    theme: {
                        color: "#004F4D",
                    },
                };

                const razorpayInstance = new Razorpay(options);
                razorpayInstance.open();
                return; // Don't close modal immediately, let handler do it
            }

            setActiveModal(null);
            setAmountInput('');
            fetchWalletData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transaction failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 size={32} className="text-[#004F4D] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle size={40} className="text-red-500 mb-3" />
                <h3 className="text-lg font-bold text-gray-800">Connection Error</h3>
                <button onClick={fetchWalletData} className="mt-4 bg-[#004F4D] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg">Retry</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-24 font-sans">
            {/* --- Top Dark Section --- */}
            <div className="bg-[#004F4D] pt-10 pb-16 px-6 rounded-b-[40px] text-white text-center shadow-lg relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-2">Available Balance</p>
                <div className="text-5xl font-black mb-10 tracking-tight">
                    <span className="text-3xl font-medium align-top opacity-80 mr-1">₹</span>
                    {wallet?.balance?.toLocaleString('en-IN') || '0'}
                </div>

                <div className="flex gap-4 justify-center max-w-sm mx-auto">
                    <button
                        onClick={() => setActiveModal('add_money')}
                        className="flex-1 bg-white text-[#004F4D] py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
                    >
                        <Plus size={16} strokeWidth={3} className="sm:w-[18px] sm:h-[18px]" /> Add Money
                    </button>
                    <button
                        onClick={() => setActiveModal('withdraw')}
                        className="flex-1 bg-white/10 text-white border border-white/20 py-3 px-3 sm:px-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-md shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap"
                    >
                        <ArrowUpRight size={16} strokeWidth={3} className="sm:w-[18px] sm:h-[18px]" /> Withdraw
                    </button>
                </div>
            </div>

            {/* --- Toggle Pills --- */}
            <div className="px-6 -mt-7 relative z-20 mb-10">
                <div className="bg-white p-1.5 rounded-full shadow-lg border border-gray-100 flex max-w-[280px] mx-auto">
                    <button className="flex-1 bg-[#004F4D] text-white py-2.5 rounded-full text-xs font-bold shadow-md transition-all">
                        Transactions
                    </button>
                    <button className="flex-1 text-gray-400 py-2.5 rounded-full text-xs font-bold hover:bg-gray-50 transition-all">
                        Analytics
                    </button>
                </div>
            </div>

            {/* --- Recent Activity List --- */}
            <div className="px-6 max-w-lg mx-auto">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 pl-2">Recent Activity</h3>

                <div className="space-y-2">
                    {transactions.length > 0 ? (
                        transactions.map((txn, idx) => (
                            <TransactionItem key={txn._id || idx} txn={txn} />
                        ))
                    ) : (
                        <div className="text-center py-10 opacity-50">
                            <p className="text-gray-400 text-sm font-medium">No recent transactions</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal for Withdraw / Add Money */}
            {activeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end sm:items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-8 shadow-2xl animate-slideUp">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-[#003836]">
                                {activeModal === 'withdraw' ? 'Withdraw Funds' : 'Add Money'}
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-8 h-8 rounded-full bg-gray-100/50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                            >
                                <Menu size={16} className="rotate-45" />
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 font-medium mb-8">
                            {activeModal === 'withdraw'
                                ? 'Transfer funds directly to your verified bank account.'
                                : 'Add funds to your wallet using UPI or Cards.'
                            }
                        </p>

                        <div className="mb-8">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">Amount (₹)</label>
                            <input
                                type="number"
                                autoFocus
                                value={amountInput}
                                onChange={(e) => setAmountInput(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-2xl font-black text-[#003836] focus:outline-none focus:border-[#004F4D] focus:bg-white transition-all shadow-inner placeholder:text-gray-300"
                                placeholder="0"
                            />
                            {activeModal === 'withdraw' && (
                                <p className="text-[10px] text-gray-400 mt-3 text-right font-medium">Available Balance: <span className="text-[#003836] font-bold">₹{wallet?.balance}</span></p>
                            )}
                        </div>

                        <button
                            onClick={handleTransaction}
                            className="w-full bg-[#004F4D] text-white font-bold py-4 rounded-2xl text-sm active:scale-95 transition-transform shadow-lg shadow-[#004F4D]/20"
                        >
                            Proceed Securely
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerWallet;
