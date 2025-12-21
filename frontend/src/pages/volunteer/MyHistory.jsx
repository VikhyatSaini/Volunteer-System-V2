import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Clock, Calendar, CheckCircle2, XCircle, Hourglass, History, Loader2, 
  TrendingUp, Filter, Search, Download, Target, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Progress } from '../../components/ui/progress'; // Ensure you have this component

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

const MyHistory = () => {
  const queryClient = useQueryClient();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [hours, setHours] = useState('');
  const [dateWorked, setDateWorked] = useState('');
  
  // New: Search & Filter States
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'approved', 'pending'
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Data
  const { data: myEvents } = useQuery({
    queryKey: ['my-events'],
    queryFn: async () => (await api.get('/users/my-events')).data,
  });

  const { data: hourLogs, isLoading } = useQuery({
    queryKey: ['my-hours'],
    queryFn: async () => (await api.get('/users/my-hours')).data,
  });

  // 2. Submit Mutation
  const submitHoursMutation = useMutation({
    mutationFn: async (data) => {
      return await api.post(`/events/${data.eventId}/loghours`, {
        hours: data.hours,
        dateWorked: data.dateWorked
      });
    },
    onSuccess: () => {
      toast.success("Hours submitted successfully!");
      setHours('');
      setDateWorked('');
      setSelectedEventId('');
      queryClient.invalidateQueries(['my-hours']);
      queryClient.invalidateQueries(['volunteer-dashboard']);
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Failed to submit')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedEventId || !hours || !dateWorked) {
      toast.error("Please fill in all fields");
      return;
    }
    submitHoursMutation.mutate({ eventId: selectedEventId, hours, dateWorked });
  };

  const handleExport = () => {
    if (!hourLogs || hourLogs.length === 0) {
      toast.error("No history to export");
      return;
    }

    try {
      // 1. Define CSV Headers
      const headers = ["Event Title", "Date Worked", "Hours", "Status", "Location"];
      
      // 2. Convert Data to CSV Rows
      const rows = hourLogs.map(log => [
        `"${log.event?.title || 'Unknown Event'}"`, // Wrap in quotes to handle commas in titles
        format(new Date(log.dateWorked), 'yyyy-MM-dd'),
        log.hours,
        log.status,
        `"${log.event?.location || 'Remote'}"`
      ]);

      // 3. Combine Headers and Rows
      const csvContent = [
        headers.join(','), 
        ...rows.map(row => row.join(','))
      ].join('\n');

      // 4. Create a Blob (A file-like object of immutable raw data)
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // 5. Create a temporary download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `volunteer_history_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      // 6. Append to body, trigger click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export report");
    }
  };

  // --- CALCULATIONS ---
  const eligibleEvents = myEvents?.filter(event => new Date(event.date) < new Date()) || [];
  
  const stats = useMemo(() => {
    if (!hourLogs) return { total: 0, approved: 0, pending: 0, events: 0, rate: 0, impact: 0 };
    
    const total = hourLogs.reduce((acc, log) => acc + (log.hours || 0), 0);
    const approved = hourLogs.filter(l => l.status === 'approved').reduce((acc, log) => acc + (log.hours || 0), 0);
    const pending = hourLogs.filter(l => l.status === 'pending').reduce((acc, log) => acc + (log.hours || 0), 0);
    const uniqueEvents = new Set(hourLogs.map(l => l.event?._id)).size;
    const approvalRate = hourLogs.length > 0 
      ? Math.round((hourLogs.filter(l => l.status === 'approved').length / hourLogs.length) * 100) 
      : 0;

    // Gamification: 10 points per hour + 50 points per event
    const impactScore = (approved * 10) + (uniqueEvents * 50);

    return { total, approved, pending, events: uniqueEvents, rate: approvalRate, impact: impactScore };
  }, [hourLogs]);

  // --- FILTERING ---
  const filteredLogs = useMemo(() => {
    if (!hourLogs) return [];
    return hourLogs.filter(log => {
      const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
      const matchesSearch = log.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      return matchesStatus && matchesSearch;
    });
  }, [hourLogs, filterStatus, searchTerm]);

  // Goal Progress (Example: 20 hours/month goal)
  const monthlyGoal = 20;
  const progressPercent = Math.min((stats.approved / monthlyGoal) * 100, 100);

  return (
    <motion.div 
      className="space-y-8 pb-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Activity History</h1>
          <p className="text-slate-400 mt-1">Track your impact, analyze your growth, and log new hours.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all">
          <Download className="mr-2 h-4 w-4" /> Export Report
        </Button>
      </div>

      {/* 2. Informative Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Impact */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-lg">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Impact</span>
                <div className="p-1.5 bg-emerald-500/10 rounded-md"><Zap className="h-4 w-4 text-emerald-500" /></div>
              </div>
              <div>
                <span className="text-3xl font-bold text-white">{stats.total}</span> <span className="text-sm text-slate-500">hrs</span>
                <p className="text-xs text-emerald-400 mt-1 flex items-center">
                   <TrendingUp className="h-3 w-3 mr-1" /> Top 15% Volunteer
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Goal */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-lg">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Goal</span>
                <div className="p-1.5 bg-blue-500/10 rounded-md"><Target className="h-4 w-4 text-blue-500" /></div>
              </div>
              <div>
                 <div className="flex justify-between items-end mb-1">
                    <span className="text-2xl font-bold text-white">{stats.approved}</span>
                    <span className="text-xs text-slate-400">/ {monthlyGoal} hrs</span>
                 </div>
                 <Progress value={progressPercent} className="h-1.5 bg-slate-800" indicatorClassName="bg-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Approval Rate */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-lg">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approval Rate</span>
                <div className="p-1.5 bg-purple-500/10 rounded-md"><CheckCircle2 className="h-4 w-4 text-purple-500" /></div>
              </div>
              <div>
                <span className="text-3xl font-bold text-white">{stats.rate}%</span>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.pending} hrs pending review
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

         {/* Events Count */}
         <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 shadow-lg">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Missions Joined</span>
                <div className="p-1.5 bg-amber-500/10 rounded-md"><Calendar className="h-4 w-4 text-amber-500" /></div>
              </div>
              <div>
                <span className="text-3xl font-bold text-white">{stats.events}</span>
                <p className="text-xs text-slate-500 mt-1">
                   Unique events attended
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* LEFT COLUMN: Log Hours Form */}
        <motion.div className="lg:col-span-1" variants={itemVariants}>
          <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-md sticky top-8 shadow-2xl shadow-black/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-400">
                <Clock className="h-5 w-5" /> Log New Hours
              </CardTitle>
              <CardDescription>
                Record your contributions for verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="event" className="text-slate-300">Select Event</Label>
                  <div className="relative">
                    <select
                      id="event"
                      className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none transition-shadow"
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                    >
                      <option value="">-- Choose a past event --</option>
                      {eligibleEvents.map(event => (
                        <option key={event._id} value={event._id}>{event.title}</option>
                      ))}
                    </select>
                    <Filter className="absolute right-3 top-3 h-4 w-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-300">Date Worked</Label>
                  <Input 
                    id="date" type="date" 
                    className="bg-slate-950 border-slate-700 text-white [color-scheme:dark] focus:border-emerald-500/50" 
                    value={dateWorked} onChange={(e) => setDateWorked(e.target.value)} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-slate-300">Hours Contributed</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input 
                      id="hours" type="number" min="0.5" step="0.5" placeholder="e.g. 3.5" 
                      className="pl-9 bg-slate-950 border-slate-700 focus:border-emerald-500/50" 
                      value={hours} onChange={(e) => setHours(e.target.value)} 
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white mt-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
                  disabled={submitHoursMutation.isPending || eligibleEvents.length === 0}
                >
                  {submitHoursMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Submit Log"}
                </Button>
                
                {eligibleEvents.length === 0 && (
                   <div className="p-3 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-500 text-center">
                      No eligible past events found.
                   </div>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* RIGHT COLUMN: Advanced History Table */}
        <motion.div className="lg:col-span-2 space-y-4" variants={itemVariants}>
          
          {/* Controls Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-slate-900/40 p-1.5 rounded-lg border border-slate-800/50 backdrop-blur-sm">
            {/* Filter Tabs */}
            <div className="flex p-1 bg-slate-950/80 rounded-md border border-slate-800">
              {['all', 'approved', 'pending', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-sm capitalize transition-all ${
                    filterStatus === status 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search events..." 
                className="pl-9 h-9 bg-slate-950 border-slate-800 text-xs focus:ring-emerald-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm overflow-hidden min-h-[400px]">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 bg-slate-950/40 hover:bg-slate-950/40">
                    <TableHead className="text-slate-400 pl-6 h-10">Event Details</TableHead>
                    <TableHead className="text-slate-400 h-10">Date Logged</TableHead>
                    <TableHead className="text-slate-400 h-10">Duration</TableHead>
                    <TableHead className="text-right text-slate-400 pr-6 h-10">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-40 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-500" /></TableCell>
                      </TableRow>
                    ) : filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <motion.tr 
                          key={log._id}
                          layout
                          initial={{ opacity: 0, x: -10 }} 
                          animate={{ opacity: 1, x: 0 }} 
                          exit={{ opacity: 0, x: 10 }}
                          className="border-slate-800 group hover:bg-slate-800/40 transition-colors"
                        >
                          <TableCell className="font-medium text-slate-200 pl-6 py-3">
                             <div className="flex flex-col">
                                <span className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                   {log.event?.title || "External / Custom Event"}
                                </span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-wide">
                                   {log.event?.location || "Remote"}
                                </span>
                             </div>
                          </TableCell>
                          <TableCell className="text-slate-400 text-xs">
                             {format(new Date(log.dateWorked), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                             <div className="flex items-center gap-3">
                                <Badge variant="outline" className="bg-slate-950 border-slate-700 text-slate-300 font-mono text-xs">
                                  {log.hours}h
                                </Badge>
                                {/* Mini Visual Bar */}
                                <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                                  <div 
                                    className="h-full bg-emerald-500/70" 
                                    style={{ width: `${Math.min((log.hours / 8) * 100, 100)}%` }} 
                                  />
                                </div>
                             </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            {log.status === 'approved' && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 text-[10px]"><CheckCircle2 className="h-3 w-3 mr-1"/> Approved</Badge>}
                            {log.status === 'pending' && <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 text-[10px]"><Hourglass className="h-3 w-3 mr-1"/> Pending</Badge>}
                            {log.status === 'rejected' && <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20 text-[10px]"><XCircle className="h-3 w-3 mr-1"/> Rejected</Badge>}
                          </TableCell>
                        </motion.tr>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-40 text-center text-slate-500">
                           <div className="flex flex-col items-center justify-center">
                              <Search className="h-8 w-8 mb-2 opacity-20" />
                              <p>No records found.</p>
                           </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MyHistory;