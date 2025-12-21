import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Loader2, CheckCircle2, XCircle, Clock, Calendar, MapPin, User, 
  Hourglass, AlertCircle, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const ApproveHours = () => {
  const queryClient = useQueryClient();

  // --- 1. FETCH PENDING LOGS ---
  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['pending-hours'],
    queryFn: async () => {
      const response = await api.get('/admin/pending-hours');
      // Handle both array response or object wrapper
      return Array.isArray(response.data) ? response.data : response.data.logs || [];
    },
  });

  // --- 2. CALCULATE QUICK STATS ---
  const stats = useMemo(() => {
    if (!logs) return { count: 0, totalHours: 0 };
    return {
      count: logs.length,
      totalHours: logs.reduce((acc, log) => acc + (Number(log.hours) || 0), 0)
    };
  }, [logs]);

  // --- 3. ✅ FIXED: UPDATE STATUS MUTATION ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ logId, status }) => {
      // 🎯 THE FIX: Matching your admin.route.js exactly
      // router.put('/hours/:logId/status', ...)
      const response = await api.put(`/admin/hours/${logId}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      const action = variables.status === 'approved' ? 'Approved' : 'Rejected';
      toast.success(`Request ${action} Successfully`);
      
      // Refresh all relevant data
      queryClient.invalidateQueries(['pending-hours']);
      queryClient.invalidateQueries(['adminStats']); 
      queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
      console.error("API Error:", error.response?.data);
      const msg = error.response?.data?.message || "Failed to update status.";
      toast.error(msg);
    }
  });

  const handleAction = (logId, status) => {
    updateStatusMutation.mutate({ logId, status });
  };

  if (isLoading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
        <p className="text-slate-400 animate-pulse font-medium">Loading Requests...</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="flex h-[50vh] flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Unable to load requests</h3>
      <p className="text-slate-400 max-w-md mb-6">There was a problem fetching the pending logs.</p>
      <Button onClick={() => window.location.reload()} variant="outline" className="border-slate-700 text-white">
        Retry Connection
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen relative w-full pb-20 space-y-8">
      
      {/* Background Glow */}
      <div className="fixed top-20 left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-10 right-[-10%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Approvals Queue <CheckCircle2 className="text-emerald-500" size={28} />
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Review time logs submitted by volunteers.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <StatCard label="Pending Requests" value={stats.count} icon={<FileText size={20} />} color="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" />
        <StatCard label="Total Hours Pending" value={`${stats.totalHours}h`} icon={<Clock size={20} />} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard label="Queue Status" value={stats.count > 0 ? "Action Required" : "All Clear"} icon={<Hourglass size={20} />} color={stats.count > 0 ? "text-pink-400" : "text-emerald-400"} bg={stats.count > 0 ? "bg-pink-500/10" : "bg-emerald-500/10"} border={stats.count > 0 ? "border-pink-500/20" : "border-emerald-500/20"} />
      </div>

      {/* Main Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="relative z-10">
        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-xl shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-800/50 pb-4">
            <CardTitle className="text-white text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              Pending Submissions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="hover:bg-transparent border-slate-800">
                  <TableHead className="text-slate-400 pl-6">Volunteer</TableHead>
                  <TableHead className="text-slate-400">Event Details</TableHead>
                  <TableHead className="text-slate-400">Date Logged</TableHead>
                  <TableHead className="text-slate-400">Duration</TableHead>
                  <TableHead className="text-right text-slate-400 pr-6">Decision</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs?.length > 0 ? (
                  logs.map((log) => (
                    <TableRow key={log._id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      
                      {/* Volunteer Info */}
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-indigo-400 font-bold text-sm">
                            {log.volunteer?.name ? log.volunteer.name.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-medium text-white">{log.volunteer?.name || 'Unknown User'}</div>
                            <div className="text-xs text-slate-500">{log.volunteer?.email || 'No email'}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Event Info */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-slate-200">{log.event?.title || "Custom Log Entry"}</div>
                          <div className="flex items-center text-xs text-slate-500 gap-1.5">
                            <MapPin className="h-3 w-3" /> {log.event?.location || "Remote"}
                          </div>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Calendar className="h-4 w-4 text-slate-600" />
                          {log.date ? format(new Date(log.date), 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </TableCell>

                      {/* Hours */}
                      <TableCell>
                        <Badge variant="outline" className="text-base px-3 py-1 border-slate-700 bg-slate-800/50 text-white font-bold tracking-wide">
                          {log.hours} <span className="text-xs font-normal text-slate-500 ml-1">hrs</span>
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" variant="ghost" 
                            onClick={() => handleAction(log._id, 'rejected')} 
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            disabled={updateStatusMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1.5" /> Reject
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleAction(log._id, 'approved')} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 border border-emerald-500/50"
                            disabled={updateStatusMutation.isPending}
                          >
                            {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve</>}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-80 text-center">
                       <div className="flex flex-col items-center justify-center text-slate-500">
                          <div className="h-20 w-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700/50 animate-pulse">
                             <CheckCircle2 className="h-10 w-10 text-emerald-500/50" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">All Caught Up!</h3>
                          <p className="text-sm text-slate-400">No pending requests found.</p>
                       </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, bg, border }) => (
  <Card className={`bg-slate-900/50 backdrop-blur-sm ${border}`}>
    <CardContent className="p-6 flex items-center justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`h-12 w-12 rounded-xl ${bg} ${color} flex items-center justify-center border ${border}`}>{icon}</div>
    </CardContent>
  </Card>
);

export default ApproveHours;