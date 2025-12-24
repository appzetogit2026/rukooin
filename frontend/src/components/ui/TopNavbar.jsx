import React from 'react';
import { User, Globe } from 'lucide-react';
import logo from '../../assets/rokologin-removebg-preview.png';

const TopNavbar = () => {
    return (
        <nav className="hidden md:flex w-full h-16 bg-white/10 backdrop-blur-md border-b border-white/10 px-8 justify-between items-center fixed top-0 z-50">

            {/* Scroll-aware logo can be added here, for now static */}
            <img src={logo} alt="Rukko" className="h-10 object-contain" />

            {/* Desktop Links */}
            <div className="flex items-center gap-8">
                {['Home', 'Bookings', 'Corporates', 'List your property'].map((item) => (
                    <a key={item} href="#" className="text-surface font-semibold text-sm hover:text-accent transition">
                        {item}
                    </a>
                ))}
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-surface font-semibold text-sm">
                    <Globe size={18} />
                    EN
                </button>
                <button className="px-4 py-2 bg-surface text-white rounded-lg font-bold text-sm shadow-lg hover:bg-surface/90 transition flex items-center gap-2">
                    <User size={18} />
                    Login / Signup
                </button>
            </div>

        </nav>
    );
};

export default TopNavbar;
