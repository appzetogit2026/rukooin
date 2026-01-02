import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownLeft, FileText, Download, Filter, Search, Calendar } from 'lucide-react';
import gsap from 'gsap';
import PartnerHeader from '../components/PartnerHeader';

const TransactionRow = ({ txn }) => {
    const isCredit = txn.type === 'credit';

    return (
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCredit ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {isCredit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div>
                    <h4 className="font-bold text-[#003836] text-sm group-hover:text-[#004F4D] transition-colors">{txn.desc}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium mt-0.5">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 uppercase tracking-wide">{txn.id}</span>
                        <span>•</span>
                        <span>{txn.date}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <div className={`font-black text-sm ${isCredit ? 'text-green-600' : 'text-[#003836]'}`}>
                    {isCredit ? '+' : '-'}₹{txn.amount}
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${txn.status === 'Success' ? 'text-green-500' :
                    txn.status === 'Pending' ? 'text-orange-500' : 'text-red-500'
                    }`}>
                    {txn.status}
                </div>
            </div>
        </div>
    );
};

const PartnerTransactions = () => {
    const listRef = useRef(null);
    const [filter, setFilter] = useState('all');

    const transactions = [
        { id: 'TXN-9921', desc: 'Booking Payment - Arjun Mehta', date: '27 Aug, 10:30 AM', amount: '2,400', type: 'credit', status: 'Success' },
        { id: 'TXN-9920', desc: 'Weekly Payout to HDFC Bank', date: '26 Aug, 09:00 AM', amount: '15,000', type: 'debit', status: 'Pending' },
        { id: 'TXN-9919', desc: 'Platform Commission Fee', date: '26 Aug, 09:00 AM', amount: '450', type: 'debit', status: 'Success' },
        { id: 'TXN-9915', desc: 'Booking Payment - Sarah Smith', date: '25 Aug, 02:15 PM', amount: '4,500', type: 'credit', status: 'Success' },
        { id: 'TXN-9912', desc: 'Refund - Booking #BK8801', date: '24 Aug, 11:00 AM', amount: '1,200', type: 'debit', status: 'Success' },
        { id: 'TXN-9910', desc: 'Booking Payment - Rahul Verma', date: '23 Aug, 08:45 PM', amount: '3,200', type: 'credit', status: 'Success' },
    ];

    const filteredTxns = transactions.filter(t => filter === 'all' || t.type === filter);

    useEffect(() => {
        if (listRef.current) {
            gsap.fromTo(listRef.current.children,
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.05, duration: 0.3, ease: 'power2.out', clearProps: 'all' }
            );
        }
    }, [filter]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PartnerHeader title="Transactions" subtitle="History & Statements" />

            {/* Filters & Actions */}
            <div className="bg-white sticky top-[73px] z-30 border-b border-gray-100 px-4 py-3 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">

                    {/* Segmented Control */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'all' ? 'bg-white shadow-sm text-[#004F4D]' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('credit')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'credit' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Credits
                        </button>
                        <button
                            onClick={() => setFilter('debit')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === 'debit' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Debits
                        </button>
                    </div>

                    {/* Date / Download */}
                    <div className="flex gap-2">
                        <button className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500 hover:bg-[#004F4D] hover:text-white transition-colors">
                            <Calendar size={16} />
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-lg text-gray-500 hover:bg-[#004F4D] hover:text-white transition-colors">
                            <Download size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 pt-6">

                {/* Search (Optional) */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search by ID or Name..."
                        className="w-full h-12 bg-white rounded-2xl pl-12 pr-4 text-sm font-medium border border-gray-200 shadow-sm focus:outline-none focus:border-[#004F4D]/20 transition-colors"
                    />
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden" ref={listRef}>
                    {filteredTxns.length > 0 ? filteredTxns.map((txn, idx) => (
                        <TransactionRow key={idx} txn={txn} />
                    )) : (
                        <div className="text-center py-12">
                            <FileText size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-400 font-bold">No transactions found</p>
                        </div>
                    )}
                </div>

                <p className="text-center text-[10px] text-gray-400 mt-6 font-medium uppercase tracking-widest">
                    Showing 30 days history
                </p>

            </main>
        </div>
    );
};

export default PartnerTransactions;
