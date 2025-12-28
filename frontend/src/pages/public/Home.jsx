import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Calendar, Users, ShieldCheck, 
  HeartHandshake, Star, Globe, Clock, Sparkles, 
  MapPin, CheckCircle2, Loader2, LayoutDashboard
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../lib/axios';
import { Button } from '../../components/ui/button'; 
import useAuth from '../../hooks/useAuth'; // <--- 1. Import useAuth

// --- Animated Background ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
    <motion.div 
      animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0], x: [0, 100, 0], y: [0, -50, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-20%] left-[-10%] w-[70vh] h-[70vh] bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-[120px] mix-blend-screen" 
    />
    <motion.div 
      animate={{ scale: [1.1, 1, 1.1], rotate: [0, -90, 0], x: [0, -100, 0], y: [0, 50, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-[-20%] right-[-10%] w-[70vh] h-[70vh] bg-gradient-to-br from-cyan-600/20 to-blue-600/20 rounded-full blur-[120px] mix-blend-screen" 
    />
    <div className="absolute inset-0 bg-[#0f172a]/90 backdrop-blur-[1px]"></div>
  </div>
);

const Home = () => {
  const { user } = useAuth(); // <--- 2. Get current user status

  // --- FETCH REAL DATA ---
  const { data: landingData, isLoading } = useQuery({
    queryKey: ['landingPageData'],
    queryFn: async () => {
      // Fetch all public events to calculate stats
      const response = await api.get('/events');
      const allEvents = Array.isArray(response.data) ? response.data : [];

      // Calculate stats based on real data
      const totalEvents = allEvents.length;
      // Sum of all people currently registered for events
      const activeVolunteers = allEvents.reduce((acc, curr) => acc + (curr.registrationCount || 0), 0);
      // Sort by date to get upcoming features
      const sortedEvents = allEvents
        .filter(e => new Date(e.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        featuredEvents: sortedEvents.slice(0, 3), // Top 3 Upcoming
        stats: {
          events: totalEvents,
          volunteers: activeVolunteers,
          // Estimate: Avg 4 hours per slot filled
          hours: activeVolunteers * 4 
        }
      };
    },
    // Default values while loading
    placeholderData: {
      featuredEvents: [],
      stats: { events: 0, volunteers: 0, hours: 0 }
    }
  });

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-pink-500/30 overflow-x-hidden relative">
      
      <AnimatedBackground />

      {/* --- NAVBAR --- */}
      <nav className="relative z-50 border-b border-white/5 bg-[#0f172a]/70 backdrop-blur-xl">
        <div className="flex items-center justify-between h-20 px-6 mx-auto max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 overflow-hidden text-white rounded-xl group">
              <div className="absolute inset-0 transition-opacity bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 opacity-80 group-hover:opacity-100"></div>
              <HeartHandshake size={24} className="relative z-10" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">RallyPoint</span>
          </div>

          <div className="items-center hidden gap-8 text-sm font-medium md:flex text-slate-400">
            <a href="#events" className="transition-colors hover:text-white">Opportunities</a>
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#impact" className="transition-colors hover:text-white">Impact</a>
          </div>

          <div className="flex items-center gap-4">
            {/* --- SMART NAVBAR BUTTONS --- */}
            {user ? (
               <Link to="/dashboard">
                 <Button className="px-6 font-bold bg-white rounded-full text-slate-900 hover:bg-indigo-50">
                   <LayoutDashboard className="w-4 h-4 mr-2"/> Dashboard
                 </Button>
               </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="font-semibold text-slate-300 hover:text-white hover:bg-white/5">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button className="px-6 font-bold bg-white rounded-full text-slate-900 hover:bg-indigo-50">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 px-6 pt-24 pb-32">
        <div className="grid items-center gap-16 mx-auto max-w-7xl lg:grid-cols-2">
          
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-pink-300 border rounded-full bg-pink-500/10 border-pink-500/20 backdrop-blur-md"
            >
              <Sparkles size={14} className="text-pink-400" />
              <span>The future of community service</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]"
            >
              Real impact, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500">
                real time.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl mx-auto text-lg leading-relaxed md:text-xl text-slate-400 lg:mx-0"
            >
              Join a growing community making a difference. Discover local events, track your service hours, and verify your impact instantly.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row lg:justify-start"
            >
              {/* --- SMART HERO BUTTONS --- */}
              <Link to={user ? "/dashboard" : "/register"}>
                <Button size="lg" className="w-full px-10 text-lg font-bold text-white transition-all rounded-full shadow-xl h-14 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-purple-900/30 sm:w-auto hover:scale-105">
                  {user ? "Go to Dashboard" : "Start Volunteering"}
                </Button>
              </Link>
              
              <Link to={user ? "/dashboard/events" : "/events"}>
                <Button size="lg" variant="outline" className="w-full px-10 text-lg font-semibold rounded-full h-14 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20 sm:w-auto backdrop-blur-md">
                  Browse Events <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
              className="flex flex-wrap justify-center gap-6 pt-8 text-sm font-medium lg:justify-start text-slate-500"
            >
               <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Verified 501(c)(3) Partners</div>
               <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-emerald-500" /> Automated Certificates</div>
            </motion.div>
          </div>

          {/* Right Hero Visual - Abstract Data Visualization */}
          <motion.div
             initial={{ opacity: 0, scale: 0.9, x: 50 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
             className="relative z-20 hidden lg:block"
          >
             <div className="relative p-6 transition-all duration-500 transform border shadow-2xl rounded-3xl border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-purple-900/20 rotate-3 hover:rotate-0">
                <div className="space-y-6">
                   <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <div className="flex gap-3">
                         <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                         <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                         <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                      </div>
                      <div className="w-20 h-2 rounded-full bg-white/10"></div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border bg-white/5 rounded-xl border-white/5">
                         <p className="text-xs font-bold uppercase text-slate-400">Estimated Impact</p>
                         <p className="mt-1 text-3xl font-black text-white">{landingData?.stats?.hours} hrs</p>
                      </div>
                      <div className="p-4 border bg-white/5 rounded-xl border-white/5">
                         <p className="text-xs font-bold uppercase text-slate-400">Total Events</p>
                         <p className="mt-1 text-3xl font-black text-cyan-400">{landingData?.stats?.events}</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex items-center h-12 px-4 text-sm text-pink-200 border-l-4 border-pink-500 rounded-lg bg-gradient-to-r from-pink-500/20 to-transparent">
                         {landingData?.stats?.volunteers} Volunteers Active
                      </div>
                      <div className="flex items-center h-12 px-4 text-sm text-purple-200 border-l-4 border-purple-500 rounded-lg bg-gradient-to-r from-purple-500/20 to-transparent">
                         Food Drive event created
                      </div>
                      <div className="flex items-center h-12 px-4 text-sm border-l-4 rounded-lg bg-gradient-to-r from-cyan-500/20 to-transparent border-cyan-500 text-cyan-200">
                         Hours Verified Instantly
                      </div>
                   </div>
                </div>
                <div className="absolute rounded-full -inset-10 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 blur-3xl opacity-10 -z-10"></div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* --- REAL DATA STATS BANNER --- */}
      <section className="relative z-10 py-16 bg-slate-900/50 backdrop-blur-md border-y border-white/5">
         <div className="grid grid-cols-2 gap-8 px-6 mx-auto text-center max-w-7xl md:grid-cols-4">
             <StatBox value={landingData?.stats?.volunteers || 0} label="Active Volunteers" color="from-pink-500 to-purple-500" />
             <StatBox value={landingData?.stats?.events || 0} label="Events Hosted" color="from-purple-500 to-cyan-500" />
             <StatBox value={landingData?.stats?.hours || 0} label="Est. Hours" color="from-cyan-500 to-blue-500" suffix="+" />
             <StatBox value="100%" label="Commitment" color="from-blue-500 to-purple-500" />
         </div>
      </section>

      {/* --- FEATURED OPPORTUNITIES (REAL DATA) --- */}
      {/* Only show this section if we actually have events */}
      {landingData?.featuredEvents?.length > 0 && (
        <section id="events" className="relative z-10 py-32 bg-gradient-to-b from-transparent to-slate-900/50">
          <div className="px-6 mx-auto max-w-7xl">
            <div className="flex flex-col items-end justify-between gap-6 mb-12 md:flex-row">
              <div>
                <span className="text-sm font-bold tracking-widest text-pink-400 uppercase">Get Involved</span>
                <h2 className="mt-2 text-4xl font-extrabold text-white">Featured Opportunities</h2>
              </div>
              
              {/* --- SMART VIEW ALL BUTTON --- */}
              <Link to={user ? "/dashboard/events" : "/events"}>
                <Button variant="ghost" className="text-slate-300 hover:text-white group">
                  View All Events <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"/>
                </Button>
              </Link>
            </div>

            {isLoading ? (
               <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-pink-500 animate-spin"/></div>
            ) : (
              <div className="grid gap-8 md:grid-cols-3">
                {landingData.featuredEvents.map((event) => (
                  // --- SMART CARD LINK ---
                  <Link 
                    to={user ? `/dashboard/events/${event._id}` : `/events/${event._id}`} 
                    key={event._id} 
                    className="h-full group"
                  >
                    <div className="flex flex-col h-full overflow-hidden transition-all duration-300 border bg-slate-800/50 border-white/10 rounded-2xl hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-900/20">
                      <div className="relative h-48 overflow-hidden bg-slate-700">
                        {event.bannerImage ? (
                          <img src={event.bannerImage} alt={event.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-700 to-slate-800">
                            <Calendar className="w-12 h-12 text-slate-500" />
                          </div>
                        )}
                        <div className="absolute px-3 py-1 text-xs font-bold text-white border rounded-full top-4 right-4 bg-slate-900/80 backdrop-blur-md border-white/10">
                          {event.category || 'General'}
                        </div>
                      </div>
                      <div className="flex flex-col flex-1 p-6">
                        <div className="mb-2 text-xs font-bold tracking-wider text-pink-400 uppercase">
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </div>
                        <h3 className="mb-2 text-xl font-bold text-white transition-colors line-clamp-1 group-hover:text-pink-300">
                          {event.title}
                        </h3>
                        <p className="flex-1 mb-4 text-sm text-slate-400 line-clamp-2">
                          {event.description}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-300">
                            <MapPin size={14} className="text-slate-500" />
                            <span className="truncate max-w-[120px]">{event.location}</span>
                          </div>
                          <span className="px-2 py-1 text-xs font-medium text-white rounded-md bg-white/10">
                            {event.slotsAvailable - (event.registrationCount || 0)} spots left
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* --- FEATURES GRID --- */}
      <section id="features" className="relative z-10 py-32">
        <div className="px-6 mx-auto max-w-7xl">
          <div className="mb-20 text-center">
            <span className="text-sm font-bold tracking-widest text-transparent uppercase bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
               Powerful Platform
            </span>
            <h2 className="mt-4 mb-6 text-4xl font-extrabold text-white md:text-5xl">
               Everything you need to <br/> maximize impact.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            <FeatureCard 
              icon={<Calendar size={32} />} color="pink"
              title="Smart Scheduling"
              desc="Browse opportunities and sign up for shifts that perfectly fit your life with one click."
            />
            <FeatureCard 
              icon={<Clock size={32} />} color="purple"
              title="Automated Tracking"
              desc="Forget paper logs. Your volunteer hours are automatically recorded and verified instantly."
            />
            <FeatureCard 
              icon={<ShieldCheck size={32} />} color="cyan"
              title="Verified Certificates"
              desc="Generate official, shareable volunteer certificates for school, work, or LinkedIn."
            />
            <FeatureCard 
              icon={<Users size={32} />} color="blue"
              title="Community Hub"
              desc="Connect with like-minded individuals and coordinate group efforts effortlessly."
            />
            <FeatureCard 
              icon={<Globe size={32} />} color="indigo"
              title="Remote Options"
              desc="Find virtual volunteering opportunities you can do from anywhere in the world."
            />
            <FeatureCard 
              icon={<Star size={32} />} color="yellow"
              title="Rewards & Badges"
              desc="Earn recognition for your contributions and level up your volunteer profile."
            />
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="relative z-10 px-6 py-32">
        <div className="max-w-7xl mx-auto relative z-20 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-[3rem] p-12 md:p-24 text-center overflow-hidden border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
          
          <div className="relative z-10">
             <h2 className="mb-8 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
               Ready to join the movement?
             </h2>
             <p className="max-w-2xl mx-auto mb-12 text-xl text-indigo-200">
               Create your account today. It's free, takes 2 minutes, and opens the door to meaningful change.
             </p>
             
             {/* --- SMART CTA BUTTON --- */}
             <Link to={user ? "/dashboard" : "/register"}>
               <Button size="lg" className="h-16 px-12 text-xl font-bold transition-all bg-white rounded-full shadow-2xl text-indigo-950 hover:bg-indigo-50 hover:scale-105 shadow-white/20">
                  {user ? "Go to Dashboard" : "Create Free Account"}
               </Button>
             </Link>
             <p className="mt-8 text-sm font-medium text-indigo-300/70">No credit card required • Join as Organization or Individual</p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 bg-[#060913] pt-20 pb-10 px-6 mt-20 border-t border-white/5">
        <div className="grid grid-cols-2 gap-10 mx-auto mb-16 max-w-7xl md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 text-white shadow-lg rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
                <HeartHandshake size={22} />
              </div>
              <span className="text-2xl font-extrabold text-white">RallyPoint</span>
            </div>
            <p className="max-w-xs mb-8 text-sm leading-relaxed text-slate-500">
              Empowering communities through modern, seamless volunteer management technology.
            </p>
          </div>
          
          <div>
            <h4 className="mb-6 font-bold text-white">Platform</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              
              {/* --- SMART FOOTER LINK --- */}
              <li>
                <Link to={user ? "/dashboard/events" : "/events"} className="transition-colors hover:text-pink-400">
                   Browse Events
                </Link>
              </li>
              
              <li><Link to="#" className="transition-colors hover:text-pink-400">For Nonprofits</Link></li>
              <li><Link to="#" className="transition-colors hover:text-pink-400">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-6 font-bold text-white">Support</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link to="/support" className="transition-colors hover:text-cyan-400">Help Center</Link></li>
              <li><Link to="#" className="transition-colors hover:text-cyan-400">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 font-bold text-white">Legal</h4>
            <ul className="space-y-3 text-sm font-medium text-slate-400">
              <li><Link to="#" className="transition-colors hover:text-purple-400">Privacy Policy</Link></li>
              <li><Link to="#" className="transition-colors hover:text-purple-400">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-between gap-4 pt-8 mx-auto border-t max-w-7xl border-white/5 md:flex-row">
          <p className="text-sm font-medium text-slate-600">© 2024 RallyPoint Inc. Made with <HeartHandshake size={14} className="inline mx-1 text-pink-500" /> globally.</p>
        </div>
      </footer>

    </div>
  );
};

// --- Helper Components ---
const StatBox = ({ value, label, color, suffix = "" }) => (
  <div>
    <div className={`text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${color} mb-2`}>
      {value}{suffix}
    </div>
    <div className="text-sm font-bold tracking-wider uppercase text-slate-400">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc, color }) => {
  const colorMap = {
    pink: "text-pink-400 group-hover:text-pink-300 from-pink-500/20 to-pink-500/0",
    purple: "text-purple-400 group-hover:text-purple-300 from-purple-500/20 to-purple-500/0",
    cyan: "text-cyan-400 group-hover:text-cyan-300 from-cyan-500/20 to-cyan-500/0",
    blue: "text-blue-400 group-hover:text-blue-300 from-blue-500/20 to-blue-500/0",
    indigo: "text-indigo-400 group-hover:text-indigo-300 from-indigo-500/20 to-indigo-500/0",
    yellow: "text-yellow-400 group-hover:text-yellow-300 from-yellow-500/20 to-yellow-500/0",
  };
  
  return (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
    className="relative p-8 overflow-hidden transition-all duration-500 border rounded-3xl bg-white/5 border-white/10 group hover:border-white/20 hover:-translate-y-2"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    
    <div className="relative z-10">
      <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 ${colorMap[color].split(' ')[0]} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold text-white">{title}</h3>
      <p className="text-sm font-medium leading-relaxed text-slate-400">{desc}</p>
    </div>
  </motion.div>
)};

export default Home;