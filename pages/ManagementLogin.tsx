
import React, { useState } from 'react';
import { UserRole, User, Language } from '../types.ts';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, Mail, Building2, Key, 
  AlertCircle, Eye, EyeOff, ShieldCheck, Info, User as UserIcon, ArrowLeft
} from 'lucide-react';
import { translations } from '../translations.ts';
import { dbService } from '../services/db.ts';

interface LoginProps {
  onLogin: (user: User) => void;
  currentLanguage: Language;
}

const ManagementLogin: React.FC<LoginProps> = ({ onLogin, currentLanguage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const t = translations[currentLanguage];

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('Invalid credential format.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const normalizedEmail = email.trim().toLowerCase();
      // Mock credentials logic
      const isAdmin = (normalizedEmail === 'admin@pmc' && password === 'admin123');
      const isEditor = (normalizedEmail === 'editor@pmc' && password === 'editor123');
      const isViewer = (normalizedEmail === 'viewer@pmc' && password === 'viewer123');

      if (isAdmin || isEditor || isViewer) {
        let assignedRole = UserRole.ADMIN;
        let assignedName = 'Senior Administrator';

        if (isEditor) {
          assignedRole = UserRole.EDITOR;
          assignedName = 'Regional Editor';
        } else if (isViewer) {
          assignedRole = UserRole.VIEWER;
          assignedName = 'Public Auditor';
        }

        // Generate session ID for single account enforcement
        const sessionId = `mgmt_sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        // Seed the "official" registry if not exists, then update session
        const existing = await dbService.getRegisteredUser(normalizedEmail);
        await dbService.registerUser(normalizedEmail, {
          name: assignedName,
          password: password,
          role: assignedRole,
          activeSessionId: sessionId
        });

        const user: User = {
          id: `official-${assignedRole.toLowerCase()}-01`,
          name: assignedName,
          email: normalizedEmail,
          role: assignedRole,
          sessionId: sessionId,
          avatar: `https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200`
        };
        onLogin(user);
        navigate('/dashboard/management');
      } else {
        setError('Authentication Failed: Access denied for these credentials.');
      }
      setIsLoading(false);
    }, 1200);
  };

  const useDemo = (role: 'admin' | 'editor' | 'viewer') => {
    setEmail(`${role}@pmc`);
    setPassword(`${role}123`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0f1d] dark:bg-black relative overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.05)_0%,_transparent_70%)] pointer-events-none"></div>
      
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
        <div className="hidden lg:block text-left text-white space-y-8 pr-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-5xl font-black tracking-tighter leading-none">{t.officialPortal.split(' ')[0]} <br/> {t.officialPortal.split(' ')[1]} <br/> <span className="text-blue-500">{t.staffTerminal.split(' ')[0]}.</span></h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Secure multi-level access for Puttur Municipal Corporation personnel. Authentication is required to access the internal logistics dashboard.
          </p>
          
          <div className="p-8 bg-blue-900/10 border border-blue-500/20 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em]">
              <Info size={16} /> {t.demoCreds}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { r: 'admin', label: 'Senior Admin' },
                { r: 'editor', label: 'Regional Editor' },
                { r: 'viewer', label: 'Public Auditor' }
              ].map(item => (
                <button 
                  key={item.r}
                  onClick={() => useDemo(item.r as any)}
                  className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-xs group"
                >
                  <span className="font-bold text-slate-300">{item.label}</span>
                  <span className="font-mono text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">{item.r}@pmc</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigate('/login/public')}
            className="flex items-center gap-3 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all"
          >
            <ArrowLeft size={16} /> {t.switchPublic}
          </button>
        </div>

        <div className="bg-white dark:bg-[#111827] w-full rounded-[2.5rem] shadow-2xl p-10 border border-slate-200 dark:border-slate-800 relative transition-all">
          <div className="text-center mb-10">
            <div className="inline-flex lg:hidden items-center justify-center w-20 h-20 bg-blue-600/5 text-blue-500 rounded-3xl mb-6 border border-blue-500/20">
              <Building2 size={36} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{t.internalLogin}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{t.officialAccess}</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="font-bold tracking-wide">{error}</p>
            </div>
          )}

          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.officialId}</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 font-bold"
                  placeholder="name@pmc"
                />
                <Mail className="absolute left-4 top-4.5 text-slate-400 dark:text-slate-600" size={20} />
              </div>
            </div>
            
            <div className="space-y-2 text-left">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.securePassword}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-800 font-bold"
                  placeholder="••••••••"
                />
                <Key className="absolute left-4 top-4.5 text-slate-400 dark:text-slate-600" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4.5 text-slate-400 dark:text-slate-600 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : t.enterCommandHub}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800/50 text-center flex flex-col gap-4">
            <button 
              onClick={() => navigate('/login/public')}
              className="lg:hidden text-[10px] font-black text-blue-600 uppercase tracking-widest"
            >
              {t.switchPublic}
            </button>
            <p className="text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <ShieldCheck size={10} className="text-blue-600 dark:text-blue-900" />
              Official Use Only • Single Session Enforcement Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementLogin;
