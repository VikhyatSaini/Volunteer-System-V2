import { useMemo, useState } from 'react'; // Added useState
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Clock, AlertCircle, Loader2, TrendingUp, 
  ArrowRight, CheckCircle2, Activity, UserPlus, FileText, 
  MoreHorizontal, Trophy, Target, PieChart, Sparkles,
  ChevronDown, ChevronUp // Added Icons
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';
import { format, subDays, isSameDay, formatDistanceToNow } from 'date-fns';

import api from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showAllActivity, setShowAllActivity] = useState(false); // State for toggle

  // 1. FETCH ALL RAW DATA
  const { data: rawData, isLoading } = useQuery({
    queryKey: ['adminDashboardRealData'],
    queryFn: async () => {
      const [statsRes, usersRes, eventsRes, logsRes] = await Promise.all([
        api.get('/admin/stats'),       
        api.get('/users'),            
        api.get('/events'),            
        api.get('/admin/pending-hours') 
      ]);

      const users = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.users || []);
      const logs = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data.logs || []);
      const events = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data.events || []);

      return {
        stats: statsRes.data,
        users,
        events,
        logs
      };
    },
    refetchInterval: 30000 
  });

  // 2. PROCESS DATA
  const processedData = useMemo(() => {
    if (!rawData) return null;
    const { users, events, logs } = rawData;

    // --- A. ACTIVITY CHART ---
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return d;
    });

    const chartData = last7Days.map(day => {
      const newUsers = users.filter(u => isSameDay(new Date(u.createdAt), day)).length;
      const activeLogs = logs.filter(l => isSameDay(new Date(l.createdAt || l.date), day)).length;
      
      return {
        name: format(day, 'EEE'), 
        active: activeLogs,
        new: newUsers
      };
    });

    // --- B. CATEGORY PIE CHART ---
    const categoryCounts = events.reduce((acc, event) => {
      const cat = event.category || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const pieColors = ['#F472B6', '#818CF8', '#34D399', '#FBBF24', '#22D3EE'];
    const categoryData = Object.keys(categoryCounts).map((key, index) => ({
      name: key,
      value: categoryCounts[key],
      color: pieColors[index % pieColors.length]
    }));

    // --- C. LEADERBOARD ---
    const topVolunteers = users
      .filter(u => u.role === 'volunteer')
      .sort((a, b) => (b.volunteerHours || 0) - (a.volunteerHours || 0))
      .slice(0, 3)
      .map(u => ({
        name: u.name,
        hours: u.volunteerHours || 0,
        events: u.eventsAttended?.length || 0,
        img: u.profilePicture || null
      }));

    // --- D. REAL-TIME FEED ---
    const userActivities = users.map(u => ({
      id: `user-${u._id}`,
      type: 'registration',
      title: 'New Volunteer',
      desc: `${u.name} joined the platform`,
      date: new Date(u.createdAt),
      icon: <UserPlus className="w-4 h-4" />,
      color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"
    }));

    const logActivities = logs.map(l => ({
      id: `log-${l._id}`,
      type: 'log',
      title: 'Hours Submitted',
      desc: `${l.volunteer?.name || 'User'} logged ${l.hours}h`,
      date: new Date(l.createdAt || l.date),
      icon: <FileText className="w-4 h-4" />,
      color: "text-purple-400 bg-purple-400/10 border-purple-400/20"
    }));

    // Sort by date and take top 10 (we will slice 3 or 10 in render)
    const activityFeed = [...userActivities, ...logActivities]
      .sort((a, b) => b.date - a.date)
      .slice(0, 10); 

    return { chartData, categoryData, topVolunteers, activityFeed };
  }, [rawData]);


  if (isLoading || !processedData) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          <p className="font-medium tracking-wide text-slate-400">Syncing Live Data...</p>
        </div>
      </div>
    );
  }

  const { chartData, categoryData, topVolunteers, activityFeed } = processedData;
  const { stats } = rawData;

  // Logic to toggle between 3 items and full list
  const displayedFeed = showAllActivity ? activityFeed : activityFeed.slice(0, 3);

  return (
    <div className="relative w-full min-h-screen pb-20 font-sans text-slate-200">
      
      {/* --- AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col items-end justify-between gap-6 p-8 border shadow-2xl md:flex-row bg-slate-900/40 rounded-3xl border-white/5 backdrop-blur-2xl">
          <div>
            <h1 className="flex items-center gap-4 text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
               <Target className="text-indigo-500" size={40} /> Command Center
            </h1>
            <p className="mt-3 text-lg font-medium text-slate-400">
               Live overview of your organization's impact.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/admin/events/create')} 
            className="h-12 px-6 font-semibold text-white transition-all border-0 shadow-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25 rounded-xl hover:scale-105"
          >
            <Sparkles size={18} className="mr-2" /> Create New Event
          </Button>
        </div>

        {/* --- 1. KEY METRICS --- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total Volunteers" 
            value={stats?.totalVolunteers || 0} 
            icon={<Users size={28} />} 
            trend="+12% Growth" 
            color="text-cyan-400"
            gradient="from-cyan-500/20 to-blue-500/5"
            borderColor="border-cyan-500/20"
          />
          <StatCard 
            title="Hours Logged" 
            value={stats?.totalHoursLogged || 0} 
            icon={<Clock size={28} />} 
            trend="Total Impact" 
            color="text-fuchsia-400"
            gradient="from-fuchsia-500/20 to-pink-500/5"
            borderColor="border-fuchsia-500/20"
          />
          <StatCard 
            title="Active Events" 
            value={stats?.upcomingEvents || 0} 
            icon={<Calendar size={28} />} 
            trend="Open Slots" 
            color="text-emerald-400"
            gradient="from-emerald-500/20 to-teal-500/5"
            borderColor="border-emerald-500/20"
          />
          <StatCard 
            title="Pending Approvals" 
            value={stats?.pendingVolunteers || 0} 
            icon={<AlertCircle size={28} />} 
            trend="Action Needed" 
            isWarning={true}
            color="text-amber-400"
            gradient="from-amber-500/20 to-orange-500/5"
            borderColor="border-amber-500/20"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* --- 2. ACTIVITY CHART (Area) --- */}
          <Card className="overflow-hidden shadow-xl lg:col-span-2 bg-slate-900/60 border-white/10 backdrop-blur-xl">
            <CardHeader className="pb-4 border-b border-white/5">
              <CardTitle className="flex items-center justify-between text-xl font-bold text-white">
                 <div className="flex items-center gap-2">
                    <Activity className="text-indigo-400" size={22} /> Engagement Trends
                 </div>
                 <Badge variant="outline" className="text-indigo-300 bg-indigo-500/10 border-indigo-500/20">Last 7 Days</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pl-0">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff', fontWeight: 600 }}
                      cursor={{ stroke: '#fff', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="active" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorActive)" name="Activity Logs" />
                    <Area type="monotone" dataKey="new" stroke="#22d3ee" strokeWidth={4} fillOpacity={1} fill="url(#colorNew)" name="New Users" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* --- 3. CATEGORY DISTRIBUTION (Donut) --- */}
          <Card className="flex flex-col overflow-hidden shadow-xl bg-slate-900/60 border-white/10 backdrop-blur-xl">
             <CardHeader className="pb-4 border-b border-white/5">
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                   <PieChart className="text-fuchsia-400" size={22} /> Event Categories
                </CardTitle>
             </CardHeader>
             <CardContent className="relative flex flex-col items-center justify-center flex-1 p-6">
                {categoryData.length > 0 ? (
                  <>
                    <div className="h-[240px] w-full relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                             <Pie
                                data={categoryData}
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                             >
                                {categoryData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-lg" />
                                ))}
                             </Pie>
                             <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                formatter={(value, name) => [`${value} Events`, name]}
                             />
                          </RePieChart>
                       </ResponsiveContainer>
                       {/* Center Text */}
                       <div className="absolute text-center transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2">
                          <div className="text-3xl font-black text-white">{rawData.events.length}</div>
                          <div className="text-xs font-bold tracking-widest uppercase text-slate-400">Total</div>
                       </div>
                    </div>
                    <div className="grid w-full grid-cols-2 mt-2 gap-x-4 gap-y-3">
                       {categoryData.map((cat) => (
                          <div key={cat.name} className="flex items-center gap-2 p-2 text-sm border rounded-lg text-slate-300 bg-white/5 border-white/5">
                             <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: cat.color }}></div>
                             <span className="font-medium truncate">{cat.name}</span>
                          </div>
                       ))}
                    </div>
                  </>
                ) : (
                  <div className="text-sm italic text-slate-500">No events found to categorize.</div>
                )}
             </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
           
           {/* --- 4. TOP PERFORMERS --- */}
           <Card className="overflow-hidden shadow-xl bg-slate-900/60 border-white/10 backdrop-blur-xl">
              <CardHeader className="pb-4 border-b bg-white/5 border-white/5">
                 <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                    <Trophy className="text-yellow-400" size={22} /> Leaderboard
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 {topVolunteers.length > 0 ? topVolunteers.map((vol, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 transition-colors border cursor-default rounded-xl bg-white/5 border-white/5 hover:bg-white/10 group">
                       <div className="relative">
                          {vol.img ? (
                             <img src={vol.img} alt={vol.name} className="object-cover w-12 h-12 border-2 rounded-full border-slate-700" />
                          ) : (
                             <div className="flex items-center justify-center w-12 h-12 font-bold border-2 rounded-full border-slate-700 bg-slate-800 text-slate-400">
                                {vol.name.charAt(0)}
                             </div>
                          )}
                          <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-black font-bold border border-slate-900 shadow-lg ${
                            index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-300' : 'bg-amber-700'
                          }`}>
                             {index + 1}
                          </div>
                       </div>
                       <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{vol.name}</h4>
                          <p className="text-xs text-slate-400">{vol.events} Missions</p>
                       </div>
                       <div className="text-right">
                          <div className="text-lg font-black text-indigo-400">{vol.hours}h</div>
                       </div>
                    </div>
                 )) : (
                   <p className="py-4 text-sm text-center text-slate-500">No volunteer data yet.</p>
                 )}
              </CardContent>
           </Card>

           {/* --- 5. REAL-TIME FEED (With View More Toggle) --- */}
           <Card className="overflow-hidden shadow-xl lg:col-span-2 bg-slate-900/60 border-white/10 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
                 <CardTitle className="flex items-center gap-2 text-xl font-bold text-white">
                    <Clock className="text-cyan-400" size={22} /> Real-time Feed
                 </CardTitle>
                 {activityFeed.length > 3 && (
                   <Button 
                     variant="ghost" 
                     size="sm" 
                     onClick={() => setShowAllActivity(!showAllActivity)}
                     className="h-8 text-slate-400 hover:text-white hover:bg-white/10"
                   >
                     {showAllActivity ? (
                       <span className="flex items-center gap-1">Show Less <ChevronUp size={14} /></span>
                     ) : (
                       <span className="flex items-center gap-1">View More <ChevronDown size={14} /></span>
                     )}
                   </Button>
                 )}
              </CardHeader>
              <CardContent className="p-6">
                 <div className="space-y-2">
                    {displayedFeed.length > 0 ? (
                       displayedFeed.map((item) => (
                          <div key={item.id} className="flex items-center gap-4 p-4 transition-all border border-transparent rounded-2xl hover:bg-white/5 group hover:border-white/5">
                             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-lg group-hover:scale-110 transition-transform ${item.color}`}>
                                {item.icon}
                             </div>
                             <div className="flex-1">
                                <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                             </div>
                             <Badge variant="secondary" className="transition-colors bg-slate-950 text-slate-500 border-slate-800 group-hover:text-white">
                                {formatDistanceToNow(item.date, { addSuffix: true })}
                             </Badge>
                          </div>
                       ))
                    ) : (
                       <div className="py-10 text-sm text-center text-slate-500">No recent activity found.</div>
                    )}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* --- 6. QUICK ACTIONS --- */}
        <div className="pt-4">
           <h3 className="flex items-center gap-2 mb-6 text-xl font-bold text-white">
              <MoreHorizontal className="text-slate-500" /> Quick Actions
           </h3>
           <div className="grid gap-4 md:grid-cols-4">
              <ActionCard 
                 title="Approve Hours" 
                 desc="Review Logs" 
                 icon={<CheckCircle2 className="text-emerald-400" size={24} />}
                 gradient="from-emerald-500/20 to-teal-500/5"
                 border="border-emerald-500/30"
                 onClick={() => navigate('/admin/approvals')}
              />
              <ActionCard 
                 title="Manage Users" 
                 desc="View Database" 
                 icon={<Users className="text-blue-400" size={24} />}
                 gradient="from-blue-500/20 to-indigo-500/5"
                 border="border-blue-500/30"
                 onClick={() => navigate('/admin/volunteers')}
              />
              <ActionCard 
                 title="Create Event" 
                 desc="New Initiative" 
                 icon={<Calendar className="text-fuchsia-400" size={24} />}
                 gradient="from-fuchsia-500/20 to-pink-500/5"
                 border="border-fuchsia-500/30"
                 onClick={() => navigate('/admin/events/create')}
              />
              <ActionCard 
                 title="Settings" 
                 desc="System Config" 
                 icon={<MoreHorizontal className="text-slate-200" size={24} />}
                 gradient="from-slate-700/50 to-slate-800/50"
                 border="border-slate-600/50"
                 onClick={() => navigate('/admin/settings')}
              />
           </div>
        </div>

      </div>
    </div>
  );
};

