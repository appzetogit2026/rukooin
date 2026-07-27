import React, { useState } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, Search, Filter, CheckCircle2, XCircle, Users, RefreshCcw, Save, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MarkAttendance = () => {
  const navigate = useNavigate();

  const initialStaff = [
    {
      id: 1,
      name: 'Rahul Sharma',
      role: 'Receptionist',
      phone: '9876543210',
      attendance: 'present',
      img: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 2,
      name: 'Priya Patel',
      role: 'Housekeeping',
      phone: '9876543211',
      attendance: 'absent',
      img: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 3,
      name: 'Vikram Singh',
      role: 'Kitchen Staff',
      phone: '9876543212',
      attendance: 'half',
      img: 'https://randomuser.me/api/portraits/men/62.jpg'
    },
    {
      id: 4,
      name: 'Amit Yadav',
      role: 'Security',
      phone: '9876543213',
      attendance: 'absent',
      img: 'https://randomuser.me/api/portraits/men/86.jpg'
    },
    {
      id: 5,
      name: 'Suresh Kumar',
      role: 'Maintenance',
      phone: '9876543214',
      attendance: 'present',
      img: 'https://randomuser.me/api/portraits/men/67.jpg'
    },
    {
      id: 6,
      name: 'Anjali Verma',
      role: 'Accountant',
      phone: '9876543215',
      attendance: 'half',
      img: 'https://randomuser.me/api/portraits/women/24.jpg'
    },
    {
      id: 7,
      name: 'Rohit Mehta',
      role: 'Manager',
      phone: '9876543216',
      attendance: 'present',
      img: 'https://randomuser.me/api/portraits/men/55.jpg'
    }
  ];

  const [staffData, setStaffData] = useState(initialStaff);

  const handleAttendanceChange = (id, status) => {
    setStaffData(staffData.map(staff => 
      staff.id === id ? { ...staff, attendance: status } : staff
    ));
  };

  const getCounts = () => {
    let present = 0, absent = 0, half = 0;
    staffData.forEach(s => {
      if (s.attendance === 'present') present++;
      if (s.attendance === 'absent') absent++;
      if (s.attendance === 'half') half++;
    });
    return { present, absent, half, total: staffData.length };
  };

  const counts = getCounts();

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-32">
      {/* Header Section */}
      <div className="bg-[#009688] pt-6 pb-20 px-5 rounded-b-[30px] relative overflow-hidden">
        {/* Decorative Wave/Blob if needed - for now just plain background as per previous screens, though image shows a slight wave */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="flex justify-between items-center text-white relative z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Mark Attendance</h1>
              <div className="flex items-center text-sm text-white/90">
                <span>Sunrise Hotel</span>
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
          <button className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <CalendarIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="-mt-14 px-3">
        
        {/* Today's Summary Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-gray-800">Today's Summary</h2>
            <div className="flex items-center gap-1.5 bg-[#f0f9f8] text-[#009688] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>22 May, 2025</span>
              <ChevronDownIcon className="w-3 h-3 ml-0.5" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#f2fbf5] rounded-xl p-2.5 flex flex-col justify-between border border-[#e6f4ea]">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800 leading-none mb-1">{counts.present}</div>
                <div className="text-[10px] font-semibold text-gray-500">Present</div>
              </div>
            </div>

            <div className="bg-[#fff5f5] rounded-xl p-2.5 flex flex-col justify-between border border-[#ffeded]">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                <XCircle className="w-4 h-4 text-[#ef4444]" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800 leading-none mb-1">{counts.absent}</div>
                <div className="text-[10px] font-semibold text-gray-500">Absent</div>
              </div>
            </div>

            <div className="bg-[#fff9f0] rounded-xl p-2.5 flex flex-col justify-between border border-[#ffeed6]">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                <HalfDayIcon className="w-4 h-4 text-[#f59e0b]" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800 leading-none mb-1">{counts.half}</div>
                <div className="text-[10px] font-semibold text-gray-500">Half Day</div>
              </div>
            </div>

            <div className="bg-[#f4f7fb] rounded-xl p-2.5 flex flex-col justify-between border border-[#e8eff7]">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm">
                <Users className="w-4 h-4 text-[#64748b]" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-800 leading-none mb-1">{counts.total}</div>
                <div className="text-[10px] font-semibold text-gray-500">Total Staff</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#009688] focus:border-[#009688] text-sm shadow-sm"
              placeholder="Search staff by name"
            />
          </div>
          <button className="px-4 bg-white border border-gray-200 rounded-2xl flex items-center gap-2 text-[#009688] font-semibold text-sm shadow-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* List Header */}
        <div className="flex justify-between items-center mb-2 px-4 bg-gray-100/50 py-2 rounded-lg">
          <span className="text-[11px] font-bold text-gray-500">Staff Member</span>
          <span className="text-[11px] font-bold text-gray-500 mr-8">Attendance Status</span>
        </div>

        {/* Staff List */}
        <div className="flex flex-col gap-3">
          {staffData.map((staff) => (
            <div key={staff.id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center justify-between">
              
              {/* Staff Info */}
              <div className="flex items-center gap-3 w-[45%]">
                <img src={staff.img} alt={staff.name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                <div className="flex flex-col">
                  <h3 className="font-bold text-gray-800 text-sm leading-tight mb-0.5">{staff.name}</h3>
                  <p className="text-[10px] font-bold text-[#009688] mb-0.5">{staff.role}</p>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Phone className="w-2.5 h-2.5" />
                    <span className="text-[9px]">{staff.phone}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Buttons */}
              <div className="flex items-center gap-1.5 w-[55%] justify-end">
                <button 
                  onClick={() => handleAttendanceChange(staff.id, 'present')}
                  className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl border transition-colors flex-1 ${
                    staff.attendance === 'present' 
                      ? 'bg-[#009688] border-[#009688] text-white shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 mb-0.5 ${staff.attendance === 'present' ? 'text-white' : 'text-[#22c55e]'}`} />
                  <span className="text-[9px] font-bold">Present</span>
                </button>
                
                <button 
                  onClick={() => handleAttendanceChange(staff.id, 'absent')}
                  className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl border transition-colors flex-1 ${
                    staff.attendance === 'absent' 
                      ? 'bg-[#ef4444] border-[#ef4444] text-white shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <XCircle className={`w-4 h-4 mb-0.5 ${staff.attendance === 'absent' ? 'text-white' : 'text-[#ef4444]'}`} />
                  <span className="text-[9px] font-bold">Absent</span>
                </button>
                
                <button 
                  onClick={() => handleAttendanceChange(staff.id, 'half')}
                  className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl border transition-colors flex-1 ${
                    staff.attendance === 'half' 
                      ? 'bg-[#f59e0b] border-[#f59e0b] text-white shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <HalfDayIcon className={`w-4 h-4 mb-0.5 ${staff.attendance === 'half' ? 'text-white' : 'text-[#f59e0b]'}`} />
                  <span className="text-[9px] font-bold">Half Day</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3 mt-6 mb-8">
          <button className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm w-[35%]">
            <RefreshCcw className="w-4 h-4" />
            Clear All
          </button>
          <button className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#009688] text-white font-bold text-sm flex-1 shadow-lg shadow-teal-500/30">
            <Save className="w-4 h-4" />
            Save Attendance
          </button>
        </div>

      </div>
    </div>
  );
};

const ChevronDownIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const HalfDayIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M12 2v20"></path>
  </svg>
);

export default MarkAttendance;
