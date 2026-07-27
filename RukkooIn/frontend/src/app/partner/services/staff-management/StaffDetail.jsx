import React, { useState } from 'react';
import { ChevronLeft, MoreVertical, Camera, Phone, Mail, Calendar, Edit2, MoreHorizontal, User, Briefcase, MapPin, AlertCircle, Plane, CreditCard, FileText, CalendarCheck, Edit, PauseCircle, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const StaffDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = [
    { name: 'Overview', icon: User },
    { name: 'Attendance', icon: CalendarCheck },
    { name: 'Leave', icon: Plane },
    { name: 'Salary', icon: CreditCard },
    { name: 'Documents', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fc] pb-24">
      {/* Header Section */}
      <div className="bg-[#009688] pt-6 pb-20 px-5 rounded-b-[30px] relative">
        <div className="flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <ChevronLeft className="w-7 h-7 cursor-pointer" onClick={() => navigate(-1)} />
            <div>
              <h1 className="text-xl font-bold">Staff Details</h1>
              <div className="flex items-center text-sm text-white/90">
                <span>Sunrise Hotel</span>
                <ChevronDownIcon className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
          <button className="p-1">
            <MoreVertical className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="-mt-14 px-4">
        
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm mb-4 relative">
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img 
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Rahul Sharma" 
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm"
              />
              <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border border-gray-200 shadow-sm text-[#009688]">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {/* Info */}
            <div className="flex-1 pt-1">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-gray-800">Rahul Sharma</h2>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[13px] font-bold text-[#009688]">Receptionist</span>
                <span className="bg-[#e6f4ea] text-[#22c55e] text-[10px] font-bold px-2 py-0.5 rounded-md">Active</span>
              </div>
              
              <div className="flex flex-col gap-1.5 text-xs text-gray-500 mb-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>9876543210</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  <span>rahul.sharma@email.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined on 12 May 2023</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-5 mt-2 pr-2">
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#f0f9f8] flex items-center justify-center text-[#009688]">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-gray-700">Call</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#f0f9f8] flex items-center justify-center text-[#009688]">
                <Edit2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-gray-700">Edit</span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-[#f0f9f8] flex items-center justify-center text-[#009688]">
                <MoreHorizontal className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium text-gray-700">More</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-5 px-1 py-1 flex justify-between overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            return (
              <button 
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex flex-col items-center gap-1.5 px-4 py-2 shrink-0 border-b-2 transition-colors ${isActive ? 'border-[#009688] text-[#009688]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-bold">{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Personal Information */}
        <div className="mb-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3 ml-1">Personal Information</h3>
          <div className="bg-white rounded-3xl p-4 shadow-sm flex flex-col gap-4">
            <InfoRow icon={User} label="Full Name" value="Rahul Sharma" />
            <div className="w-full h-px bg-gray-100"></div>
            <InfoRow icon={Phone} label="Mobile Number" value="9876543210" />
            <div className="w-full h-px bg-gray-100"></div>
            <InfoRow icon={Mail} label="Email" value="rahul.sharma@email.com" />
            <div className="w-full h-px bg-gray-100"></div>
            <InfoRow icon={Briefcase} label="Staff Type" value="Receptionist" />
            <div className="w-full h-px bg-gray-100"></div>
            <InfoRow icon={Calendar} label="Joining Date" value="12 May 2023" />
            <div className="w-full h-px bg-gray-100"></div>
            <InfoRow icon={Calendar} label="Date of Birth" value="15 Aug 1994" />
            <div className="w-full h-px bg-gray-100"></div>
            <InfoRow 
              icon={MapPin} 
              label="Address" 
              value={<>123, MG Road, Indore,<br/>Madhya Pradesh, 452001</>} 
              alignTop
            />
            <div className="w-full h-px bg-gray-100"></div>
            <InfoRow 
              icon={Phone} 
              label="Emergency Contact" 
              value={<>Ramesh Sharma (Father)<br/>9876543211</>} 
              alignTop
            />
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-3 ml-1">Summary</h3>
          <div className="grid grid-cols-4 gap-2">
            <SummaryCard 
              icon={CalendarCheck} 
              title="Attendance" 
              value="22/26" 
              subtitle="This Month"
              bg="bg-[#f0f9f8]" 
              iconColor="text-[#009688]" 
            />
            <SummaryCard 
              icon={Plane} 
              title="Leaves" 
              value="2" 
              subtitle="This Month"
              bg="bg-[#fff9f0]" 
              iconColor="text-[#f59e0b]" 
            />
            <SummaryCard 
              icon={CreditCard} 
              title="Salary Status" 
              value="Paid" 
              subtitle="June 2025"
              bg="bg-[#f0f9f8]" 
              iconColor="text-[#009688]" 
            />
            <SummaryCard 
              icon={FileText} 
              title="Documents" 
              value="4" 
              subtitle="Uploaded"
              bg="bg-[#f8f5ff]" 
              iconColor="text-[#8b5cf6]" 
            />
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex items-center gap-2 mb-8">
          <button className="flex-1 py-3.5 rounded-xl border-2 border-[#009688] flex items-center justify-center gap-2 text-[#009688] font-bold text-sm bg-white">
            <Edit className="w-4 h-4" /> Edit Staff
          </button>
          <button className="flex-1 py-3.5 rounded-xl border-2 border-[#f59e0b] flex items-center justify-center gap-2 text-[#f59e0b] font-bold text-sm bg-white">
            <PauseCircle className="w-4 h-4" /> Deactivate
          </button>
          <button className="flex-1 py-3.5 rounded-xl bg-[#ef4444] border-2 border-[#ef4444] flex items-center justify-center gap-2 text-white font-bold text-sm">
            <Trash2 className="w-4 h-4" /> Delete Staff
          </button>
        </div>

      </div>

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

const InfoRow = ({ icon: Icon, label, value, alignTop }) => (
  <div className={`flex justify-between ${alignTop ? 'items-start' : 'items-center'}`}>
    <div className="flex items-center gap-3 text-gray-700 w-1/2">
      <div className="w-6 h-6 rounded-md bg-[#f0f9f8] flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-[#009688]" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
    <div className={`text-xs font-medium text-gray-600 text-right w-1/2 ${alignTop ? 'leading-relaxed' : ''}`}>
      {value}
    </div>
  </div>
);

const SummaryCard = ({ icon: Icon, title, value, subtitle, bg, iconColor }) => (
  <div className={`${bg} rounded-2xl p-2.5 flex flex-col items-center text-center justify-center`}>
    <Icon className={`w-5 h-5 ${iconColor} mb-2`} />
    <span className="text-[9px] font-semibold text-gray-600 mb-0.5">{title}</span>
    <span className="text-base font-bold text-gray-800 leading-tight mb-0.5">{value}</span>
    <span className="text-[8px] font-medium text-gray-500">{subtitle}</span>
  </div>
);

// Helper component for chevron down in header
const ChevronDownIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default StaffDetail;
