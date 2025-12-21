import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Loader2, Search, User, MoreVertical, Shield, ShieldAlert, 
  Users, UserCheck, Clock, X, Mail, CalendarDays, Award, 
  Edit2, Save, Trash2, Ban, Unlock, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import api from '../../lib/axios';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../components/ui/table';
import { Card, CardContent } from '../../components/ui/card';

const ManageVolunteers = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- MODAL STATES ---
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', role: '', status: '' });

  // --- 1. FETCH DATA ---
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      if (Array.isArray(response.data)) return response.data;
      if (response.data && Array.isArray(response.data.users)) return response.data.users;
      return [];
    },
    staleTime: 1000 * 60 * 5, 
  });

  // --- 2. UPDATE USER MUTATION ---
  const updateUserMutation = useMutation({
    mutationFn: async (data) => {
      return await api.put(`/users/${selectedUser._id}`, data);
    },
    onSuccess: (response) => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries(['users']);
      
      const updatedData = response.data || {};
      setSelectedUser(prev => ({ ...prev, ...editFormData, ...updatedData })); 
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  });

  // --- 3. DELETE USER MUTATION ---
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      return await api.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      toast.success("User deleted permanently");
      queryClient.invalidateQueries(['users']);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  });

  // --- 4. ACTION HANDLERS ---

  const startEdit = () => {
    setEditFormData({
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
      status: selectedUser.status
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateUserMutation.mutate(editFormData);
  };

  // Handle Ban / Activate (Mapped to 'rejected' / 'approved')
  const handleToggleStatus = () => {
    // If currently rejected (banned), make approved. Otherwise make rejected.
    const newStatus = selectedUser.status === 'rejected' ? 'approved' : 'rejected';
    const action = newStatus === 'rejected' ? 'Ban' : 'Activate';
    
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      updateUserMutation.mutate({ status: newStatus });
      setSelectedUser(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure? This action CANNOT be undone.")) {
      deleteUserMutation.mutate(selectedUser._id);
    }
  };

  // --- 5. FILTER LOGIC ---
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => 
      (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // --- 6. STATS ---
  const stats = useMemo(() => {
    if (!users) return { total: 0, admins: 0, volunteers: 0, totalHours: 0 };
    return {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      volunteers: users.filter(u => u.role !== 'admin').length,
      totalHours: users.reduce((acc, curr) => acc + (curr.volunteerHours || 0), 0)
    };
  }, [users]);

  useEffect(() => {
    if (!selectedUser) setIsEditing(false);
  }, [selectedUser]);

  if (isLoading) return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="w-12 h-12 text-indigo-500 animate-spin" /></div>;
  if (isError) return <div className="p-10 text-center text-red-400">Failed to load users.</div>;

  return (
    <div className="relative w-full min-h-screen pb-20 space-y-8">
      
      {/* Background */}
      <div className="fixed top-20 right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-white">
            User Directory <Users className="text-indigo-500" size={28} />
          </h1>
          <p className="mt-2 text-slate-400">Manage <span className="font-bold text-white">{stats.total}</span> registered accounts.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatBadge label="Total Users" value={stats.total} icon={<Users size={18} />} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
        <StatBadge label="Volunteers" value={stats.volunteers} icon={<UserCheck size={18} />} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <StatBadge label="Admins" value={stats.admins} icon={<ShieldAlert size={18} />} color="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
        <StatBadge label="Total Impact" value={`${stats.totalHours}h`} icon={<Clock size={18} />} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
      </div>

      {/* Main Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <Card className="overflow-hidden shadow-xl bg-slate-900/60 border-slate-800 backdrop-blur-xl">
          <div className="flex gap-4 p-4 border-b border-slate-800/50">
             <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
               <Input 
                 placeholder="Search users..." 
                 className="pl-10 text-white bg-slate-950/50 border-slate-700"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
          </div>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-950/50">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="pl-6 text-slate-400">User Profile</TableHead>
                  <TableHead className="text-slate-400">Role</TableHead>
                  <TableHead className="text-slate-400">Joined</TableHead>
                  <TableHead className="text-slate-400">Hours</TableHead>
                  <TableHead className="pr-6 text-right text-slate-400">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id} className="border-slate-800/50 hover:bg-slate-800/30">
                    <TableCell className="py-4 pl-6">
                      <div 
                        className="flex items-center gap-4 cursor-pointer group"
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center border text-xs font-bold transition-colors ${
                          user.status === 'rejected' 
                            ? 'bg-red-900/20 border-red-500/50 text-red-500' 
                            : 'bg-slate-800 border-slate-700 text-indigo-400 group-hover:border-indigo-500'
                        }`}>
                          {user.profilePicture ? (
                             <img src={user.profilePicture} alt={user.name} className="object-cover w-full h-full rounded-full" />
                          ) : (
                             (user.name || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className={`font-semibold transition-colors ${user.status === 'rejected' ? 'text-red-400 line-through' : 'text-white group-hover:text-indigo-400'}`}>
                            {user.name}
                          </div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className={user.role === 'admin' ? "text-purple-400 border-purple-500/30" : "text-blue-400 border-blue-500/30"}>
                          {user.role}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-400">
                       {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                       <span className="font-bold text-white">{user.volunteerHours || 0}</span> <span className="text-xs text-slate-500">hrs</span>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                       {user.status === 'rejected' ? (
                         <Badge variant="destructive" className="text-red-400 bg-red-500/10 border-red-500/20">Banned</Badge>
                       ) : user.status === 'pending' ? (
                         <Badge variant="outline" className="text-yellow-400 border-yellow-500/30 bg-yellow-500/5">Pending</Badge>
                       ) : (
                         <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/5">Active</Badge>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* --- EDIT USER MODAL --- */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg overflow-hidden border shadow-2xl bg-slate-900 border-slate-800 rounded-2xl"
            >
              {/* Header */}
              <div className={`h-32 relative transition-colors duration-500 ${
                selectedUser.status === 'rejected' ? 'bg-red-900/40' :
                isEditing ? 'bg-indigo-900/40' : 'bg-gradient-to-r from-indigo-600 to-purple-600'
              }`}>
                 <button 
                   onClick={() => setSelectedUser(null)}
                   className="absolute z-10 p-2 text-white transition-colors rounded-full top-4 right-4 bg-black/20 hover:bg-black/40"
                 >
                   <X size={18} />
                 </button>
                 {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold tracking-widest text-indigo-200 uppercase opacity-20">
                       Edit Mode
                    </div>
                 )}
                 {selectedUser.status === 'rejected' && !isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 text-4xl font-bold tracking-widest text-red-200 uppercase opacity-20">
                       <Ban size={32} /> BANNED
                    </div>
                 )}
              </div>

              <div className="px-8 pb-8">
                 {/* Avatar */}
                 <div className="relative mb-4 -mt-16">
                    <div className={`h-32 w-32 rounded-full border-4 ${selectedUser.status === 'rejected' ? 'border-red-500/50' : 'border-slate-900'} bg-slate-800 flex items-center justify-center text-4xl font-bold text-white overflow-hidden shadow-xl`}>
                       {selectedUser.profilePicture ? (
                          <img src={selectedUser.profilePicture} alt="Profile" className="object-cover w-full h-full" />
                       ) : (
                          (selectedUser.name || 'U').charAt(0).toUpperCase()
                       )}
                    </div>
                 </div>

                 {!isEditing ? (
                   <>
                     <div className="mb-6">
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                           {selectedUser.name}
                           {selectedUser.role === 'admin' && <ShieldAlert className="w-5 h-5 text-purple-400" />}
                        </h2>
                        <p className="text-slate-400">{selectedUser.email}</p>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 border bg-slate-950/50 rounded-xl border-slate-800">
                           <div className="flex items-center gap-2 mb-1 text-sm text-slate-400"><Clock size={14} /> Total Impact</div>
                           <div className="text-2xl font-black text-white">{selectedUser.volunteerHours || 0} <span className="text-sm font-normal text-slate-500">hours</span></div>
                        </div>
                        <div className="p-4 border bg-slate-950/50 rounded-xl border-slate-800">
                           <div className="flex items-center gap-2 mb-1 text-sm text-slate-400"><Award size={14} /> Events Joined</div>
                           <div className="text-2xl font-black text-white">{selectedUser.eventsAttended?.length || 0}</div>
                        </div>
                     </div>

                     {/* Action Buttons Row */}
                     <div className="flex gap-2 mb-6">
                        {selectedUser.status === 'rejected' ? (
                          <Button 
                            onClick={handleToggleStatus} 
                            disabled={updateUserMutation.isPending}
                            className="flex-1 border bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border-emerald-600/20"
                          >
                             {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Unlock size={16} className="mr-2"/>}
                             Activate User
                          </Button>
                        ) : (
                          <Button 
                            onClick={handleToggleStatus}
                            disabled={updateUserMutation.isPending} 
                            className="flex-1 text-orange-400 border bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20"
                          >
                             {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Ban size={16} className="mr-2"/>}
                             Ban User
                          </Button>
                        )}
                        
                        <Button 
                          onClick={handleDelete}
                          disabled={deleteUserMutation.isPending}
                          className="flex-1 text-red-400 border bg-red-600/10 hover:bg-red-600/20 border-red-600/20"
                        >
                           {deleteUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 size={16} className="mr-2"/>}
                           Delete Account
                        </Button>
                     </div>

                     <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg text-slate-300 bg-slate-800/30">
                           <CalendarDays className="w-5 h-5 text-indigo-400" />
                           <div>
                              <p className="text-xs font-bold uppercase text-slate-500">Joined On</p>
                              <p>{selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'MMMM do, yyyy') : 'N/A'}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg text-slate-300 bg-slate-800/30">
                           <Mail className="w-5 h-5 text-pink-400" />
                           <div>
                              <p className="text-xs font-bold uppercase text-slate-500">Email Address</p>
                              <p>{selectedUser.email}</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="flex justify-end gap-3 mt-8">
                        <Button variant="outline" onClick={() => setSelectedUser(null)} className="border-slate-700 text-slate-300">Close</Button>
                        <Button onClick={startEdit} className="gap-2 text-white bg-indigo-600 hover:bg-indigo-500">
                           <Edit2 size={16} /> Edit Details
                        </Button>
                     </div>
                   </>
                 ) : (
                   /* --- EDIT MODE --- */
                   <div className="pt-2 space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-400">Full Name</label>
                        <Input 
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                          className="text-white bg-slate-950 border-slate-700"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-400">Email Address</label>
                        <Input 
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                          className="text-white bg-slate-950 border-slate-700"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-400">Role</label>
                        <select 
                          value={editFormData.role}
                          onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                          className="w-full h-10 px-3 py-2 text-sm text-white border rounded-md border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="volunteer">Volunteer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-slate-400">Status</label>
                        <select 
                          value={editFormData.status}
                          onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                          className="w-full h-10 px-3 py-2 text-sm text-white border rounded-md border-slate-700 bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="approved">Approved (Active)</option>
                          <option value="pending">Pending</option>
                          <option value="rejected">Rejected (Banned)</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 mt-8 border-t border-slate-800">
                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white">Cancel</Button>
                        <Button onClick={handleSave} className="gap-2 text-white bg-emerald-600 hover:bg-emerald-500" disabled={updateUserMutation.isPending}>
                           {updateUserMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save size={16} />}
                           Save Changes
                        </Button>
                     </div>
                   </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

const StatBadge = ({ label, value, icon, color, bg, border }) => (
  <div className={`p-4 rounded-xl border ${bg} ${border} backdrop-blur-sm flex flex-col justify-between h-24`}>
    <div className={`flex justify-between items-start ${color}`}>
       <span className="text-xs font-bold uppercase opacity-80">{label}</span>
       {icon}
    </div>
    <div className={`text-2xl font-black text-white`}>{value}</div>
  </div>
);

export default ManageVolunteers;