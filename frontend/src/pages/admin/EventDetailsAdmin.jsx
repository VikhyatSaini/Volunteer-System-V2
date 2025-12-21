import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Calendar, MapPin, Users, Mail, UserX, Loader2, 
  Clock, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';

const EventDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Fetch Event Details
  const { data: event, isLoading: isEventLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}`);
      return res.data;
    }
  });

  // 2. Fetch Volunteers List
  const { data: volunteers, isLoading: isVolunteersLoading } = useQuery({
    queryKey: ['event-volunteers', id],
    queryFn: async () => {
      const res = await api.get(`/events/${id}/volunteers`);
      return res.data;
    }
  });

  // 3. Remove Volunteer Mutation
  const removeMutation = useMutation({
    mutationFn: async (volunteerId) => {
      return await api.delete(`/events/${id}/volunteers/${volunteerId}`);
    },
    onSuccess: () => {
      toast.success("Volunteer removed successfully");
      queryClient.invalidateQueries(['event-volunteers', id]); // Refresh list
      queryClient.invalidateQueries(['event', id]); // Refresh counts
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to remove volunteer");
    }
  });

  const handleRemove = (volunteerId) => {
    if (confirm("Are you sure you want to remove this volunteer?")) {
      removeMutation.mutate(volunteerId);
    }
  };

  if (isEventLoading || isVolunteersLoading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;
  }

  if (!event) return <div className="p-10 text-center text-red-400">Event not found</div>;

  return (
    <div className="pb-10 space-y-8">
      
      {/* HEADER */}
      <div>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/events/manage')}
          className="pl-0 mb-4 text-slate-400 hover:text-white hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Events
        </Button>
        
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white">{event.title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(event.date), 'MMMM do, yyyy - h:mm a')}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center min-w-[100px]">
                <div className="text-xs font-bold uppercase text-slate-500">Registered</div>
                <div className="text-2xl font-bold text-emerald-400">{event.registrationCount || 0}</div>
             </div>
             <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-center min-w-[100px]">
                <div className="text-xs font-bold uppercase text-slate-500">Capacity</div>
                <div className="text-2xl font-bold text-white">{event.slotsAvailable}</div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Details */}
        <div className="space-y-8 lg:col-span-2">
           
           {/* Description Card */}
           <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader><CardTitle className="text-lg text-white">About Event</CardTitle></CardHeader>
              <CardContent className="leading-relaxed whitespace-pre-wrap text-slate-300">
                 {event.description}
              </CardContent>
           </Card>

           {/* Volunteer Management Table */}
           <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Users className="text-indigo-400" size={20} /> Registered Volunteers
                 </CardTitle>
                 <Badge variant="outline" className="text-slate-400 border-slate-700">
                    {volunteers?.length || 0} / {event.slotsAvailable}
                 </Badge>
              </CardHeader>
              <CardContent className="p-0">
                 <Table>
                    <TableHeader className="bg-slate-950/50">
                       <TableRow className="border-slate-800 hover:bg-transparent">
                          <TableHead className="pl-6 text-slate-400">Volunteer</TableHead>
                          <TableHead className="text-slate-400">Contact</TableHead>
                          <TableHead className="text-slate-400">Skills</TableHead>
                          <TableHead className="pr-6 text-right text-slate-400">Action</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {volunteers && volunteers.length > 0 ? (
                          volunteers.map((vol) => (
                             <TableRow key={vol._id} className="border-slate-800/50 hover:bg-slate-800/20">
                                <TableCell className="pl-6 font-medium text-white">
                                   <div className="flex items-center gap-3">
                                      <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-indigo-400 border rounded-full bg-indigo-500/20 border-indigo-500/30">
                                         {vol.name?.charAt(0) || 'U'}
                                      </div>
                                      {vol.name}
                                   </div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-400">
                                   <div className="flex items-center gap-2"><Mail size={12}/> {vol.email}</div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-400">
                                   {vol.skills && vol.skills.length > 0 
                                      ? vol.skills.slice(0, 2).join(', ') + (vol.skills.length > 2 ? '...' : '') 
                                      : '-'}
                                </TableCell>
                                <TableCell className="pr-6 text-right">
                                   <Button 
                                      size="sm" 
                                      variant="destructive" 
                                      className="h-8 text-red-400 border bg-red-500/10 hover:bg-red-500/20 border-red-500/20"
                                      onClick={() => handleRemove(vol._id)}
                                      disabled={removeMutation.isPending}
                                   >
                                      {removeMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin"/> : <UserX size={14} className="mr-1"/>}
                                      Remove
                                   </Button>
                                </TableCell>
                             </TableRow>
                          ))
                       ) : (
                          <TableRow>
                             <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                No volunteers registered yet.
                             </TableCell>
                          </TableRow>
                       )}
                    </TableBody>
                 </Table>
              </CardContent>
           </Card>
        </div>

        {/* RIGHT COLUMN: Quick Stats or Image */}
        <div className="space-y-6">
           {event.bannerImage && (
              <div className="overflow-hidden border shadow-lg rounded-xl border-slate-800">
                 <img src={event.bannerImage} alt="Banner" className="object-cover w-full h-auto" />
              </div>
           )}
           
           <Card className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border-indigo-500/20">
              <CardHeader><CardTitle className="text-base text-white">Status</CardTitle></CardHeader>
              <CardContent>
                 <div className="flex items-center gap-2 mb-2 font-medium text-emerald-400">
                    <CheckCircle2 size={18} /> Active Event
                 </div>
                 <p className="text-sm text-slate-400">
                    This event is currently visible to volunteers. {event.slotsAvailable - (event.registrationCount || 0)} spots remaining.
                 </p>
              </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
};

export default EventDetailsAdmin;