
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { User, UserRole, Report, AuthState, ReportStatus, StatusHistoryEntry, Announcement, ReportCategory, Language } from './types.ts';
import Navbar from './components/Navbar.tsx';
import Home from './pages/Home.tsx';
import PublicLogin from './pages/PublicLogin.tsx';
import ManagementLogin from './pages/ManagementLogin.tsx';
import PublicDashboard from './pages/PublicDashboard.tsx';
import ManagementDashboard from './pages/ManagementDashboard.tsx';
import Profile from './pages/Profile.tsx';
import ContactSupport from './pages/ContactSupport.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import TermsAndConditions from './pages/TermsAndConditions.tsx';
import Chatbot from './components/Chatbot.tsx';
import { dbService } from './services/db.ts';
import { GoogleGenAI } from "@google/genai";
import { Building2, AlertTriangle } from 'lucide-react';

const INITIAL_REPORTS: Report[] = [
  // 11 RESOLVED REPORTS
  {
    id: 'res-1', title: 'Main Trunk Water Pipe Burst', description: 'Major pipe leak near Main Street flooding the area.', category: ReportCategory.WATER, status: ReportStatus.RESOLVED, reportedBy: 'u1', reportedByName: 'Kumar Swamy', location: 'Main Street, Darbe, Puttur', createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), resolutionNote: 'High-pressure trunk pipe replaced and road surface restored.', reportImage: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'res-2', title: 'Street Light Failure', description: 'Entire block dark for 3 days near Bolwar junction.', category: ReportCategory.OTHER, status: ReportStatus.RESOLVED, reportedBy: 'u2', reportedByName: 'Anita Rao', location: 'Market Road, Bolwar, Puttur', createdAt: new Date(Date.now() - 86400000 * 9).toISOString(), resolutionNote: 'Electrical wiring fixed and new LED lamp installed.', reportImage: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1471958680802-1345a694ba6d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'res-3', title: 'Pothole Hazard', description: 'Deep pothole causing bike accidents near school.', category: ReportCategory.ROADS, status: ReportStatus.RESOLVED, reportedBy: 'u3', reportedByName: 'Ramesh Hegde', location: 'School Zone, Nehru Nagar, Puttur', createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), resolutionNote: 'Pothole filled with Bitumen and leveled.', reportImage: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1596431905663-80e4618a829f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'res-4', title: 'Clogged Drainage', description: 'Plastic waste blocking main drain causing overflow.', category: ReportCategory.WASTE, status: ReportStatus.RESOLVED, reportedBy: 'u4', reportedByName: 'Suresh K.', location: 'Bus Stand Road, Kombettu, Puttur', createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), resolutionNote: 'De-silting completed and plastic waste removed.', reportImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1504307651254-35680fb3ba66?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'res-5', title: 'Broken Park Bench', description: 'Wooden slats broken on public park bench.', category: ReportCategory.SOCIAL, status: ReportStatus.RESOLVED, reportedBy: 'u5', reportedByName: 'Meera Bai', location: 'Public Park, Kabaka, Puttur', createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), resolutionNote: 'Bench repaired with new timber slats and painted.', reportImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'res-6', title: 'Illegal Dumping', description: 'Massive pile of construction waste in vacant lot.', category: ReportCategory.WASTE, status: ReportStatus.RESOLVED, reportedBy: 'u6', reportedByName: 'Vikram Singh', location: 'Green Lane, Bannur, Puttur', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), resolutionNote: 'Dumped materials cleared using JCB.', reportImage: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'res-7', title: 'Stray Cattle Hazard', description: 'Herd of cattle permanently occupying Main junction.', category: ReportCategory.SOCIAL, status: ReportStatus.RESOLVED, reportedBy: 'u7', reportedByName: 'Lata M.', location: 'High Street, Court Road, Puttur', createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), resolutionNote: 'Cattle moved to Gaushala and owners fined.', reportImage: 'https://images.unsplash.com/photo-1516466723877-e4ec1d736c8a?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1541339907198-e08756edd810?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'res-8', title: 'Open Manhole', description: 'Manhole cover missing on Parlane sidewalk.', category: ReportCategory.ROADS, status: ReportStatus.RESOLVED, reportedBy: 'u8', reportedByName: 'Arjun P.', location: 'Cross Road 2, Parlane, Puttur', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), resolutionNote: 'New heavy-duty cast iron cover installed.', reportImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7903?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'res-9', title: 'Water Contamination', description: 'Yellowish water supplied to residential blocks.', category: ReportCategory.WATER, status: ReportStatus.RESOLVED, reportedBy: 'u9', reportedByName: 'Priya D.', location: 'College Road, Vivekananda College Area, Puttur', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), resolutionNote: 'Overhead tank de-greased and chlorination levels reset.', reportImage: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1548932813-731309489673?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'res-10', title: 'Damaged Traffic Sign', description: 'Stop sign bent and unreadable due to vandalism.', category: ReportCategory.ROADS, status: ReportStatus.RESOLVED, reportedBy: 'u10', reportedByName: 'Zaid K.', location: 'Junction, Muraliya, Puttur', createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(), resolutionNote: 'New reflective traffic signage installed.', reportImage: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1494548162494-384bba4ab999?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'res-11', title: 'Loudspeaker Noise', description: 'Late night noise from unauthorized event venue.', category: ReportCategory.SOCIAL, status: ReportStatus.RESOLVED, reportedBy: 'u11', reportedByName: 'Rahul G.', location: 'Quiet Avenue, Sampya, Puttur', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), resolutionNote: 'Site inspected, speakers seized, and fines issued.', reportImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', resolutionImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600'
  },

  // 14 IN PROGRESS REPORTS
  {
    id: 'prog-1', title: 'Overflowing Bins', description: 'Garbage collection truck missed Kemminje for 3 days.', category: ReportCategory.WASTE, status: ReportStatus.IN_PROGRESS, reportedBy: 'u12', reportedByName: 'Sita Ram', location: 'Lane 4, Kemminje, Puttur', createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(), reportImage: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-2', title: 'Tap Flow Weakness', description: 'Water pressure barely enough to reach first floor.', category: ReportCategory.WATER, status: ReportStatus.IN_PROGRESS, reportedBy: 'u13', reportedByName: 'Mohit N.', location: 'Block 2, Padil, Puttur', createdAt: new Date(Date.now() - 86400000 * 0.4).toISOString(), reportImage: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-3', title: 'Major Road Fissure', description: 'Structural crack in main bridge asphalt.', category: ReportCategory.ROADS, status: ReportStatus.IN_PROGRESS, reportedBy: 'u14', reportedByName: 'Neha J.', location: 'Main Bridge, Kodimbadi, Puttur', createdAt: new Date(Date.now() - 86400000 * 0.3).toISOString(), reportImage: 'https://images.unsplash.com/photo-1596431905663-80e4618a829f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-4', title: 'Leaking Public Faucet', description: 'Continuous water waste from broken tap.', category: ReportCategory.WATER, status: ReportStatus.IN_PROGRESS, reportedBy: 'u15', reportedByName: 'Dev P.', location: 'Near Market, Darbe, Puttur', createdAt: new Date(Date.now() - 86400000 * 0.2).toISOString(), reportImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-5', title: 'Aggressive Stray Dogs', description: 'Pack of 5 dogs attacking morning walkers.', category: ReportCategory.SOCIAL, status: ReportStatus.IN_PROGRESS, reportedBy: 'u16', reportedByName: 'Kavita L.', location: 'Childrens Park, Bolwar, Puttur', createdAt: new Date(Date.now() - 86400000 * 0.1).toISOString(), reportImage: 'https://images.unsplash.com/photo-1516733968453-db55a5631bb4?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-6', title: 'Construction Dust', description: 'Dust from new complex not being controlled with water.', category: ReportCategory.WASTE, status: ReportStatus.IN_PROGRESS, reportedBy: 'u17', reportedByName: 'Amit B.', location: 'New Layout, Nehru Nagar, Puttur', createdAt: new Date().toISOString(), reportImage: 'https://images.unsplash.com/photo-1504307651254-35680fb3ba66?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-7', title: 'Footpath Encroachment', description: 'Vendors blocking pedestrian path completely.', category: ReportCategory.SOCIAL, status: ReportStatus.IN_PROGRESS, reportedBy: 'u18', reportedByName: 'Simran H.', location: 'Station Road, Kombettu, Puttur', createdAt: new Date().toISOString(), reportImage: 'https://images.unsplash.com/photo-1541339907198-e08756edd810?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-8', title: 'Dangling Power Lines', description: 'Electric wires hanging dangerously low after storm.', category: ReportCategory.OTHER, status: ReportStatus.IN_PROGRESS, reportedBy: 'u19', reportedByName: 'Yash S.', location: 'Lane 1, Kabaka, Puttur', createdAt: new Date().toISOString(), reportImage: 'https://images.unsplash.com/photo-1471958680802-1345a694ba6d?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-9', title: 'Sewage Leak', description: 'Raw sewage leaking into open street drain.', category: ReportCategory.WASTE, status: ReportStatus.IN_PROGRESS, reportedBy: 'u20', reportedByName: 'Anil V.', location: 'Back Alley, Bannur, Puttur', createdAt: new Date().toISOString(), reportImage: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-10', title: 'Empty Park Corner', description: 'Park bench removed and not replaced.', category: ReportCategory.SOCIAL, status: ReportStatus.IN_PROGRESS, reportedBy: 'u21', reportedByName: 'Sunita T.', location: 'Circle, Court Road, Puttur', createdAt: new Date().toISOString(), reportImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-11', title: 'Road Puddle', description: 'Permanent water logging due to poor grading.', category: ReportCategory.WATER, status: ReportStatus.IN_PROGRESS, reportedBy: 'u22', reportedByName: 'Gaurav K.', location: 'Main Gate, Parlane, Puttur', createdAt: new Date().toISOString(), reportImage: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-12', title: 'Flickering Street Bulb', description: 'One light flickering, causing night-time hazard.', category: ReportCategory.OTHER, status: ReportStatus.IN_PROGRESS, reportedBy: 'u23', reportedByName: 'Deepak M.', location: 'Hostel Area, Vivekananda College Area, Puttur', createdAt: new Date().toISOString(), reportImage: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-13', title: 'Broken Grate', description: 'Metal drain grate snapped, open hole in road.', category: ReportCategory.ROADS, status: ReportStatus.IN_PROGRESS, reportedBy: 'u24', reportedByName: 'Sharan S.', location: 'Side Street, Muraliya, Puttur', createdAt: new Date().toISOString(), reportImage: 'https://images.unsplash.com/photo-1581094288338-2314dddb7903?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'prog-14', title: 'Pond Pollution', description: 'Debris and plastic bags in city temple pond.', category: ReportCategory.WASTE, status: ReportStatus.IN_PROGRESS, reportedBy: 'u25', reportedByName: 'Ishwar B.', location: 'Temple Pond, Sampya, Puttur', createdAt: new Date().toISOString(), reportImage: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=600'
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Smart Waste Management Initiative',
    description: 'Puttur introduces IoT-enabled waste bins equipped with ultrasonic fill-level sensors. This system uses AI-driven route optimization for collection trucks, significantly reducing carbon emissions and ensuring zero-overflow streets.',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'ann-2',
    title: 'Digital Water Conservation Drive',
    description: 'New high-efficiency smart meters are being installed across Ward 4 to 8. These devices provide real-time leak detection alerts directly to your mobile portal.',
    imageUrl: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=800',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

const AppContent: React.FC<{
  auth: AuthState;
  reports: Report[];
  announcements: Announcement[];
  onLogin: (user: User) => Promise<void>;
  onLogout: () => Promise<void>;
  onUpdateUser: (user: User) => Promise<void>;
  addReport: (r: Report) => Promise<void>;
  removeReport: (id: string) => Promise<void>;
  addAnnouncement: (a: Announcement) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  updateReportStatus: (id: string, status: ReportStatus, note?: string, resolutionImage?: string) => Promise<void>;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  logoUrl?: string;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}> = ({ 
  auth, reports, announcements, onLogin, onLogout, onUpdateUser, 
  addReport, removeReport, addAnnouncement, deleteAnnouncement, 
  updateReportStatus, isDarkMode, onToggleDarkMode, logoUrl,
  currentLanguage, onLanguageChange
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isManagement = auth.user?.role === UserRole.ADMIN || auth.user?.role === UserRole.EDITOR || auth.user?.role === UserRole.VIEWER;

  useEffect(() => {
    const checkSession = async () => {
      if (auth.isAuthenticated && auth.user) {
        const registryUser = await dbService.getRegisteredUser(auth.user.email);
        if (registryUser && registryUser.activeSessionId !== auth.user.sessionId) {
          onLogout();
          navigate('/login/public');
        }
      }
    };
    checkSession();
  }, [location.pathname, auth.isAuthenticated, auth.user, navigate, onLogout]);

  return (
    <>
      <Navbar 
        user={auth.user} 
        onLogout={() => { onLogout(); navigate('/'); }} 
        onNavigate={navigate} 
        currentPath={location.pathname}
        isDarkMode={isDarkMode}
        onToggleDarkMode={onToggleDarkMode}
        logoUrl={logoUrl}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
      />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home reports={reports} announcements={announcements} user={auth.user} onAddAnnouncement={addAnnouncement} onDeleteAnnouncement={deleteAnnouncement} currentLanguage={currentLanguage} />} />
          <Route path="/login/public" element={<PublicLogin onLogin={onLogin} currentLanguage={currentLanguage} />} />
          <Route path="/official-portal-login" element={<ManagementLogin onLogin={onLogin} currentLanguage={currentLanguage} />} />
          <Route path="/contact" element={<ContactSupport user={auth.user} currentLanguage={currentLanguage} />} />
          <Route path="/privacy" element={<PrivacyPolicy currentLanguage={currentLanguage} />} />
          <Route path="/terms" element={<TermsAndConditions currentLanguage={currentLanguage} />} />
          <Route path="/dashboard/public" element={auth.isAuthenticated && auth.user?.role === UserRole.PUBLIC ? <PublicDashboard user={auth.user} reports={reports} addReport={addReport} removeReport={removeReport} currentLanguage={currentLanguage} /> : <Navigate to="/login/public" />} />
          <Route path="/dashboard/management" element={auth.isAuthenticated && isManagement ? <ManagementDashboard user={auth.user!} reports={reports} updateStatus={updateReportStatus} currentLanguage={currentLanguage} /> : <Navigate to="/official-portal-login" />} />
          <Route path="/profile" element={auth.isAuthenticated && auth.user ? <Profile user={auth.user} reports={reports} onUpdateUser={onUpdateUser} currentLanguage={currentLanguage} /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      <footer className="bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-400 py-12 px-6 border-t border-slate-100 dark:border-white/5 relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
               {logoUrl && <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-xl object-cover grayscale opacity-40" />}
               <div className="text-left">
                 <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Puttur Corporation</p>
                 <p className="text-[9px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest">Official Government Portal</p>
               </div>
            </div>
            <nav className="flex flex-wrap justify-center gap-10 text-[9px] font-black uppercase tracking-[0.3em]">
               <button onClick={() => navigate('/privacy')} className="hover:text-brand-500 transition-colors">Privacy Policy</button>
               <button onClick={() => navigate('/terms')} className="hover:text-brand-500 transition-colors">Terms of Service</button>
               <button onClick={() => navigate('/contact')} className="hover:text-brand-500 transition-colors">Support Hub</button>
            </nav>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12">
             <p className="text-[8px] font-bold text-slate-400 dark:text-slate-600 tracking-[0.3em]">© {new Date().getFullYear()} PMC • ALL RIGHTS RESERVED</p>
             <button onClick={() => navigate('/official-portal-login')} className="flex items-center gap-3 px-8 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-all text-[9px] font-black uppercase tracking-[0.3em]">
               <Building2 size={14} className="text-blue-600 dark:text-blue-400" /> Management Login Terminal
             </button>
          </div>
        </div>
      </footer>
      <Chatbot currentLanguage={currentLanguage} />
    </>
  );
};

export default function App() {
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [reports, setReports] = useState<Report[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || Language.KANNADA;
  });
  const [logoUrl, setLogoUrl] = useState<string | undefined>(localStorage.getItem('pmc_logo') || undefined);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    const initApp = async () => {
      try {
        await dbService.init();
        const storedUser = await dbService.getStoredUser();
        
        if (storedUser) {
          const registryUser = await dbService.getRegisteredUser(storedUser.email);
          if (registryUser && registryUser.activeSessionId !== storedUser.sessionId) {
            await dbService.clearUser();
            setSessionError("Session preempted: This account was logged in from another location.");
            setAuth({ user: null, isAuthenticated: false });
          } else {
            setAuth({ user: storedUser, isAuthenticated: true });
          }
        }
        
        const dbReports = await dbService.getAllReports();
        if (dbReports.length > 0) {
          setReports(dbReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
          for (const r of INITIAL_REPORTS) await dbService.saveReport(r);
          setReports(INITIAL_REPORTS);
        }

        const dbAnnouncements = await dbService.getAllAnnouncements();
        if (dbAnnouncements.length > 0) {
          setAnnouncements(dbAnnouncements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } else {
          for (const a of INITIAL_ANNOUNCEMENTS) await dbService.saveAnnouncement(a);
          setAnnouncements(INITIAL_ANNOUNCEMENTS);
        }
      } catch (err) {
        console.error("Database initialization failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    initApp();
  }, [logoUrl]);

  const handleLogin = async (user: User) => {
    setAuth({ user, isAuthenticated: true });
    await dbService.saveUser(user);
    if (user.sessionId) {
      await dbService.updateActiveSession(user.email, user.sessionId);
    }
  };

  const handleLogout = async () => {
    setAuth({ user: null, isAuthenticated: false });
    await dbService.clearUser();
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setAuth({ user: updatedUser, isAuthenticated: true });
    await dbService.saveUser(updatedUser);
  };

  const addReport = async (newReport: Report) => {
    await dbService.saveReport(newReport);
    setReports(prev => [newReport, ...prev]);
  };

  const removeReport = async (id: string) => {
    await dbService.deleteReport(id);
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const addAnnouncement = async (announcement: Announcement) => {
    await dbService.saveAnnouncement(announcement);
    setAnnouncements(prev => [announcement, ...prev]);
  };

  const deleteAnnouncement = async (id: string) => {
    await dbService.deleteAnnouncement(id);
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const updateReportStatus = async (id: string, status: ReportStatus, note?: string, resolutionImage?: string) => {
    const report = reports.find(r => r.id === id);
    if (report) {
      const historyEntry: StatusHistoryEntry = {
        from: report.status,
        to: status,
        timestamp: new Date().toISOString(),
        updatedBy: auth.user?.name || 'System'
      };
      const updatedReport: Report = { 
        ...report, 
        status, 
        resolutionNote: note,
        resolutionImage: resolutionImage || report.resolutionImage,
        history: [...(report.history || []), historyEntry]
      };
      await dbService.saveReport(updatedReport);
      setReports(prev => prev.map(r => r.id === id ? updatedReport : r));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-white/5 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-surface-pearl dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
        
        {sessionError && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black mb-4 dark:text-white">Security Alert</h2>
              <p className="text-slate-500 text-sm mb-8">{sessionError}</p>
              <button 
                onClick={() => setSessionError(null)}
                className="w-full py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-500 transition-all"
              >
                Acknowledge
              </button>
            </div>
          </div>
        )}

        <AppContent 
          auth={auth} 
          reports={reports} 
          announcements={announcements}
          onLogin={handleLogin} 
          onLogout={handleLogout} 
          onUpdateUser={handleUpdateUser}
          addReport={addReport}
          removeReport={removeReport}
          addAnnouncement={addAnnouncement}
          deleteAnnouncement={deleteAnnouncement}
          updateReportStatus={updateReportStatus}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          logoUrl={logoUrl}
          currentLanguage={currentLanguage}
          onLanguageChange={setCurrentLanguage}
        />
      </div>
    </HashRouter>
  );
}
