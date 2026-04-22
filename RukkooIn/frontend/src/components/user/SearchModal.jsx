import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Users, Baby, PawPrint, ArrowRight } from 'lucide-react';
import ModernDatePicker from '../ui/ModernDatePicker';

const SearchModal = ({ isOpen, onClose, onSearch }) => {
    const [search, setSearch] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [withPet, setWithPet] = useState(false);

    const handleSearch = () => {
        onSearch({
            search,
            checkIn,
            checkOut,
            adults,
            children,
            withPet
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Advanced Search</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Find the perfect stay for your trip</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh] no-scrollbar">
                            {/* Search Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Location</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Where are you going?"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-surface/20 focus:border-surface outline-none transition-all text-sm font-medium"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <ModernDatePicker 
                                    label="Check-in"
                                    date={checkIn}
                                    onChange={setCheckIn}
                                    minDate={new Date()}
                                    placeholder="Arrival"
                                />
                                <ModernDatePicker 
                                    label="Check-out"
                                    date={checkOut}
                                    onChange={setCheckOut}
                                    minDate={checkIn || new Date()}
                                    placeholder="Departure"
                                    align="right"
                                />
                            </div>

                            {/* Guests */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Guests</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Adults */}
                                    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-surface/10 rounded-xl flex items-center justify-center">
                                                <Users size={16} className="text-surface" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">Adults</p>
                                                <p className="text-[10px] text-gray-400">13+ yrs</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setAdults(Math.max(1, adults - 1))}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-surface hover:text-surface transition-colors font-bold"
                                            >-</button>
                                            <span className="text-xs font-bold text-gray-800 w-4 text-center">{adults}</span>
                                            <button 
                                                onClick={() => setAdults(adults + 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-surface hover:text-surface transition-colors font-bold"
                                            >+</button>
                                        </div>
                                    </div>

                                    {/* Children */}
                                    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                                <Baby size={16} className="text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">Children</p>
                                                <p className="text-[10px] text-gray-400">0-12 yrs</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setChildren(Math.max(0, children - 1))}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-surface hover:text-surface transition-colors font-bold"
                                            >-</button>
                                            <span className="text-xs font-bold text-gray-800 w-4 text-center">{children}</span>
                                            <button 
                                                onClick={() => setChildren(children + 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-surface hover:text-surface transition-colors font-bold"
                                            >+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pets Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                        <PawPrint size={18} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Traveling with pets?</p>
                                        <p className="text-[10px] text-gray-400">Search for pet-friendly stays</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setWithPet(!withPet)}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${withPet ? 'bg-surface' : 'bg-gray-300'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${withPet ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Footer / Search Button */}
                        <div className="p-6 bg-white border-t border-gray-100">
                            <button 
                                onClick={handleSearch}
                                className="w-full py-4 bg-surface text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-surface/20 active:scale-95 transition-all"
                            >
                                <Search size={20} />
                                <span>Search Properties</span>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
