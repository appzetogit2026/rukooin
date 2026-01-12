import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/user/Home';
import HotelDetails from './pages/user/HotelDetails';
import BottomNavbar from './components/ui/BottomNavbar';
import TopNavbar from './components/ui/TopNavbar';
import PartnerBottomNavbar from './app/partner/components/PartnerBottomNavbar';
// import Lenis from 'lenis'; // Removed manual import

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
import AdminPropertyRequestDetail from './app/admin/pages/AdminPropertyRequestDetail';
import AdminReviews from './app/admin/pages/AdminReviews';
import AdminFinance from './app/admin/pages/AdminFinance';
import AdminEarnings from './app/admin/pages/AdminEarnings';
import AdminSettings from './app/admin/pages/AdminSettings';
import AdminOffers from './app/admin/pages/AdminOffers';
import AdminProtectedRoute from './app/admin/AdminProtectedRoute';









// Hotel Partner Auth & Pages
import HotelLogin from './pages/auth/HotelLoginPage';
import HotelSignup from './pages/auth/HotelSignupPage';
import PartnerHome from './app/partner/pages/PartnerHome';
import AddPropertyWizard from './app/partner/addProperty/AddPropertyWizard'; // Updated Wizard
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
import MyPropertiesPage from './app/partner/pages/MyPropertiesPage';
import PropertyDetailsPage from './app/partner/pages/PropertyDetailsPage';

// User Pages
import SearchPage from './pages/user/SearchPage';
import BookingsPage from './pages/user/BookingsPage';
import ListingPage from './pages/user/ListingPage';
import BookingConfirmationPage from './pages/user/BookingConfirmationPage';
import WalletPage from './pages/user/WalletPage';
import PaymentPage from './pages/user/PaymentPage';
import SupportPage from './pages/user/SupportPage';
import ReferAndEarnPage from './pages/user/ReferAndEarnPage';
import SavedPlacesPage from './pages/user/SavedPlacesPage';
import NotificationsPage from './pages/user/NotificationsPage';
import SettingsPage from './pages/user/SettingsPage';
import PartnerLandingPage from './pages/user/PartnerLandingPage';
import LegalPage from './pages/user/LegalPage';
import AmenitiesPage from './pages/user/AmenitiesPage';
import ReviewsPage from './pages/user/ReviewsPage';
import OffersPage from './pages/user/OffersPage';
import ProfileEdit from './pages/user/ProfileEdit';

import { useLenis } from './app/shared/hooks/useLenis';

// Wrapper to conditionally render Navbars & Handle Lenis
const Layout = ({ children }) => {
  const location = useLocation();

  // Disable Lenis on Admin routes only (as requested)
  const isCmsRoute = location.pathname.startsWith('/admin');
  useLenis(isCmsRoute);

  // 1. GLOBAL HIDE: Auth pages, Admin, and Property Wizard
  // These pages control their own layout fully.
  // Note: '/login' will match '/hotel/login', '/register' matches '/hotel/register'
  const globalHideRoutes = ['/login', '/signup', '/register', '/admin', '/hotel/join'];
  const shouldGlobalHide = globalHideRoutes.some(route => location.pathname.includes(route));

  if (shouldGlobalHide) {
    return <>{children}</>;
  }

  // 2. CONTEXT DETECTION
  const isPartnerApp = location.pathname.startsWith('/hotel');

  // 3. NAVBAR VISIBILITY
  // User Top/Bottom Navs should NOT show in Partner App
  const showUserNavs = !isPartnerApp;

  // Specific user pages where BottomNav is hidden (e.g. detailed flows)
  const hideUserBottomNavOn = ['/booking-confirmation', '/payment', '/search', '/support', '/refer'];
  const showUserBottomNav = showUserNavs && !hideUserBottomNavOn.some(r => location.pathname.includes(r));

  // Partner Bottom Nav should show in Partner App (authenticated pages)
  // We exclude the root '/hotel' as it's likely a landing page without app navigation needs
  const showPartnerBottomNav = isPartnerApp && location.pathname !== '/hotel';

  return (
    <>
      {showUserNavs && <TopNavbar />}

      <div className={`min-h-screen md:pt-16 ${showUserBottomNav || showPartnerBottomNav ? 'pb-20 md:pb-0' : ''}`}>
        {children}
      </div>

      {showUserBottomNav && <BottomNavbar />}
      {showPartnerBottomNav && <PartnerBottomNavbar />}
    </>
  );
};

import { Toaster } from 'react-hot-toast';

import { Navigate, Outlet } from 'react-router-dom';

// Simple Protected Route for Users
const UserProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

// Public Route (redirects to home if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};



function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Layout>
        <Routes>
          {/* User Auth Routes (Public Only) */}
          <Route path="/login" element={<PublicRoute><UserLogin /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><UserSignup /></PublicRoute>} />



          {/* Hotel/Partner Module Routes */}
          <Route path="/hotel/login" element={<HotelLogin />} />
          <Route path="/hotel/register" element={<HotelSignup />} />
          <Route path="/hotel" element={<HotelLayout />}>
            {/* <Route index element={<PartnerHome />} /> */}
            <Route index element={<Navigate to="/hotel/login" replace />} />
            {/* Wizard Route */}
            <Route path="join" element={<AddPropertyWizard />} />
            <Route path="edit/:id" element={<AddPropertyWizard />} />
            <Route path="rooms" element={<RoomManager />} />
            <Route path="partner-dashboard" element={<PartnerDashboard />} />
            <Route path="dashboard" element={<PartnerDashboard />} />

            {/* Partner Sub-pages */}
            <Route path="properties" element={<MyPropertiesPage />} />
            <Route path="properties/:id" element={<PropertyDetailsPage />} />
            <Route path="bookings" element={<PartnerBookings />} />
            <Route path="wallet" element={<PartnerWallet />} />
            <Route path="reviews" element={<PartnerReviews />} />
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
          <Route element={<AdminProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="bookings/:id" element={<AdminBookingDetail />} />
              <Route path="property-requests" element={<AdminPropertyRequests />} />
              <Route path="property-requests/:id" element={<AdminPropertyRequestDetail />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="finance" element={<AdminFinance />} />
              <Route path="earnings" element={<AdminEarnings />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="hotels" element={<AdminHotels />} />
              <Route path="hotels/:id" element={<AdminHotelDetail />} />
              <Route path="offers" element={<AdminOffers />} />
            </Route>
          </Route>



          {/* Protected User Pages */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/hotel/:id" element={<HotelDetails />} />
            <Route path="/hotel/:id/amenities" element={<AmenitiesPage />} />
            <Route path="/hotel/:id/reviews" element={<ReviewsPage />} />
            <Route path="/hotel/:id/offers" element={<OffersPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/listings" element={<ListingPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
            <Route path="/refer" element={<ReferAndEarnPage />} />
            <Route path="/saved-places" element={<SavedPlacesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/partner-landing" element={<PartnerLandingPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/serviced" element={<div className="pt-20 text-center text-surface font-bold">Serviced Page</div>} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

