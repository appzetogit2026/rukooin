import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/user/Home';
import HotelDetails from './pages/user/HotelDetails';
import BottomNavbar from './components/ui/BottomNavbar';
import TopNavbar from './components/ui/TopNavbar';
import Lenis from 'lenis';

// Wrapper to conditionally render Navbars
const Layout = ({ children }) => {
  const location = useLocation();
  const hideBottomNavRoutes = ['/hotel/', '/booking-confirmation', '/payment', '/search', '/support', '/refer'];
  const shouldHideBottomNav = hideBottomNavRoutes.some(route => location.pathname.includes(route));

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

import SearchPage from './pages/user/SearchPage';
import BookingsPage from './pages/user/BookingsPage';
import ListingPage from './pages/user/ListingPage';
import BookingConfirmationPage from './pages/user/BookingConfirmationPage';
import WalletPage from './pages/user/WalletPage';
import PaymentPage from './pages/user/PaymentPage';
import SupportPage from './pages/user/SupportPage';
import ReferAndEarnPage from './pages/user/ReferAndEarnPage';

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
          <Route path="/" element={<Home />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/listings" element={<ListingPage />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          {/* Add placeholders for other nav items */}
          <Route path="/serviced" element={<div className="pt-20 text-center text-surface font-bold">Serviced Page</div>} />
          <Route path="/refer" element={<ReferAndEarnPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
