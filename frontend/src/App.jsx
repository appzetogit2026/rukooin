import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/user/Home';
import HotelDetails from './pages/user/HotelDetails';
import BottomNavbar from './components/ui/BottomNavbar';
import TopNavbar from './components/ui/TopNavbar';
import Lenis from 'lenis';

// User Auth Pages
import UserLogin from './pages/auth/UserLogin';
import UserSignup from './pages/auth/UserSignup';

// Admin Auth Pages
import AdminLogin from './app/admin/pages/AdminLogin';
import AdminSignup from './app/admin/pages/AdminSignup';


// Partner Pages (New Module)

import HotelLayout from './layouts/HotelLayout';
import AdminLayout from './app/admin/layouts/AdminLayout';
import AdminDashboard from './app/admin/pages/AdminDashboard';
import AdminHotels from './app/admin/pages/AdminHotels';

import AdminHotelDetail from './app/admin/pages/AdminHotelDetail';
import AdminUsers from './app/admin/pages/AdminUsers';
import AdminUserDetail from './app/admin/pages/AdminUserDetail';

import AdminBookings from './app/admin/pages/AdminBookings';
import AdminBookingDetail from './app/admin/pages/AdminBookingDetail';

import AdminPropertyRequests from './app/admin/pages/AdminPropertyRequests';
import AdminReviews from './app/admin/pages/AdminReviews';
import AdminFinance from './app/admin/pages/AdminFinance';
import AdminEarnings from './app/admin/pages/AdminEarnings';
import AdminSettings from './app/admin/pages/AdminSettings';









// Hotel Partner Auth & Pages
import HotelLogin from './app/partner/pages/HotelLogin';
import PartnerHome from './app/partner/pages/PartnerHome';
import JoinRokkooin from './app/partner/pages/JoinRokkooin';
import PartnerDashboard from './app/partner/pages/PartnerDashboard';
import PartnerBookings from './app/partner/pages/PartnerBookings';
import PartnerWallet from './app/partner/pages/PartnerWallet';
import PartnerReviews from './app/partner/pages/PartnerReviews';
import PartnerPage from './app/partner/pages/PartnerPage';
import PartnerNotifications from './app/partner/pages/PartnerNotifications';
import PartnerKYC from './app/partner/pages/PartnerKYC';
import PartnerSupport from './app/partner/pages/PartnerSupport';
import PartnerProfile from './app/partner/pages/PartnerProfile';
import PartnerTransactions from './app/partner/pages/PartnerTransactions';
import PartnerTerms from './app/partner/pages/PartnerTerms';
import PartnerSettings from './app/partner/pages/PartnerSettings';
import RoomManager from './app/partner/pages/RoomManager';

// User Pages
import SearchPage from './pages/user/SearchPage';
import BookingsPage from './pages/user/BookingsPage';
import ListingPage from './pages/user/ListingPage';
import BookingConfirmationPage from './pages/user/BookingConfirmationPage';
import WalletPage from './pages/user/WalletPage';
import PaymentPage from './pages/user/PaymentPage';
import SupportPage from './pages/user/SupportPage';
import ReferAndEarnPage from './pages/user/ReferAndEarnPage';

// Wrapper to conditionally render Navbars
const Layout = ({ children }) => {
  const location = useLocation();

  // Routes where navbars should be completely hidden
  const hideAllNavRoutes = ['/login', '/signup', '/register', '/admin', '/hotel'];
  const shouldHideAllNav = hideAllNavRoutes.some(route => location.pathname.includes(route));

  // Routes where only bottom nav should be hidden
  const hideBottomNavRoutes = ['/hotel/', '/booking-confirmation', '/payment', '/search', '/support', '/refer'];
  const shouldHideBottomNav = hideBottomNavRoutes.some(route => location.pathname.includes(route));

  // If auth page, render without any navbars
  if (shouldHideAllNav) {
    return <>{children}</>;
  }

  return (
    <>
      <TopNavbar />
      <div className={`min-h-screen md:pt-16 ${!shouldHideBottomNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </div>
      {!shouldHideBottomNav && <BottomNavbar />}
    </>
  );
};

function App() {
  // Initialize Smooth Scrolling (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <Layout>
        <Routes>
          {/* User Auth Routes */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/signup" element={<UserSignup />} />



          {/* Hotel/Partner Module Routes */}
          <Route path="/hotel/login" element={<HotelLogin />} />
          <Route path="/hotel" element={<HotelLayout />}>
            <Route index element={<PartnerHome />} />
            {/* Wizard Route */}
            <Route path="join" element={<JoinRokkooin />} />
            <Route path="rooms" element={<RoomManager />} />
            <Route path="partner-dashboard" element={<PartnerDashboard />} />
            <Route path="dashboard" element={<PartnerDashboard />} />

            {/* Partner Sub-pages */}
            <Route path="bookings" element={<PartnerBookings />} />
            <Route path="wallet" element={<PartnerWallet />} />
            <Route path="reviews" element={<PartnerReviews />} />

            {/* Generic/Placeholder Pages */}
            <Route path="transactions" element={<PartnerTransactions />} />
            <Route path="notifications" element={<PartnerNotifications />} />
            <Route path="kyc" element={<PartnerKYC />} />
            <Route path="support" element={<PartnerSupport />} />
            <Route path="terms" element={<PartnerTerms />} />
            <Route path="settings" element={<PartnerSettings />} />
            <Route path="profile" element={<PartnerProfile />} />
          </Route>

          {/* Admin Auth Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          {/* Admin App Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/:id" element={<AdminUserDetail />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="bookings/:id" element={<AdminBookingDetail />} />
            <Route path="property-requests" element={<AdminPropertyRequests />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="finance" element={<AdminFinance />} />
            <Route path="earnings" element={<AdminEarnings />} />
            <Route path="settings" element={<AdminSettings />} />




            <Route path="hotels" element={<AdminHotels />} />

            <Route path="hotels/:id" element={<AdminHotelDetail />} />

            {/* Add more admin routes here later */}
          </Route>



          {/* User Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/listings" element={<ListingPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/refer" element={<ReferAndEarnPage />} />

          {/* Placeholder Routes */}
          <Route path="/serviced" element={<div className="pt-20 text-center text-surface font-bold">Serviced Page</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

