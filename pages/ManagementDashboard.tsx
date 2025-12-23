
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Report, ReportStatus, User, UserRole, PriorityLevel, ReportCategory, Language, AppNotification } from '../types.ts';
import { 
  LayoutGrid, List, MapPin, User as UserIcon, Clock, CheckCircle, 
  Play, CheckCircle2, ShieldAlert, Sparkles,
  Tag, Calendar, FileText, Info, Lock, X, Bell, BellRing, History, 
  ArrowDownWideNarrow, Eye, ArrowRight, Camera, Image as ImageIcon, 
  Trash2, ExternalLink, ChevronRight, Verified, ShieldCheck, Award, 
  CheckSquare, Square, Layers, AlertTriangle, RefreshCw, Download,
  Activity, TrendingUp, AlertCircle, Briefcase, Filter, Loader2
} from 'lucide-react';
import { translations } from '../translations.ts';

interface ManagementDashboardProps {
  user: User;
  reports: Report[];
  updateStatus: (id: string, status: ReportStatus, note?: string, resolutionImage?: string) => void;
  currentLanguage: Language;
}

const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ user, reports, updateStatus, currentLanguage }) => {
  const [filter, setFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'DATE' | 'PRIORITY'>('DATE');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionImage, setResolutionImage] = useState('');
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const t = translations[currentLanguage];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const priorityOrder: Record<string, number> = {
    [PriorityLevel.CRITICAL]: 0,
    [PriorityLevel.HIGH]: 1,
    [PriorityLevel.MEDIUM]: 2,
    [PriorityLevel.LOW]: 3,
  };

  const stats = useMemo(() => ({
    pending: reports.filter(r => r.status === ReportStatus.PENDING).length,
    critical: reports.filter(r => r.priority === PriorityLevel.CRITICAL && r.status !== ReportStatus.RESOLVED).length,
    solvedToday: reports.filter(r => r.status === ReportStatus.RESOLVED && new Date(r.createdAt).toDateString() === new Date().toDateString()).length,
    efficiency: reports.length ? Math.round((reports.filter(r => r.status === ReportStatus.RESOLVED).length / reports.length) * 100) : 0
  }), [reports]);

  useEffect(() => {
    const alerts: AppNotification[] = reports
      .filter(r => r.status === ReportStatus.PENDING && (r.priority === PriorityLevel.CRITICAL || r.priority === PriorityLevel.HIGH))
      .map(r => ({
        id: `notif-${r.id}`,
        title: `Priority Alert: Case #${r.id.slice(0, 4)}`,
        message: `${r.title} requires action.`,
        type: 'alert',
        timestamp: r.createdAt,
        read: false,
        relatedReportId: r.id
      }));
    setNotifications(alerts);
  }, [reports]);

  const filteredAndSortedReports = useMemo(() => {
    let result = reports.filter(r => {
      const statusMatch = filter === 'ALL' || r.status === filter;
      const catMatch = categoryFilter === 'ALL' || r.category === categoryFilter;
      return statusMatch && catMatch;
    });

    if (sortBy === 'PRIORITY') {
      result.sort((a, b) => (priorityOrder[a.priority || 'Medium'] || 4) - (priorityOrder[b.priority || 'Medium'] || 4));
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [reports, filter, categoryFilter, sortBy]);

  const toggleAll = () => {
    if (selectedIds.size === filteredAndSortedReports.length && filteredAndSortedReports.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedReports.map(r => r.id)));
    }
  };

  const toggleId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setResolutionNote(report.resolutionNote || '');
    setResolutionImage(report.resolutionImage || '');
  };

  const handleUpdate = async (status: ReportStatus) => {
    if (!selectedReport) return;
    updateStatus(selectedReport.id, status, status === ReportStatus.RESOLVED ? resolutionNote : undefined, status === ReportStatus.RESOLVED ? resolutionImage : undefined);
    setSelectedReport(null);
  };

  const handleBulkUpdate = async (status: ReportStatus) => {
    setIsBulkProcessing(true);
    // Add a small artificial delay for UX feel of "processing"
    await new Promise(resolve => setTimeout(resolve, 800));
    
    for (const id of selectedIds) {
      updateStatus(
        id, 
        status, 
        status === ReportStatus.RESOLVED ? "Bulk resolved via management portal." : undefined
      );
    }
    
    setSelectedIds(new Set());
    setIsBulkProcessing(false);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-40 pb-20">
      <div className="max-w-[1600px] mx-auto px-8">
        
        {/* TOP STATUS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[{ label: "Backlog", val: stats.pending, icon: <Clock />, color: "amber" }, 
            { label: "Critical", val: stats.critical, icon: <AlertCircle />, color: "rose" },
            { label: "Resolved Today", val: stats.solvedToday, icon: <CheckCircle />, color: "emerald" },
            { label: "Performance", val: stats.efficiency + "%", icon: <TrendingUp />, color: "blue" }
          ].map((s, i) => (
            <div key={i} className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm border-l-4 border-l-${s.color}-500`}>
              <div className="flex items-center gap-3 text-slate-400 mb-3 uppercase font-black text-[10px] tracking-widest">
                <span className={`text-${s.color}-500`}>{s.icon}</span> {s.label}
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white">{s.val}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start relative">
          
          {/* BULK ACTION FLOATING BAR */}
          {selectedIds.size > 0 && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 dark:bg-slate-800 text-white px-10 py-6 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/10 flex items-center gap-10 animate-slideUp backdrop-blur-2xl">
              <div className="flex items-center gap-4 pr-10 border-r border-white/10">
                <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center text-xs font-black shadow-xl shadow-brand-500/20">
                  {isBulkProcessing ? <Loader2 size={16} className="animate-spin" /> : selectedIds.size}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Registry Items</span>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ready for protocol</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  disabled={isBulkProcessing}
                  onClick={() => handleBulkUpdate(ReportStatus.IN_PROGRESS)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95"
                >
                  <Play size={16} /> In Progress
                </button>
                <button 
                  disabled={isBulkProcessing}
                  onClick={() => handleBulkUpdate(ReportStatus.RESOLVED)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95"
                >
                  <CheckCircle2 size={16} /> Resolve
                </button>
                <button 
                  disabled={isBulkProcessing}
                  onClick={() => handleBulkUpdate(ReportStatus.PENDING)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95"
                >
                  <Clock size={16} /> Stall
                </button>
              </div>

              <div className="h-10 w-px bg-white/5"></div>

              <button 
                onClick={() => setSelectedIds(new Set())}
                className="p-3 hover:bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"
                title="Deselect All"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {/* LIST VIEW */}
          <div className="xl:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 flex justify-between items-center shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={toggleAll} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all group">
                  {selectedIds.size === filteredAndSortedReports.length && filteredAndSortedReports.length > 0 
                    ? <CheckSquare className="text-brand-500" /> 
                    : <Square className="text-slate-300 group-hover:text-brand-500/50" />
                  }
                </button>
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                  {['ALL', ReportStatus.PENDING, ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setFilter(s as any)} 
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        filter === s 
                        ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-md' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      {s === 'ALL' ? 'Everything' : s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <button onClick={() => setSortBy(sortBy === 'DATE' ? 'PRIORITY' : 'DATE')} className="px-5 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">
                   <ArrowDownWideNarrow size={16} className="text-brand-500" /> {sortBy}
                 </button>
                 <button className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-500 hover:text-brand-500 transition-all shadow-sm relative" onClick={() => setShowNotifications(!showNotifications)}>
                    <Bell size={20} className={unreadCount > 0 ? "animate-bounce text-brand-500" : ""} />
                    {unreadCount > 0 && <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-500 border-2 border-white dark:border-slate-800 rounded-full"></span>}
                 </button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm max-h-[70vh] overflow-y-auto custom-scrollbar">
               {filteredAndSortedReports.length === 0 ? (
                 <div className="p-32 text-center flex flex-col items-center gap-6 opacity-40">
                   <Layers size={64} className="text-slate-300" />
                   <p className="text-xs font-black uppercase tracking-[0.4em]">No matching records</p>
                 </div>
               ) : (
                 filteredAndSortedReports.map(report => (
                   <div key={report.id} onClick={() => handleSelectReport(report)} className={`p-8 border-b border-slate-50 dark:border-white/[0.02] cursor-pointer flex items-center gap-8 group transition-all ${selectedReport?.id === report.id ? 'bg-brand-50/50 dark:bg-brand-500/[0.03]' : 'hover:bg-slate-50/50 dark:hover:bg-white/[0.01]'}`}>
                      <button onClick={(e) => toggleId(report.id, e)} className="shrink-0 p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-2xl transition-all">
                         {selectedIds.has(report.id) ? <CheckSquare className="text-brand-500" /> : <Square className="text-slate-200" />}
                      </button>
                      <div className="flex-grow min-w-0">
                         <div className="flex items-center gap-3 mb-2.5">
                            <span className="text-[10px] font-black bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2 py-0.5 rounded-md">#{report.id.slice(0, 4).toUpperCase()}</span>
                            <h3 className="font-black text-lg text-slate-900 dark:text-white truncate">{report.title}</h3>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                              report.priority === PriorityLevel.CRITICAL 
                              ? 'bg-rose-500 text-white animate-pulse' 
                              : report.priority === PriorityLevel.HIGH
                              ? 'bg-orange-500/10 text-orange-500'
                              : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                            }`}>
                              {report.priority || 'Medium'}
                            </span>
                         </div>
                         <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span className="flex items-center gap-2"><MapPin size={12} className="text-rose-500" /> {report.location.split(',')[1]?.trim() || "Local Area"}</span>
                            <span className="flex items-center gap-2"><Tag size={12} className="text-brand-500" /> {report.category}</span>
                            <span className="flex items-center gap-2"><Calendar size={12} /> {new Date(report.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                      <div className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shrink-0 transition-all ${
                        report.status === ReportStatus.RESOLVED 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' 
                        : report.status === ReportStatus.IN_PROGRESS
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                      }`}>
                         {report.status}
                      </div>
                      <ChevronRight size={18} className="text-slate-200 group-hover:translate-x-1 transition-transform group-hover:text-brand-500" />
                   </div>
                 ))
               )}
            </div>
          </div>

          {/* INSPECTION VIEW */}
          <div className="xl:col-span-4">
            {selectedReport ? (
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-white/5 shadow-2xl animate-fadeIn sticky top-40 max-h-[80vh] overflow-y-auto custom-scrollbar">
                 <div className="flex justify-between items-start mb-10">
                    <div className="space-y-2">
                       <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{selectedReport.title}</h2>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational ID: {selectedReport.id.toUpperCase()}</p>
                    </div>
                    <button onClick={() => setSelectedReport(null)} className="p-4 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-[1.5rem] transition-all"><X size={20} /></button>
                 </div>

                 <div className="space-y-10">
                    <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-white/5 grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol Origin</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate flex items-center gap-2"><UserIcon size={12} className="text-brand-500" /> {selectedReport.reportedByName}</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Zone Identification</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate flex items-center gap-2"><MapPin size={12} className="text-rose-500" /> {selectedReport.location}</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileText size={14} className="text-slate-300" /> Field Intelligence</h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{selectedReport.description}</p>
                       {selectedReport.reportImage && (
                        <div className="group relative rounded-[2rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-inner bg-slate-900">
                          <img src={selectedReport.reportImage} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-1000" alt="Field Proof" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                            <span className="text-[8px] font-black text-white uppercase tracking-widest">Primary Evidence Capture</span>
                          </div>
                        </div>
                       )}
                    </div>

                    {selectedReport.status !== ReportStatus.RESOLVED && (
                      <div className="space-y-8 pt-8 border-t border-slate-100 dark:border-white/5">
                         <div className="grid grid-cols-2 gap-4">
                            <button 
                              onClick={() => handleUpdate(ReportStatus.IN_PROGRESS)} 
                              className="py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 active:scale-95 hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
                            >
                              <Play size={16} /> Mark Start
                            </button>
                            <button 
                              onClick={() => handleUpdate(ReportStatus.PENDING)} 
                              className="py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                            >
                              Move to Stalled
                            </button>
                         </div>
                         
                         <div className="space-y-5 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] p-8 rounded-[2.5rem] border border-emerald-500/10 shadow-inner">
                            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Final Resolution Protocol</h4>
                            <textarea 
                              value={resolutionNote} 
                              onChange={e => setResolutionNote(e.target.value)}
                              placeholder="Deployment summary & corrective actions taken..." 
                              className="w-full p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all min-h-[120px] dark:text-white"
                            />
                            <div 
                              onClick={() => fileInputRef.current?.click()} 
                              className="w-full h-40 bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] transition-all overflow-hidden relative group"
                            >
                               {resolutionImage ? (
                                 <img src={resolutionImage} className="w-full h-full object-cover" />
                               ) : (
                                 <>
                                   <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors shadow-sm mb-3">
                                      <Camera size={24} />
                                   </div>
                                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Attach Redressal Proof</span>
                                 </>
                               )}
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f){ const r = new FileReader(); r.onloadend = () => setResolutionImage(r.result as string); r.readAsDataURL(f); } }} />
                            <button 
                              onClick={() => handleUpdate(ReportStatus.RESOLVED)} 
                              disabled={!resolutionNote.trim()} 
                              className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-emerald-500/20 active:scale-95 hover:bg-emerald-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                              <ShieldCheck size={18} /> Close & Seal Registry
                            </button>
                         </div>
                      </div>
                    )}

                    {selectedReport.status === ReportStatus.RESOLVED && (
                      <div className="p-8 bg-emerald-500/[0.05] rounded-[2.5rem] border border-emerald-500/10 shadow-inner">
                         <div className="flex items-center gap-3 text-emerald-500 mb-6">
                            <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white">
                               <CheckCircle2 size={24} />
                            </div>
                            <div>
                               <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">Protocol Verified</span>
                               <p className="text-[8px] font-bold text-emerald-600/60 uppercase tracking-widest mt-1">Registry Closed Successfully</p>
                            </div>
                         </div>
                         <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl mb-6 shadow-sm">
                            <p className="text-sm italic font-medium text-emerald-800 dark:text-emerald-300 leading-relaxed">"{selectedReport.resolutionNote}"</p>
                         </div>
                         {selectedReport.resolutionImage && (
                          <div className="rounded-2xl overflow-hidden shadow-xl border border-emerald-500/10">
                            <img src={selectedReport.resolutionImage} className="rounded-xl w-full h-auto object-cover" />
                          </div>
                         )}
                      </div>
                    )}
                 </div>
              </div>
            ) : (
              <div className="h-[60vh] border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-slate-300 p-12 text-center bg-white/[0.01]">
                 <div className="w-24 h-24 bg-slate-50 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                    <Briefcase size={40} className="opacity-20" />
                 </div>
                 <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Audit Standby</h3>
                 <p className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest max-w-[200px] leading-relaxed">Select a report from the registry to initiate inspection protocol</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckSquare = ({ className, size = 20 }: { className?: string, size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>;
const Square = ({ className, size = 20 }: { className?: string, size?: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2"/></svg>;

export default ManagementDashboard;
