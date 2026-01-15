import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Home, Users, BedDouble, ArrowLeft, ArrowRight } from 'lucide-react';
import logo from '../../../assets/rokologin-removebg-preview.png';

const PartnerJoinPropertyType = () => {
  const navigate = useNavigate();

  const propertyTypes = [
    {
      key: 'hotel',
      label: 'Hotel',
      description: 'Multiple rooms, daily stays, front desk operations',
      badge: 'Best for city & business stays',
      icon: Building2,
      route: '/hotel/join-hotel',
    },
    {
      key: 'resort',
      label: 'Resort',
      description: 'Destination stays with activities and experiences',
      badge: 'Best for leisure & vacation',
      icon: Home,
      route: '/hotel/join-resort',
    },
    {
      key: 'villa',
      label: 'Villa',
      description: 'Entire villa or premium holiday home',
      badge: 'Best for families & groups',
      icon: Home,
      route: '/hotel/join-villa',
    },
    {
      key: 'hostel',
      label: 'Hostel',
      description: 'Beds or dorms for backpackers and students',
      badge: 'Best for budget travellers',
      icon: Users,
      route: '/hotel/join-hostel',
    },
    {
      key: 'pg',
      label: 'PG / Co-living',
      description: 'Long-stay beds or rooms with shared facilities',
      badge: 'Best for working professionals',
      icon: BedDouble,
      route: '/hotel/join-pg',
    },
    {
      key: 'homestay',
      label: 'Homestay',
      description: 'Live-with-host or family-run stays',
      badge: 'Best for local experiences',
      icon: Home,
      route: '/hotel/join-homestay',
    },
  ];

  const handleSelect = (route) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-[#001F1E] text-white flex flex-col">
      <header className="h-16 px-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <img src={logo} alt="Rukko" className="h-7 object-contain" />
        <div className="w-9" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-black mb-2">Choose your property type</h1>
          <p className="text-sm text-white/70 mb-6">
            Select what you want to list on Rukkoo. We will open the right setup flow for you.
          </p>

          <div className="grid grid-cols-1 gap-3">
            {propertyTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleSelect(item.route)}
                  className="w-full flex items-center justify-between gap-3 bg-white/5 hover:bg-white/10 active:scale-[0.99] transition-all border border-white/10 rounded-2xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-bold">{item.label}</div>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-semibold uppercase tracking-wide">
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/70 mt-0.5">{item.description}</div>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-white/60" />
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PartnerJoinPropertyType;
