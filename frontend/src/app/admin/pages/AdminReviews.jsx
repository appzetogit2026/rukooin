import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, Search, Filter, MoreVertical, Eye, Trash2,
    CheckCircle, XCircle, AlertTriangle, ThumbsUp, ThumbsDown, Flag
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';

// Mock Data
const INITIAL_REVIEWS = [
    { id: 1, user: "Rahul Sharma", hotel: "Grand Palace Hotel", rating: 5, comment: "Excellent service and beautiful rooms! The staff was very helpful and the location is perfect.", date: "2024-01-15", status: "APPROVED", helpful: 24, reported: 0 },
    { id: 2, user: "Priya Singh", hotel: "Ocean View Resort", rating: 4, comment: "Great beach view and clean rooms. Food could be better but overall a nice stay.", date: "2024-01-14", status: "APPROVED", helpful: 12, reported: 0 },
    { id: 3, user: "Amit Kumar", hotel: "Mountain Retreat", rating: 2, comment: "Very disappointing. Room was dirty and AC wasn't working. Staff was rude.", date: "2024-01-13", status: "PENDING", helpful: 3, reported: 5 },
    { id: 4, user: "Sneha Patel", hotel: "City Center Inn", rating: 5, comment: "Perfect for business travelers. Close to metro station and very professional service.", date: "2024-01-12", status: "APPROVED", helpful: 18, reported: 0 },
    { id: 5, user: "Vikram Reddy", hotel: "Grand Palace Hotel", rating: 1, comment: "Worst experience ever! Overpriced and terrible service. Would not recommend.", date: "2024-01-11", status: "FLAGGED", helpful: 2, reported: 8 },
    { id: 6, user: "Anita Roy", hotel: "Lakeside Villa", rating: 4, comment: "Beautiful property with great amenities. Breakfast was delicious. Will visit again!", date: "2024-01-10", status: "APPROVED", helpful: 15, reported: 0 },
    { id: 7, user: "Rajesh Gupta", hotel: "Heritage Palace Hotel", rating: 5, comment: "Absolutely stunning! The architecture is breathtaking and staff is very courteous.", date: "2024-01-09", status: "APPROVED", helpful: 31, reported: 0 },
];

const StarRating = ({ rating }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
            <Star
                key={star}
                size={14}
                className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
        ))}
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        APPROVED: 'bg-green-100 text-green-700 border-green-200',
        PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
        FLAGGED: 'bg-red-100 text-red-700 border-red-200',
        REJECTED: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    const icons = {
        APPROVED: <CheckCircle size={10} />,
        PENDING: <AlertTriangle size={10} />,
        FLAGGED: <Flag size={10} />,
        REJECTED: <XCircle size={10} />,
    };

    return (
        <span className={`flex items-center gap-1 w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[status]}`}>
            {icons[status]}
            {status}
        </span>
    );
};

const AdminReviews = () => {
    const [reviews, setReviews] = useState(INITIAL_REVIEWS);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [ratingFilter, setRatingFilter] = useState('ALL');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '', type: 'danger', onConfirm: () => { } });

    // Filter Logic
    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchesSearch =
                r.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.hotel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.comment.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
            const matchesRating = ratingFilter === 'ALL' || r.rating === parseInt(ratingFilter);

            return matchesSearch && matchesStatus && matchesRating;
        });
    }, [reviews, searchQuery, statusFilter, ratingFilter]);

    // Stats
    const stats = useMemo(() => {
        return {
            total: reviews.length,
            approved: reviews.filter(r => r.status === 'APPROVED').length,
            pending: reviews.filter(r => r.status === 'PENDING').length,
            flagged: reviews.filter(r => r.status === 'FLAGGED').length,
            avgRating: (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        };
    }, [reviews]);

    // Handlers
    const handleApprove = (review) => {
        setModalConfig({
            isOpen: true,
            title: 'Approve Review?',
            message: `This will make the review visible to all users.`,
            type: 'success',
            confirmText: 'Approve',
            onConfirm: () => {
                setReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: 'APPROVED' } : r));
            }
        });
    };

    const handleReject = (review) => {
        setModalConfig({
            isOpen: true,
            title: 'Reject Review?',
            message: `This review will be hidden from users.`,
            type: 'danger',
            confirmText: 'Reject',
            onConfirm: () => {
                setReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: 'REJECTED' } : r));
            }
        });
    };

    const handleDelete = (review) => {
        setModalConfig({
            isOpen: true,
            title: 'Delete Review?',
            message: `This action cannot be undone. The review will be permanently deleted.`,
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: () => {
                setReviews(prev => prev.filter(r => r.id !== review.id));
            }
        });
    };

    return (
        <div className="space-y-6 pb-10" onClick={() => setActiveDropdown(null)}>
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                {...modalConfig}
            />

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Review Management</h2>
                <p className="text-gray-500 text-sm">Monitor and moderate user reviews across all hotels.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Total Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Avg Rating</p>
                    <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-gray-900">{stats.avgRating}</p>
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-1">Flagged</p>
                    <p className="text-2xl font-bold text-red-600">{stats.flagged}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by user, hotel, or comment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-black outline-none shadow-sm"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-black"
                >
                    <option value="ALL">All Status</option>
                    <option value="APPROVED">Approved</option>
                    <option value="PENDING">Pending</option>
                    <option value="FLAGGED">Flagged</option>
                    <option value="REJECTED">Rejected</option>
                </select>

                <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-black"
                >
                    <option value="ALL">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-gray-900">{review.user}</h4>
                                                    <StarRating rating={review.rating} />
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    Reviewed <Link to={`/admin/hotels/${review.id}`} className="text-blue-600 hover:underline">{review.hotel}</Link> • {review.date}
                                                </p>
                                            </div>
                                            <StatusBadge status={review.status} />
                                        </div>

                                        {/* Comment */}
                                        <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                                        {/* Footer Stats */}
                                        <div className="flex items-center gap-6 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp size={14} />
                                                {review.helpful} helpful
                                            </span>
                                            {review.reported > 0 && (
                                                <span className="flex items-center gap-1 text-red-600">
                                                    <Flag size={14} />
                                                    {review.reported} reports
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions Dropdown */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === review.id ? null : review.id); }}
                                            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {activeDropdown === review.id && (
                                            <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1">
                                                {review.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleApprove(review)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-green-600"
                                                    >
                                                        <CheckCircle size={14} /> Approve
                                                    </button>
                                                )}
                                                {review.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleReject(review)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-amber-600"
                                                    >
                                                        <XCircle size={14} /> Reject
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review)}
                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                            <Star size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No Reviews Found</h3>
                            <p className="text-sm text-gray-500">
                                {searchQuery ? `No reviews matching "${searchQuery}"` : 'No reviews to display.'}
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminReviews;
