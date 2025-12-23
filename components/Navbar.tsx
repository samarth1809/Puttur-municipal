
import React, { useState } from 'react';
import { UserRole, User, Language } from '../types';
import { LogOut, LayoutDashboard, User as UserIcon, LogIn, Sun, Moon, Shield, Loader2, Award, Globe, ChevronDown } from 'lucide-react';
import { translations } from '../translations.ts';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  logoUrl?: string;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  onNavigate, 
  currentPath, 
  isDarkMode, 
  onToggleDarkMode,
  logoUrl,
  currentLanguage,
  onLanguageChange
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const isManagement = user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR || user?.role === UserRole.VIEWER;
  const t = translations[currentLanguage];

  const languages = [
    { code: Language.ENGLISH, name: 'English', label: 'EN' },
    { code: Language.KANNADA, name: 'ಕನ್ನಡ', label: 'KN' },
    { code: Language.HINDI, name: 'हिन्दी', label: 'HI' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] glass-island px-10 py-5 flex justify-between items-center m-8 rounded-[2.5rem] shadow-2xl transition-all border border-white/50 dark:border-white/10">
      <div 
        className="flex items-center space-x-5 cursor-pointer group"
        onClick={() => onNavigate('/')}
      >
        <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-500/10 to-accent-500/10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-xl shadow-brand-500/5 border border-white/40 dark:border-white/5">
          {logoUrl ? (
            <img src={logoUrl} alt="PMC Logo" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative">
                <Award className="text-brand-500 animate-pulse" size={24} />
                <Loader2 className="absolute -top-1 -right-1 animate-spin text-accent-500" size={12} />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex gap-1.5 items-center">
             <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none group-hover:text-brand-600 transition-colors">Puttur</span>
             <span className="text-2xl font-black text-brand-600 tracking-tighter leading-none">PMC</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1 dark:text-slate-500">Official Municipal Portal</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Language Switcher */}
        <div className="relative">
          <button 
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/10 rounded-2xl border border-slate-100 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 transition-all font-black text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300"
          >
            <Globe size={16} className="text-brand-500" />
            {languages.find(l => l.code === currentLanguage)?.label}
            <ChevronDown size={14} className={`transition-transform duration-300 ${langMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {langMenuOpen && (
            <div className="absolute top-full right-0 mt-3 w-40 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-white/10 overflow-hidden animate-slideUp">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full px-6 py-4 text-left text-xs font-black uppercase tracking-widest transition-all ${currentLanguage === lang.code ? 'bg-brand-500 text-white' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'}`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Improved Theme Toggle Button */}
        <button 
          onClick={onToggleDarkMode}
          className="theme-rotate p-3.5 text-slate-500 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 bg-white/50 dark:bg-white/10 rounded-2xl transition-all duration-500 active:scale-90 border border-slate-100 dark:border-white/10 group relative overflow-hidden"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="relative z-10 flex items-center justify-center transition-transform duration-700">
            {isDarkMode ? <Sun size={22} className="text-brand-400 animate-pulse-soft" /> : <Moon size={22} className="text-accent-500" />}
          </div>
          <div className="absolute inset-0 bg-brand-500/5 dark:bg-brand-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>

        {user ? (
          <div className="flex items-center gap-5">
            <button 
              onClick={() => onNavigate(isManagement ? '/dashboard/management' : '/dashboard/public')}
              className={`flex items-center gap-3 px-8 py-3.5 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg ${
                currentPath.includes('dashboard') 
                ? 'bg-slate-900 dark:bg-brand-600 text-white shadow-slate-900/20' 
                : 'bg-white dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/20 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard size={18} />
              <span className="hidden sm:inline">{t.portal}</span>
            </button>
            
            <div className="h-10 w-px bg-slate-200 dark:bg-white/10"></div>
            
            <div className="flex items-center gap-4">
              <div 
                className="text-right hidden sm:block cursor-pointer group"
                onClick={() => onNavigate('/profile')}
              >
                <p className="text-xs font-black text-slate-900 dark:text-white leading-none group-hover:text-brand-600 transition-colors">{user.name}</p>
                <div className="flex items-center justify-end gap-1.5 mt-1">
                  {isManagement && <Shield size={10} className="text-accent-500" />}
                  <p className="text-[9px] text-brand-600 dark:text-brand-400 font-black uppercase tracking-widest">{user.role}</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigate('/profile')}
                className="w-12 h-12 rounded-[1.25rem] border-2 border-white dark:border-slate-800 overflow-hidden shadow-2xl hover:ring-4 hover:ring-brand-500/20 transition-all bg-slate-100 dark:bg-slate-800"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <UserIcon size={22} />
                  </div>
                )}
              </button>
              <button 
                onClick={onLogout}
                className="p-3 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90"
              >
                <LogOut size={24} />
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => onNavigate('/login/public')}
            className="flex items-center gap-3 px-10 py-4.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-600 dark:hover:bg-brand-500 dark:hover:text-white hover:-translate-y-1 transition-all shadow-2xl shadow-slate-900/20 dark:shadow-black/20 active:scale-95 group"
          >
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            <span>{t.login}</span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