// --- Sub-Components (Enhanced Visuals) ---

const StatCard = ({ title, value, icon, trend, color, gradient, borderColor, isWarning }) => (
  <div className="relative group hover:scale-[1.02] transition-transform duration-300">
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-3xl opacity-50 group-hover:opacity-100 transition duration-500`}></div>
    <div className={`relative bg-slate-900/80 border ${borderColor} rounded-3xl p-6 h-full flex flex-col justify-between backdrop-blur-md shadow-xl`}>
      <div className="flex items-start justify-between mb-4">
        <div>
           <p className="text-sm font-semibold tracking-wide uppercase text-slate-400">{title}</p>
           <h3 className="mt-2 text-4xl font-black text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-2xl bg-slate-950 border border-white/5 ${color} shadow-lg`}>
           {icon}
        </div>
      </div>
      <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg w-fit ${isWarning ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
         {isWarning ? <AlertCircle size={14} /> : <TrendingUp size={14} />}
         {trend}
      </div>
    </div>
  </div>
);

const ActionCard = ({ title, desc, icon, onClick, gradient, border }) => (
  <div 
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl border ${border} bg-slate-900/60 p-1 cursor-pointer transition-all duration-300 group hover:shadow-2xl hover:shadow-indigo-500/10`}
  >
     <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
     <div className="relative flex items-center h-full gap-4 p-5 bg-slate-950/80 rounded-xl backdrop-blur-md">
        <div className="flex items-center justify-center w-12 h-12 transition-transform border shadow-lg rounded-xl bg-slate-900 border-white/10 group-hover:scale-110">
           {icon}
        </div>
        <div className="flex-1">
           <h4 className="text-lg font-bold text-white transition-colors group-hover:text-indigo-200">{title}</h4>
           <p className="text-xs text-slate-400 group-hover:text-slate-300">{desc}</p>
        </div>
        <ArrowRight className="transition-all -translate-x-2 opacity-0 text-slate-600 group-hover:text-white group-hover:translate-x-0 group-hover:opacity-100" size={20} />
     </div>
  </div>
);

export default AdminDashboard;