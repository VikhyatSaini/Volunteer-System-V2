import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Calendar, MapPin, Edit2, Trash2, X, Save, 
  Loader2, ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay, isPast, isFuture } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../lib/axios';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';

const ManageEvents = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming'); 
  
  // --- MODAL STATES ---
  const [editingEvent, setEditingEvent] = useState(null);

  // --- 1. FETCH EVENTS ---
  const { data: events, isLoading, isError } = useQuery({
    queryKey: ['admin-events'],
    queryFn: async () => {
      const response = await api.get('/events?limit=1000');
      return response.data;
    },
  });

  // --- 2. DELETE MUTATION ---
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/events/${id}`),
    onSuccess: () => {
      toast.success("Event deleted successfully");
      queryClient.invalidateQueries(['admin-events']);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  // --- 3. FILTER LOGIC ---
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    const today = new Date();
    
    let categoryEvents = events;
    if (activeTab === 'upcoming') {
      categoryEvents = events.filter(e => isFuture(new Date(e.date)) && !isSameDay(new Date(e.date), today));
    } else if (activeTab === 'ongoing') {
      categoryEvents = events.filter(e => isSameDay(new Date(e.date), today));
    } else if (activeTab === 'expired') {
      categoryEvents = events.filter(e => isPast(new Date(e.date)) && !isSameDay(new Date(e.date), today));
    }

    return categoryEvents.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, activeTab, searchTerm]);

  const handleDelete = (id) => {
    if (confirm("Are you sure? This will delete the event and all registrations.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;
  if (isError) return <div className="p-10 text-center text-red-400">Failed to load events.</div>;

  return (
    <div className="relative w-full min-h-screen pb-20 space-y-8">
      <div className="fixed top-20 right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* HEADER */}
      <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-white">
            Event Management <ListFilter className="text-indigo-500" size={28} />
          </h1>
          <p className="mt-2 text-slate-400">View, edit, and manage your organization's timeline.</p>
        </div>
        
        <div className="flex gap-2 p-1 border rounded-lg bg-slate-900/50 border-slate-800">
          {['upcoming', 'ongoing', 'expired', 'all'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <Card className="overflow-hidden shadow-xl bg-slate-900/60 border-slate-800 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-between gap-4 p-4 border-b border-slate-800/50 md:flex-row">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search events..." 
                className="pl-10 text-white bg-slate-950/50 border-slate-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500">
              Showing <span className="font-bold text-white">{filteredEvents.length}</span> {activeTab} events
            </div>
          </div>

          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-6 text-slate-400">Event Details</TableHead>
                  <TableHead className="text-slate-400">Date & Status</TableHead>
                  <TableHead className="text-slate-400">Capacity</TableHead>
                  <TableHead className="pr-6 text-right text-slate-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => {
                    const isToday = isSameDay(new Date(event.date), new Date());
                    const isPastEvent = isPast(new Date(event.date)) && !isToday;

                    return (
                      <TableRow key={event._id} className="border-slate-800/50 hover:bg-slate-800/30">
                        <TableCell className="py-4 pl-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 overflow-hidden border rounded-lg bg-slate-800 border-slate-700 shrink-0">
                               {event.bannerImage ? (
                                 <img src={event.bannerImage} alt="" className="object-cover w-full h-full" />
                               ) : (
                                 <div className="flex items-center justify-center w-full h-full text-slate-500"><Calendar size={20}/></div>
                               )}
                            </div>
                            <div>
                              {/* CLICKABLE TITLE -> NAVIGATES TO DETAILS PAGE */}
                              <button 
                                onClick={() => navigate(`/admin/events/${event._id}/manage`)}
                                className="font-semibold text-white truncate max-w-[200px] hover:text-indigo-400 transition-colors text-left hover:underline"
                              >
                                {event.title}
                              </button>
                              <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                <MapPin size={10} /> {event.location}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                             <span className="text-sm text-slate-300">{format(new Date(event.date), 'MMM d, yyyy')}</span>
                             <span className="text-xs text-slate-500">{format(new Date(event.date), 'h:mm a')}</span>
                           </div>
                           <div className="mt-1">
                             {isToday ? <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">Ongoing</Badge>
                             : isPastEvent ? <Badge variant="outline" className="text-slate-500 border-slate-700 text-[10px] px-1.5 py-0">Expired</Badge>
                             : <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] px-1.5 py-0">Upcoming</Badge>}
                           </div>
                        </TableCell>
                        <TableCell>
                           <div className="text-sm text-slate-300">{event.registrationCount || 0} / {event.slotsAvailable}</div>
                           <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(((event.registrationCount || 0) / event.slotsAvailable) * 100, 100)}%` }} />
                           </div>
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                           <div className="flex justify-end gap-2">
                             <Button size="sm" variant="ghost" onClick={() => setEditingEvent(event)} className="w-8 h-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"><Edit2 size={16} /></Button>
                             <Button size="sm" variant="ghost" onClick={() => handleDelete(event._id)} disabled={deleteMutation.isPending} className="w-8 h-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 size={16} /></Button>
                           </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-500">No {activeTab} events found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingEvent && (
          <EditEventModal 
            event={editingEvent} 
            onClose={() => setEditingEvent(null)} 
            onSuccess={() => {
              setEditingEvent(null);
              queryClient.invalidateQueries(['admin-events']);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENT: EDIT MODAL ---
const EditEventModal = ({ event, onClose, onSuccess }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title: event.title,
      description: event.description,
      location: event.location,
      date: new Date(event.date).toISOString().slice(0, 16),
      slotsAvailable: event.slotsAvailable,
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => await api.put(`/events/${event._id}`, data),
    onSuccess: () => {
      toast.success("Event updated successfully!");
      onSuccess();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Update failed"),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white"><Edit2 size={20} className="text-indigo-400" /> Edit Event</h2>
          <button onClick={onClose} className="p-1 transition rounded-full text-slate-400 hover:text-white hover:bg-slate-800"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="edit-form" onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-5">
            <div className="space-y-2"><Label className="text-slate-300">Event Title</Label><Input className="text-white bg-slate-950 border-slate-700" {...register("title", { required: "Title is required" })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-slate-300">Location</Label><Input className="text-white bg-slate-950 border-slate-700" {...register("location", { required: "Required" })} /></div>
              <div className="space-y-2"><Label className="text-slate-300">Capacity</Label><Input type="number" className="text-white bg-slate-950 border-slate-700" {...register("slotsAvailable", { required: "Required", min: 1 })} /></div>
            </div>
            <div className="space-y-2"><Label className="text-slate-300">Date & Time</Label><Input type="datetime-local" className="bg-slate-950 border-slate-700 text-white [color-scheme:dark]" {...register("date", { required: "Required" })} /></div>
            <div className="space-y-2"><Label className="text-slate-300">Description</Label><Textarea className="bg-slate-950 border-slate-700 text-white min-h-[120px]" {...register("description", { required: "Required" })} /></div>
          </form>
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-slate-800 bg-slate-900/50">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">Cancel</Button>
          <Button type="submit" form="edit-form" className="text-white bg-indigo-600 hover:bg-indigo-500" disabled={updateMutation.isPending}>{updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageEvents;