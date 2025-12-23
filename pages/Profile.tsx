
import React, { useState, useMemo } from 'react';
import { User, Report, ReportStatus, Language, ReportCategory } from '../types.ts';
import { 
  User as UserIcon, Mail, Shield, Camera, Check, ArrowLeft, 
  RefreshCw, Fingerprint, History, Clock, CheckCircle2, 
  MapPin, Eye, X, Sparkles, ExternalLink, Info, Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { translations } from '../translations.ts';

// Added PUTTUR_WARDS constant to fix the "Cannot find name 'PUTTUR_WARDS'" error
const PUTTUR_WARDS = [
  "Darbe", "Bolwar", "Nehru Nagar", "Kombettu", "Kabaka", "Bannur", 
  "Court Road", "Parlane", "Vivekananda College Area", "Muraliya", 
  "Sampya", "Kemminje", "Padil", "Kodimbadi", "Other Area"
];

interface ProfileProps {
  user: User;
  reports: Report[];
  onUpdateUser: (user: User) => Promise<void>;
  currentLanguage: Language;
}

const Profile: React.FC<ProfileProps> = ({ user, reports, onUpdateUser, currentLanguage }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const navigate = useNavigate();
  const t = translations[currentLanguage];

  const userReports = useMemo(() => {
    return reports.filter(r => r.reportedBy === user.id).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reports, user.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    await onUpdateUser({
      ...user,
      name,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f97316&color=fff`
    });
    setIsUpdating(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    setAvatar(newAvatar);
  };

  const openInGoogleMaps = (location: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-surface-pearl dark:bg-slate-950 min-h-screen transition-colors duration-500">
      
      {/* Detailed Viewing Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-200 dark:border-slate-800 overflow-y-auto custom-scrollbar animate-slideUp">
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
              </div>
              <button onClick={() => setViewingReport(null)} className="p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">{viewingReport.title}</h2>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <MapPin size={14} className="text-rose-500" /> {viewingReport.location}
              </div>
              <button 
                onClick={() => openInGoogleMaps(viewingReport.location)}
                className="flex items-center gap-2 px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm"
              >
                <ExternalLink size={14} className="text-brand-500" /> Google Maps
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.contextDescription}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">{viewingReport.description}</p>
                {viewingReport.reportImage && (
                  <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-xl bg-slate-100 dark:bg-slate-950 mt-4">
                    <img src={viewingReport.reportImage} alt="Evidence" className="w-full h-auto object-cover max-h-48" />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-accent-500 uppercase tracking-widest">{t.aiAudit}</h4>
                <div className="p-6 bg-accent-500/5 border border-accent-500/10 rounded-[2rem] italic">
                  <Sparkles size={18} className="text-accent-500 mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                    "{viewingReport.aiAnalysis || "Analysis pending..."}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-500/5 blur-[120px] rounded-full animate-float-slow"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-accent-500/5 blur-[100px] rounded-full animate-float-medium"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-40 pb-20 relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-slate-400 hover:text-brand-600 font-black text-[10px] uppercase tracking-[0.3em] mb-12 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 transition-colors shadow-sm">
            <ArrowLeft size={18} />
          </div>
          {t.returnPortal}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Settings Section */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden unique-card-shadow flex flex-col">
            <div className="h-40 bg-gradient-to-r from-brand-600 to-accent-600 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
            </div>

            <div className="relative px-8 md:px-12 pb-12 -mt-20">
              <div className="relative group mb-8 flex flex-col items-center">
                <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 border-8 border-white dark:border-slate-900 shadow-2xl overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt={name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <UserIcon size={48} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={handleRandomAvatar}
                  className="absolute -bottom-2 right-1/2 translate-x-12 p-3 bg-brand-500 text-white rounded-2xl shadow-xl hover:bg-brand-600 transition-all active:scale-90 border-4 border-white dark:border-slate-900"
                  title="Randomize Avatar"
                >
                  <RefreshCw size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                    <div className="flex items-center gap-2">
                      <UserIcon size={14} className="text-brand-500" /> {t.fullName}
                    </div>
                  </label>
                  <input
                    type="text" 
                    required
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                    <div className="flex items-center gap-2">
                      <Camera size={14} className="text-accent-500" /> Avatar Identity (URL)
                    </div>
                  </label>
                  <input
                    type="url" 
                    value={avatar} 
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white font-bold outline-none focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 transition-all"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div className="space-y-3 opacity-60">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">
                    <div className="flex items-center gap-2">
                      <Mail size={14} /> {t.emailAddress}
                    </div>
                  </label>
                  <div className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 border border-transparent rounded-2xl text-slate-500 font-bold flex items-center gap-3">
                    {user.email}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${
                    isSaved 
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                    : 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-500/20'
                  }`}
                >
                  {isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : isSaved ? (
                    <><Check size={20} /> {t.detailsUpdated}</>
                  ) : (
                    <><Check size={20} /> {t.saveChanges}</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Submission History Section */}
          <div className="lg:col-span-7 space-y-10">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-500/10 text-accent-500 rounded-2xl flex items-center justify-center border border-accent-500/20">
                  <History size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t.pastReports}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Managed Digital Registry</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {userReports.length} {userReports.length === 1 ? 'Record' : 'Records'}
              </div>
            </div>

            <div className="space-y-4">
              {userReports.length === 0 ? (
                <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] p-20 border border-dashed border-slate-200 dark:border-white/10 text-center flex flex-col items-center gap-6 animate-fadeIn">
                   <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-300">
                      <Info size={32} />
                   </div>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.noReportsFound}</p>
                   <button 
                     onClick={() => navigate('/dashboard/public')}
                     className="px-8 py-3 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 transition-all shadow-lg"
                   >
                     File Your First Report
                   </button>
                </div>
              ) : (
                userReports.map((report) => (
                  <div 
                    key={report.id}
                    onClick={() => setViewingReport(report)}
                    className="group bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden flex flex-col sm:flex-row items-center gap-6"
                  >
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden shrink-0 border border-slate-100 dark:border-white/5">
                      {report.reportImage ? (
                        <img src={report.reportImage} alt="Report" className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>

                    <div className="flex-grow text-center sm:text-left min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-black text-slate-900 dark:text-white text-lg tracking-tight truncate pr-4">{report.title}</h3>
                        <div className={`px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit mx-auto sm:mx-0 ${
                          report.status === ReportStatus.RESOLVED ? 'bg-emerald-500/10 text-emerald-500' :
                          report.status === ReportStatus.IN_PROGRESS ? 'bg-blue-500/10 text-blue-500' :
                          'bg-amber-500/10 text-amber-500'
                        }`}>
                          {t[report.status as ReportStatus] || report.status}
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <div className="flex items-center gap-1.5"><MapPin size={12} className="text-rose-500" /> {PUTTUR_WARDS.find(w => report.location.includes(w)) || "Puttur"}</div>
                         <div className="flex items-center gap-1.5"><Clock size={12} className="text-accent-500" /> {new Date(report.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 text-[10px] font-black text-brand-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                      {t.viewDetails} <Eye size={16} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
