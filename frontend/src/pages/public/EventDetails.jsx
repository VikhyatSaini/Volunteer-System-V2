import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { 
  Calendar, MapPin, Clock, Users, ArrowLeft, Loader2, 
  CheckCircle2, XCircle, Share2, ClipboardList 
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../lib/axios';
import useAuth from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Helper to check if we are currently inside the dashboard
  const isDashboard = location.pathname.includes('/dashboard');

  // Local state for immediate UI feedback
  const [localWaitlist, setLocalWaitlist] = useState(false);

  // 1. Fetch Single Event Data
  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await api.get(`/events/${id}`);
      return response.data;
    },
  });

  // 2. Fetch My Registrations
  const { data: joinedEventIds } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: async () => {
      if (!user) return [];
      const response = await api.get('/events/my-registrations');
      return response.data;
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
        return response.data;
      } catch (error) {
        return [];
      }
    },
    enabled: !!user,
  });

  // 4. Register Mutation
  const joinMutation = useMutation({
    mutationFn: async () => {
      return await api.post(`/events/${id}/register`);
    },
    onSuccess: () => {
      toast.success("Successfully registered! 🎉");
      queryClient.invalidateQueries(['event', id]); 
      queryClient.invalidateQueries(['my-registrations']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to register');
    }
  });

  // 5. Unregister Mutation
  const leaveMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`/events/${id}/unregister`);
    },
    onSuccess: () => {
      toast.success("Unregistered successfully.");
      queryClient.invalidateQueries(['event', id]);
      queryClient.invalidateQueries(['my-registrations']);
      setLocalWaitlist(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unregister');
    }
  });

  // 6. Join Waitlist Mutation
  const waitlistMutation = useMutation({
    mutationFn: async () => {
      return await api.post(`/events/${id}/waitlist`);
    },
    onSuccess: (data) => {
      toast.success(data.data.message || "Added to waitlist!");
      setLocalWaitlist(true); 
      queryClient.invalidateQueries(['my-waitlist']);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to join waitlist';
      if (msg.toLowerCase().includes("already")) {
        setLocalWaitlist(true);
        toast.error("You are already on the waitlist.");
      } else {
        toast.error(msg);
      }
    }
  });

  // --- NEW: SHARE FUNCTION ---
  const handleShare = async () => {
    const shareData = {
      title: event.title,
      text: `Check out this volunteer opportunity: ${event.title}`,
      url: window.location.href,
    };

    try {
      // 1. Try Native Share (Mobile)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // 2. Fallback to Clipboard (Desktop)
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard! 📋");
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>;
  if (isError || !event) return <div className="mt-20 text-center text-red-400">Event not found.</div>;

  // Derived State
  const isJoined = joinedEventIds?.includes(id);
  const isOnWaitlist = waitlistedEventIds?.includes(id) || localWaitlist;
  
  const registeredCount = event.registrationCount || 0;
  const remaining = Math.max(0, event.slotsAvailable - registeredCount);
  const isFull = remaining === 0;

  return (
    <div className="max-w-5xl pb-20 mx-auto">
      
      {/* Back Button (Smart Navigation) */}
      <Button 
        variant="ghost" 
        className="pl-0 mb-6 text-slate-400 hover:text-white hover:bg-transparent"
        onClick={() => navigate(isDashboard ? '/dashboard/events' : '/events')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
      </Button>

      {/* Hero Image Section */}
      <div className="relative w-full h-64 mb-8 overflow-hidden shadow-2xl md:h-96 rounded-2xl shadow-emerald-900/10 group">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent" />
        <img 
          src={event.bannerImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80"} 
          alt={event.title} 
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-0 left-0 z-20 w-full p-6 md:p-10">
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags?.map((tag, i) => (
              <Badge key={i} className="border-0 bg-emerald-500/20 text-emerald-300 backdrop-blur-md">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white md:text-5xl drop-shadow-lg">{event.title}</h1>
          <div className="flex items-center text-lg text-slate-300">
            <MapPin className="w-5 h-5 mr-2 text-emerald-400" /> {event.location}
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* Left Column: Description */}
        <div className="space-y-8 lg:col-span-2">
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">About this Event</h2>
            <div className="prose prose-invert prose-slate max-w-none">
              <p className="text-lg leading-relaxed whitespace-pre-wrap text-slate-300">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Action Card */}
        <div className="lg:col-span-1">
          <Card className="sticky bg-slate-900/60 border-slate-800 backdrop-blur-xl top-8">
            <CardContent className="p-6 space-y-6">
              
              {/* Date & Time */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-slate-800 text-emerald-400">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium tracking-wide uppercase text-slate-400">Date</p>
                  <p className="text-lg font-semibold text-white">{format(new Date(event.date), 'MMMM d, yyyy')}</p>
                  <p className="text-sm text-slate-400">{format(new Date(event.date), 'EEEE')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-slate-800 text-emerald-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium tracking-wide uppercase text-slate-400">Time</p>
                  <p className="text-lg font-semibold text-white">{format(new Date(event.date), 'h:mm a')}</p>
                </div>
              </div>

              {/* Slots */}
              <div className="p-4 space-y-3 border rounded-xl bg-slate-950/50 border-slate-800">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Users className="w-4 h-4" /> Capacity
                  </span>
                  <span className="font-bold text-white">{registeredCount} / {event.slotsAvailable} Filled</span>
                </div>
                <div className="w-full h-2 overflow-hidden rounded-full bg-slate-800">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${Math.min((registeredCount / event.slotsAvailable) * 100, 100)}%` }}
                  />
                </div>
                <p className={`text-xs text-center font-medium ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>
                  {isFull ? "No spots remaining" : `${remaining} spots left!`}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-3">
                
                {/* 1. If Joined -> Show Unregister */}
                {isJoined ? (
                  <Button 
                    variant="destructive" 
                    className="w-full h-12 text-base text-red-500 border bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
                    onClick={() => {
                        if(confirm('Are you sure you want to unregister?')) leaveMutation.mutate();
                    }}
                    disabled={leaveMutation.isPending}
                  >
                    {leaveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>Unregister <XCircle className="w-5 h-5 ml-2" /></>
                    )}
                  </Button>
                
                ) : isFull ? (
                  /* 2. If Full -> Show Waitlist or "On Waitlist" */
                  isOnWaitlist ? (
                     <Button disabled className="w-full h-12 text-base border cursor-not-allowed bg-amber-500/10 text-amber-500 border-amber-500/20">
                        <ClipboardList className="w-5 h-5 mr-2" /> On Waitlist
                     </Button>
                  ) : (
                    <Button 
                      className="w-full h-12 text-base text-white shadow-lg bg-amber-600 hover:bg-amber-700 shadow-amber-900/20"
                      onClick={() => {
                          if(!user) {
                              toast.error("Please login to join waitlist");
                              navigate('/login');
                          }
                          else waitlistMutation.mutate();
                      }}
                      disabled={waitlistMutation.isPending}
                    >
                      {waitlistMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>Join Waitlist <ClipboardList className="w-5 h-5 ml-2" /></>
                      )}
                    </Button>
                  )

                ) : (
                  /* 3. Normal State -> Show Register */
                  <Button 
                    className="w-full h-12 text-base text-white shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20"
                    onClick={() => {
                        if(!user) {
                            toast.error("Please login to join");
                            navigate('/login');
                        } 
                        else joinMutation.mutate();
                    }}
                    disabled={joinMutation.isPending}
                  >
                    {joinMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>Register Now <CheckCircle2 className="w-5 h-5 ml-2" /></>
                    )}
                  </Button>
                )}

                {/* --- SHARE BUTTON (FIXED) --- */}
                <Button 
                  variant="outline" 
                  className="w-full border-slate-700 hover:bg-slate-800 text-slate-400"
                  onClick={handleShare} // Added the handler here
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share Event
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;