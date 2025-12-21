import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Loader2, CheckCircle, Clock, Reply, Send } from 'lucide-react'; // 👈 Icons
import { format } from 'date-fns';
import toast from 'react-hot-toast'; // 👈 Toast
import api from '../../lib/axios';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea'; // 👈 Import Textarea

const AdminMessages = () => {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState(null); // ID of message being replied to
  const [replyText, setReplyText] = useState("");

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const res = await api.get('/messages');
      return res.data;
    }
  });

  const readMutation = useMutation({
    mutationFn: async (id) => await api.put(`/messages/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries(['messages'])
  });

  // --- REPLY MUTATION ---
  const replyMutation = useMutation({
    mutationFn: async ({ id, text }) => {
      return await api.put(`/messages/${id}/reply`, { replyText: text });
    },
    onSuccess: () => {
      toast.success("Reply sent successfully");
      setReplyingTo(null);
      setReplyText("");
      queryClient.invalidateQueries(['messages']);
    },
    onError: () => toast.error("Failed to send reply")
  });

  const handleReplySubmit = (id) => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ id, text: replyText });
  };

  if (isLoading) return <div className="flex items-center justify-center h-96"><Loader2 className="text-indigo-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-3xl font-bold text-white">
        <Mail className="text-pink-500" /> Support Inbox
      </h1>

      <div className="grid gap-4">
        {messages?.length > 0 ? (
          messages.map((msg) => (
            <Card key={msg._id} className={`border-slate-800 transition-all ${msg.status === 'unread' ? 'bg-slate-900/80 border-l-4 border-l-pink-500' : 'bg-slate-900/40 opacity-90'}`}>
              <CardContent className="p-6">
                
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{msg.subject}</h3>
                    <p className="text-sm text-slate-400">From: <span className="text-indigo-400">{msg.user?.name}</span> ({msg.user?.email})</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{format(new Date(msg.createdAt), 'MMM d, h:mm a')}</span>
                    
                    {/* Status Badges */}
                    {msg.status === 'replied' ? (
                       <Badge variant="outline" className="text-indigo-400 border-indigo-500/30 bg-indigo-500/10"><Reply size={10} className="mr-1"/> Replied</Badge>
                    ) : msg.status === 'read' ? (
                       <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/5"><CheckCircle size={10} className="mr-1"/> Read</Badge>
                    ) : (
                       <Button size="sm" variant="outline" onClick={() => readMutation.mutate(msg._id)} className="text-xs text-pink-400 h-7 border-pink-500/50 hover:bg-pink-500/10">Mark Read</Button>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <p className="p-4 mb-4 text-sm whitespace-pre-wrap border rounded-lg text-slate-300 bg-slate-950/50 border-slate-800">
                  {msg.message}
                </p>

                {/* --- REPLY SECTION --- */}
                {msg.adminReply ? (
                  // If already replied, show the reply
                  <div className="p-4 mt-2 ml-8 border-l-2 border-indigo-500 rounded-r-lg bg-indigo-900/20">
                    <p className="flex items-center gap-2 mb-1 text-xs font-bold text-indigo-300">
                      <Reply size={12} /> Admin Response 
                      <span className="ml-auto font-normal text-slate-500">{format(new Date(msg.repliedAt), 'MMM d, h:mm a')}</span>
                    </p>
                    <p className="text-sm text-indigo-100">{msg.adminReply}</p>
                  </div>
                ) : (
                  // If not replied, show reply button/form
                  <div className="mt-4">
                    {replyingTo === msg._id ? (
                      <div className="space-y-2 duration-200 animate-in fade-in slide-in-from-top-2">
                        <Textarea 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply here..."
                          className="bg-slate-950 border-slate-700 text-white min-h-[100px]"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} className="text-slate-400">Cancel</Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleReplySubmit(msg._id)} 
                            disabled={replyMutation.isPending}
                            className="text-white bg-indigo-600 hover:bg-indigo-500"
                          >
                            {replyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setReplyingTo(msg._id)} 
                        className="h-auto p-0 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                      >
                        <Reply size={16} className="mr-1" /> Reply to User
                      </Button>
                    )}
                  </div>
                )}

              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center text-slate-500">No messages found.</div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;