import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Fleet from './pages/Fleet';
import Booking from './pages/Booking';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import AdminFleet from './pages/AdminFleet';
import AdminBookings from './pages/AdminBookings';
import AdminCustomers from './pages/AdminCustomers';
import AdminLocations from './pages/AdminLocations';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminMaintenance from './pages/AdminMaintenance';
import AdminPricing from './pages/AdminPricing';
import useStore from './store/useStore';

// Protected Route Protocol
const ProtectedRoute = ({ children, role }) => {
  const user = useStore((state) => state.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function App() {
  const fetchCars = useStore((state) => state.fetchCars);

  React.useEffect(() => {
    fetchCars(); // Synchronize all identified units from the cloud registry
  }, [fetchCars]);

  return (
    <Router>
      <Routes>
        {/* Public Hub Nodes */}
        <Route path="/" element={<Home />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/booking" element={<Booking />} />
        
        {/* Admin Command Center */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/fleet" element={<ProtectedRoute role="admin"><AdminFleet /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute role="admin"><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute role="admin"><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/locations" element={<ProtectedRoute role="admin"><AdminLocations /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/maintenance" element={<ProtectedRoute role="admin"><AdminMaintenance /></ProtectedRoute>} />
        <Route path="/admin/pricing" element={<ProtectedRoute role="admin"><AdminPricing /></ProtectedRoute>} />

        {/* Catch-all Redirect Protocol */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
