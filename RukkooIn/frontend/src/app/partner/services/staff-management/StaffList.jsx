import React from 'react';
import { ChevronLeft, Filter, Search, ChevronDown, Phone, Calendar, ChevronRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffList = () => {
  const navigate = useNavigate();

  const staffData = [
    {
      id: 1,
      name: 'Rahul Sharma',
      role: 'Receptionist',
      phone: '9876543210',
      joined: '12 May 2023',
      status: 'Active',
      attendance: 'Present Today',
      attendanceType: 'present',
      img: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      name: 'Priya Patel',
      role: 'Housekeeping',
      phone: '9876543211',
      joined: '18 Jun 2023',
      status: 'Active',
      attendance: 'Present Today',
      attendanceType: 'present',
      img: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 3,
      name: 'Vikram Singh',
      role: 'Kitchen Staff',
      phone: '9876543212',
      joined: '01 Apr 2023',
      status: 'Active',
      attendance: 'Half Day',
      attendanceType: 'half',
      img: 'https://randomuser.me/api/portraits/men/62.jpg'
    },
    {
      id: 4,
      name: 'Amit Yadav',
      role: 'Security',
      phone: '9876543213',
      joined: '20 Jan 2023',
      status: 'Active',
      attendance: 'Absent Today',
      attendanceType: 'absent',
      img: 'https://randomuser.me/api/portraits/men/86.jpg'
    },
    {
      id: 5,
      name: 'Suresh Kumar',
      role: 'Maintenance',
      phone: '9876543214',
      joined: '15 Sep 2023',
      status: 'Inactive',
      attendance: 'Absent Today',
      attendanceType: 'inactive',
      img: 'https://randomuser.me/api/portraits/men/67.jpg'
    }
  ];

  const getAttendanceStyle = (type) => {
    switch (type) {
      case 'present':
        return 'bg-[#e6f4ea] text-[#22c55e] border-[#22c55e]';
      case 'half':
        return 'bg-[#fff5e6] text-[#f59e0b] border-[#f59e0b]';
      case 'absent':
        return 'bg-[#ffeded] text-[#ef4444] border-[#ef4444]';
      case 'inactive':
        return 'bg-[#f3f4f6] text-gray-500 border-gray-400';
      default:
        return 'bg-gray-100 text-gray-500';
    }
  };

  const getAttendanceDotColor = (type) => {
    switch (type) {
      case 'present': return 'bg-[#22c55e]';
      case 'half': return 'bg-[#f59e0b]';
      case 'absent': return 'bg-[#ef4444]';
      case 'inactive': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-32">
      {/* Header Section */}
      <div className="bg-[#009688] pt-6 pb-12 px-5 rounded-b-[30px] relative">
        <div className="flex justify-between items-center mb-4 text-white">
          <div className="flex items-center gap-3">
            <ChevronLeft className="w-7 h-7 cursor-pointer" onClick={() => navigate('/hotel/staff-management')} />
            <div>
              <h1 className="text-xl font-bold">Staff Management</h1>
              <div className="flex items-center text-sm text-white/90">
                <span>Sunrise Hotel</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
          <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <Filter className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="-mt-8 px-3">
        <div className="bg-white rounded-3xl p-4 shadow-sm min-h-[500px]">
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#009688] focus:border-[#009688] sm:text-sm"
              placeholder="Search by name or mobile number"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-5 pb-1">
            <button className="px-4 py-1.5 rounded-full bg-[#009688] text-white text-xs font-semibold whitespace-nowrap shrink-0">
              All
            </button>
            {['Manager', 'Receptionist', 'Housekeeping', 'Kitchen'].map((role) => (
              <button key={role} className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-700 text-xs font-semibold whitespace-nowrap shrink-0">
                {role}
              </button>
            ))}
            <button className="px-4 py-1.5 rounded-full border border-gray-200 text-gray-700 text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1">
              Secu... <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* List Header */}
          <div className="flex justify-between items-center mb-4 px-1">
            <div className="text-sm font-bold text-gray-800">Total Staff: 45</div>
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-600 cursor-pointer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 16H3"/><path d="M16 16H13"/><path d="M21 16H19"/><path d="M16 8H3"/><path d="M21 8H19"/><path d="M12 22v-6"/><path d="M12 8V2"/><path d="M15 5l-3-3-3 3"/><path d="M15 19l-3 3-3-3"/></svg>
              <span>Sort by: Name (A-Z)</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Staff List */}
          <div className="flex flex-col gap-3">
            {staffData.map((staff) => (
              <div 
                key={staff.id} 
                className="border border-gray-100 rounded-2xl p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] relative cursor-pointer hover:shadow-md transition-shadow bg-white"
                onClick={() => navigate(`/hotel/staff-detail/${staff.id}`)}
              >
                
                {/* Status Badge */}
                <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold ${staff.status === 'Active' ? 'bg-[#e6f4ea] text-[#22c55e]' : 'bg-gray-100 text-gray-500'}`}>
                  {staff.status}
                </div>

                <div className="flex items-start gap-3">
                  <img src={staff.img} alt={staff.name} className="w-14 h-14 rounded-full object-cover bg-gray-200 border border-gray-100" />
                  
                  <div className="flex-1 mt-0.5">
                    <h3 className="font-bold text-gray-800 text-sm">{staff.name}</h3>
                    <p className="text-[11px] font-bold text-[#009688] mb-2">{staff.role}</p>
                    
                    <div className="flex flex-col gap-2.5 mt-2">
                      {/* Row 1: Phone number & Attendance pill */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-3.5 h-3.5" />
                          <span className="text-xs font-medium">{staff.phone}</span>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${getAttendanceStyle(staff.attendanceType)} border`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${getAttendanceDotColor(staff.attendanceType)}`}></div>
                          <span className="text-[10px] font-bold">{staff.attendance}</span>
                        </div>
                      </div>

                      {/* Row 2: Joined date & Action buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Joined {staff.joined}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-[#009688]">
                            <Phone className="w-4 h-4" />
                          </button>
                          <button className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Extended FAB */}
      <div className="fixed bottom-24 right-4 z-50">
        <button className="bg-[#009688] px-5 py-3 rounded-full flex items-center gap-2 text-white shadow-lg border-2 border-white/50 hover:bg-teal-600 transition-colors">
          <Plus className="w-5 h-5" />
          <span className="font-bold text-sm">Add Staff</span>
        </button>
      </div>
      
      {/* CSS for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default StaffList;
