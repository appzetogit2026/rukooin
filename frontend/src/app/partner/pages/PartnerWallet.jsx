import React, { useState, useEffect, useRef } from 'react';
import {
    Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft,
    CreditCard, Calendar, ChevronRight, DollarSign,
    Settings, Clock, Loader2, AlertCircle, RefreshCw
} from 'lucide-react';
import gsap from 'gsap';
import PartnerHeader from '../components/PartnerHeader';
import walletService from '../../../services/walletService';
import { toast } from 'react-hot-toast';

const TransactionItem = ({ txn, index }) => {
    const isCredit = txn.type === 'credit';

    return (
        <div className="transaction-item flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl mb-3 shadow-sm active:scale-[0.99] transition-transform">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                    <h4 className="font-bold text-[#003836] text-sm">{txn.description}</h4>
                    <p className="text-[10px] text-gray-400 font-medium">{new Date(txn.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • {txn.reference}</p>
                </div>
            </div>
            <div className="text-right">
                <div className={`font-black text-sm ${isCredit ? 'text-green-600' : 'text-[#003836]'}`}>
                    {isCredit ? '+' : '-'}₹{txn.amount?.toLocaleString('en-IN')}
                </div>
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-block mt-0.5 uppercase tracking-wide ${txn.status === 'completed' ? 'bg-green-50 text-green-700' :
                        txn.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-gray-50 text-gray-600'
                    }`}>
                    {txn.status}
                </div>
            </div>
        </div>
    );
};

const PartnerWallet = () => {
    const listRef = useRef(null);
    const cardRef = useRef(null);

    const [wallet, setWallet] = useState(null);
    const [stats, setStats] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    // Fetch wallet data
    const fetchWalletData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch wallet balance
            const walletResponse = await walletService.getWallet();
            setWallet(walletResponse.wallet);

            // Fetch wallet stats
            const statsResponse = await walletService.getWalletStats();
            setStats(statsResponse.stats);

            // Fetch transactions
            const txnResponse = await walletService.getTransactions({ limit: 10 });
            setTransactions(txnResponse.transactions);

        } catch (err) {
            console.error('Error fetching wallet data:', err);
            setError(err.response?.data?.message || 'Failed to load wallet data');
            toast.error('Failed to load wallet data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, []);

    useEffect(() => {
        if (!loading && wallet) {
            const tl = gsap.timeline();

            // Card Entrance
            if (cardRef.current) {
                tl.fromTo(cardRef.current,
                    { y: 20, opacity: 0, scale: 0.95 },
                    { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' }
                );
            }

            // List Stagger
            if (listRef.current && listRef.current.children.length > 0) {
                tl.fromTo(listRef.current.children,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: 'power2.out' },
                    '-=0.3'
                );
            }
        }
    }, [loading, wallet]);

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);

        if (!amount || amount < 500) {
            toast.error('Minimum withdrawal amount is ₹500');
            return;
        }

        if (amount > wallet.balance) {
            toast.error('Insufficient balance');
            return;
        }

        try {
            const response = await walletService.requestWithdrawal(amount);
            toast.success(response.message || 'Withdrawal request submitted');
            setShowWithdrawModal(false);
            setWithdrawAmount('');
            fetchWalletData(); // Refresh data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Withdrawal failed');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={48} className="text-surface animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Loading wallet...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to Load Wallet</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchWalletData}
                        className="bg-surface text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto hover:bg-[#003836] transition"
                    >
                        <RefreshCw size={18} />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PartnerHeader title="Wallet" subtitle="Earnings & Payouts" />

            <div className="max-w-3xl mx-auto px-4 pt-6">

                {/* Balance Card */}
                <div ref={cardRef} className="bg-[#004F4D] text-white rounded-[2rem] p-6 shadow-xl shadow-[#004F4D]/20 mb-8 relative overflow-hidden">
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-500/20 rounded-full blur-xl -ml-5 -mb-5"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-sm font-medium text-white/60 mb-1">Available Balance</h3>
                                <div className="text-4xl font-black tracking-tight">₹{wallet?.balance?.toLocaleString('en-IN') || '0'}</div>
                            </div>
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Wallet size={20} className="text-white" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowWithdrawModal(true)}
                                disabled={!wallet?.balance || wallet?.balance < 500}
                                className="flex-1 bg-white text-[#003836] h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Withdraw Now <ArrowUpRight size={16} />
                            </button>
                            <button
                                onClick={fetchWalletData}
                                className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 active:scale-95 transition-colors"
                            >
                                <RefreshCw size={18} className="text-white" />
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
                        <div className="text-xl font-black">₹{stats?.totalEarnings?.toLocaleString('en-IN') || '0'}</div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                                <Clock size={12} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">This Month</span>
                        </div>
                        <div className="text-xl font-black">₹{stats?.thisMonthEarnings?.toLocaleString('en-IN') || '0'}</div>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-bold text-[#003836]">Recent Transactions</h3>
                    <button className="text-xs font-bold text-blue-600">See All</button>
                </div>

                {transactions.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                        <Wallet size={48} className="text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No transactions yet</p>
                        <p className="text-xs text-gray-400 mt-1">Your earnings will appear here</p>
                    </div>
                ) : (
                    <div ref={listRef}>
                        {transactions.map((txn, idx) => (
                            <TransactionItem key={txn._id || idx} txn={txn} />
                        ))}
                    </div>
                )}

            </div>

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-surface mb-2">Request Withdrawal</h3>
                        <p className="text-sm text-gray-500 mb-6">Enter amount to withdraw to your bank account</p>

                        <div className="mb-6">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Amount (₹)</label>
                            <input
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder="Min ₹500"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold text-surface focus:outline-none focus:border-surface focus:ring-1 focus:ring-surface transition-all"
                            />
                            <p className="text-xs text-gray-400 mt-2">Available: ₹{wallet?.balance?.toLocaleString('en-IN')}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowWithdrawModal(false);
                                    setWithdrawAmount('');
                                }}
                                className="flex-1 bg-gray-100 text-surface font-bold py-3 rounded-xl active:scale-95 transition-transform"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdraw}
                                className="flex-1 bg-surface text-white font-bold py-3 rounded-xl active:scale-95 transition-transform"
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerWallet;
