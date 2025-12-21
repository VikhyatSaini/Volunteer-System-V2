import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, CalendarPlus, Users, Clock, LogOut, 
  Menu, ShieldCheck, HeartHandshake, Bell, ChevronRight, 
  Search, Settings, HelpCircle, ChevronDown, X, 
  Briefcase, ListFilter, Mail 
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const DashboardLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);

  // --- SECURITY & REDIRECTION LOGIC ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // 1. Basic Auth Check: Must be logged in
    if (!loading && (!user || !token)) {
      navigate('/login', { replace: true });
      return;
    }

    // 2. Strict Role Protection
    // If a non-admin tries to access ANY path starting with '/admin', kick them out.
    if (!loading && user && user.role !== 'admin' && location.pathname.startsWith('/admin')) {
      navigate('/dashboard', { replace: true });
    }

  }, [user, loading, navigate, location]);

  if (loading || !user) return null; 

  // --- ADMIN LINKS (Management Focused) ---
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Manage Events', path: '/admin/events/manage', icon: <ListFilter size={18} /> }, 
    { name: 'Create Event', path: '/admin/events/create', icon: <CalendarPlus size={18} /> },
    { name: 'Volunteers', path: '/admin/volunteers', icon: <Users size={18} /> },
    { name: 'Approvals', path: '/admin/approvals', icon: <Clock size={18} /> },
    { name: 'Support Inbox', path: '/admin/messages', icon: <Mail size={18} /> },
  ];

  // --- VOLUNTEER LINKS (Action Focused) ---
  const volunteerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    
    // --- FIX: Updated path from '/events' to '/dashboard/events' ---
    { name: 'Browse Events', path: '/dashboard/events', icon: <Briefcase size={18} /> }, 
    
    { name: 'My History', path: '/my-hours', icon: <Clock size={18} /> },
  ];

  // Select links based on role
  const links = user?.role === 'admin' ? adminLinks : volunteerLinks;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const SidebarContent = ({ expanded }) => (
    <div className="flex flex-col h-full">
      {/* 1. Brand Header */}
      <div className={`h-16 flex items-center px-5 border-b border-slate-800 ${expanded ? 'justify-start' : 'justify-center'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md ${user?.role === 'admin' ? 'bg-purple-600 shadow-purple-900/20' : 'bg-indigo-600 shadow-indigo-900/20'}`}>
            {user?.role === 'admin' ? <ShieldCheck size={18} /> : <HeartHandshake size={18} />}
          </div>
          {expanded && (
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight tracking-tight text-slate-100">RallyPoint</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {user?.role === 'admin' ? 'Admin Portal' : 'Volunteer'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 mb-2">
          {expanded && <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-slate-500">Platform</p>}
        </div>
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link to={link.path} key={link.path} onClick={() => setMobileMenuOpen(false)}>
              <div className={`
                flex items-center px-3 py-2.5 rounded-md group transition-all duration-200 mb-1
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
              `}>
                <span className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {link.icon}
                </span>
                {expanded && (
                  <span className="ml-3 text-sm font-medium">
                    {link.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}

        {/* Secondary Links (Settings, etc.) */}
        <div className="px-3 mt-8">
          {expanded && <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-slate-500">Settings</p>}
          <Link to="/profile">
            <div className="flex items-center px-3 py-2.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 mb-1">
              <Settings size={18} />
              {expanded && <span className="ml-3 text-sm font-medium">Account</span>}
            </div>
          </Link>
          <Link to="/support">
            <div className="flex items-center px-3 py-2.5 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200">
              <HelpCircle size={18} />
              {expanded && <span className="ml-3 text-sm font-medium">Support</span>}
            </div>
          </Link>
        </div>
      </nav>

      {/* 3. User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className={`flex items-center ${expanded ? 'justify-between' : 'justify-center'}`}>
          {expanded && (
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 overflow-hidden border rounded-full bg-slate-700 border-slate-600">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="User" className="object-cover w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-xs font-bold text-white">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
               </div>
               <div className="flex flex-col overflow-hidden">
                  <span className="w-24 text-sm font-medium truncate text-slate-200">{user?.name}</span>
                  <span className="text-xs capitalize text-slate-500">{user?.role}</span>
               </div>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            className="p-2 transition-colors rounded-md text-slate-400 hover:bg-slate-800 hover:text-white"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen font-sans antialiased bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      
      {/* --- SIDEBAR (Desktop) --- */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        className="sticky top-0 z-30 flex-col hidden h-screen border-r md:flex border-slate-800 bg-slate-900"
      >
        <SidebarContent expanded={isSidebarOpen} />
      </motion.aside>

      {/* --- MOBILE DRAWER --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 border-r w-72 bg-slate-900 border-slate-800 md:hidden"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <SidebarContent expanded={true} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-6 border-b bg-slate-900/80 backdrop-blur-md border-slate-800">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="hidden p-2 transition-colors rounded-md hover:bg-slate-800 text-slate-400 md:block"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md hover:bg-slate-800 text-slate-400 md:hidden"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb / Page Title */}
            <div className="items-center hidden text-sm sm:flex">
               <span className="font-medium text-slate-500">Application</span>
               <ChevronRight size={14} className="mx-2 text-slate-600" />
               <span className="font-medium capitalize text-slate-200">
                 {location.pathname.includes('/events/manage') 
                    ? 'Manage Events' 
                    : location.pathname.split('/')[2] || location.pathname.split('/')[1] || 'Dashboard'}
               </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="hidden md:flex items-center bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 w-64 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
               <Search size={14} className="mr-2 text-slate-500" />
               <input 
                 type="text" 
                 placeholder="Search..." 
                 className="w-full text-xs bg-transparent border-none outline-none text-slate-200 placeholder-slate-600" 
               />
               <span className="text-[10px] text-slate-600 border border-slate-700 rounded px-1.5 py-0.5">⌘K</span>
            </div>

            <div className="w-px h-6 mx-2 bg-slate-800"></div>

            <button className="relative p-2 transition-colors rounded-md hover:bg-slate-800 text-slate-400 hover:text-indigo-400">
              <Bell size={18} />
              <span className="absolute top-2 right-2.5 h-1.5 w-1.5 bg-indigo-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 py-1 pl-2 pr-1 transition-all border border-transparent rounded-full hover:bg-slate-800 hover:border-slate-700"
              >
                 <div className="flex items-center justify-center overflow-hidden text-xs font-bold text-white bg-indigo-600 rounded-full w-7 h-7">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="User" className="object-cover w-full h-full" />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                 </div>
                 <ChevronDown size={14} className="mr-1 text-slate-500" />
              </button>
              
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setProfileMenuOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 z-40 w-48 py-1 mt-2 border rounded-lg shadow-xl bg-slate-900 border-slate-800"
                    >
                      <div className="px-4 py-2 border-b border-slate-800">
                        <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                        <p className="text-xs truncate text-slate-500">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white" onClick={() => setProfileMenuOpen(false)}>
                        Profile Settings
                      </Link>
                      <button 
                        onClick={() => { handleLogout(); setProfileMenuOpen(false); }}
                        className="w-full px-4 py-2 text-sm text-left text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950 md:p-8 custom-scrollbar">
           <div className="mx-auto max-w-7xl">
             <Outlet />
           </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;