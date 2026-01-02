import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, BedDouble, Wifi, Tv, Wind, CheckCircle, IndianRupee } from 'lucide-react';
import usePartnerStore from '../store/partnerStore';
import BottomSheet from '../components/BottomSheet';
import { useLenis } from '../../shared/hooks/useLenis';

const RoomManager = () => {
    useLenis();
    const navigate = useNavigate();
    const { formData, addRoom, updateRoom, deleteRoom } = usePartnerStore();

    // Local state for modal
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [activeRoom, setActiveRoom] = useState({
        type: 'Deluxe Room',
        price: '',
        capacity: 2,
        amenities: []
    });

    const amenitiesList = [
        { id: 'ac', label: 'AC', icon: Wind },
        { id: 'wifi', label: 'Free Wi-Fi', icon: Wifi },
        { id: 'tv', label: 'TV', icon: Tv },
        { id: 'geyser', label: 'Geyser', icon: CheckCircle }, // using checkcircle as generic
    ];

    const handleOpenAdd = () => {
        setEditingRoom(null);
        setActiveRoom({ type: 'Standard Room', price: '', capacity: 2, amenities: [] });
        setIsSheetOpen(true);
    };

    const handleOpenEdit = (room) => {
        setEditingRoom(room);
        setActiveRoom(room);
        setIsSheetOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!activeRoom.type || !activeRoom.price) {
            alert("Please fill required fields");
            return;
        }

        if (editingRoom) {
            updateRoom(editingRoom.id, activeRoom);
        } else {
            addRoom(activeRoom);
        }
        setIsSheetOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this room?")) {
            deleteRoom(id);
        }
    };

    const toggleAmenity = (id) => {
        const current = activeRoom.amenities || [];
        if (current.includes(id)) {
            setActiveRoom({ ...activeRoom, amenities: current.filter(a => a !== id) });
        } else {
            setActiveRoom({ ...activeRoom, amenities: [...current, id] });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={20} className="text-[#003836]" />
                    </button>
                    <div>
                        <h1 className="text-lg font-black text-[#003836]">Manage Rooms</h1>
                        <p className="text-xs text-gray-500 font-medium">{formData.propertyName || 'Your Property'}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 pt-6">

                {/* Stats / Intro */}
                <div className="bg-[#004F4D] text-white p-6 rounded-3xl shadow-lg mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-2">Room Inventory</h2>
                        <p className="text-white/80 text-sm mb-6 max-w-sm">
                            Add all room types available at your property. You can update prices anytime.
                        </p>
                        <button
                            onClick={handleOpenAdd}
                            className="bg-white text-[#004F4D] px-5 py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center gap-2"
                        >
                            <Plus size={18} /> Add New Room
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                </div>

                {/* Room List */}
                <div className="space-y-4">
                    {(!formData.rooms || formData.rooms.length === 0) ? (
                        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                                <BedDouble size={32} />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">No Rooms Added</h3>
                            <p className="text-gray-400 text-sm">Start adding rooms to list your hotel.</p>
                        </div>
                    ) : (
                        formData.rooms.map((room) => (
                            <div key={room.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row gap-5">
                                {/* Image Placeholder */}
                                <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-xl shrink-0 flex items-center justify-center text-gray-400">
                                    <BedDouble size={32} />
                                </div>

                                {/* Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-black text-lg text-[#003836]">{room.type}</h3>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Capacity: {room.capacity} Guests</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-[#004F4D] flex items-center justify-end gap-0.5">
                                                <IndianRupee size={16} strokeWidth={3} />{room.price}
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold">per night</p>
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        {room.amenities && room.amenities.map(a => (
                                            <span key={a} className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-600 border border-gray-100 uppercase">
                                                {a}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-3 border-t border-gray-50">
                                        <button
                                            onClick={() => handleOpenEdit(room)}
                                            className="flex-1 bg-gray-900 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                                        >
                                            <Edit size={14} /> Edit & Price
                                        </button>
                                        <button
                                            onClick={() => handleDelete(room.id)}
                                            className="w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Add/Edit Modal */}
            <BottomSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                title={editingRoom ? "Edit Room" : "Add Room"}
            >
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Room Type */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Room Type</label>
                        <select
                            value={activeRoom.type}
                            onChange={(e) => setActiveRoom({ ...activeRoom, type: e.target.value })}
                            className="w-full p-4 bg-gray-50 rounded-xl font-bold text-gray-900 outline-none focus:ring-2 focus:ring-[#004F4D]/20 border border-gray-100 appearance-none"
                        >
                            <option value="Standard Room">Standard Room</option>
                            <option value="Deluxe Room">Deluxe Room</option>
                            <option value="Super Deluxe">Super Deluxe</option>
                            <option value="Suite">Suite</option>
                            <option value="Family Suite">Family Suite</option>
                        </select>
                    </div>

                    {/* Price & Capacity Row */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Price (₹)</label>
                            <input
                                type="number"
                                value={activeRoom.price}
                                onChange={(e) => setActiveRoom({ ...activeRoom, price: e.target.value })}
                                placeholder="2500"
                                className="w-full p-4 bg-gray-50 rounded-xl font-black text-lg text-[#004F4D] outline-none focus:ring-2 focus:ring-[#004F4D]/20 border border-gray-100"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Capacity</label>
                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100">
                                <button type="button" onClick={() => setActiveRoom(prev => ({ ...prev, capacity: Math.max(1, prev.capacity - 1) }))} className="w-12 h-[58px] flex items-center justify-center text-gray-500 font-bold hover:bg-gray-200 rounded-l-xl">-</button>
                                <div className="flex-1 text-center font-black text-lg">{activeRoom.capacity}</div>
                                <button type="button" onClick={() => setActiveRoom(prev => ({ ...prev, capacity: Math.min(10, prev.capacity + 1) }))} className="w-12 h-[58px] flex items-center justify-center text-gray-500 font-bold hover:bg-gray-200 rounded-r-xl">+</button>
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Amenities</label>
                        <div className="grid grid-cols-2 gap-3">
                            {amenitiesList.map((item) => {
                                const isSelected = (activeRoom.amenities || []).includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleAmenity(item.id)}
                                        className={`p-3 rounded-xl flex items-center gap-3 border transition-all ${isSelected ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-200 text-gray-500'}`}
                                    >
                                        <item.icon size={18} />
                                        <span className="text-xs font-bold">{item.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Submit */}
                    <button type="submit" className="w-full bg-[#004F4D] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#004F4D]/20 active:scale-95 transition-all">
                        {editingRoom ? 'Update Room' : 'Add Room'}
                    </button>
                </form>
            </BottomSheet>
        </div>
    );
};

export default RoomManager;
