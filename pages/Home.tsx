
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Report, ReportStatus, Announcement, User, UserRole, Language, ReportCategory } from '../types.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { 
  CheckCircle, LayoutDashboard, Image as ImageIcon, ArrowUpRight, Info, X, Trash2, Camera, Megaphone, 
  Droplets, Trash, HardHat, AlertCircle, Sparkles, Loader2, ShieldCheck, ChevronRight, Calendar, 
  Eye, Send, User as UserIcon, MapPin, Award, History, Verified, Building, Rocket, Workflow, 
  Shield, Map as MapIcon, Plus, UploadCloud, Users, ArrowRight, Star, Heart
} from 'lucide-react';
import { translations } from '../translations.ts';
import { GoogleGenAI } from "@google/genai";
import GrievanceMap from '../components/GrievanceMap.tsx';

interface HomeProps {
  reports: Report[];
  announcements: Announcement[];
  user: User | null;
  onAddAnnouncement: (a: Announcement) => Promise<void>;
  onDeleteAnnouncement: (id: string) => Promise<void>;
  currentLanguage: Language;
}

const Home: React.FC<HomeProps> = ({ reports, announcements, user, onAddAnnouncement, onDeleteAnnouncement, currentLanguage }) => {
  const navigate = useNavigate();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isManagingAnnouncements, setIsManagingAnnouncements] = useState(false);
  const [newAnnouncementImage, setNewAnnouncementImage] = useState<string | null>(null);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementDesc, setNewAnnouncementDesc] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [selectedSuccessStory, setSelectedSuccessStory] = useState<Report | null>(null);
  
  const [infoModal, setInfoModal] = useState<'ABOUT' | 'PROCESS' | 'VISION' | 'SECURITY' | null>(null);

  const t = translations[currentLanguage];
  
  const solvedReports = reports.filter(r => r.status === ReportStatus.RESOLVED);
  const solvedCount = solvedReports.length;
  const pendingCount = reports.filter(r => r.status === ReportStatus.PENDING).length;
  const activeCount = reports.filter(r => r.status === ReportStatus.IN_PROGRESS).length;

  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR || user?.role === UserRole.VIEWER;
  const canModifyAnnouncements = user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR;

  // Calculate "Civic Heroes" - people with most solved reports
  const civicHeroes = useMemo(() => {
    const counts: Record<string, { name: string, count: number, avatar?: string }> = {};
    solvedReports.forEach(r => {
      if (!counts[r.reportedBy]) {
        counts[r.reportedBy] = { name: r.reportedByName, count: 0 };
      }
      counts[r.reportedBy].count += 1;
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [solvedReports]);

  useEffect(() => {
    const latest = announcements[0];
    if (latest && latest.isActive) {
      const hasSeenId = sessionStorage.getItem('lastAnnouncementId');
      if (latest.id !== hasSeenId) {
        setSelectedAnnouncement(latest);
      }
    }
  }, [announcements]);

  const closeAnnouncementPopup = () => {
    if (selectedAnnouncement) {
      sessionStorage.setItem('lastAnnouncementId', selectedAnnouncement.id);
    }
    setSelectedAnnouncement(null);
  };

  const handleAiGenerate = async () => {
    if (!newAnnouncementTitle.trim()) {
      alert("Please enter a headline.");
      return;
    }

    setIsGeneratingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              text: `A professional municipal announcement banner for Puttur city. Theme: "${newAnnouncementTitle}". High-quality, cinematic photography style. 16:9 aspect ratio. No text in image.`,
            },
          ],
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setNewAnnouncementImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      alert("AI recalibrating.");
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleUpload = async () => {
    if (!newAnnouncementTitle || !newAnnouncementImage) return;
    setIsUploading(true);
    const ann: Announcement = {
      id: Math.random().toString(36).substr(2, 9),
      imageUrl: newAnnouncementImage,
      title: newAnnouncementTitle,
      description: newAnnouncementDesc,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    await onAddAnnouncement(ann);
    setNewAnnouncementImage(null);
    setNewAnnouncementTitle('');
    setNewAnnouncementDesc('');
    setIsUploading(false);
  };

  const statsData = [
    { name: t[ReportStatus.PENDING], value: pendingCount, color: '#f97316' }, 
    { name: t[ReportStatus.IN_PROGRESS], value: activeCount, color: '#3b82f6' }, 
    { name: t[ReportStatus.RESOLVED], value: solvedCount, color: '#10b981' }, 
  ];

  const categoryData = reports.reduce((acc: any[], report) => {
    const categoryName = t[report.category as keyof typeof t] || report.category;
    const existing = acc.find(item => item.name === categoryName);
    if (existing) { existing.value += 1; } else { acc.push({ name: categoryName, value: 1 }); }
    return acc;
  }, []);

  const COLORS = ['#f97316', '#3b82f6', '#fb923c', '#60a5fa', '#ea580c', '#2563eb'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Water Supply': return <Droplets size={16} />;
      case 'Waste Disposal': return <Trash size={16} />;
      case 'Road Facility': return <HardHat size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getHubInfo = (id: string) => {
    switch(id) {
      case 'ABOUT': return {
        title: t.aboutPmc,
        icon: <Building size={48} />,
        color: 'text-brand-500',
        content: currentLanguage === Language.KANNADA 
          ? "ಪುತ್ತೂರು ನಗರಸಭೆಯು (PMC) ಪುತ್ತೂರಿನ ಸ್ಥಳೀಯ ಆಡಳಿತ ಸಂಸ್ಥೆಯಾಗಿದೆ. ನಮ್ಮ ಉದ್ದೇಶವು ನಗರವನ್ನು ಸುಸ್ಥಿರ ಮತ್ತು ತಂತ್ರಜ್ಞಾನ ಆಧಾರಿತವಾಗಿ ಅಭಿವೃದ್ಧಿಪಡಿಸುವುದು. ನಾಗರಿಕ ಸೇವೆಗಳ ನಿರ್ವಹಣೆಯಿಂದ ಹಿಡಿದು ಡಿಜಿಟಲ್ ಪಾರದರ್ಶಕತೆಯವರೆಗೆ, PMC ಸದಾ ಬದ್ಧವಾಗಿದೆ."
          : "Puttur Municipal Corporation (PMC) serves as the local governing body of Puttur, Karnataka. Our mission is to transform the city into a sustainable, tech-enabled urban hub while preserving its rich cultural heritage. From managing essential services to pioneering digital grievance redressal, PMC is committed to transparent and resilient governance."
      };
      case 'PROCESS': return {
        title: t.processGuide,
        icon: <Workflow size={48} />,
        color: 'text-accent-500',
        content: (
          <ul className="space-y-4">
            {[
              { step: 1, text: currentLanguage === Language.KANNADA ? "ವರದಿ: ಸ್ಥಳ ಮತ್ತು ಚಿತ್ರಗಳೊಂದಿಗೆ ಸಮಸ್ಯೆಯನ್ನು ಸಲ್ಲಿಸಿ." : "Report: Submit an issue with precise location and visual proof." },
              { step: 2, text: currentLanguage === Language.KANNADA ? "ಪರಿಶೀಲನೆ: AI ಮೂಲಕ ಸಮಸ್ಯೆಯ ತೀವ್ರತೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತದೆ." : "Audit: AI analyzes severity and assigns priority for dispatch." },
              { step: 3, text: currentLanguage === Language.KANNADA ? "ಕಾರ್ಯಪ್ರವೃತ್ತಿ: ಮುನ್ಸಿಪಲ್ ತಂಡಗಳನ್ನು ಸ್ಥಳಕ್ಕೆ ಕಳುಹಿಸಲಾಗುತ್ತದೆ." : "Mobilization: Specialized municipal task forces are dispatched." },
              { step: 4, text: currentLanguage === Language.KANNADA ? "ಪರಿಹಾರ: ಕೆಲಸ ಪೂರ್ಣಗೊಂಡ ನಂತರ ಚಿತ್ರಗಳ ಸಾಕ್ಷಿ ಒದಗಿಸಲಾಗುತ್ತದೆ." : "Resolution: Work is completed with high-fidelity photo proof." },
              { step: 5, text: currentLanguage === Language.KANNADA ? "ದೃಢೀಕರಣ: ನಾಗರಿಕರು ಪರಿಹಾರವನ್ನು ಪರಿಶೀಲಿಸಿ ಮುಚ್ಚಬಹುದು." : "Verification: Citizens review the fix for final registry closure." }
            ].map((s, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="w-6 h-6 rounded-full bg-accent-500/10 text-accent-500 text-[10px] font-black flex items-center justify-center shrink-0 mt-1">{s.step}</span>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.text}</span>
              </li>
            ))}
          </ul>
        )
      };
      case 'VISION': return {
        title: t.vision2030,
        icon: <Rocket size={48} />,
        color: 'text-emerald-500',
        content: currentLanguage === Language.KANNADA
          ? "ನಮ್ಮ 'ವಿಷನ್ 2030' ಈ ಕೆಳಗಿನವುಗಳ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸುತ್ತದೆ: 100% ಕಸ ವಿಂಗಡಣೆ, ಮೂಲಸೌಕರ್ಯ ಮೇಲ್ವಿಚಾರಣೆಗಾಗಿ ಡಿಜಿಟಲ್ ತಂತ್ರಜ್ಞಾನ, 100% LED ಬೀದಿ ದೀಪಗಳು ಮತ್ತು ಪರಿಸರ ಸ್ನೇಹಿ ಸಾರಿಗೆ ವ್ಯವಸ್ಥೆ."
          : "Our 'Vision 2030' roadmap focuses on: Zero-Waste City through 100% source segregation, Digital Twin technology for proactive infrastructure monitoring, 100% LED smart street lighting, and seamless 'Last-Mile' connectivity via integrated electric shuttles."
      };
      case 'SECURITY': return {
        title: t.trustSecurity,
        icon: <Shield size={48} />,
        color: 'text-rose-500',
        content: currentLanguage === Language.KANNADA
          ? "ನಾವು ಮಿಲಿಟರಿ ದರ್ಜೆಯ AES-256 ಎನ್‌ಕ್ರಿಪ್ಶನ್ ಬಳಸುತ್ತೇವೆ. ನಾಗರಿಕರ ಗುರುತು ಮತ್ತು ಡೇಟಾವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ರಕ್ಷಿಸಲಾಗಿದೆ. ನೈಜ ಪ್ರೊಫೈಲ್‌ಗಳು ಮಾತ್ರ ಸಮಸ್ಯೆಯನ್ನು ವರದಿ ಮಾಡಬಲ್ಲವು."
          : "We employ military-grade AES-256 encryption. Our 'Single-Session Enforcement' ensures your account is protected from unauthorized access. Verified citizen profiles prevent spam, ensuring every report in our ecosystem is authentic, verifiable, and actionable."
      };
      default: return null;
    }
  };

  return (
    <div className="bg-surface-pearl dark:bg-slate-950 min-h-screen transition-colors duration-500">
      
      {/* HUB INFO MODAL */}
      {infoModal && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 border border-white/10 animate-slideUp">
            <button onClick={() => setInfoModal(null)} className="absolute top-8 right-8 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl hover:text-rose-500 transition-all"><X size={20} /></button>
            {(() => {
              const info = getHubInfo(infoModal);
              if (!info) return null;
              return (
                <div className="text-left">
                  <div className={`w-20 h-20 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center ${info.color} mb-8 shadow-inner`}>
                    {info.icon}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">{info.title}</h2>
                  <div className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                    {typeof info.content === 'string' ? <p>{info.content}</p> : info.content}
                  </div>
                  <button onClick={() => setInfoModal(null)} className="mt-10 px-8 py-4 bg-slate-900 dark:bg-brand-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-500 transition-all">Acknowledge</button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* SUCCESS STORY MODAL */}
      {selectedSuccessStory && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp border border-white/10 p-10">
             <button onClick={() => setSelectedSuccessStory(null)} className="absolute top-6 right-6 p-3 bg-slate-100 dark:bg-white/5 rounded-xl hover:text-rose-500 transition-all"><X size={20} /></button>
             <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-inner">
                <img src={selectedSuccessStory.resolutionImage || selectedSuccessStory.reportImage} className="w-full h-full object-cover" alt="Resolved Case" />
             </div>
             <div className="flex items-center gap-2 text-emerald-500 mb-2">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified Resolution</span>
             </div>
             <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{selectedSuccessStory.title}</h2>
             <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6">"{selectedSuccessStory.resolutionNote || "Issue resolved by municipal task force."}"</p>
             <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 font-black text-xs">{selectedSuccessStory.reportedByName[0]}</div>
                   <div className="text-left">
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{selectedSuccessStory.reportedByName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">Public Contributor</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(selectedSuccessStory.createdAt).toLocaleDateString()}</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-48 pb-64 hero-mesh slant-top overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-left">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="lg:w-3/5">
              <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">{t.heroTitle} <br/><span className="accent-mesh text-glow-orange">{t.heroAccent}</span></h1>
              <p className="text-xl text-slate-400 max-w-xl mb-12 font-medium leading-relaxed">{t.heroSub}</p>
              
              {user ? (
                <div className="flex flex-wrap gap-4 animate-fadeIn">
                  <button 
                    onClick={() => navigate(isStaff ? '/dashboard/management' : '/dashboard/public')} 
                    className="px-10 py-5 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/40 hover:bg-brand-500 transition-all flex items-center gap-4 active:scale-95 group"
                  >
                    {t.viewMyDashboard} <LayoutDashboard size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  <button onClick={() => navigate('/login/public')} className="px-10 py-5 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-brand-500/40 hover:bg-brand-500 transition-all flex items-center gap-4 active:scale-95 group">
                    {t.citizenAccess} <ArrowUpRight size={20} />
                  </button>
                </div>
              )}
            </div>
            <div className="lg:w-2/5 grid grid-cols-2 gap-4">
              {[{ label: t.activeRegistry, value: reports.length }, { label: t.verifiedFixes, value: solvedCount }, { label: t[ReportStatus.IN_PROGRESS], value: activeCount }, { label: t[ReportStatus.PENDING], value: pendingCount }].map((item, i) => (
                <div key={i} className="glass-midnight p-6 rounded-[2rem] border-l-4 border-l-brand-500 hover:-translate-y-2 transition-transform duration-500">
                  <div className="text-3xl font-black text-white mb-1">{item.value}</div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD ANALYTICS SECTION */}
      <section className="max-w-7xl mx-auto px-6 -mt-32 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[3rem] p-10 unique-card-shadow border border-slate-100 dark:border-white/5 group transition-all">
            <div className="flex items-center justify-between mb-10">
              <div><h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{t.municipalEfficiency}</h3><p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-2">Performance analytics by status</p></div>
              <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-[1.5rem] flex items-center justify-center text-accent-500 group-hover:scale-110 transition-transform"><LayoutDashboard size={32} /></div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} /><YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} /><Tooltip cursor={{fill: 'rgba(248, 250, 252, 0.1)'}} contentStyle={{borderRadius: '24px', border: 'none', backgroundColor: '#0f172a', color: '#fff'}} /><Bar dataKey="value" radius={[15, 15, 15, 15]} barSize={60}>{statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Bar></BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[3rem] p-10 unique-card-shadow border border-slate-100 dark:border-white/5 flex flex-col">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-none">{t.categoryMetrics}</h3>
            <div className="flex-grow">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart><Pie data={categoryData} cx="50%" cy="45%" innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value" stroke="none">{categoryData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}/></PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE MUNICIPAL GRID (MAP) SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-left">
         <div className="flex items-center gap-6 mb-16">
            <div className="w-16 h-16 bg-brand-500/10 text-brand-500 rounded-[1.5rem] flex items-center justify-center border border-brand-500/10 shadow-inner">
              <MapIcon size={32} />
            </div>
            <div>
               <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Live Grievance Map</h2>
               <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2">Spatial Distribution of Reported Issues</p>
            </div>
         </div>
         <div className="relative bg-white dark:bg-slate-900 rounded-[4rem] border border-slate-100 dark:border-white/5 overflow-hidden shadow-2xl min-h-[500px]">
            <GrievanceMap reports={reports} height="500px" className="w-full h-full" />
         </div>
      </section>

      {/* CIVIC HEROES SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-left border-t border-slate-100 dark:border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-10">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center shadow-inner border border-amber-500/10"><Users size={32} /></div>
                <div>
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{t.civicHeroes}</h2>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2">{t.topContributors}</p>
                </div>
             </div>
             <div className="space-y-4">
                {civicHeroes.length === 0 ? (
                  <div className="p-10 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 text-xs font-black uppercase tracking-widest">No verified heroes yet</div>
                ) : (
                  civicHeroes.map((hero, i) => (
                    <div key={i} className="flex items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm group hover:-translate-y-1 transition-all">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-2 border-white shadow-lg">
                           <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(hero.name)}&background=f97316&color=fff`} className="w-full h-full object-cover" alt={hero.name} />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xl">#{i + 1}</div>
                      </div>
                      <div className="flex-grow">
                         <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{hero.name}</h4>
                         <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1.5"><Heart size={10} fill="currentColor" /> {hero.count} Problems Solved</p>
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>

          <div className="lg:col-span-7 space-y-10">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center shadow-inner border border-emerald-500/10"><Verified size={32} /></div>
                <div>
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Resolved Cases</h2>
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2">Latest Municipal Improvements</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               {solvedReports.slice(0, 4).map(report => (
                 <div key={report.id} onClick={() => setSelectedSuccessStory(report)} className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all cursor-pointer group">
                    <div className="aspect-video rounded-[2rem] overflow-hidden mb-6">
                       <img src={report.resolutionImage || report.reportImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Result" />
                    </div>
                    <div className="flex items-center gap-2 text-brand-500 mb-2">{getCategoryIcon(report.category)}<span className="text-[9px] font-black uppercase tracking-widest">{t[report.category as ReportCategory] || report.category}</span></div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 line-clamp-1">{report.title}</h3>
                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                       <UserIcon size={12} /> {report.reportedByName}
                    </div>
                 </div>
               ))}
               {solvedReports.length === 0 && <div className="col-span-2 p-20 bg-slate-50 dark:bg-white/5 rounded-[3rem] border border-dashed text-center text-slate-400 font-black uppercase text-[10px] tracking-widest">Waiting for first resolution</div>}
             </div>
          </div>
        </div>
      </section>

      {/* INFORMATION HUB */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-left border-t border-slate-100 dark:border-white/5">
         <div className="flex items-center gap-6 mb-20">
            <h2 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] whitespace-nowrap">{t.infoHubTitle}</h2>
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-grow"></div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 'ABOUT' as const, icon: <Building size={32} />, title: t.aboutPmc, desc: t.aboutPmcDesc, color: 'text-brand-500', bg: 'bg-brand-500/10' }, 
              { id: 'PROCESS' as const, icon: <Workflow size={32} />, title: t.processGuide, desc: t.processGuideDesc, color: 'text-accent-500', bg: 'bg-accent-500/10' }, 
              { id: 'VISION' as const, icon: <Rocket size={32} />, title: t.vision2030, desc: t.vision2030Desc, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }, 
              { id: 'SECURITY' as const, icon: <Shield size={32} />, title: t.trustSecurity, desc: t.trustSecurityDesc, color: 'text-rose-500', bg: 'bg-rose-500/10' }
            ].map((hub) => (
              <div key={hub.id} onClick={() => setInfoModal(hub.id)} className="group p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-white/5 hover:shadow-2xl transition-all cursor-pointer flex flex-col">
                 <div className={`w-16 h-16 ${hub.bg} ${hub.color} rounded-[1.5rem] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform`}>{hub.icon}</div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">{hub.title}</h3>
                 <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed flex-grow">{hub.desc}</p>
                 <div className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${hub.color}`}>{t.learnMore} <ChevronRight size={14} /></div>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
};

export default Home;
