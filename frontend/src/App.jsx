import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// --- 1. Public Pages ---
import Home from './pages/public/Home'; 
import AllEvents from './pages/public/AllEvents';
import EventDetails from './pages/public/EventDetails';

// --- 2. Auth Pages ---
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// --- 3. Admin Pages ---
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateEvent from './pages/admin/CreateEvent';
import ManageVolunteers from './pages/admin/ManageVolunteers';
import ApproveHours from './pages/admin/ApproveHours';
import ManageEvents from './pages/admin/ManageEvents';
import EventDetailsAdmin from './pages/admin/EventDetailsAdmin';
import AdminMessages from './pages/admin/AdminMessages';

// --- 4. Volunteer Pages ---
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import MyHistory from './pages/volunteer/MyHistory';
import MyRegistrations from './pages/volunteer/MyRegistrations';

// --- 5. Shared Pages ---
import Profile from './pages/Profile';
import Support from './pages/Support';

// --- 6. Layouts ---
import AuthLayout from './components/layout/AuthLayout';
import DashboardLayout from './components/layout/DashboardLayout';

function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 antialiased font-sans overflow-x-hidden">
      
      {/* AnimatePresence handles smooth page transitions (optional) */}
      <AnimatePresence mode="wait">
        <Routes>
          
          {/* =========================================
              PUBLIC ROUTES (Accessible by everyone)
          ========================================== */}
          
          {/* Landing Page */}
          <Route path="/" element={<Home />} />
          
          {/* Public Event Browsing (External View) */}
          <Route path="/events" element={<AllEvents />} />
          <Route path="/events/:id" element={<EventDetails />} />
          
          
          {/* =========================================
              AUTH ROUTES (Login / Register)
              Wrapped in AuthLayout for the 3D Flip Animation
          ========================================== */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/resetpassword/:token" element={<ResetPassword />} />
          </Route>
          

          {/* =========================================
              PROTECTED DASHBOARD ROUTES
              Wrapped in DashboardLayout (Sidebar & Navbar)
          ========================================== */}
          <Route element={<DashboardLayout />}>
            
            {/* ---------------------------
                A. ADMIN ONLY ROUTES 
            ---------------------------- */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Event Management */}
            <Route path="/admin/events/manage" element={<ManageEvents />} />       {/* Table View */}
            <Route path="/admin/events/:id/manage" element={<EventDetailsAdmin />} /> {/* Detail/Edit View */}
            <Route path="/admin/events/create" element={<CreateEvent />} />
            
            {/* User & Request Management */}
            <Route path="/admin/volunteers" element={<ManageVolunteers />} />
            <Route path="/admin/approvals" element={<ApproveHours />} />
            <Route path="/admin/messages" element={<AdminMessages />} />           {/* Support Inbox */}

            {/* ---------------------------
                B. VOLUNTEER ONLY ROUTES 
            ---------------------------- */}
            <Route path="/dashboard" element={<VolunteerDashboard />} />
            <Route path="/my-hours" element={<MyHistory />} />
            <Route path="/my-registrations" element={<MyRegistrations />} />

            {/* ---------------------------
                C. SHARED / PUBLIC DASHBOARD ROUTES
            ---------------------------- */}
            
            {/* Event Browsing (Internal Dashboard View) */}
            {/* These allow users to browse events without losing the sidebar */}
            <Route path="/dashboard/events" element={<AllEvents />} />
            <Route path="/dashboard/events/:id" element={<EventDetails />} />

            {/* Common Pages (Profile, Support) */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/support" element={<Support />} />

          </Route>
          

          {/* =========================================
              404 NOT FOUND
          ========================================== */}
          <Route path="*" element={
            <div className="flex h-screen items-center justify-center bg-[#0f172a] text-center">
              <div>
                <h1 className="mb-2 text-4xl font-bold text-white">404</h1>
                <p className="text-slate-400">Page not found</p>
              </div>
            </div>
          } />
        
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default App;