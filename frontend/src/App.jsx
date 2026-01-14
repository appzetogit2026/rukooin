import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/user/Home';
import UserPropertyDetailsPage from './pages/user/PropertyDetailsPage';
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
// import AdminHotels from './app/admin/pages/AdminHotels'; // Deprecated

import AdminHotelDetail from './app/admin/pages/AdminHotelDetail';
import AdminUsers from './app/admin/pages/AdminUsers';
import AdminUserDetail from './app/admin/pages/AdminUserDetail';

import AdminBookings from './app/admin/pages/AdminBookings';
import AdminBookingDetail from './app/admin/pages/AdminBookingDetail';

import AdminPartners from './app/admin/pages/AdminPartners';
import AdminReviews from './app/admin/pages/AdminReviews';
import AdminFinance from './app/admin/pages/AdminFinance';
import AdminEarnings from './app/admin/pages/AdminEarnings';
import AdminSettings from './app/admin/pages/AdminSettings';
import AdminOffers from './app/admin/pages/AdminOffers';
import AdminProtectedRoute from './app/admin/AdminProtectedRoute';
import AdminProperties from './app/admin/pages/AdminProperties';
import AdminLegalPages from './app/admin/pages/AdminLegalPages';
import AdminContactMessages from './app/admin/pages/AdminContactMessages';

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
import PartnerAbout from './app/partner/pages/PartnerAbout';
import PartnerPrivacy from './app/partner/pages/PartnerPrivacy';
import PartnerContact from './app/partner/pages/PartnerContact';

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
import AboutPage from './pages/user/AboutPage';
import ContactPage from './pages/user/ContactPage';
import AmenitiesPage from './pages/user/AmenitiesPage';
import ReviewsPage from './pages/user/ReviewsPage';
import OffersPage from './pages/user/OffersPage';
import ProfileEdit from './pages/user/ProfileEdit';

import { useLenis } from './app/shared/hooks/useLenis';
import { legalService } from './services/apiService';
import { Clock } from 'lucide-react';
import logo from './assets/rokologin-removebg-preview.png';

// Wrapper to conditionally render Navbars & Handle Lenis
const Layout = ({ children }) => {
  const location = useLocation();
  const [platformStatus, setPlatformStatus] = React.useState({
    loading: true,
    maintenanceMode: false,
    maintenanceTitle: '',
    maintenanceMessage: ''
  });

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

  React.useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      try {
        const data = await legalService.getPlatformStatus();
        if (isMounted) {
          setPlatformStatus({
            loading: false,
            maintenanceMode: !!data.maintenanceMode,
            maintenanceTitle: data.maintenanceTitle || 'We will be back soon.',
            maintenanceMessage: data.maintenanceMessage || 'The platform is under scheduled maintenance. Please check back in some time.'
          });
        }
      } catch (error) {
        if (isMounted) {
          setPlatformStatus(prev => ({ ...prev, loading: false }));
        }
      }
    };
    fetchStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const isUserHotelDetail = /^\/hotel\/[0-9a-fA-F]{24}(\/(amenities|reviews|offers))?$/.test(location.pathname);
  const isPartnerApp = location.pathname.startsWith('/hotel') && !isUserHotelDetail;

  // 3. NAVBAR VISIBILITY
  // User Top/Bottom Navs should NOT show in Partner App
  const showUserNavs = !isPartnerApp;

  // Specific user pages where BottomNav is hidden (e.g. detailed flows)
  const hideUserBottomNavOn = ['/booking-confirmation', '/payment', '/search', '/support', '/refer', '/hotel/'];
  const showUserBottomNav = showUserNavs && !hideUserBottomNavOn.some(r => location.pathname.includes(r));

  // Partner Bottom Nav should show in Partner App (authenticated pages)
  // We exclude the root '/hotel' as it's likely a landing page without app navigation needs
  const showPartnerBottomNav = isPartnerApp && location.pathname !== '/hotel';

  const isAuthRoute = ['/login', '/signup', '/hotel/login', '/hotel/register'].some(route =>
    location.pathname.startsWith(route)
  );

  const showMaintenanceOverlay =
    platformStatus.maintenanceMode &&
    !isCmsRoute &&
    !isAuthRoute;

  return (
    <>
      {showUserNavs && <TopNavbar />}

      <div className={`min-h-screen md:pt-16 ${showUserBottomNav || showPartnerBottomNav ? 'pb-20 md:pb-0' : ''}`}>
        {showMaintenanceOverlay ? (
          <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-10 text-center bg-gradient-to-b from-[#111827] via-[#0f172a] to-black">
            <div className="flex flex-col items-center justify-center max-w-md w-full">
              <div className="mb-6 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Clock className="w-8 h-8 md:w-9 md:h-9 text-teal-400" />
                </div>
                <img
                  src={logo}
                  alt="Rukkoin"
                  className="h-10 md:h-12 object-contain"
                />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white mb-3 leading-snug">
                {platformStatus.maintenanceTitle}
              </h1>
              <p className="text-sm md:text-base text-gray-300 mb-8 leading-relaxed">
                {platformStatus.maintenanceMessage}
              </p>
            </div>
          </div>
        ) : (
          children
        )}
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

// Partner Protected Route
const PartnerProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const location = useLocation();

  // Allow access to login/register/join
  const publicPartnerPaths = ['/hotel/login', '/hotel/register'];
  if (publicPartnerPaths.some(p => location.pathname.startsWith(p))) {
    return children ? children : <Outlet />;
  }

  if (!token || !user || user.role !== 'partner') {
    return <Navigate to="/hotel/login" state={{ from: location }} replace />;
  }

  const isPending = user.partnerApprovalStatus !== 'approved';
  if (isPending) {
    const allowedPending = ['/hotel/dashboard', '/hotel/partner-dashboard', '/hotel/join', '/hotel/profile'];
    if (!allowedPending.some(p => location.pathname.startsWith(p))) {
      return <Navigate to="/hotel/dashboard" replace />;
    }
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



import ScrollToTop from './components/ui/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
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
            <Route element={<PartnerProtectedRoute />}>
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
              <Route path="about" element={<PartnerAbout />} />
              <Route path="privacy" element={<PartnerPrivacy />} />
              <Route path="contact" element={<PartnerContact />} />
              <Route path="settings" element={<PartnerSettings />} />
              <Route path="profile" element={<PartnerProfile />} />
            </Route>
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
              <Route path="partners" element={<AdminPartners />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="finance" element={<AdminFinance />} />
              <Route path="earnings" element={<AdminEarnings />} />
              <Route path="legal" element={<AdminLegalPages />} />
              <Route path="contact-messages" element={<AdminContactMessages />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="properties" element={<AdminProperties />} />
              <Route path="properties/:id" element={<AdminHotelDetail />} />
              <Route path="offers" element={<AdminOffers />} />
            </Route>
          </Route>



          {/* Protected User Pages */}
          <Route element={<UserProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/hotel/:id" element={<UserPropertyDetailsPage />} />
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
            <Route path="/booking/:id" element={<BookingConfirmationPage />} />
            <Route path="/refer" element={<ReferAndEarnPage />} />
            <Route path="/saved-places" element={<SavedPlacesPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/partner-landing" element={<PartnerLandingPage />} />
            <Route path="/legal" element={<LegalPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/serviced" element={<div className="pt-20 text-center text-surface font-bold">Serviced Page</div>} />
          </Route>
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
