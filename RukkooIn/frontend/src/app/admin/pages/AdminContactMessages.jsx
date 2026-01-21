import React, { useEffect, useState, useCallback } from 'react';
import {
  User, Hotel, Mail, Phone, MessageCircle, ChevronLeft, ChevronRight, X,
  Search, Filter, Clock, CheckCircle, AlertCircle, Send, StickyNote,
  UserCheck, Loader2, MoreVertical, Flag
} from 'lucide-react';
import adminService from '../../../services/adminService';
import toast from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

const AdminContactMessages = () => {
  const [audience, setAudience] = useState('user');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Detail Modal States
  const [replyText, setReplyText] = useState('');
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat or notes

  const load = useCallback(async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const res = await adminService.getContactMessages({
        audience,
        status: status === 'all' ? undefined : status,
        search: search || undefined,
        page: pageToLoad,
        limit
      });
      setMessages(res.messages || []);
      setTotal(res.total || 0);
      setPage(res.page || pageToLoad);
    } catch {
      toast.error('Unable to fetch support tickets.');
    } finally {
      setLoading(false);
    }
  }, [audience, status, search, limit]);

  useEffect(() => {
    load(1);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const handleStatusChange = async (id, nextStatus) => {
    try {
      await adminService.updateContactStatus(id, nextStatus);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, status: nextStatus } : m))
      );
      if (selectedMessage?._id === id) {
        setSelectedMessage(prev => ({ ...prev, status: nextStatus }));
      }
      toast.success(`Ticket marked as ${nextStatus.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update ticket status.');
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await adminService.replyToTicket(selectedMessage._id, replyText);
      if (res.success) {
        setSelectedMessage(res.ticket);
        setReplyText('');
        toast.success('Reply sent successfully');
      }
    } catch {
      toast.error('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      const res = await adminService.addTicketNote(selectedMessage._id, noteText);
      if (res.success) {
        setSelectedMessage(res.ticket);
        setNoteText('');
        toast.success('Note added');
      }
    } catch {
      toast.error('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (s) => {
    if (s === 'new') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s === 'in_progress') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s === 'resolved') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'closed') return 'bg-gray-100 text-gray-700 border-gray-200';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 uppercase tracking-tighter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            <MessageCircle size={32} /> Helpdesk Control
          </h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
            Centrally manage user and partner inquiries with ticket tracking.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm">
            <button
              onClick={() => setAudience('user')}
              className={`px-5 py-2 text-[10px] font-black rounded-xl uppercase transition-all ${audience === 'user' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              User
            </button>
            <button
              onClick={() => setAudience('partner')}
              className={`px-5 py-2 text-[10px] font-black rounded-xl uppercase transition-all ${audience === 'partner' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Partner
            </button>
          </div>

          <div className="flex bg-white p-1 rounded-2xl border border-gray-200 shadow-sm overflow-x-auto no-scrollbar">
            {['all', 'new', 'in_progress', 'resolved', 'closed'].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 py-2 text-[10px] font-black rounded-xl uppercase transition-all whitespace-nowrap ${status === s ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 border border-gray-200 rounded-[2rem] shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Ticket ID, Email, or Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-[11px] font-black uppercase focus:bg-white focus:border-black outline-none transition-all"
          />
        </div>
        <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl text-[11px] font-black uppercase hover:bg-gray-50 transition-all flex items-center gap-2">
          <Filter size={16} /> Advanced Filter
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400">
              <tr>
                <th className="px-8 py-5">Ticket / Subject</th>
                <th className="px-8 py-5">Sender Details</th>
                <th className="px-8 py-5">Last Activity</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-8"><div className="h-12 bg-gray-50 rounded-2xl"></div></td>
                  </tr>
                ))
              ) : messages.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <AlertCircle size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Zero active tickets in this queue.</p>
                  </td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr key={m._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${m.status === 'new' ? 'bg-blue-500 animate-pulse' : 'bg-transparent'}`}></div>
                        <div>
                          <p className="text-xs font-black text-gray-900 uppercase">#{m.ticketId}</p>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter line-clamp-1 max-w-[200px]">{m.subject}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-black text-gray-900 uppercase">{m.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Mail size={10} className="text-gray-300" />
                        <p className="text-[9px] font-bold text-gray-400 uppercase truncate max-w-[150px]">{m.email}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase">
                        <Clock size={12} />
                        {new Date(m.updatedAt || m.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${getStatusColor(m.status)}`}>
                        {m.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => setSelectedMessage(m)}
                        className="px-5 py-2.5 bg-black text-white text-[10px] font-black uppercase rounded-xl hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 ml-auto"
                      >
                        <MessageCircle size={14} /> Open Thread
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-8 py-6 border-t border-gray-100 bg-gray-50/30">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
            Showing {messages.length} / {total} support tickets
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => load(page - 1)}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-white transition-all shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => load(i + 1)}
                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${page === i + 1 ? 'bg-black text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-400 hover:border-gray-300'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              disabled={page >= totalPages}
              onClick={() => load(page + 1)}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-white transition-all shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedMessage(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full mx-auto relative z-10 overflow-hidden flex flex-col h-[85vh] border border-gray-200"
            >
              {/* Modal Header */}
              <div className="px-10 py-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Ticket #{selectedMessage.ticketId}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase border ${getStatusColor(selectedMessage.status)}`}>
                      {selectedMessage.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">{selectedMessage.subject}</h3>
                </div>
                <button onClick={() => setSelectedMessage(null)} className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-black hover:text-white transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Sub-Tabs */}
              <div className="px-10 py-4 bg-white border-b border-gray-100 flex gap-4">
                <button onClick={() => setActiveTab('chat')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'chat' ? 'border-black text-black' : 'border-transparent text-gray-300'}`}>Customer Chat</button>
                <button onClick={() => setActiveTab('notes')} className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${activeTab === 'notes' ? 'border-black text-black' : 'border-transparent text-gray-300'}`}>Internal Ops Notes ({selectedMessage.internalNotes?.length || 0})</button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8 no-scrollbar bg-gray-50/20">
                <AnimatePresence mode='wait'>
                  {activeTab === 'chat' ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                      {/* Original Message */}
                      <div className="flex flex-col items-start max-w-[85%]">
                        <div className="px-6 py-4 bg-white border border-gray-200 rounded-[2rem] rounded-tl-none shadow-sm">
                          <p className="text-[10px] font-black text-indigo-600 uppercase mb-2 flex items-center gap-2">
                            <User size={12} /> {selectedMessage.name} (Source)
                          </p>
                          <p className="text-xs font-bold text-gray-800 leading-relaxed uppercase tracking-tight">{selectedMessage.message}</p>
                          <p className="text-[8px] font-black text-gray-300 uppercase mt-2">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Replies */}
                      {selectedMessage.replies?.map((r, i) => (
                        <div key={i} className="flex flex-col items-end w-full">
                          <div className="max-w-[85%] px-6 py-4 bg-black text-white rounded-[2rem] rounded-tr-none shadow-xl border border-gray-800">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-2 flex items-center justify-end gap-2">
                              System Response <UserCheck size={12} className="text-blue-400" />
                            </p>
                            <p className="text-xs font-bold leading-relaxed uppercase tracking-tight">{r.message}</p>
                            <p className="text-[8px] font-black text-gray-500 uppercase mt-2 text-right">Sent by {r.adminId?.name || 'Admin'} • {new Date(r.sentAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      {selectedMessage.internalNotes?.map((n, i) => (
                        <div key={i} className="p-5 bg-amber-50 border border-amber-100 rounded-[1.5rem] relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-3 text-amber-200">
                            <StickyNote size={40} className="rotate-12 opacity-30" />
                          </div>
                          <p className="text-xs font-bold text-amber-900 uppercase tracking-tight relative z-10">{n.note}</p>
                          <div className="mt-3 flex items-center gap-2 relative z-10">
                            <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-[10px] font-black text-amber-700">A</div>
                            <p className="text-[9px] font-black text-amber-600 uppercase">{n.adminId?.name || 'Admin'} • {new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                      {(!selectedMessage.internalNotes || selectedMessage.internalNotes.length === 0) && (
                        <div className="py-20 text-center">
                          <StickyNote size={48} className="mx-auto text-gray-200 mb-2" />
                          <p className="text-[10px] font-black text-gray-400 uppercase">Private notes reside here. Only viewable by Ops team.</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer Inputs */}
              <div className="px-10 py-8 border-t border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => handleStatusChange(selectedMessage._id, 'in_progress')} className="text-[9px] font-black uppercase text-amber-600 hover:underline">Mark In Progress</button>
                    <button onClick={() => handleStatusChange(selectedMessage._id, 'resolved')} className="text-[9px] font-black uppercase text-green-600 hover:underline">Mark Resolved</button>
                    <button onClick={() => handleStatusChange(selectedMessage._id, 'closed')} className="text-[9px] font-black uppercase text-gray-400 hover:underline">Close Ticket</button>
                  </div>
                </div>

                <div className="relative">
                  {activeTab === 'chat' ? (
                    <>
                      <input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type official reply to sender..."
                        className="w-full pl-6 pr-32 py-4 bg-gray-50 border border-transparent rounded-2xl text-[11px] font-black uppercase focus:bg-white focus:border-black outline-none transition-all"
                      />
                      <button
                        onClick={handleReply}
                        disabled={submitting || !replyText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-black text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-2 hover:shadow-lg active:scale-95 disabled:opacity-50 transition-all"
                      >
                        {submitting ? <Loader2 className="animate-spin" size={14} /> : <><Send size={14} /> Send Reply</>}
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add internal coordination note..."
                        className="w-full pl-6 pr-32 py-4 bg-amber-50 border border-transparent rounded-2xl text-[11px] font-black uppercase focus:bg-white focus:border-amber-400 outline-none transition-all"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={submitting || !noteText.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-amber-600 text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-2 hover:shadow-lg active:scale-95 disabled:opacity-50 transition-all"
                      >
                        {submitting ? <Loader2 className="animate-spin" size={14} /> : <><StickyNote size={14} /> Add Note</>}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminContactMessages;
