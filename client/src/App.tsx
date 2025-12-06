import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DialogProvider } from './components/ui/IOSDialog';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MatchOperation from './pages/MatchOperation';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminOrganizations from './pages/AdminOrganizations';
import DigitalID from './pages/DigitalID';
import Documents from './pages/Documents';
import ModulesDashboard from './pages/ModulesDashboard';
import CompetitionWizard from './pages/CompetitionWizard';
import CompetitionManagement from './pages/CompetitionManagement';
import CompetitionList from './pages/CompetitionList';
import VenueList from './pages/VenueList';
import VenueForm from './pages/VenueForm';
import BookingCalendar from './pages/BookingCalendar';
import MyBookings from './pages/MyBookings';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <DialogProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="modules" element={<ModulesDashboard />} />
              <Route path="competitions" element={<CompetitionList />} />
              <Route path="competitions/new" element={<CompetitionWizard />} />
              <Route path="competitions/:id/manage" element={<CompetitionManagement />} />
              <Route path="matches" element={<MatchOperation />} />
              <Route path="profile" element={<Profile />} />
              <Route path="digital-id" element={<DigitalID />} />
              <Route path="documents" element={<Documents />} />
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/organizations" element={<AdminOrganizations />} />
              {/* Venue & Booking Routes */}
              <Route path="venues" element={<VenueList />} />
              <Route path="venues/new" element={<VenueForm />} />
              <Route path="venues/:id/edit" element={<VenueForm />} />
              <Route path="venues/:id/book" element={<BookingCalendar />} />
              <Route path="my-bookings" element={<MyBookings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DialogProvider>
    </AuthProvider>
  );
}

export default App;
