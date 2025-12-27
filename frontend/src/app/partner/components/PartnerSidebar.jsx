import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
    X, User, Building, List,
    CreditCard, History, Shield,
    FileText, HelpCircle, LogOut,
    LayoutDashboard,
    ChevronRight, Wallet, Bell, Settings
} from 'lucide-react';
import usePartnerStore from '../store/partnerStore';

const PartnerSidebar = ({ isOpen, onClose }) => {
    const sidebarRef = useRef(null);
    const backdropRef = useRef(null);
    const contentRef = useRef(null);
    const navigate = useNavigate();
    const { formData } = usePartnerStore(); // Get user details if available

    useEffect(() => {
        if (isOpen) {
            // Document body lock
            document.body.style.overflow = 'hidden';

            // Animation In
            const tl = gsap.timeline();
            tl.to(backdropRef.current, {
                opacity: 1,
                duration: 0.3,
                display: 'block',
                ease: 'power2.out'
            })
                .to(sidebarRef.current, {
                    x: '0%',
                    duration: 0.4,
                    ease: 'power3.out'
                }, '-=0.2')
                .fromTo(contentRef.current.children, {
                    opacity: 0,
                    x: 20
                }, {
                    opacity: 1,
                    x: 0,
                    duration: 0.3,
                    stagger: 0.05,
                    ease: 'power2.out'
                }, '-=0.2');

        } else {
            // Animation Out
            const tl = gsap.timeline({
                onComplete: () => {
                    if (backdropRef.current) backdropRef.current.style.display = 'none';
                    document.body.style.overflow = '';
                }
            });
            tl.to(sidebarRef.current, {
                x: '100%',
                duration: 0.3,
                ease: 'power3.in'
            })
                .to(backdropRef.current, {
                    opacity: 0,
                    duration: 0.3
                }, '-=0.1');
        }
    }, [isOpen]);

    const handleNavigation = (path) => {
        onClose();
        // Allow animation to start then navigate
        setTimeout(() => navigate(path), 300);
    };

    const menuGroups = [
        {
            title: 'Overview',
            items: [
                { icon: LayoutDashboard, label: 'Dashboard', path: '/hotel/partner-dashboard' },
            ]
        },
        {
            title: 'Growth & Finance',
            items: [
                { icon: Wallet, label: 'Wallet & Payouts', path: '/hotel/wallet', badge: '₹0.00' },
                { icon: History, label: 'Booking History', path: '/hotel/bookings' },
                { icon: CreditCard, label: 'Transactions', path: '/hotel/transactions' },
            ]
        },
        {
            title: 'Management',
            items: [
                { icon: Building, label: 'My Properties', path: '/hotel/dashboard' },
                { icon: List, label: 'Reviews & Ratings', path: '/hotel/reviews' },
                { icon: Bell, label: 'Notifications', path: '/hotel/notifications', badge: '2' },
            ]
        },
        {
            title: 'Support & Legal',
            items: [
                { icon: Shield, label: 'KYC & Verification', path: '/hotel/kyc', status: 'Pending' },
                { icon: HelpCircle, label: 'Help & Support', path: '/hotel/support' },
                { icon: FileText, label: 'Terms & Conditions', path: '/hotel/terms' },
                { icon: Settings, label: 'Settings', path: '/hotel/settings' },
            ]
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop */}
            <div
                ref={backdropRef}
                onClick={onClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 hidden pointer-events-auto transition-opacity"
            />

            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className="absolute top-0 right-0 bottom-0 w-[85%] max-w-md bg-white shadow-2xl translate-x-full pointer-events-auto flex flex-col"
            >
                {/* Header */}
                <div className="p-6 pb-4 border-b border-gray-100 flex items-start justify-between bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-lg font-bold">
                            {/* Initials */}
                            {formData?.propertyName ? formData.propertyName.substring(0, 2).toUpperCase() : 'JD'}
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-black leading-tight">
                                {formData?.propertyName || 'Partner Account'}
                            </h2>
                            <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full inline-block mt-1">
                                Verified Partner
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div ref={contentRef} className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* View Profile Card */}
                    <div
                        onClick={() => handleNavigation('/hotel/profile')}
                        className="bg-gray-900 text-white p-4 rounded-2xl flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-full">
                                <User size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">View Profile</h3>
                                <p className="text-xs text-gray-400">Manage account details</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                    </div>

                    {/* Menu Groups */}
                    {menuGroups.map((group, idx) => (
                        <div key={idx}>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 px-2">
                                {group.title}
                            </h4>
                            <div className="space-y-1">
                                {group.items.map((item, idy) => (
                                    <button
                                        key={idy}
                                        onClick={() => handleNavigation(item.path)}
                                        className="w-full p-3 rounded-xl hover:bg-gray-50 flex items-center justify-between group transition-colors active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-gray-400 group-hover:text-black transition-colors">
                                                <item.icon size={18} />
                                            </div>
                                            <span className="text-sm font-bold text-gray-700 group-hover:text-black">
                                                {item.label}
                                            </span>
                                        </div>
                                        {item.badge && (
                                            <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                        {item.status && (
                                            <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                                {item.status}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={() => {
                            // Handle logout logic here
                            navigate('/hotel');
                        }}
                        className="w-full flex items-center justify-center gap-2 p-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-2">
                        Version 1.0.0 • Partner App
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PartnerSidebar;
