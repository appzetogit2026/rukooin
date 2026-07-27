import React from 'react';
import { Menu, Bell, Users, CheckCircle2, XCircle, UserX, FileClock, UserPlus, CalendarCheck, FileText, CreditCard, ChevronDown, Phone, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const StaffManagement = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-32">
      {/* Header Section */}
      <div className="bg-[#009688] pt-6 pb-12 px-5 rounded-b-[30px] relative">
        <div className="flex justify-between items-center mb-4 text-white">
          <div className="flex items-center gap-4">
            <Menu className="w-7 h-7" />
            <div>
              <h1 className="text-xl font-bold">Staff Management</h1>
              <div className="flex items-center text-sm text-white/90">
                <span>Sunrise Hotel</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
          <div className="relative">
            <Bell className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 bg-teal-400 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#009688]">
              3
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Pulling up over header */}
      <div className="-mt-8 px-3">
        {/* Overview Section */}
        <div className="bg-white rounded-2xl p-3 shadow-sm mb-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-gray-800">Overview</h2>
            <div className="flex items-center gap-1.5 bg-[#f0f9f8] text-[#009688] px-2.5 py-1 rounded-lg text-[10px] font-semibold">
              <CalendarCheck className="w-4 h-4" />
              <span>22 May, 2025</span>
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-4 gap-1.5 mb-3">
            <div 
              className="bg-[#f0f9f8] rounded-xl p-2 flex flex-col items-center text-center cursor-pointer hover:bg-teal-50 transition-colors"
              onClick={() => navigate('/hotel/staff-list')}
            >
              <div className="w-6 h-6 rounded-full bg-[#009688] flex items-center justify-center mb-1">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="text-base font-bold text-gray-800 leading-tight">45</div>
              <div className="text-[9px] font-semibold text-[#009688] leading-tight">Total Staff</div>
            </div>
            
            <div className="bg-[#f2fbf5] rounded-xl p-2 flex flex-col items-center text-center border border-[#e6f4ea]">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
              </div>
              <div className="text-base font-bold text-gray-800 leading-tight">34</div>
              <div className="text-[9px] font-semibold text-[#22c55e] leading-tight">Present Today</div>
            </div>

            <div className="bg-[#fff5f5] rounded-xl p-2 flex flex-col items-center text-center border border-[#ffeded]">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm">
                <XCircle className="w-3.5 h-3.5 text-[#ef4444]" />
              </div>
              <div className="text-base font-bold text-gray-800 leading-tight">6</div>
              <div className="text-[9px] font-semibold text-[#ef4444] leading-tight">Absent Today</div>
            </div>

            <div className="bg-[#fff9f0] rounded-xl p-2 flex flex-col items-center text-center border border-[#ffeed6]">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mb-1 shadow-sm">
                <UserX className="w-3.5 h-3.5 text-[#f59e0b]" />
              </div>
              <div className="text-base font-bold text-gray-800 leading-tight">3</div>
              <div className="text-[9px] font-semibold text-[#f59e0b] leading-tight">On Leave</div>
            </div>
          </div>

          <div className="bg-[#f8f5ff] rounded-xl p-2.5 flex items-center gap-3 w-fit pr-6 border border-[#f0eaff]">
            <div className="w-8 h-8 rounded-full bg-[#8b5cf6] flex items-center justify-center shrink-0">
              <FileClock className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-gray-800 leading-tight">2</div>
              <div className="text-[10px] font-medium text-gray-500">Pending Leaves</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 ml-1">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: UserPlus, label: 'Add Staff', color: 'text-[#009688]', bg: 'bg-[#f0f9f8]', route: null },
              { icon: CalendarCheck, label: 'Mark Attendance', color: 'text-[#009688]', bg: 'bg-[#f0f9f8]', route: '/hotel/mark-attendance' },
              { icon: FileClock, label: 'Leave Requests', color: 'text-[#009688]', bg: 'bg-[#f0f9f8]', badge: 2, route: null },
              { icon: CreditCard, label: 'Salary Records', color: 'text-[#009688]', bg: 'bg-[#f0f9f8]', route: '/hotel/salary-records' },
            ].map((action, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-3 flex flex-col items-center justify-center gap-2 shadow-sm relative cursor-pointer hover:bg-teal-50 transition-colors"
                onClick={() => { if (action.route) navigate(action.route) }}
              >
                {action.badge && (
                  <span className="absolute -top-2 -right-2 bg-[#009688] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {action.badge}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-full ${action.bg} flex items-center justify-center mb-1`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">{action.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Staff */}
        <div>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-bold text-gray-800">Recent Staff</h2>
            <button 
              className="text-[#009688] text-sm font-semibold flex items-center gap-1 cursor-pointer"
              onClick={() => navigate('/hotel/staff-list')}
            >
              View All <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>
          </div>
          
          <div className="bg-white rounded-3xl p-2 shadow-sm">
            {[
              { name: 'Rahul Sharma', role: 'Receptionist', status: 'Present', img: 'https://randomuser.me/api/portraits/men/32.jpg' },
              { name: 'Priya Patel', role: 'Housekeeping', status: 'Present', img: 'https://randomuser.me/api/portraits/women/44.jpg' },
              { name: 'Amit Verma', role: 'Kitchen Staff', status: 'Present', img: 'https://randomuser.me/api/portraits/men/67.jpg' },
              { name: 'Sanjay Kumar', role: 'Security', status: 'Absent', img: 'https://randomuser.me/api/portraits/men/86.jpg', noBorder: true },
            ].map((staff, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 ${!staff.noBorder ? 'border-b border-gray-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <img src={staff.img} alt={staff.name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{staff.name}</h3>
                    <p className="text-xs text-gray-500">{staff.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${staff.status === 'Present' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`}></div>
                    <span className="text-xs font-medium text-gray-600">{staff.status}</span>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-[#f0f9f8] flex items-center justify-center">
                    <Phone className="w-4 h-4 text-[#009688]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAB - Adjusted position to sit above the existing bottom navbar */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50">
        <button className="w-14 h-14 bg-[#009688] rounded-full flex items-center justify-center text-white shadow-lg border-[4px] border-white/50 hover:bg-teal-600 transition-colors">
          <Plus className="w-7 h-7" />
        </button>
      </div>

    </div>
  );
};

export default StaffManagement;
