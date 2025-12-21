import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Clock, Calendar, XCircle, Loader2, ClipboardList 
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../lib/axios';
import { Card, CardHeader, CardTitle, CardFooter } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const MyRegistrations = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetch Registered Events
  const { data: registeredEvents, isLoading: loadingRegs } = useQuery({
    queryKey: ['my-events-full'],
    queryFn: async () => {
      const res = await api.get('/users/my-events');
      return res.data;
    },
  });

  // 2. Fetch Waitlisted Events
  const { data: waitlistedEvents, isLoading: loadingWait } = useQuery({
    queryKey: ['my-waitlist-full'],
    queryFn: async () => {
      const res = await api.get('/events/my-waitlist');
      return res.data;
    },
  });

  // 3. Unregister Mutation
  const leaveMutation = useMutation({
    mutationFn: async (eventId) => {
      return await api.delete(`/events/${eventId}/unregister`);
    },
    onSuccess: () => {
      toast.success("Unregistered successfully.");
      queryClient.invalidateQueries(['my-events-full']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unregister');
    }
  });

  // 4. Leave Waitlist Mutation
  const leaveWaitlistMutation = useMutation({
    mutationFn: async (eventId) => {
      return await api.delete(`/events/${eventId}/waitlist`);
    },
    onSuccess: () => {
      toast.success("Removed from waitlist.");
      queryClient.invalidateQueries(['my-waitlist-full']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove from waitlist');
    }
  });

  const handleLeave = (e, eventId) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to cancel your registration?")) return;
    leaveMutation.mutate(eventId);
  };

  const handleLeaveWaitlist = (e, eventId) => {
    e.stopPropagation();
    if (!confirm("Remove yourself from the waitlist?")) return;
    leaveWaitlistMutation.mutate(eventId);
  };

  if (loadingRegs || loadingWait) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-emerald-500" /></div>;

  const now = new Date();
  const upcoming = registeredEvents?.filter(e => new Date(e.date) >= now) || [];
  const past = registeredEvents?.filter(e => new Date(e.date) < now) || [];
  const waitlist = waitlistedEvents || [];

  const EventList = ({ list, type }) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {list.length > 0 ? (
        list.map((event) => (
          <Card key={event._id} className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all group overflow-hidden">
            <div className="relative h-32 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
               <img 
                 src={event.bannerImage || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80"} 
                 alt={event.title} 
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
               />
               <Badge className="absolute top-2 left-2 z-20 bg-slate-950/70 backdrop-blur-md border-slate-700">
                  {format(new Date(event.date), 'MMM dd, yyyy')}
               </Badge>
               {type === 'waitlist' && (
                 <Badge className="absolute top-2 right-2 z-20 bg-amber-500/80 text-white border-0">
                    Waitlist
                 </Badge>
               )}
            </div>
            
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg text-white line-clamp-1">{event.title}</CardTitle>
              <div className="flex items-center text-xs text-slate-400 mt-1">
                <Clock className="h-3 w-3 mr-1" /> {format(new Date(event.date), 'h:mm a')}
              </div>
              <div className="flex items-center text-xs text-slate-400 mt-1">
                <MapPin className="h-3 w-3 mr-1" /> {event.location}
              </div>
            </CardHeader>
            
            <CardFooter className="p-4 pt-2 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => navigate(`/events/${event._id}`)}
              >
                Details
              </Button>
              
              {type === 'upcoming' && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                  onClick={(e) => handleLeave(e, event._id)}
                  disabled={leaveMutation.isPending}
                >
                  {leaveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                </Button>
              )}

              {type === 'waitlist' && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20"
                  onClick={(e) => handleLeaveWaitlist(e, event._id)}
                  disabled={leaveWaitlistMutation.isPending}
                >
                  {leaveWaitlistMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                </Button>
              )}

            </CardFooter>
          </Card>
        ))
      ) : (
        <div className="col-span-full py-10 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
          <p>No events found.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">My Registrations</h1>
        <p className="text-slate-400">Manage your upcoming schedule, waitlists, and past history.</p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist ({waitlist.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="upcoming" className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-500" /> Confirmed Events
            </h2>
            <EventList list={upcoming} type="upcoming" />
          </TabsContent>

          <TabsContent value="waitlist" className="space-y-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-amber-500" /> Waitlisted Events
            </h2>
            <p className="text-sm text-slate-400 mb-4">You will be automatically registered if a spot opens up.</p>
            <EventList list={waitlist} type="waitlist" />
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <h2 className="text-xl font-semibold text-white opacity-70">Past Events</h2>
            <div className="opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
               <EventList list={past} type="past" />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default MyRegistrations;