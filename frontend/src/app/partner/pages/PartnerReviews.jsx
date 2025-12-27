import React, { useState, useEffect, useRef } from 'react';
import { Star, MessageCircle, ThumbsUp, MoreHorizontal, CornerDownRight } from 'lucide-react';
import gsap from 'gsap';
import PartnerHeader from '../components/PartnerHeader';

const ReviewCard = ({ review }) => {
    const [isReplying, setIsReplying] = useState(false);

    return (
        <div className="review-card bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                        {/* Placeholder Avatar */}
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 text-xs">
                            {review.user[0]}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 text-sm">{review.user}</h4>
                        <div className="flex items-center gap-1">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-300"} />
                                ))}
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">• {review.date}</span>
                        </div>
                    </div>
                </div>
                <button className="text-gray-300 hover:text-black">
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {review.comment}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4 border-t border-dashed border-gray-100 pt-3">
                <button className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-black transition-colors">
                    <ThumbsUp size={14} /> Helpful
                </button>
                <button
                    onClick={() => setIsReplying(!isReplying)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isReplying ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                >
                    <MessageCircle size={14} /> Reply
                </button>
            </div>

            {/* Reply Box */}
            {isReplying && (
                <div className="mt-4 pl-4 border-l-2 border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex gap-2 items-start mb-2">
                            <CornerDownRight size={14} className="text-gray-400 mt-1" />
                            <textarea
                                placeholder="Write your reply..."
                                className="w-full bg-transparent text-sm focus:outline-none resize-none h-20"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end">
                            <button className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md active:scale-95 transition-transform">
                                Post Reply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PartnerReviews = () => {
    const listRef = useRef(null);

    // Mock Data
    const reviews = [
        { id: 1, user: "Rohan Das", rating: 5, date: "2 days ago", comment: "Absolutely loved the stay! The room was spotless and the staff was extremely courteous. Will definitely visit again." },
        { id: 2, user: "Priya K.", rating: 4, date: "1 week ago", comment: "Great location, but the wifi was a bit spotty in the room. Otherwise a pleasant experience." },
        { id: 3, user: "Amit Sharma", rating: 5, date: "2 weeks ago", comment: "Value for money. The breakfast was delicious and the check-in process was seamless." },
        { id: 4, user: "John Doe", rating: 3, date: "3 weeks ago", comment: "Decent for a night's stay. Could be cleaner." },
    ];

    useEffect(() => {
        if (listRef.current) {
            gsap.fromTo(listRef.current.children,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out" }
            );
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PartnerHeader title="Reviews" subtitle="What guests are saying" />

            {/* Scorecard */}
            <div className="bg-white sticky top-[73px] z-30 px-6 py-6 border-b border-gray-100 shadow-sm mb-6">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <div className="text-5xl font-black text-black tracking-tighter">4.8</div>
                        <div className="flex justify-center text-yellow-500 mt-1">
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                            <Star size={12} fill="currentColor" />
                        </div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider">124 Reviews</p>
                    </div>

                    {/* Bars */}
                    <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map(star => (
                            <div key={star} className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 w-2">{star}</span>
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-black rounded-full"
                                        style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : 5}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <main ref={listRef} className="max-w-3xl mx-auto px-4">
                {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </main>
        </div>
    );
};

export default PartnerReviews;
