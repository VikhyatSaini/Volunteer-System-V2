import { useState } from 'react';
import { useQuery } from '@tanstack/react-query'; // 👈 Import React Query
import { Mail, ChevronDown, Send, Loader2, HelpCircle, LifeBuoy, Sparkles, MessageSquare, User, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns'; // 👈 Date formatting
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge'; // 👈 Badge
import toast from 'react-hot-toast';
import api from '../lib/axios';

// ... (keep existing faqs array) ...
const faqs = [ /* ... same as before ... */ ];

const Support = () => {
  const [openFaq, setOpenFaq] = useState(0); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

  // --- FETCH USER MESSAGES ---
  const { data: myMessages, refetch } = useQuery({
    queryKey: ['myMessages'],
    queryFn: async () => {
      const res = await api.get('/messages/my');
      return res.data;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = {
      subject: e.target.subject.value,
      message: e.target.message.value
    };

    try {
      await api.post('/messages', formData);
      toast.success("Message sent! We'll get back to you shortly.");
      e.target.reset();
      refetch(); // Refresh the list
      setActiveTab('history'); // Switch to history tab to show it
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl pb-10 mx-auto space-y-8"
    >
      
      {/* 1. Hero Section (Keep same as before) */}
      <div className="relative overflow-hidden border shadow-2xl rounded-3xl bg-slate-900 border-slate-800">
         {/* ... (Keep background divs same as previous code) ... */}
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90"></div>
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
         
         <div className="relative z-10 flex flex-col items-center justify-between gap-6 p-10 md:flex-row">
          <div>
             <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-medium border rounded-full bg-white/10 border-white/20 backdrop-blur-md text-white/90">
                <Sparkles size={12} className="text-yellow-300" /> Help Center
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl drop-shadow-sm">
               How can we <br/> help you today?
             </h1>
          </div>
          <div className="items-center justify-center hidden w-32 h-32 border rounded-full shadow-2xl md:flex bg-white/10 backdrop-blur-md border-white/20">
             <LifeBuoy size={64} className="text-white animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* 2. FAQ Section (Left) */}
        <div className="space-y-6 lg:col-span-7">
           {/* ... (Keep FAQ Header same as before) ... */}
           <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10">
               <HelpCircle className="text-indigo-400" size={22} />
            </div>
            <div>
               <h2 className="text-xl font-bold text-white">Common Questions</h2>
               <p className="text-xs text-slate-400">Quick answers to frequently asked questions.</p>
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div key={index} initial={false} className={`border rounded-xl overflow-hidden transition-all duration-300 ${openFaq === index ? 'bg-slate-900/80 border-indigo-500/50' : 'bg-slate-900/40 border-slate-800'}`}>
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex items-center justify-between w-full p-5 text-left">
                  <span className={`font-semibold ${openFaq === index ? 'text-indigo-300' : 'text-slate-200'}`}>{faq.question}</span>
                  <div className={`p-1 rounded-full ${openFaq === index ? 'bg-indigo-500/20 rotate-180' : 'bg-slate-800'}`}><ChevronDown size={16} /></div>
                </button>
                <AnimatePresence>
                  {openFaq === index && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="p-5 pt-0 text-sm border-t text-slate-400 border-indigo-500/10">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 3. Right Column: Switchable Form / History */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            
            {/* Tabs */}
            <div className="flex p-1 mb-4 border rounded-lg bg-slate-900/60 border-slate-800 backdrop-blur-md">
              <button 
                onClick={() => setActiveTab('new')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'new' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                New Request
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'history' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                My Tickets
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'new' ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="relative p-6 overflow-hidden border shadow-xl bg-slate-900/60 border-slate-800 rounded-2xl backdrop-blur-md"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 -mt-10 -mr-10 rounded-full pointer-events-none bg-pink-500/10 blur-2xl"></div>
                  <div className="relative z-10 flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-500/10"><Mail className="text-pink-400" size={20} /></div>
                    <div><h2 className="text-xl font-bold text-white">Contact Support</h2><p className="text-xs text-slate-400">We usually respond within 24 hours.</p></div>
                  </div>

                  <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                      <Input id="subject" name="subject" placeholder="e.g. Issue with hour approval" className="text-white bg-slate-950/80 border-slate-700" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-300">Message</Label>
                      <textarea id="message" name="message" rows="5" className="w-full px-3 py-2 text-sm text-white border rounded-lg resize-none bg-slate-950/80 border-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500/20" placeholder="Describe your issue..." required />
                    </div>
                    <Button type="submit" size="lg" className="w-full text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Send Message
                    </Button>
                  </form>
                </motion.div>
              ) : (
                <motion.div 
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-3"
                >
                  {myMessages && myMessages.length > 0 ? (
                    myMessages.map((msg) => (
                      <div key={msg._id} className="p-4 border shadow-sm bg-slate-900/60 border-slate-800 rounded-xl backdrop-blur-md">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-white">{msg.subject}</h3>
                          {msg.status === 'replied' ? 
                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">Replied</Badge> : 
                            <Badge variant="outline" className="text-slate-400 border-slate-700">Sent</Badge>
                          }
                        </div>
                        <p className="mb-3 text-sm text-slate-400 line-clamp-2">{msg.message}</p>
                        
                        {/* Show Reply if exists */}
                        {msg.adminReply && (
                          <div className="p-3 mt-3 border-l-2 border-indigo-500 bg-indigo-900/20 rounded-r-md">
                            <div className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-300">
                              <CheckCircle2 size={12} /> Admin Response
                              <span className="ml-auto font-normal text-slate-500">{format(new Date(msg.repliedAt), 'MMM d')}</span>
                            </div>
                            <p className="text-sm text-indigo-100">{msg.adminReply}</p>
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-right text-slate-600">
                          {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 border bg-slate-900/60 border-slate-800 rounded-2xl">
                      <MessageSquare className="mb-2 text-slate-600" size={32} />
                      <p className="text-slate-500">No tickets found.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Support;