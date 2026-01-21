import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, Search, Filter, Mail, Shield,
    MoreVertical, Trash2, Edit2, ShieldAlert,
    UserCheck, UserX, X, Loader2, Key
} from 'lucide-react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import useAdminStore from '../store/adminStore';

const AdminStaff = () => {
    const { admin } = useAdminStore();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'admin'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllStaff();
            // Ensure we always set an array
            setStaff(Array.isArray(response) ? response : (response?.staff || []));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch staff');
            setStaff([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await adminService.createStaff(formData);
            toast.success('Staff member created successfully');
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'admin' });
            fetchStaff();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create staff');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await adminService.updateStaff(id, { isActive: newStatus === 'active' });
            toast.success(`Staff status updated to ${newStatus}`);
            fetchStaff();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteStaff = async (id, name, role) => {
        if (role === 'superadmin') {
            toast.error('Cannot delete superadmin');
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${name}?`)) {
            try {
                await adminService.deleteStaff(id);
                toast.success('Staff member deleted');
                fetchStaff();
            } catch (error) {
                toast.error('Failed to delete staff');
            }
        }
    };

    const filteredStaff = staff.filter(member => {
        const matchesSearch =
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || member.role === filterRole;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        const styles = {
            superadmin: 'bg-purple-100 text-purple-700 border-purple-200',
            admin: 'bg-blue-100 text-blue-700 border-blue-200',
            support: 'bg-green-100 text-green-700 border-green-200',
            finance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            verification: 'bg-orange-100 text-orange-700 border-orange-200'
        };
        return `px-2 py-1 rounded-full text-xs font-semibold border ${styles[role] || 'bg-gray-100 text-gray-700'}`;
    };

    if (admin?.role !== 'superadmin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
                <ShieldAlert size={64} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
                <p className="text-gray-500 max-w-md">
                    Only Superadmins have permission to manage staff accounts and roles.
                    Please contact the system administrator if you believe this is an error.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Staff Management</h1>
                    <p className="text-gray-500 mt-1">Manage administrative accounts and granular permissions.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-black/10 hover:shadow-black/20 transition-all w-fit"
                >
                    <Plus size={20} />
                    Add Staff Member
                </motion.button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Staff', value: Array.isArray(staff) ? staff.length : 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active', value: Array.isArray(staff) ? staff.filter(s => s.isActive).length : 0, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Inactive', value: Array.isArray(staff) ? staff.filter(s => !s.isActive).length : 0, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Superadmins', value: Array.isArray(staff) ? staff.filter(s => s.role === 'superadmin').length : 0, icon: Shield, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        className="bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none font-medium min-w-[150px]"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="superadmin">Superadmin</option>
                        <option value="admin">Admin</option>
                        <option value="support">Support</option>
                        <option value="finance">Finance</option>
                        <option value="verification">Verification</option>
                    </select>
                </div>
            </div>

            {/* Staff Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-sm font-bold text-gray-500">STAFF MEMBER</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500">ROLE</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500">STATUS</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500">JOINED ON</th>
                                <th className="px-6 py-4 text-sm font-bold text-gray-500 text-right">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin text-gray-400" />
                                                <span className="text-gray-500 font-medium">Loading staff library...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredStaff.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users size={48} className="text-gray-200" />
                                                <p className="text-gray-500 font-medium">No staff members found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStaff.map((member) => (
                                        <motion.tr
                                            key={member._id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-gray-50/50 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm">
                                                        {member.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{member.name}</p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Mail size={12} /> {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={getRoleBadge(member.role)}>
                                                    {member.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleStatus(member._id, member.isActive ? 'active' : 'inactive')}
                                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${member.isActive
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${member.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                    {member.isActive ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                                                {new Date(member.createdAt).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleDeleteStaff(member._id, member.name, member.role)}
                                                        disabled={member.role === 'superadmin'}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-0 disabled:pointer-events-none"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Staff Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-black text-white rounded-2xl">
                                            <Plus size={24} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900">Add Staff</h2>
                                            <p className="text-gray-500 text-sm">Create a new administrative account</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateStaff} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none"
                                            placeholder="john@rukkoo.in"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Initial Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                required
                                                type="password"
                                                className="w-full pl-12 pr-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all outline-none"
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700 ml-1">Assign Role</label>
                                        <select
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none font-medium"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="admin">Admin (All Access)</option>
                                            <option value="support">Support (Queries & Users)</option>
                                            <option value="finance">Finance (Payouts & Fees)</option>
                                            <option value="verification">Verification (KYC/Approvals)</option>
                                        </select>
                                    </div>

                                    <div className="pt-4">
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            disabled={submitting}
                                            className="w-full bg-black text-white py-4 rounded-2xl font-black shadow-xl shadow-black/10 hover:shadow-black/20 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
                                        >
                                            {submitting ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <UserCheck size={20} />
                                                    Create Account
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminStaff;
