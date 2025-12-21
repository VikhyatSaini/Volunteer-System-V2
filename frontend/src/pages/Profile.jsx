import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  User, Mail, Calendar, Wrench, Camera, Loader2, Save, Lock, ShieldCheck, Sparkles, KeyRound 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import api from '../lib/axios';
import useAuth from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const Profile = () => {
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Local Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    skills: '', 
    availability: '', 
  });
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // 1. Fetch Profile Data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/users/profile');
      return response.data;
    },
  });

  // 2. Populate Form
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        skills: profile.skills ? profile.skills.join(', ') : '',
        availability: profile.availability ? profile.availability.join(', ') : '',
      });
      setImagePreview(profile.profilePicture);
    }
  }, [profile]);

  // 3. Update Mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const form = new FormData();
      form.append('name', data.name);
      form.append('email', data.email);
      
      const skillList = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      skillList.forEach(s => form.append('skills', s));

      const availList = data.availability.split(',').map(s => s.trim()).filter(Boolean);
      availList.forEach(s => form.append('availability', s));

      if (imageFile) {
        form.append('image', imageFile);
      }

      // Only append password fields if newPassword is provided
      if (data.newPassword) {
        form.append('currentPassword', data.currentPassword);
        form.append('newPassword', data.newPassword);
      }

      return await api.put('/users/profile', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      queryClient.invalidateQueries(['profile']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Password Validation
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        toast.error("Please enter your current password to save changes");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      if (newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
    }

    updateMutation.mutate({ ...formData, currentPassword, newPassword });
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-10 space-y-8"
    >
      
      {/* 1. Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/50 to-slate-900 border border-slate-800 p-8 md:p-12 text-center md:text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-400">
            Profile Settings
          </h1>
          <p className="text-slate-400 mt-3 text-lg max-w-2xl">
            Customize your volunteer persona, manage your skills, and secure your account.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* 2. Left Column: Profile Card (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md shadow-xl overflow-hidden">
             <div className="h-24 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
             <CardContent className="-mt-12 text-center relative z-10">
                <div className="relative inline-block group mb-4">
                  <div className="h-32 w-32 rounded-full p-1 bg-slate-950 shadow-2xl mx-auto">
                     <div className="h-full w-full rounded-full overflow-hidden border-4 border-slate-800 relative">
                        <img 
                          src={imagePreview || "https://via.placeholder.com/150"} 
                          alt="Profile" 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="h-8 w-8 text-white/80" />
                        </div>
                     </div>
                  </div>
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleImageChange}
                  />
                </div>

                <h2 className="text-2xl font-bold text-white">{profile?.name}</h2>
                <p className="text-emerald-400 text-sm font-medium mb-4">{profile?.email}</p>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  <Badge variant="outline" className="border-slate-700 text-slate-300 bg-slate-800/50">
                    {profile?.role?.toUpperCase()}
                  </Badge>
                  <Badge 
                    className={`border-0 ${
                      profile?.status === 'approved' ? "bg-emerald-500/20 text-emerald-400" :
                      profile?.status === 'rejected' ? "bg-red-500/20 text-red-400" :
                      "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {profile?.status?.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 border-t border-slate-800 pt-4">
                    <div className="flex flex-col items-center p-2 bg-slate-950/50 rounded-lg">
                        <Sparkles className="h-4 w-4 text-yellow-500 mb-1" />
                        <span>Joined 2024</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-slate-950/50 rounded-lg">
                        <ShieldCheck className="h-4 w-4 text-blue-500 mb-1" />
                        <span>Verified</span>
                    </div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* 3. Right Column: Forms (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Details Card */}
            <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5 text-emerald-500" /> Personal Information
                </CardTitle>
                <CardDescription>Update your public profile details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                      <Input 
                        id="name"
                        className="bg-slate-950 border-slate-700 text-white focus:border-emerald-500/50"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        className="bg-slate-950 border-slate-700 text-white focus:border-emerald-500/50"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="skills" className="text-slate-300">Skills & Interests</Label>
                    <div className="relative">
                      <Wrench className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input 
                        id="skills"
                        className="pl-9 bg-slate-950 border-slate-700 text-white focus:border-emerald-500/50"
                        placeholder="Coding, First Aid, Teaching..."
                        value={formData.skills}
                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                      />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label htmlFor="availability" className="text-slate-300">Availability</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                      <Input 
                        id="availability"
                        className="pl-9 bg-slate-950 border-slate-700 text-white focus:border-emerald-500/50"
                        placeholder="Weekends, Evenings..."
                        value={formData.availability}
                        onChange={(e) => setFormData({...formData, availability: e.target.value})}
                      />
                    </div>
                 </div>
              </CardContent>
            </Card>

            {/* Security Card (Colorful & Attractive) */}
            <Card className="bg-gradient-to-br from-slate-900 to-indigo-950/30 border-slate-800 backdrop-blur-md overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Lock className="h-5 w-5 text-indigo-400" /> Security & Password
                </CardTitle>
                <CardDescription>Ensure your account stays safe.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 relative z-10">
                
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-300">Current Password</Label>
                  <div className="relative group">
                     <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
                     <Input 
                        id="currentPassword"
                        type="password"
                        placeholder="Enter current password to save changes"
                        className="pl-9 bg-slate-950/50 border-slate-700 text-white focus:border-indigo-500/50 focus:ring-indigo-500/20"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                     />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-slate-300">New Password</Label>
                    <Input 
                      id="newPassword"
                      type="password"
                      placeholder="Min 6 characters"
                      className="bg-slate-950/50 border-slate-700 text-white focus:border-indigo-500/50"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter new password"
                      className="bg-slate-950/50 border-slate-700 text-white focus:border-indigo-500/50"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 px-8 transition-all hover:scale-[1.02]"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Save Changes
                </Button>
            </div>

          </form>
        </div>

      </div>
    </motion.div>
  );
};

export default Profile;