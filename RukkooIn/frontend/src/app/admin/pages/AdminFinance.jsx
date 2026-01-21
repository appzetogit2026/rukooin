import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, TrendingUp, Download, ArrowUpRight, ArrowDownRight,
    CreditCard, Calendar, CheckCircle, Clock, Loader2, Building2,
    Users, Search, Filter, Eye, XCircle, ShieldCheck, AlertCircle
} from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';

const currency = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const FinanceStatCard = ({ title, value, subtext, color, icon: Icon, loading }) => (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
            {loading ? (
                <div className="h-8 w-24 bg-gray-50 animate-pulse rounded-lg"></div>
            ) : (
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{value}</h3>
            )}
            {subtext && <p className={`text-[9px] font-bold mt-1 uppercase ${color}`}>{subtext}</p>}
        </div>
        <div className={`p-4 rounded-2xl ${color.replace('text-', 'bg-').split('-')[0] + '-50'} ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

const AdminFinance = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [financeData, setFinanceData] = useState({
        stats: {},
        recentTransactions: [],
        pendingWithdrawals: [],
        processedWithdrawals: []
    });

    const [transactions, setTransactions] = useState([]);
    const [txLoading, setTxLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'success', onConfirm: () => { } });
    const [processingId, setProcessingId] = useState(null);

    const fetchFinanceData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await adminService.getFinanceData();
            if (res.success) {
                setFinanceData({
                    stats: res.stats,
                    recentTransactions: res.recentTransactions,
                    pendingWithdrawals: res.pendingWithdrawals,
                    processedWithdrawals: res.processedWithdrawals
                });
            }
        } catch (error) {
            console.error('Finance Fetch Error:', error);
            toast.error('Failed to load financial records');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTransactions = useCallback(async (p) => {
        try {
            setTxLoading(true);
            const res = await adminService.getTransactions({ page: p, limit: 10 });
            if (res.success) {
                setTransactions(res.transactions);
            }
        } catch (error) {
            toast.error('Failed to load logs');
        } finally {
            setTxLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinanceData();
    }, [fetchFinanceData]);

    useEffect(() => {
        if (activeTab === 'transactions') {
            fetchTransactions(page);
        }
    }, [activeTab, page, fetchTransactions]);

    const handleWithdrawalAction = (withdrawal, action) => {
        const isApprove = action === 'approve';
        setModalConfig({
            isOpen: true,
            title: isApprove ? 'Approve Settlement?' : 'Reject Request?',
            message: isApprove
                ? `You are about to approve a payout of ${currency(withdrawal.amount)} to ${withdrawal.partnerId?.name}. Please ensure bank transfer is initiated.`
                : `Rejecting this will return the funds to the partner's wallet.`,
            type: isApprove ? 'success' : 'danger',
            confirmText: isApprove ? 'Mark as Paid' : 'Reject Forever',
            onConfirm: async () => {
                try {
                    setProcessingId(withdrawal._id);
                    const res = await adminService.processWithdrawal({
                        withdrawalId: withdrawal._id,
                        action,
                        remarks: isApprove ? 'Processed by Admin' : 'Documentation mismatch',
                        utrNumber: isApprove ? 'UTR-' + Date.now() : ''
                    });
                    if (res.success) {
                        toast.success(`Payout ${action}d successfully`);
                        fetchFinanceData();
                    }
                } catch {
                    toast.error('Processing failed');
                } finally {
                    setProcessingId(null);
                }
            }
        });
    };

    return (
        <div className="space-y-6 pb-20">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
                        <Wallet size={32} /> Financial Command
                    </h2>
                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">System-wide revenue tracking and partner settlement portal.</p>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
                    {['overview', 'payouts', 'transactions'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FinanceStatCard
                    title="Gross GMV"
                    value={currency(financeData.stats.totalRevenue)}
                    subtext="TOTAL SALES VOLUME"
                    color="text-green-600"
                    icon={TrendingUp}
                    loading={loading}
                />
                <FinanceStatCard
                    title="Platform Commission"
                    value={currency(financeData.stats.totalCommissions)}
                    subtext="PLATFORM EARNINGS"
                    color="text-indigo-600"
                    icon={ShieldCheck}
                    loading={loading}
                />
                <FinanceStatCard
                    title="Payouts Disbursed"
                    value={currency(financeData.stats.totalPayouts)}
                    subtext="SETTLED WITH PARTNERS"
                    color="text-blue-600"
                    icon={CreditCard}
                    loading={loading}
                />
                <FinanceStatCard
                    title="Pending Payouts"
                    value={currency(financeData.stats.pendingPayouts)}
                    subtext="DUE FOR RELEASE"
                    color="text-amber-600"
                    icon={Clock}
                    loading={loading}
                />
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        {/* Summary Box */}
                        <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                                <AlertCircle size={18} className="text-orange-500" /> System Settlement Rules
                            </h3>
                            <div className="space-y-4">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Commission Policy</p>
                                    <p className="text-xs font-bold text-gray-800 uppercase tracking-tight">System automatically deducts 15-20% platform fee from setiap check-out completion.</p>
                                </div>
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Payout Cycle</p>
                                    <p className="text-xs font-bold text-gray-800 uppercase tracking-tight">Manual Review required for all withdrawals above ₹5,000. Under ₹5,000 processed within 24-48 hours.</p>
                                </div>
                                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <p className="text-[10px] font-black uppercase text-indigo-400 mb-1">Wallet Verification</p>
                                    <p className="text-xs font-bold text-indigo-900 uppercase tracking-tight">Partner bank accounts must be independently verified before settlement release.</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions List */}
                        <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center justify-between">
                                <span>Recent General Ledger</span>
                                <button onClick={() => setActiveTab('transactions')} className="text-[9px] text-indigo-600 font-black hover:underline">VIEW ALL</button>
                            </h3>
                            <div className="space-y-2">
                                {financeData.recentTransactions.map(tx => (
                                    <div key={tx._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                {tx.type === 'credit' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-gray-900 truncate max-w-[150px]">{tx.description}</p>
                                                <p className="text-[8px] font-bold text-gray-400 uppercase">{tx.partnerId?.name} • {new Date(tx.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'credit' ? '+' : '-'}{currency(tx.amount)}
                                            </p>
                                            <p className={`text-[8px] font-black uppercase ${tx.status === 'completed' ? 'text-green-500' : 'text-amber-500'}`}>{tx.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'payouts' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tighter">Settlement Queue</h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Found {financeData.pendingWithdrawals.length} partners waiting for funds.</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400">
                                        <tr>
                                            <th className="px-8 py-4">Request Details</th>
                                            <th className="px-8 py-4">Bank Destination</th>
                                            <th className="px-8 py-4">Net Amount</th>
                                            <th className="px-8 py-4 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {financeData.pendingWithdrawals.map(wd => (
                                            <tr key={wd._id} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <p className="text-xs font-black text-gray-900 uppercase">#{wd.withdrawalId}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mt-0.5">{wd.partnerId?.name}</p>
                                                    <p className="text-[9px] font-bold text-gray-300 mt-1 uppercase tracking-tighter italic">Requested {new Date(wd.createdAt).toLocaleString()}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-[10px] font-black text-gray-800 uppercase">{wd.bankDetails?.bankName}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{wd.bankDetails?.accountNumber}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{wd.bankDetails?.ifscCode}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl font-black text-gray-900">{currency(wd.amount)}</span>
                                                        <AlertCircle size={12} className="text-amber-500 animate-pulse" />
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            disabled={processingId === wd._id}
                                                            onClick={() => handleWithdrawalAction(wd, 'reject')}
                                                            className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                        <button
                                                            disabled={processingId === wd._id}
                                                            onClick={() => handleWithdrawalAction(wd, 'approve')}
                                                            className="flex-1 py-3 bg-black text-white text-[10px] font-black uppercase rounded-2xl hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            {processingId === wd._id ? <Loader2 className="animate-spin" size={14} /> : <>Approve Release <ArrowRight size={14} /></>}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {financeData.pendingWithdrawals.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center">
                                                    <CheckCircle size={48} className="mx-auto text-green-100 mb-4" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">All settlements are clear. Zero pending requests.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'transactions' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center bg-gray-50/50 gap-4">
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                        <Download size={20} className="text-indigo-600" /> Complete Ledger
                                    </h3>
                                    <p className="text-[10px] font-black uppercase text-gray-400 mt-1">Verified audit log of every monetary movement on the platform.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
                                        <Filter size={14} /> Filter Logs
                                    </button>
                                    <button className="px-6 py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase shadow-lg flex items-center gap-2">
                                        <Download size={14} /> Download Ledger
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400">
                                        <tr>
                                            <th className="px-8 py-4">Timestamp</th>
                                            <th className="px-8 py-4">Partner Entity</th>
                                            <th className="px-8 py-4">Mechanism / Proof</th>
                                            <th className="px-8 py-4">Context</th>
                                            <th className="px-8 py-4 text-right">Delta</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {txLoading ? (
                                            [1, 2, 3, 4, 5].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan="5" className="px-8 py-6"><div className="h-10 bg-gray-50 rounded-xl"></div></td>
                                                </tr>
                                            ))
                                        ) : (
                                            transactions.map(tx => (
                                                <tr key={tx._id} className="hover:bg-gray-50/20 transition-all">
                                                    <td className="px-8 py-5">
                                                        <p className="text-[10px] font-black text-gray-900 uppercase">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase">{new Date(tx.createdAt).toLocaleTimeString()}</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-[10px] font-black text-gray-800 uppercase">{tx.partnerId?.name}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase">{tx.partnerId?.email}</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${tx.type === 'credit' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                                {tx.category}
                                                            </span>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase font-mono tracking-tighter">REF: {tx.reference || 'SYSTEM'}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 max-w-[200px]">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-tight truncate">{tx.description}</p>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <p className={`text-sm font-black ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {tx.type === 'credit' ? '+' : '-'}{currency(tx.amount)}
                                                        </p>
                                                        <p className="text-[8px] font-black text-gray-300 uppercase">BAL: {currency(tx.balanceAfter)}</p>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ArrowRight = ({ size }) => <ArrowUpRight size={size} />;

export default AdminFinance;
