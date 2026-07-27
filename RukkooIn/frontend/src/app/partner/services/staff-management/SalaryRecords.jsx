import React from 'react';
import { ChevronLeft, Filter, Wallet, CheckCircle2, PieChart, IndianRupee, Search, Calendar, ChevronRight, Plus, Building2, Banknote, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SalaryRecords = () => {
  const navigate = useNavigate();

  const salaryData = [
    {
      id: 1,
      name: 'Rahul Sharma',
      role: 'Receptionist',
      month: 'May 2025',
      status: 'Paid',
      statusText: 'Paid on 10 May 2025',
      amount: '₹20,000',
      method: 'UPI',
      img: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      name: 'Priya Patel',
      role: 'Housekeeping',
      month: 'May 2025',
      status: 'Pending',
      statusText: 'Payment Pending',
      amount: '₹15,000',
      method: 'Cash',
      img: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 3,
      name: 'Vikram Singh',
      role: 'Kitchen Staff',
      month: 'May 2025',
      status: 'Paid',
      statusText: 'Paid on 08 May 2025',
      amount: '₹18,000',
      method: 'Bank Transfer',
      img: 'https://randomuser.me/api/portraits/men/62.jpg'
    },
    {
      id: 4,
      name: 'Amit Yadav',
      role: 'Security',
      month: 'May 2025',
      status: 'Pending',
      statusText: 'Payment Pending',
      amount: '₹16,000',
      method: 'UPI',
      img: 'https://randomuser.me/api/portraits/men/86.jpg'
    },
    {
      id: 5,
      name: 'Suresh Kumar',
      role: 'Maintenance',
      month: 'May 2025',
      status: 'Paid',
      statusText: 'Paid on 07 May 2025',
      amount: '₹17,000',
      method: 'Cash',
      img: 'https://randomuser.me/api/portraits/men/67.jpg'
    },
    {
      id: 6,
      name: 'Anjali Verma',
      role: 'Accountant',
      month: 'May 2025',
      status: 'Pending',
      statusText: 'Payment Pending',
      amount: '₹22,000',
      method: 'Bank Transfer',
      img: 'https://randomuser.me/api/portraits/women/24.jpg'
    }
  ];

  const getMethodIcon = (method) => {
    switch (method) {
      case 'UPI': return <span className="text-[10px] font-bold border border-gray-300 rounded-[3px] px-0.5 leading-none mr-1">UPI</span>;
      case 'Cash': return <Banknote className="w-3.5 h-3.5 text-gray-500 mr-1" />;
      case 'Bank Transfer': return <Building2 className="w-3.5 h-3.5 text-gray-500 mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-48">
      {/* Header Section */}
      <div className="bg-[#009688] pt-6 pb-20 px-5 rounded-b-[30px] relative">
        <div className="flex justify-between items-center text-white relative z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Salary Records</h1>
              <div className="flex items-center text-sm text-white/90">
                <span>Sunrise Hotel</span>
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
          <button className="px-3 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 gap-1.5 text-sm font-semibold">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="-mt-14 px-3 relative z-10">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-white rounded-xl p-2.5 flex flex-col items-center justify-between shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#f0f9f8] flex items-center justify-center mb-1">
              <Wallet className="w-3.5 h-3.5 text-[#009688]" />
            </div>
            <div className="text-[9px] font-semibold text-gray-500 text-center mb-0.5">Total Staff</div>
            <div className="text-base font-bold text-gray-800 leading-none">45</div>
          </div>

          <div className="bg-white rounded-xl p-2.5 flex flex-col items-center justify-between shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#f2fbf5] flex items-center justify-center mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
            </div>
            <div className="text-[9px] font-semibold text-gray-500 text-center mb-0.5">Paid This Month</div>
            <div className="text-base font-bold text-gray-800 leading-none">28</div>
          </div>

          <div className="bg-white rounded-xl p-2.5 flex flex-col items-center justify-between shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#fff9f0] flex items-center justify-center mb-1">
              <PieChart className="w-3.5 h-3.5 text-[#f59e0b]" />
            </div>
            <div className="text-[9px] font-semibold text-gray-500 text-center mb-0.5">Pending This Month</div>
            <div className="text-base font-bold text-gray-800 leading-none">17</div>
          </div>

          <div className="bg-white rounded-xl p-2.5 flex flex-col items-center justify-between shadow-sm">
            <div className="w-7 h-7 rounded-full bg-[#eff6ff] flex items-center justify-center mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-[#3b82f6]" />
            </div>
            <div className="text-[9px] font-semibold text-gray-500 text-center mb-0.5">Total Salary Paid</div>
            <div className="text-sm font-bold text-gray-800 leading-none">₹5,60,000</div>
          </div>
        </div>

        {/* Search & Sort */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#009688] focus:border-[#009688] text-sm shadow-sm"
              placeholder="Search by staff name"
            />
          </div>
          <button className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl flex items-center gap-1.5 text-gray-600 font-semibold text-[11px] shadow-sm whitespace-nowrap">
            <SortIcon className="w-3.5 h-3.5" />
            Sort by: Month
            <ChevronDownIcon className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {/* Records List Header */}
        <h2 className="text-[13px] font-bold text-gray-800 mb-3 ml-1">Salary Records</h2>

        {/* Records List */}
        <div className="flex flex-col gap-3">
          {salaryData.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex justify-between">
              
              {/* Left Info */}
              <div className="flex gap-3">
                <img src={record.img} alt={record.name} className="w-12 h-12 rounded-full object-cover bg-gray-200 border border-gray-100" />
                <div className="flex flex-col justify-center">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-0.5">{record.name}</h3>
                  <p className="text-[10px] font-bold text-[#009688] mb-1.5">{record.role}</p>
                  
                  <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px] font-medium">{record.month}</span>
                  </div>
                  
                  <p className={`text-[10px] font-semibold ${record.status === 'Paid' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                    {record.statusText}
                  </p>
                </div>
              </div>

              {/* Right Info */}
              <div className="flex flex-col items-end justify-between py-0.5">
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-bold text-gray-800 text-sm leading-none">{record.amount}</span>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${record.status === 'Paid' ? 'bg-[#e6f4ea] text-[#22c55e]' : 'bg-[#ffeded] text-[#ef4444]'}`}>
                    {record.status === 'Paid' ? (
                      <CheckCircle2 className="w-2.5 h-2.5" />
                    ) : (
                      <ClockIcon className="w-2.5 h-2.5" />
                    )}
                    <span className="text-[9px] font-bold">{record.status}</span>
                  </div>
                </div>
                
                <button className="flex items-center gap-0.5 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md mt-2 hover:bg-gray-100 transition-colors">
                  {getMethodIcon(record.method)}
                  <span className="text-[10px] font-semibold text-gray-700">{record.method}</span>
                  <ChevronRight className="w-3 h-3 text-gray-400 ml-0.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Sticky Bottom Summary Bar */}
      <div className="fixed bottom-[75px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-md z-40 bg-[#f0f9f8] rounded-2xl p-3 border border-[#d6efec] shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#009688]/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#009688]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-semibold text-[#009688]">Total Salary (May 2025)</span>
            <span className="text-sm font-bold text-gray-800">₹1,08,000</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-right border-l border-[#d6efec] pl-2 shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-semibold text-[#22c55e]">Paid</span>
            <span className="text-[10px] font-bold text-[#22c55e]">₹64,000</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-semibold text-[#ef4444]">Pending</span>
            <span className="text-[10px] font-bold text-[#ef4444]">₹44,000</span>
          </div>
        </div>
      </div>

      {/* Extended FAB */}
      <div className="fixed bottom-[145px] right-4 z-50">
        <button className="bg-[#009688] px-4 py-3 rounded-full flex items-center gap-2 text-white shadow-lg border-2 border-white/50 hover:bg-teal-600 transition-colors">
          <Plus className="w-5 h-5" />
          <span className="font-bold text-[13px]">Add Salary Record</span>
        </button>
      </div>

    </div>
  );
};

// Custom Icons
const ChevronDownIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const SortIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 16H3"/><path d="M16 16H13"/><path d="M21 16H19"/><path d="M16 8H3"/><path d="M21 8H19"/><path d="M12 22v-6"/><path d="M12 8V2"/><path d="M15 5l-3-3-3 3"/><path d="M15 19l-3 3-3-3"/>
  </svg>
);

const ClockIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

export default SalaryRecords;
