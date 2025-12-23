
import React, { useState, useRef } from 'react';
import { User, Report, ReportCategory, ReportStatus, PriorityLevel, Language } from '../types.ts';
import { Plus, Send, MapPin, Search, Filter, Clock, CheckCircle2, AlertCircle, X, Building, Camera, UploadCloud, Eye, Sparkles, Map as MapIcon, List, Info, ChevronRight, ExternalLink, Tag, Image as ImageIcon, User as UserIcon } from 'lucide-react';
import { analyzeReport } from '../services/geminiService.ts';
import { translations } from '../translations.ts';
import GrievanceMap from '../components/GrievanceMap.tsx';

const PUTTUR_WARDS = [
  "Darbe", "Bolwar", "Nehru Nagar", "Kombettu", "Kabaka", "Bannur", 
  "Court Road", "Parlane", "Vivekananda College Area", "Muraliya", 
  "Sampya", "Kemminje", "Padil", "Kodimbadi", "Other Area"
];

interface PublicDashboardProps {
  user: User;
  reports: Report[];
  addReport: (r: Report) => void;
  removeReport: (id: string) => void;
  currentLanguage: Language;
}

const PublicDashboard: React.FC<PublicDashboardProps> = ({ user, reports, addReport, removeReport, currentLanguage }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedMapWard, setSelectedMapWard] = useState<string | 'ALL'>('ALL');
  const [selectedMapStatus, setSelectedMapStatus] = useState<ReportStatus | 'ALL'>('ALL');
  const [selectedMapCategory, setSelectedMapCategory] = useState<ReportCategory | 'ALL'>('ALL');
  
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ReportCategory.WASTE,
    ward: PUTTUR_WARDS[0],
    landmark: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[currentLanguage];

  // CHANGED: No longer filtering by user.id to ensure global visibility
  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showFeedback('error', 'Evidence rejected: Image size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
        showFeedback('success', 'Image evidence attached successfully.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.landmark.trim()) {
      showFeedback('error', 'Missing critical data. Please complete the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      const aiAnalysisResult = await analyzeReport(formData.title, formData.description);
      const locationString = `${formData.landmark}, ${formData.ward}, Puttur`;

      const newReport: Report = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: locationString,
        status: ReportStatus.PENDING,
        reportedBy: user.id,
        reportedByName: user.name,
        createdAt: new Date().toISOString(),
        severity: aiAnalysisResult.severity,
        priority: aiAnalysisResult.priority as PriorityLevel,
        aiAnalysis: `[Priority: ${aiAnalysisResult.priority}] ${aiAnalysisResult.summary}`,
        reportImage: formData.image
      };

      await addReport(newReport);
      setFormData({
        title: '', description: '', category: ReportCategory.WASTE,
        ward: PUTTUR_WARDS[0], landmark: '', image: ''
      });
      setIsReporting(false);
      showFeedback('success', 'Grievance dispatched to Public Registry.');
    } catch (err) {
      showFeedback('error', 'Transmission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openInGoogleMaps = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  const handleReportAction = (report: Report) => {
    setViewingReport(report);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-32 animate-fadeIn relative">
        {feedback && (
          <div className={`fixed top-28 right-8 z-[110] p-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-slideInRight border backdrop-blur-xl ${
            feedback.type === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400' : 'bg-rose-950/80 border-rose-500/30 text-rose-400'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={22} /> : <AlertCircle size={22} />}
            <span className="font-black text-xs uppercase tracking-widest">{feedback.message}</span>
            <button onClick={() => setFeedback(null)} className="ml-4 p-1 hover:bg-white/10 rounded-lg">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Detailed Viewing Modal */}
        {viewingReport && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
            <div className="bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-800 overflow-y-auto custom-scrollbar animate-slideUp">
              <div className="flex justify-between items-start mb-8">
                <div className="flex flex-col gap-2">
                  <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 border w-fit ${
                    viewingReport.status === ReportStatus.RESOLVED ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    viewingReport.status === ReportStatus.IN_PROGRESS ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                    'bg-amber-500/10 border-amber-500/20 text-amber-500'
                  }`}>
                    <Clock size={16} />
                    {t[viewingReport.status as ReportStatus] || viewingReport.status}
                  </div>
                  {viewingReport.reportedBy === user.id && (
                    <span className="px-3 py-1 bg-brand-500/20 text-brand-500 text-[8px] font-black uppercase tracking-widest rounded-lg border border-brand-500/30 w-fit">Your Submission</span>
                  )}
                </div>
                <button onClick={() => setViewingReport(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <h2 className="text-3xl font-black text-white mb-6 tracking-tight leading-tight">{viewingReport.title}</h2>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <MapPin size={14} className="text-rose-500" /> {viewingReport.location}
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <UserIcon size={14} className="text-accent-500" /> Reported By: {viewingReport.reportedByName}
                  </div>
                </div>
                <button 
                  onClick={() => openInGoogleMaps(viewingReport.location)}
                  className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl"
                >
                  <ExternalLink size={14} className="text-brand-500" /> Open in Google Maps
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.contextDescription}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed font-medium">{viewingReport.description}</p>
                  {viewingReport.reportImage && (
                    <div className="rounded-3xl overflow-hidden border border-white/5 shadow-xl bg-slate-950 mt-4">
                      <img src={viewingReport.reportImage} alt="Evidence" className="w-full h-auto object-cover max-h-48" />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-accent-500 uppercase tracking-widest">{t.aiAudit}</h4>
                  <div className="p-6 bg-accent-500/5 border border-accent-500/10 rounded-[2rem] italic">
                    <Sparkles size={18} className="text-accent-500 mb-3" />
                    <p className="text-sm text-slate-300 font-medium leading-relaxed">
                      "{viewingReport.aiAnalysis || "Analysis pending..."}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-500 text-[9px] font-black uppercase trackingest mb-4">
              <Building size={12} /> Public Accountability Portal
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-4">
              Public <span className="text-brand-500">Registry.</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Logged in as: <span className="text-slate-200">{user.name}</span></p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-900 p-1.5 rounded-2xl flex border border-white/5">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                title="List View"
              >
                <List size={20} />
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`p-3.5 rounded-xl transition-all ${viewMode === 'map' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                title="Map View"
              >
                <MapIcon size={20} />
              </button>
            </div>
            <button
              onClick={() => setIsReporting(!isReporting)}
              className={`px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-3 shadow-2xl active:scale-95 ${
                isReporting ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/20'
              }`}
            >
              {isReporting ? <X size={18} /> : <Plus size={18} />}
              {isReporting ? t.dismissBtn : t.fileReportBtn}
            </button>
          </div>
        </div>

        {isReporting && (
          <div className="bg-slate-900/50 rounded-[3rem] border border-white/5 p-8 md:p-12 mb-20 animate-slideDown relative overflow-hidden backdrop-blur-xl">
            <h2 className="text-2xl font-black text-white mb-12 flex items-center gap-4">
              <UploadCloud size={24} className="text-brand-500" />
              File a Public Report
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">{t.incidentHeadline}</label>
                  <input
                    type="text" required value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full px-6 py-5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold text-white placeholder:text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">{t.department}</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as ReportCategory})}
                      className="w-full px-6 py-5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-black text-slate-300 appearance-none cursor-pointer"
                    >
                      {Object.values(ReportCategory).map(cat => (
                        <option key={cat} value={cat}>{t[cat as ReportCategory] || cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">{t.jurisdictionWard}</label>
                    <select
                      value={formData.ward}
                      onChange={e => setFormData({...formData, ward: e.target.value})}
                      className="w-full px-6 py-5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-black text-slate-300 appearance-none cursor-pointer"
                    >
                      {PUTTUR_WARDS.map(ward => (<option key={ward} value={ward}>{ward}</option>))}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">{t.landmark}</label>
                  <input
                    type="text" required value={formData.landmark}
                    onChange={e => setFormData({...formData, landmark: e.target.value})}
                    className="w-full px-6 py-5 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold text-white placeholder:text-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">{t.contextDescription}</label>
                  <textarea
                    required rows={4} value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-5 bg-slate-950 border border-slate-800 rounded-3xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-medium text-white resize-none h-40 placeholder:text-slate-800"
                  ></textarea>
                </div>
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] ml-1">{t.visualEvidence}</label>
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 rounded-3xl border-2 border-dashed border-slate-800 hover:border-brand-500 bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition-all">
                    {formData.image ? <img src={formData.image} className="w-full h-full object-cover rounded-3xl" /> : <ImageIcon size={20} className="m-auto mt-3.5 text-slate-600" />}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-brand-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] hover:bg-brand-500 transition-all flex items-center justify-center gap-4">
                  {isSubmitting ? t.transmitting : t.transmitData} <Send size={18} />
                </button>
              </div>
            </form>
            <p className="mt-6 text-[10px] font-black text-slate-600 uppercase tracking-widest text-center italic">All reports filed on this portal are public records accessible to all residents of Puttur.</p>
          </div>
        )}

        {viewMode === 'list' ? (
          <div className="bg-slate-900/30 rounded-[3rem] border border-white/5 overflow-hidden backdrop-blur-sm shadow-2xl animate-fadeIn">
            <div className="p-10 border-b border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Puttur Municipal Registry</h2>
              <div className="relative min-w-[300px]">
                <input 
                  type="text" 
                  placeholder={t.searchEntries} 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] font-black outline-none focus:ring-4 focus:ring-brand-500/10 text-white" 
                />
                <Search size={18} className="absolute left-5 top-4.5 text-slate-800" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-slate-600 text-[9px] font-black uppercase tracking-[0.4em]">
                  <tr>
                    <th className="px-10 py-8">{t.protocolStatus}</th>
                    <th className="px-10 py-8">{t.evidenceTitle}</th>
                    <th className="px-10 py-8">Reporter</th>
                    <th className="px-10 py-8">{t.department}</th>
                    <th className="px-10 py-8 text-right">{t.ops}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredReports.length === 0 ? (
                    <tr><td colSpan={5} className="px-10 py-32 text-center text-slate-700 font-black uppercase tracking-widest text-xs">{t.registryVoid}</td></tr>
                  ) : (
                    filteredReports.map(report => (
                      <tr key={report.id} className="group hover:bg-white/[0.02] cursor-pointer" onClick={() => handleReportAction(report)}>
                        <td className="px-10 py-8">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${report.status === ReportStatus.RESOLVED ? 'text-emerald-500' : report.status === ReportStatus.IN_PROGRESS ? 'text-blue-500' : 'text-amber-500'}`}>
                            {t[report.status as ReportStatus] || report.status}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                              {report.reportImage ? <img src={report.reportImage} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="m-auto mt-3.5 text-slate-600" />}
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-black text-white">{report.title}</span>
                              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{report.location}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex flex-col gap-1">
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{report.reportedByName}</span>
                             {report.reportedBy === user.id && (
                               <span className="text-[8px] font-black text-brand-500 uppercase tracking-widest">You</span>
                             )}
                           </div>
                        </td>
                        <td className="px-10 py-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">{t[report.category as ReportCategory] || report.category}</td>
                        <td className="px-10 py-8 text-right"><Eye size={20} className="text-slate-700 hover:text-white inline-block" /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Map Sidebar Filters */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-slate-900/50 rounded-[2.5rem] p-8 border border-white/5 backdrop-blur-xl h-full space-y-10">
                
                {/* Ward Filter */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin size={16} className="text-brand-500" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Ward Grid</h3>
                  </div>
                  <div className="space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                    <button 
                      onClick={() => setSelectedMapWard('ALL')}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedMapWard === 'ALL' ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                      Entire City
                    </button>
                    {PUTTUR_WARDS.map(ward => (
                      <button 
                        key={ward}
                        onClick={() => setSelectedMapWard(ward)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedMapWard === ward ? 'bg-brand-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}
                      >
                        {ward}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Clock size={16} className="text-accent-500" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Fix Status</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => setSelectedMapStatus('ALL')}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedMapStatus === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                      All Phases
                    </button>
                    {Object.values(ReportStatus).map(status => (
                      <button 
                        key={status}
                        onClick={() => setSelectedMapStatus(status)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${selectedMapStatus === status ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                      >
                        <div className={`w-2 h-2 rounded-full ${status === ReportStatus.RESOLVED ? 'bg-emerald-500' : status === ReportStatus.IN_PROGRESS ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                        {t[status as ReportStatus] || status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Tag size={16} className="text-emerald-500" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Issue Category</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button 
                      onClick={() => setSelectedMapCategory('ALL')}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedMapCategory === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                    >
                      All Departments
                    </button>
                    {Object.values(ReportCategory).map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedMapCategory(cat)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${selectedMapCategory === cat ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-white/5'}`}
                      >
                        {t[cat as ReportCategory] || cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-white/5">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
                     Showing {reports.filter(r => (selectedMapWard === 'ALL' || r.location.includes(selectedMapWard)) && (selectedMapStatus === 'ALL' || r.status === selectedMapStatus) && (selectedMapCategory === 'ALL' || r.category === selectedMapCategory)).length} markers based on filters.
                   </p>
                </div>
              </div>
            </div>

            {/* Accurate Geographic Map Component */}
            <div className="lg:col-span-9 relative bg-slate-900 rounded-[3.5rem] border border-white/5 overflow-hidden group shadow-2xl min-h-[600px]">
              <GrievanceMap 
                reports={reports}
                selectedWard={selectedMapWard}
                selectedStatus={selectedMapStatus}
                selectedCategory={selectedMapCategory}
                focusedReport={viewingReport}
                onMarkerClick={(r) => setViewingReport(r)}
                className="w-full h-full"
              />
              
              {/* Map Information Overlay */}
              <div className="absolute bottom-10 left-10 p-6 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-10 pointer-events-none">
                <div className="flex items-center gap-3 text-slate-400 mb-2">
                  <Info size={14} className="text-brand-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Live Spatial Registry</span>
                </div>
                <p className="text-xs font-bold text-white">Multi-dimensional filtering active.</p>
              </div>

              {/* Map Branding */}
              <div className="absolute top-10 right-10 z-10">
                 <div className="px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3">
                    <MapPin size={16} className="text-brand-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Puttur Municipal Grid</span>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicDashboard;
