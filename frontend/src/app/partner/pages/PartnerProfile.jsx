import React, { useEffect, useRef, useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Edit, Save, Camera, Lock } from 'lucide-react';
import gsap from 'gsap';
import PartnerHeader from '../components/PartnerHeader';
import usePartnerStore from '../store/partnerStore';

const Field = ({ label, value, icon: Icon, isEditing, onChange }) => (
    <div className="mb-4">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">{label}</label>
        <div className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isEditing ? 'bg-white border-black ring-1 ring-black/10' : 'bg-gray-50 border-gray-100'}`}>
            <Icon size={16} className="text-gray-400" />
            {isEditing ? (
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    className="flex-1 bg-transparent text-sm font-bold text-gray-900 focus:outline-none"
                />
            ) : (
                <span className="flex-1 text-sm font-bold text-gray-900 truncate">{value}</span>
            )}
        </div>
    </div>
);

const PartnerProfile = () => {
    const { formData } = usePartnerStore();
    const [isEditing, setIsEditing] = useState(false);
    const containerRef = useRef(null);

    // Local state for editing (mocking default values if formData is empty)
    const [profile, setProfile] = useState({
        name: formData?.propertyName || "John Doe",
        email: "partner@rokkooin.com",
        phone: "+91 98765 43210",
        address: "123, Green Park, New Delhi",
        role: "Primary Owner"
    });

    useEffect(() => {
        gsap.fromTo(containerRef.current,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
        );
    }, []);

    const handleChange = (field, e) => {
        setProfile({ ...profile, [field]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PartnerHeader title="My Profile" subtitle="Account Details" />

            <main ref={containerRef} className="max-w-xl mx-auto px-4 pt-8">

                {/* Avatar Section */}
                <div className="text-center mb-8 relative">
                    <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto shadow-xl shadow-black/20 relative group overflow-hidden">
                        {profile.name.substring(0, 2).toUpperCase()}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera size={24} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-xl font-black mt-4">{profile.name}</h2>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block mt-1">Verified Partner</span>
                </div>

                {/* Details Form */}
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-colors"
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

                    <div className="mt-8 pt-6 border-t border-dashed border-gray-100">
                        <button className="w-full flex items-center justify-center gap-2 text-red-500 font-bold text-sm hover:bg-red-50 p-3 rounded-xl transition-colors">
                            <Lock size={16} /> Change Password
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center text-xs text-gray-400">
                    <p>Member since August 2024</p>
                    <p>Partner ID: PART-8821</p>
                </div>

            </main>
        </div>
    );
};

export default PartnerProfile;
