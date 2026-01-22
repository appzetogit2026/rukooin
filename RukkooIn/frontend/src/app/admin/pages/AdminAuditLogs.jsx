import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Search, Filter, Calendar, User,
    Activity, ChevronLeft, ChevronRight, Loader2,
    FileText, Settings as SettingsIcon, UserCheck,
    LogIn, LogOut, Trash2, Edit
} from 'lucide-react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import useAdminStore from '../store/adminStore';

const AdminAuditLogs = () => {
    const { admin } = useAdminStore();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const [filters, setFilters] = useState({
        action: '',
        targetType: '',
        search: ''
    });

    useEffect(() => {
        fetchLogs();
    }, [page, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 20,
                ...(filters.action && { action: filters.action }),
                ...(filters.targetType && { targetType: filters.targetType })
            };

            const data = await adminService.getAuditLogs(params);
            setLogs(data.logs || []);
            setTotal(data.pagination?.total || 0);
            setTotalPages(data.pagination?.pages || 1);
        } catch (error) {
            toast.error('Failed to fetch audit logs');
        } finally {
            setLoading(false);
        }
    };

    const getActionBadge = (action) => {
        const styles = {
            LOGIN: 'bg-green-100 text-green-700 border-green-200',
            LOGOUT: 'bg-gray-100 text-gray-700 border-gray-200',
            PROPERTY_APPROVED: 'bg-blue-100 text-blue-700 border-blue-200',
            PROPERTY_REJECTED: 'bg-red-100 text-red-700 border-red-200',
            STAFF_CREATED: 'bg-purple-100 text-purple-700 border-purple-200',
            STAFF_DELETED: 'bg-red-100 text-red-700 border-red-200',
            SETTINGS_UPDATED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            PAYOUT_RELEASED: 'bg-green-100 text-green-700 border-green-200'
        };
        return `px-2 py-1 rounded-full text-xs font-semibold border ${styles[action] || 'bg-gray-100 text-gray-700'}`;
    };

    const getActionIcon = (action) => {
        const icons = {
            LOGIN: LogIn,
            LOGOUT: LogOut,
            PROPERTY_APPROVED: FileText,
            PROPERTY_REJECTED: Trash2,
            STAFF_CREATED: UserCheck,
            STAFF_DELETED: Trash2,
            SETTINGS_UPDATED: SettingsIcon,
            PAYOUT_RELEASED: Activity
        };
        const Icon = icons[action] || Activity;
        return <Icon size={16} />;
    };

    if (admin?.role !== 'superadmin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white rounded-3xl shadow-sm border border-gray-100">
                <Shield size={64} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
                <p className="text-gray-500 max-w-md">
                    Only Superadmins have permission to view audit logs.
                    Please contact the system administrator if you believe this is an error.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Audit Logs</h1>
                    <p className="text-gray-500 mt-1">Complete administrative activity trail for security oversight.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Activity size={18} />
                    <span className="font-bold">{total}</span> total events logged
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by description..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-black transition-all outline-none"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select
                        className="bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none font-medium min-w-[150px]"
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                    >
                        <option value="">All Actions</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                        <option value="PROPERTY_APPROVED">Property Approved</option>
                        <option value="PROPERTY_REJECTED">Property Rejected</option>
                        <option value="STAFF_CREATED">Staff Created</option>
                        <option value="STAFF_DELETED">Staff Deleted</option>
                        <option value="SETTINGS_UPDATED">Settings Updated</option>
                        <option value="PAYOUT_RELEASED">Payout Released</option>
                    </select>
                    <select
                        className="bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-black outline-none font-medium min-w-[150px]"
                        value={filters.targetType}
                        onChange={(e) => setFilters({ ...filters, targetType: e.target.value })}
                    >
                        <option value="">All Types</option>
                        <option value="Property">Property</option>
                        <option value="Admin">Admin</option>
                        <option value="Settings">Settings</option>
                        <option value="Transaction">Transaction</option>
                        <option value="User">User</option>
                    </select>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-gray-400" size={32} />
                        <span className="ml-3 text-gray-500 font-medium">Loading audit trail...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Shield size={48} className="text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No audit logs found matching your filters.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500">TIMESTAMP</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500">ADMIN</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500">ACTION</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500">DESCRIPTION</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-500">IP ADDRESS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.map((log) => (
                                    <motion.tr
                                        key={log._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(log.createdAt).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                                                    {log.admin?.name?.charAt(0) || 'A'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{log.admin?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{log.admin?.role || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getActionIcon(log.action)}
                                                <span className={getActionBadge(log.action)}>
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                                            {log.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {log.ip || 'N/A'}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && logs.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-bold">{(page - 1) * 20 + 1}</span> to{' '}
                            <span className="font-bold">{Math.min(page * 20, total)}</span> of{' '}
                            <span className="font-bold">{total}</span> logs
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="px-4 py-2 bg-white rounded-lg font-bold text-sm">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAuditLogs;
