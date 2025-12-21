import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  Calendar, MapPin, Upload, Sparkles, Tags, Type, 
  Loader2, ArrowLeft, Save, ImageIcon, Layers, Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

import api from '../../lib/axios';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      slotsAvailable: 50,
      tags: ''
    }
  });

  // Watch fields for AI generation context
  // [0]=title, [1]=location, [2]=date, [3]=description
  const watchedFields = watch(['title', 'location', 'date', 'description']);

  // --- MUTATION ---
  const createEventMutation = useMutation({
    mutationFn: async (formData) => {
      return await api.post('/events', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Event launched successfully! 🚀');
      navigate('/admin');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  });

  // --- SUBMIT HANDLER ---
  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('date', data.date);
    formData.append('location', data.location);
    formData.append('slotsAvailable', data.slotsAvailable);
    
    // Convert comma-separated string to array
    const tagsArray = data.tags.split(',').map(t => t.trim()).filter(t => t);
    tagsArray.forEach(tag => formData.append('tags', tag));

    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    createEventMutation.mutate(formData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // --- REAL AI HANDLERS ---

  // 1. Generate Description using Gemini
  const handleGenerateDescription = async () => {
    const title = watchedFields[0];
    const location = watchedFields[1];
    const date = watchedFields[2];

    if (!title || !location) {
      return toast.error('Please enter a Title and Location first for better results.');
    }

    setIsGeneratingDesc(true);
    
    try {
      // Call the backend endpoint
      const response = await api.post('/ai/generate', {
        title,
        location,
        date
      });

      // Update the form with the real AI text
      setValue('description', response.data.generatedDescription);
      toast.success('AI Description generated! ✨');
    } catch (error) {
      console.error("AI Error:", error);
      toast.error('Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  // 2. Auto Classify Tags using Gemini
  const handleAutoTag = async () => {
    const title = watchedFields[0];
    const location = watchedFields[1];
    const description = watchedFields[3];

    if (!title) {
      return toast.error('Please enter a Title first.');
    }

    setIsGeneratingTags(true);

    try {
      // Call the backend endpoint
      const response = await api.post('/ai/classify', {
        title,
        location,
        description
      });

      // Backend returns array: { tags: ["Tag1", "Tag2"] }
      // Convert to comma-separated string for the input field
      const tagsString = response.data.tags.join(', ');
      
      setValue('tags', tagsString);
      toast.success('AI Tags generated! 🏷️');
    } catch (error) {
      console.error("AI Tag Error:", error);
      toast.error('Failed to generate tags.');
    } finally {
      setIsGeneratingTags(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen pb-20 overflow-hidden">
      
      {/* --- BACKGROUND AMBIENCE --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl px-6 pt-6 mx-auto">
        
        {/* --- HEADER --- */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/admin')}
              className="border border-transparent rounded-full text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border-slate-700"
            >
              <ArrowLeft size={24} />
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight text-white">
                 Create Event <Sparkles className="text-pink-500 animate-pulse" size={24} />
              </h1>
              <p className="text-slate-400">Design a new initiative for your volunteers.</p>
            </div>
          </div>
        </motion.div>

        {/* --- MAIN FORM GRID --- */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Media & Basic Info (4 Cols) */}
          <div className="space-y-6 lg:col-span-4">
             
             {/* 1. Image Upload Card */}
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
               <Card className="overflow-hidden shadow-xl bg-slate-900/60 border-slate-800 backdrop-blur-xl">
                  <CardHeader className="pb-4">
                     <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
                        <ImageIcon size={18} className="text-indigo-400" /> Event Banner
                     </CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="flex items-center justify-center w-full">
                        <label htmlFor="dropzone-file" className="relative flex flex-col items-center justify-center w-full overflow-hidden transition-all border-2 border-dashed cursor-pointer aspect-square border-slate-700 rounded-2xl bg-slate-950/30 hover:bg-slate-900/50 hover:border-indigo-500/50 group">
                          {imagePreview ? (
                            <>
                              <img src={imagePreview} alt="Preview" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 flex flex-col items-center justify-center text-sm font-medium text-white transition-opacity opacity-0 bg-black/50 group-hover:opacity-100 backdrop-blur-sm">
                                 <Upload size={24} className="mb-2" /> Change Image
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 pt-5 pb-6 text-center">
                              <div className="p-4 mb-4 transition-transform border rounded-full shadow-lg bg-slate-900 border-slate-800 group-hover:scale-110 group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/20">
                                <Upload className="w-8 h-8 transition-colors text-slate-400 group-hover:text-indigo-400" />
                              </div>
                              <p className="mb-2 text-sm font-medium text-slate-300">Click to upload banner</p>
                              <p className="text-xs text-slate-500">SVG, PNG, JPG (Max 800x800px)</p>
                            </div>
                          )}
                          <input 
                            id="dropzone-file" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            {...register("image", { onChange: handleImageChange })} 
                          />
                        </label>
                     </div>
                  </CardContent>
               </Card>
             </motion.div>

             {/* 2. Key Details Card */}
             <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <Card className="shadow-xl bg-slate-900/60 border-slate-800 backdrop-blur-xl">
                   <CardContent className="pt-6 space-y-5">
                      {/* Date */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-slate-300"><Calendar size={14} className="text-purple-400" /> Date & Time</Label>
                        <Input 
                          type="datetime-local"
                          className="bg-slate-950/50 border-slate-700 focus:border-purple-500 h-11 text-white [color-scheme:dark]"
                          {...register("date", { required: "Date is required" })} 
                        />
                        {errors.date && <span className="text-xs text-red-400">{errors.date.message}</span>}
                      </div>

                      {/* Capacity */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-slate-300"><Users size={14} className="text-cyan-400" /> Total Capacity</Label>
                        <Input 
                          type="number" min="1"
                          className="text-white bg-slate-950/50 border-slate-700 focus:border-cyan-500 h-11"
                          {...register("slotsAvailable", { required: "Required" })} 
                        />
                      </div>
                   </CardContent>
                </Card>
             </motion.div>
          </div>

          {/* RIGHT COLUMN: Details Form (8 Cols) */}
          <div className="lg:col-span-8">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="h-full">
              <Card className="flex flex-col h-full shadow-xl bg-slate-900/60 border-slate-800 backdrop-blur-xl">
                <CardHeader className="pb-6 border-b border-slate-800/50">
                  <CardTitle className="flex items-center gap-2 text-xl text-white">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    Event Information
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-1 pt-8 space-y-8">
                  
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-300">Event Title</Label>
                    <div className="relative group">
                      <Type className="absolute left-3 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      <Input 
                        id="title" 
                        placeholder="e.g. Annual Beach Cleanup Initiative" 
                        className="h-12 pl-10 text-lg text-white bg-slate-950/50 border-slate-700 focus:border-indigo-500 placeholder:text-slate-600"
                        {...register("title", { required: "Title is required" })} 
                      />
                    </div>
                    {errors.title && <span className="text-xs text-red-400">{errors.title.message}</span>}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-slate-300">Location</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      <Input 
                        id="location" 
                        placeholder="e.g. Central Park, NY (or Remote)" 
                        className="h-12 pl-10 text-white bg-slate-950/50 border-slate-700 focus:border-indigo-500"
                        {...register("location", { required: "Location is required" })} 
                      />
                    </div>
                    {errors.location && <span className="text-xs text-red-400">{errors.location.message}</span>}
                  </div>

                  {/* Description with AI */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="description" className="text-slate-300">Description</Label>
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        disabled={isGeneratingDesc}
                        className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 text-pink-400 border border-pink-500/20 hover:border-pink-500/50 hover:bg-pink-500/20 transition-all disabled:opacity-50"
                      >
                        {isGeneratingDesc ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        AI Write
                      </button>
                    </div>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the mission, requirements, and impact..."
                      className="min-h-[200px] bg-slate-950/50 border-slate-700 focus:border-pink-500 text-white leading-relaxed resize-none p-4 text-base"
                      {...register("description", { required: "Description is required" })}
                    />
                    {errors.description && <span className="text-xs text-red-400">{errors.description.message}</span>}
                  </div>

                  {/* Tags with AI */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="tags" className="text-slate-300">Tags</Label>
                      <button
                        type="button"
                        onClick={handleAutoTag}
                        disabled={isGeneratingTags}
                        className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
                      >
                        {isGeneratingTags ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tags className="w-3 h-3" />}
                        Auto Classify
                      </button>
                    </div>
                    <div className="relative group">
                      <Input 
                        id="tags" 
                        placeholder="Environment, Outdoor, Teamwork..." 
                        className="text-white bg-slate-950/50 border-slate-700 focus:border-cyan-500 h-11"
                        {...register("tags")} 
                      />
                    </div>
                    <p className="text-xs text-slate-500">Separate tags with commas.</p>
                  </div>

                  {/* Action Bar */}
                  <div className="flex justify-end gap-4 pt-8 mt-auto border-t border-slate-800/50">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => navigate('/admin')}
                      className="h-12 px-6 text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 h-12 shadow-lg shadow-indigo-500/25 text-base font-medium rounded-lg transition-all hover:scale-[1.02]"
                      disabled={createEventMutation.isPending}
                    >
                      {createEventMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Publishing...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" /> Publish Event
                        </>
                      )}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;