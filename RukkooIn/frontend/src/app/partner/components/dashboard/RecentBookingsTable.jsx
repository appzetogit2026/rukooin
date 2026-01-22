
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const RecentBookingsTable = ({ bookings }) => {
  const navigate = useNavigate();

  if (!bookings || bookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center">
        <p className="text-gray-400 text-sm">No recent bookings found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Recent Activity</h3>
        <button
          onClick={() => navigate('/hotel/bookings')}
          className="text-xs font-semibold text-[#004F4D] flex items-center gap-1 hover:gap-2 transition-all"
        >
          View All <ChevronRight size={14} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-500">
          <thead className="bg-[#004F4D]/5 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-semibold">Guest</th>
              <th className="px-6 py-3 font-semibold">Property</th>
              <th className="px-6 py-3 font-semibold">Check-In</th>
              <th className="px-6 py-3 font-semibold">Amount</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">
                  {booking.userId?.name || booking.guestName || "Guest"}
                  <div className="text-xs text-gray-400 font-normal">{booking.userId?.phone || booking.guestPhone}</div>
                </td>
                <td className="px-6 py-4 text-gray-600 truncate max-w-[150px]">
                  {booking.propertyId?.propertyName || booking.property?.name || "Unknown Property"}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(booking.checkInDate || booking.checkIn).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short'
                  })}
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  ₹{booking.totalAmount?.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold
                                        ${booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-700' : ''}
                                        ${booking.bookingStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                                        ${booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                                        ${booking.bookingStatus === 'completed' ? 'bg-blue-100 text-blue-700' : ''}
                                    `}>
                    {(booking.bookingStatus || 'unknown').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => navigate(`/hotel/bookings/${booking._id}`)}
                    className="text-[#004F4D] hover:text-[#003836] font-medium text-xs border border-[#004F4D]/20 px-3 py-1.5 rounded-lg hover:bg-[#004F4D]/5 transition"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentBookingsTable;
