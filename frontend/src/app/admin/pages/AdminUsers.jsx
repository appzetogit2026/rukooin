import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Search, Filter, MoreVertical, Ban, CheckCircle,
    Mail, Phone, Calendar, Shield, ArrowUpRight, Trash2, Unlock, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

// --- MOCK DATA ---
const INITIAL_USERS = [
    { id: 1, name: "Rahul Sharma", email: "rahul@gmail.com", phone: "+91 9876543210", bookings: 12, spend: "₹45,200", status: "ACTIVE", joined: "12 Jan 2024" },
    { id: 2, name: "Anita Roy", email: "anita.r@hotmail.com", phone: "+91 9123456780", bookings: 4, spend: "₹12,400", status: "ACTIVE", joined: "15 Feb 2024" },
    { id: 3, name: "Vikram Singh", email: "vikram.s@yahoo.com", phone: "+91 8887776655", bookings: 0, spend: "₹0", status: "INACTIVE", joined: "20 Mar 2024" },
    { id: 4, name: "Suresh Patil", email: "suresh.p@gmail.com", phone: "+91 9988776655", bookings: 2, spend: "₹8,500", status: "BLOCKED", joined: "05 Apr 2024" },
    { id: 5, name: "Meera Reddy", email: "meera.reddy@gmail.com", phone: "+91 7654321098", bookings: 8, spend: "₹32,100", status: "ACTIVE", joined: "10 May 2024" },
];

const UserStatusBadge = ({ status }) => {
    const styles = {
        ACTIVE: 'bg-green-100 text-green-700 border-green-200',
        BLOCKED: 'bg-red-100 text-red-700 border-red-200',
        INACTIVE: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const icons = {
        ACTIVE: <CheckCircle size={10} className="mr-1" />,
        BLOCKED: <Ban size={10} className="mr-1" />,
        INACTIVE: <Shield size={10} className="mr-1" />,
    };

    return (
        <span className={`flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
            {icons[status]}
            {status}
        </span>
    );
};

const AdminUsers = () => {
    const [users, setUsers] = useState(INITIAL_USERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    // Filter Logic
    const filteredUsers = useMemo(() => {
        return users.filter(u =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.phone.includes(searchQuery)
        );
    }, [users, searchQuery]);

    // Handlers
    const handleAction = (action, user) => {
        setActiveDropdown(null);
        if (action === 'delete') {
            setModalConfig({
                isOpen: true,
                title: 'Delete User?',
                message: `Permanently delete user "${user.name}"? This will also archive their booking history.`,
                type: 'danger',
                confirmText: 'Delete',
                onConfirm: () => setUsers(prev => prev.filter(u => u.id !== user.id))
            });
        } else if (action === 'block') {
            setModalConfig({
                isOpen: true,
                title: 'Block User?',
                message: `Are you sure you want to block "${user.name}" from accessing the platform?`,
                type: 'warning',
                confirmText: 'Block',
                onConfirm: () => setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'BLOCKED' } : u))
            });
        } else if (action === 'unblock') {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'ACTIVE' } : u));
        }
    };

    return (
        <div className="space-y-6 relative" onClick={() => setActiveDropdown(null)}>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-500 text-sm">View, track, and manage registered guests.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search via name, email or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none shadow-sm w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Filter size={16} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                                <th className="p-4">User Details</th>
                                <th className="p-4">Contact Info</th>
                                <th className="p-4">Activity</th>
                                <th className="p-4">Total Spend</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50/50 transition-colors group relative"
                                        >
                                            <td className="p-4">
                                                <Link to={`/admin/users/${user.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 border border-white shadow-sm font-bold text-gray-600">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-400">Joined: {user.joined}</p>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Mail size={12} className="mr-1.5 text-gray-400" />
                                                        {user.email}
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-600">
                                                        <Phone size={12} className="mr-1.5 text-gray-400" />
                                                        {user.phone}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-2 h-2 rounded-full ${user.status === 'BLOCKED' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                    <span className="text-sm font-medium text-gray-700">{user.bookings} Bookings</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-semibold text-gray-900">{user.spend}</span>
                                            </td>
                                            <td className="p-4">
                                                <UserStatusBadge status={user.status} />
                                            </td>
                                            <td className="p-4 text-center relative">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === user.id ? null : user.id); }}
                                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeDropdown === user.id && (
                                                    <div className="absolute right-8 top-8 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1 text-left">
                                                        <Link to={`/admin/users/${user.id}`} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                                                            <Eye size={14} /> View Profile
                                                        </Link>
                                                        {user.status === 'BLOCKED' ? (
                                                            <button onClick={() => handleAction('unblock', user)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-sm text-green-700">
                                                                <Unlock size={14} /> Unblock
                                                            </button>
                                                        ) : (
                                                            <button onClick={() => handleAction('block', user)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-amber-50 text-sm text-amber-700">
                                                                <Ban size={14} /> Block
                                                            </button>
                                                        )}
                                                        <div className="h-px bg-gray-100 my-1"></div>
                                                        <button onClick={() => handleAction('delete', user)} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm text-red-600 font-medium">
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-400 text-sm">
                                            No users found matching query
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                    <span>Showing {filteredUsers.length} results</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>Prev</button>
                        <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
