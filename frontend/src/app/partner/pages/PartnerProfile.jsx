import React, { useEffect, useRef, useState } from 'react';
import { User, Mail, Phone, MapPin, Edit, Save, Camera, Lock, Menu, Wallet, CreditCard } from 'lucide-react';
import gsap from 'gsap';
import usePartnerStore from '../store/partnerStore';
import { userService, authService } from '../../../services/apiService';
import logo from '../../../assets/rokologin-removebg-preview.png';
import { useNavigate } from 'react-router-dom';

const Field = ({ label, value, icon: Icon, isEditing, onChange }) => (
    <div className="mb-4">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">{label}</label>
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isEditing ? 'bg-white border-[#004F4D] ring-1 ring-[#004F4D]/10' : 'bg-gray-50 border-gray-100'}`}>
            <Icon size={16} className="text-gray-400" />
            {isEditing ? (
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    className="flex-1 bg-transparent text-sm font-bold text-[#003836] focus:outline-none"
                    placeholder="Not set"
                />
            ) : (
                <span className="flex-1 text-sm font-bold text-[#003836] truncate">{value || 'Not set'}</span>
            )}
        </div>
    </div>
);

const PartnerProfile = () => {
    const { formData } = usePartnerStore();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const containerRef = useRef(null);
    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [memberSince, setMemberSince] = useState('');
    const [partnerId, setPartnerId] = useState('');
    const [profile, setProfile] = useState({
        name: formData?.propertyName || '',
        email: '',
        phone: '',
        address: '',
        role: 'partner',
        aadhaarNumber: '',
        panNumber: ''
    });

    useEffect(() => {
        gsap.fromTo(containerRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    }, []);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await userService.getProfile();
                const addr = data.address || {};
                const addrStr = [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
                setProfile({
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    address: addrStr,
                    role: data.role || 'partner',
                    aadhaarNumber: data.aadhaarNumber || '',
                    panNumber: data.panNumber || ''
                });
                setApprovalStatus(data.partnerApprovalStatus || 'pending');
                setMemberSince(data.partnerSince || data.createdAt || '');
                setPartnerId(data._id || '');
            } catch {
                console.error('Failed to load partner profile');
                setProfile((p) => ({
                    ...p,
                    name: p.name || 'Partner',
                    role: 'partner'
                }));
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (field, e) => {
        setProfile({ ...profile, [field]: e.target.value });
    };

    const parseAddress = (str) => {
        const parts = (str || '').split(',').map(s => s.trim()).filter(Boolean);
        return {
            street: parts[0] || '',
            city: parts[1] || '',
            state: parts[2] || '',
            zipCode: '',
            country: 'India'
        };
    };

    const handleToggleEdit = async () => {
        if (isEditing) {
            const addressObj = parseAddress(profile.address);
            try {
                const res = await authService.updateProfile({
                    name: profile.name,
                    email: profile.email,
                    phone: profile.phone,
                    address: addressObj
                });
                const updated = res.user || {};
                const addr = updated.address || addressObj;
                const addrStr = [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
                setProfile({
                    ...profile,
                    name: updated.name || profile.name,
                    email: updated.email || profile.email,
                    phone: updated.phone || profile.phone,
                    address: addrStr,
                    role: updated.role || profile.role
                });
                setIsEditing(false);
            } catch {
                setIsEditing(false);
            }
        } else {
            setIsEditing(true);
        }
    };

    const statusLabel = approvalStatus === 'approved' ? 'Verified Partner' : approvalStatus === 'rejected' ? 'Rejected' : 'Pending Approval';
    const statusClass = approvalStatus === 'approved' ? 'text-green-600 bg-green-50' : approvalStatus === 'rejected' ? 'text-red-600 bg-red-50' : 'text-orange-600 bg-orange-50';

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Custom Header */}
            <div className="flex items-center justify-between relative h-14 px-4 pt-2 bg-white/50 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100/50">
                <button
                    onClick={() => { }} // Placeholder for sidebar toggle if needed, or remove if sidebar logic isn't here
                    className="p-1.5 rounded-full bg-white hover:bg-gray-100 transition shadow-sm border border-gray-100"
                >
                    <Menu size={18} className="text-[#003836]" />
                </button>

                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-1">
                    <img src={logo} alt="Rukko" className="h-7 object-contain drop-shadow-sm" />
                </div>

                <button
                    onClick={() => navigate('/hotel/wallet')}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform"
                >
                    <div className="w-5 h-5 bg-[#004F4D] rounded-full flex items-center justify-center">
                        <Wallet size={10} className="text-white" />
                    </div>
                    <div className="flex flex-col items-start leading-none mr-0.5">
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide">Wallet</span>
                        <span className="text-[10px] font-bold text-[#003836]">₹0</span>
                    </div>
                </button>
            </div>

            <main ref={containerRef} className="max-w-xl mx-auto px-4 pt-8">

                {/* Avatar Section */}
                <div className="text-center mb-8 relative">
                    <div className="w-24 h-24 bg-[#004F4D] text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto shadow-xl shadow-[#004F4D]/20 relative group overflow-hidden">
                        {(profile.name || 'P').substring(0, 2).toUpperCase()}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera size={24} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-black mt-4">{profile.name || 'Partner'}</h2>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full inline-block mt-1 ${statusClass}`}>{statusLabel}</span>
                </div>

                {/* Details Form */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative">
                    <button
                        onClick={handleToggleEdit}
                        className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-[#004F4D] hover:text-white transition-colors"
                    >
                        {isEditing ? <Save size={18} /> : <Edit size={18} />}
                    </button>

                    <Field
                        label="Full Name"
                        value={profile.name}
                        icon={User}
                        isEditing={isEditing}
                        onChange={(e) => handleChange('name', e)}
                    />
                    <Field
                        label="Email Address"
                        value={profile.email}
                        icon={Mail}
                        isEditing={isEditing}
                        onChange={(e) => handleChange('email', e)}
                    />
                    <Field
                        label="Phone Number"
                        value={profile.phone}
                        icon={Phone}
                        isEditing={isEditing}
                        onChange={(e) => handleChange('phone', e)}
                    />
                    <Field
                        label="Address"
                        value={profile.address}
                        icon={MapPin}
                        isEditing={isEditing}
                        onChange={(e) => handleChange('address', e)}
                    />

                    {/* Non-Editable Fields */}
                    <Field
                        label="Aadhaar Number"
                        value={profile.aadhaarNumber}
                        icon={CreditCard}
                        isEditing={false} // Always read-only
                        onChange={() => { }}
                    />
                    <Field
                        label="PAN Number"
                        value={profile.panNumber}
                        icon={CreditCard}
                        isEditing={false} // Always read-only
                        onChange={() => { }}
                    />
                </div>

                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>Member since {memberSince ? new Date(memberSince).toLocaleDateString() : '—'}</p>
                    <p>Partner ID: {partnerId ? `PART-${String(partnerId).slice(-6).toUpperCase()}` : '—'}</p>
                </div>

            </main>
        </div>
    );
};

export default PartnerProfile;
