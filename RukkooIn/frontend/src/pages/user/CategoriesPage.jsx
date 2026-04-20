import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Home as VillaIcon,
  Palmtree,
  Hotel,
  Building,
  BedDouble,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const CategoriesPage = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 'Hotel', label: 'Hotel', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Villa', label: 'Villa', icon: VillaIcon, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'Resort', label: 'Resort', icon: Palmtree, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 'Homestay', label: 'Homestay', icon: Hotel, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'Hostel', label: 'Hostel', icon: Building, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'PG', label: 'PG', icon: BedDouble, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const handleCategoryClick = (id) => {
    navigate(`/search?type=${id.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
        <h1 className="text-2xl font-black text-surface tracking-tight">Explore Categories</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Find properties by their category</p>
      </div>

      {/* 3-Column Grid */}
      <div className="px-5 py-8 grid grid-cols-3 gap-y-8 gap-x-4">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className={`w-16 h-16 ${cat.bg} ${cat.color} rounded-2xl flex items-center justify-center shadow-sm transition-all group-active:scale-95 group-hover:shadow-md`}>
                <Icon size={28} strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-surface text-center">
                {cat.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPage;
