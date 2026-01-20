
import React from 'react';

const DashboardStatCard = ({ icon: Icon, label, value, subtext, actionLabel, onAction, colorClass = "text-[#004F4D]" }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full transition-transform hover:scale-[1.01]">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2.5 rounded-xl bg-gray-50 text-gray-700`}>
          <Icon size={20} className={colorClass} />
        </div>
        {actionLabel && (
          <button
            onClick={onAction}
            className="text-xs font-semibold text-[#004F4D] hover:underline"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {subtext && (
          <p className="text-xs text-green-600 font-medium mt-1">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardStatCard;
