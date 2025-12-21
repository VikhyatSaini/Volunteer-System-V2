import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Search, Loader2, ArrowRight, CheckCircle2, 
  ChevronLeft, ChevronRight, Eye, XCircle, ClipboardList, Calendar, Sparkles 
} from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../lib/axios';
import useAuth from '../../hooks/useAuth';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';

const ITEMS_PER_PAGE = 6;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

const AllEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Helper to check if we are currently inside the dashboard
  const isDashboard = location.pathname.includes('/dashboard');

  // 1. Fetch All Events
  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await api.get('/events?limit=1000');
      return response.data;
    },
    staleTime: 0,
    refetchOnWindowFocus: true, 
  });

  // 2. Fetch My Registrations
  const { data: joinedEventIds } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await api.get('/events/my-registrations');
        return response.data; 
      } catch (error) {
        return [];
      }
    },
    enabled: !!user, 
  });

  // 3. Fetch My Waitlist
  const { data: waitlistedEventIds } = useQuery({
    queryKey: ['my-waitlist'],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await api.get('/events/my-waitlist');
        return response.data.map(event => event._id); 
      } catch (error) {
        return [];
      }
    },
    enabled: !!user, 
  });

  // 4. Register Mutation
  const joinMutation = useMutation({
    mutationFn: async (eventId) => {
      return await api.post(`/events/${eventId}/register`);
    },
    onSuccess: () => {
      toast.success("Successfully registered! 🎉");
      queryClient.invalidateQueries(['events']); 
      queryClient.invalidateQueries(['my-registrations']); 
      queryClient.invalidateQueries(['volunteer-dashboard']); 
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  });

  // 5. Unregister Mutation
  const leaveMutation = useMutation({
    mutationFn: async (eventId) => {
      return await api.delete(`/events/${eventId}/unregister`);
    },
    onSuccess: () => {
      toast.success("Unregistered successfully.");
      queryClient.invalidateQueries(['events']); 
      queryClient.invalidateQueries(['my-registrations']); 
      queryClient.invalidateQueries(['volunteer-dashboard']); 
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unregister');
    }
  });

  // 6. Waitlist Mutation
  const waitlistMutation = useMutation({
    mutationFn: async (eventId) => {
      return await api.post(`/events/${eventId}/waitlist`);
    },
    onSuccess: () => {
      toast.success("Added to waitlist!");
      queryClient.invalidateQueries(['my-waitlist']); 
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to join waitlist');
    }
  });

  const handleJoin = (e, eventId) => {
    e.stopPropagation(); 
    if (!user) {
      toast.error("Please login to join events");
      navigate('/login'); 
      return;
    }
    joinMutation.mutate(eventId);
  };

  const handleLeave = (e, eventId) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to give up your spot?")) return;
    leaveMutation.mutate(eventId);
  };

  const handleWaitlist = (e, eventId) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please login to join waitlist");
      navigate('/login'); 
      return;
    }
    waitlistMutation.mutate(eventId);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredEvents = events?.filter(event => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const eventDate = new Date(event.date);
    const today = startOfDay(new Date());
    const isUpcoming = eventDate >= today; 

    return matchesSearch && isUpcoming;
  }).sort((a, b) => new Date(a.date) - new Date(b.date)) || []; 

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEvents = filteredEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-12 h-12 animate-spin text-emerald-500" /></div>;
  if (isError) return <div className="mt-20 text-center text-red-400">Failed to load events.</div>;

  return (
    // --- UPDATED CONTAINER LOGIC ---
    <div className={`
      ${!isDashboard ? 'min-h-screen bg-[#0f172a] px-4 sm:px-6 lg:px-8 py-12' : 'w-full'}
    `}>
      <div className={`${!isDashboard ? 'max-w-7xl mx-auto' : ''} space-y-8`}>
      
        {/* Header & Search */}
        <div className="flex flex-col justify-between gap-6 pb-6 border-b md:flex-row md:items-end border-slate-800">
          <div className="space-y-2">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-emerald-400"
            >
              <Sparkles className="w-4 h-4" /> Discover
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-3xl font-extrabold tracking-tight text-white md:text-5xl"
            >
              Explore Opportunities
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="max-w-xl text-base text-slate-400 md:text-lg"
            >
              Find your next mission, connect with your community, and make a real difference today.
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="relative w-full md:w-80 lg:w-96"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg blur opacity-20 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                <Input 
                  placeholder="Search events..." 
                  className="h-12 pl-12 text-base text-white rounded-lg shadow-xl bg-slate-900 border-slate-800 focus:border-emerald-500/50 focus:ring-emerald-500/20"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Events Grid */}
        {currentEvents.length > 0 ? (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode='popLayout'>
              {currentEvents.map((event) => {
                const tags = event.tags || [];
                const registeredCount = event.registrationCount || 0;
                const remaining = Math.max(0, event.slotsAvailable - registeredCount);
                const isFull = remaining === 0;
                const dateStr = event.date ? format(new Date(event.date), 'MMM d, h:mm a') : 'TBD';
                const isJoined = joinedEventIds?.includes(event._id);
                const isOnWaitlist = waitlistedEventIds?.includes(event._id);

                return (
                  <motion.div key={event._id} variants={cardVariants} layout>
                    <Card 
                      className="flex flex-col h-full overflow-hidden transition-all duration-300 cursor-pointer border-slate-800 bg-slate-900/60 backdrop-blur-sm hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/10 group"
                      onClick={() => {
                        const path = isDashboard ? `/dashboard/events/${event._id}` : `/events/${event._id}`;
                        navigate(path);
                      }}
                    >
                      {/* Image Section */}
                      <div className="relative overflow-hidden h-44">
                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                        <img 
                          src={event.bannerImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80"} 
                          alt={event.title} 
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute z-20 flex gap-2 top-3 left-3">
                          <Badge className="text-white shadow-lg bg-slate-950/80 backdrop-blur-md border-slate-700">
                            {tags[0] || "General"}
                          </Badge>
                          {isJoined && <Badge className="text-white border-0 shadow-lg bg-emerald-500"><CheckCircle2 className="w-3 h-3 mr-1"/> Registered</Badge>}
                        </div>
                      </div>

                      {/* Content */}
                      <CardHeader className="p-5 pb-2">
                        <div className="flex items-start justify-between mb-2">
                          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-md">
                            <Calendar className="w-3 h-3" /> {dateStr}
                          </div>
                        </div>
                        <CardTitle className="text-lg font-bold leading-tight text-white transition-colors line-clamp-1 group-hover:text-emerald-400">
                          {event.title}
                        </CardTitle>
                        <div className="flex items-center mt-2 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {event.location}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="flex-1 p-5 pt-2">
                        <p className="mb-4 text-xs leading-relaxed text-slate-400 line-clamp-2">
                          {event.description}
                        </p>
                        
                        <div className="p-3 space-y-2 border rounded-lg bg-slate-950/50 border-slate-800">
                          <div className="flex justify-between text-[10px] font-medium">
                            <span className={isFull ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                              {isFull ? "Event Full" : `${remaining} Spots Left`}
                            </span>
                            <span className="text-slate-500">
                              {registeredCount} / {event.slotsAvailable}
                            </span>
                          </div>
                          <div className="w-full h-1.5 overflow-hidden rounded-full bg-slate-800">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min((registeredCount / event.slotsAvailable) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>

                      {/* Footer Buttons */}
                      <CardFooter className="grid grid-cols-2 gap-3 p-5 pt-0 mt-auto">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="w-full transition-colors bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5 mr-2" /> Details
                        </Button>

                        {isJoined ? (
                          <Button 
                            variant="destructive"
                            size="sm"
                            className="w-full text-red-500 border bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
                            onClick={(e) => handleLeave(e, event._id)}
                            disabled={leaveMutation.isPending}
                          >
                            {leaveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Unregister"}
                          </Button>
                        ) : isFull ? (
                          isOnWaitlist ? (
                            <Button size="sm" disabled className="w-full border cursor-not-allowed bg-amber-500/10 text-amber-500 border-amber-500/20">
                               Waitlisted
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              className="w-full text-white bg-amber-600 hover:bg-amber-700"
                              onClick={(e) => handleWaitlist(e, event._id)}
                              disabled={waitlistMutation.isPending}
                            >
                              {waitlistMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Waitlist"}
                            </Button>
                          )
                        ) : (
                          <Button 
                            size="sm"
                            className="w-full text-white shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20"
                            onClick={(e) => handleJoin(e, event._id)}
                            disabled={joinMutation.isPending}
                          >
                            {joinMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                              <>Register <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></>
                            )}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="py-24 text-center border-2 border-dashed bg-slate-900/30 rounded-2xl border-slate-800">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white">No events found</h3>
            <p className="mt-2 text-slate-400">Try adjusting your search terms or check back later.</p>
            <Button 
              variant="link" 
              onClick={() => setSearchTerm('')}
              className="mt-4 text-emerald-400 hover:text-emerald-300"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredEvents.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium text-white">{startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredEvents.length)}</span> of {filteredEvents.length} events
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center px-4 text-sm font-medium border rounded-md text-slate-300 bg-slate-900 border-slate-800">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEvents;