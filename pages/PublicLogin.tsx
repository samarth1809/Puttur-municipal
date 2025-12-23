
import React, { useState, useRef, useEffect } from 'react';
import { UserRole, User, Language } from '../types.ts';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, RefreshCcw, Building2, Smartphone, Inbox, Copy, ExternalLink, Send, Zap } from 'lucide-react';
import { dbService } from '../services/db.ts';
import { translations } from '../translations.ts';
import emailjs from 'https://esm.sh/@emailjs/browser';

/**
 * CONFIGURATION FOR REAL GMAIL DISPATCH:
 * 1. Register at https://www.emailjs.com/
 * 2. Connect your Gmail as the "Email Service".
 * 3. Create an "Email Template" with variables: {{otp}}, {{to_name}}, {{to_email}}
 * 4. Paste your keys below.
 */
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_puttur_verify', 
  TEMPLATE_ID: 'template_otp_code',    
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY'       
};

interface LoginProps {
  onLogin: (user: User) => void;
  currentLanguage: Language;
}

type AuthView = 'login' | 'signup' | 'verify';

const PublicLogin: React.FC<LoginProps> = ({ onLogin, currentLanguage }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [showOtpNotification, setShowOtpNotification] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const t = translations[currentLanguage];
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }
  }, []);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSignupInitiate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    if (!email.includes('@gmail.com')) {
      setError("Security requirement: Only official @gmail.com accounts are permitted.");
      setIsLoading(false);
      return;
    }

    const newOtp = generateOTP();
    setGeneratedOtp(newOtp);

    try {
      if (EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        const templateParams = {
          to_email: email,
          to_name: name || email.split('@')[0],
          otp: newOtp,
          from_name: "PMC Security Hub"
        };

        const res = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          templateParams
        );

        if (res.status === 200) {
          setView('verify');
          setSuccessMsg(`A secure code has been sent to your Gmail inbox: ${email}`);
          setIsLoading(false);
        } else {
          throw new Error("SMTP relay error.");
        }
      } else {
        setTimeout(() => {
          setView('verify');
          setSuccessMsg(`[Demo Mode] Codes would be sent to your real Gmail if keys were set. Code: ${newOtp}`);
          setShowOtpNotification(true);
          setIsLoading(false);
        }, 1200);
      }
    } catch (err) {
      setError("Email dispatch failed. Please check your connectivity or configuration.");
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (otp.join('') !== generatedOtp) {
      setError("Invalid security code. Please check your Gmail.");
      setIsLoading(false);
      return;
    }

    try {
      // Create a unique session ID for this login
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const userData = {
        name: name || email.split('@')[0],
        password: password || 'verified-user',
        verified: true,
        activeSessionId: sessionId, // Save this to the global registry
        createdAt: new Date().toISOString()
      };
      
      await dbService.registerUser(email, userData);

      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: userData.name,
        email,
        role: UserRole.PUBLIC,
        sessionId: sessionId, // Assign to current local session
        avatar: `https://ui-avatars.com/api/?name=${userData.name}&background=f97316&color=fff`
      };
      
      onLogin(user);
      setShowOtpNotification(false);
      setSuccessMsg("Security clearance granted.");
      setTimeout(() => navigate('/dashboard/public'), 1000);
    } catch (err) {
      setError('System registry error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const existingUser = await dbService.getRegisteredUser(email);
      if (existingUser && existingUser.password === password) {
         // Create a unique session ID for this new login
         const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
         
         const user: User = {
           id: Math.random().toString(36).substr(2, 9),
           name: existingUser.name,
           email,
           role: UserRole.PUBLIC,
           sessionId: sessionId,
           avatar: existingUser.avatar || `https://ui-avatars.com/api/?name=${existingUser.name}&background=f97316&color=fff`
         };
         
         onLogin(user);
         setSuccessMsg("Security clearance granted.");
         setTimeout(() => navigate('/dashboard/public'), 1000);
      } else {
         setError("Authentication failed: Invalid credentials.");
      }
    } catch (err) {
      setError('System registry error.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans relative overflow-hidden">
      
      {isLoading && (
        <div className="fixed inset-0 z-[2000] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center">
          <div className="w-32 h-32 relative">
             <div className="absolute inset-0 border-4 border-white/5 border-t-red-600 rounded-full animate-spin"></div>
             <Send className="absolute inset-0 m-auto text-white animate-pulse" size={40} />
          </div>
          <h3 className="text-white font-black uppercase tracking-[0.5em] mt-10 text-sm">Validating Identity</h3>
          <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">Single Session Protocol Active...</p>
        </div>
      )}

      {showOtpNotification && (
        <div className="fixed top-8 right-8 z-[1000] animate-slideInRight">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 flex items-start gap-4 max-w-sm">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shrink-0">
              <Mail size={24} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">Security Notification</h4>
              <p className="text-xs text-slate-500 mt-1">Your real code is: <span className="text-red-600 font-black tracking-widest">{generatedOtp}</span></p>
              <button onClick={() => setShowOtpNotification(false)} className="mt-4 px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700">Dismiss</button>
            </div>
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:w-1/2 bg-[#020617] items-center justify-center p-20 relative overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.15)_0%,_transparent_50%)]"></div>
        <div className="relative z-10 text-white max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-lg text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-6 border border-emerald-500/20">
            <ShieldCheck size={12} /> Security Handshake Active
          </div>
          <h2 className="text-6xl font-black leading-[1.1] tracking-tight mb-8">
            Verified <span className="text-brand-500">Citizen</span> Identity.
          </h2>
          <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12">
            Puttur Municipal Portal ensures every account is uniquely authenticated. Logging in elsewhere will terminate existing sessions for total data safety.
          </p>
          <div className="flex gap-4 items-center p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
            <Inbox size={32} className="text-brand-500" />
            <div>
               <h4 className="font-bold text-white">Encrypted Login</h4>
               <p className="text-sm text-slate-500">Only one active session permitted per citizen account.</p>
            </div>
          </div>
          <div className="mt-16 pt-10 border-t border-white/5">
            <button 
              onClick={() => navigate('/official-portal-login')}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 border border-white/10 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 transition-all"
            >
              <Building2 size={16} className="text-brand-500" />
              Municipal Hub Portal
            </button>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md bg-slate-900 rounded-[3rem] shadow-2xl p-10 border border-white/5 relative overflow-hidden">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-500/10 text-brand-500 rounded-[2rem] mb-6 border border-brand-500/20 shadow-inner">
              {view === 'verify' ? <Smartphone size={32} className="animate-bounce" /> : <UserIcon size={32} />}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-3">
              {view === 'login' ? 'Citizen Sign In' : view === 'signup' ? 'Create Registry' : 'Check Your Gmail'}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              {view === 'verify' ? `Intercepted code for ${email}` : 'Secure access to the official portal'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-sm animate-shake">
              <AlertCircle size={18} />
              <span className="font-bold">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm">
              <CheckCircle2 size={18} />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {view === 'verify' ? (
            <form onSubmit={handleVerify} className="space-y-10">
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => otpRefs.current[idx] = el}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleKeyDown(idx, e)}
                    className="w-12 h-16 text-center bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-black text-2xl text-white"
                  />
                ))}
              </div>
              <button
                type="submit"
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all"
              >
                Confirm Identity <ArrowRight size={18} />
              </button>
            </form>
          ) : (
            <form onSubmit={view === 'login' ? handleLoginSubmit : handleSignupInitiate} className="space-y-5">
                {view === 'signup' && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Legal Name</label>
                    <div className="relative group">
                      <input
                        type="text" required value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold text-white"
                        placeholder="e.g. Kumar Swamy"
                      />
                      <UserIcon className="absolute left-4 top-4 text-slate-700 group-focus-within:text-brand-500 transition-colors" size={18} />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Gmail Address</label>
                  <div className="relative group">
                    <input
                      type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold text-white"
                      placeholder="resident@gmail.com"
                    />
                    <Mail className="absolute left-4 top-4 text-slate-700 group-focus-within:text-brand-500 transition-colors" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Passkey</label>
                  <div className="relative group">
                    <input
                      type="password" required value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-950 border border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all font-bold text-white"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute left-4 top-4 text-slate-700 group-focus-within:text-brand-500 transition-colors" size={18} />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-500 shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all mt-4"
                >
                  {view === 'login' ? 'Secure Sign In' : 'Proceed to Verification'} <ArrowRight size={18} />
                </button>

                <div className="pt-6 text-center">
                  <button 
                    type="button"
                    onClick={() => setView(view === 'login' ? 'signup' : 'login')}
                    className="block w-full text-[10px] font-black text-brand-500 uppercase tracking-widest hover:text-brand-400 transition-colors"
                  >
                    {view === 'login' ? "New citizen? Create Registry Account" : "Registered? Sign In"}
                  </button>
                </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicLogin;
