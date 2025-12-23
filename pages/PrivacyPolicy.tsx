
import React from 'react';
import { ShieldCheck, ArrowLeft, Lock, Globe, Fingerprint, ShieldAlert, Database, CheckCircle, UserCheck, Scale, Eye, Cookie, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface PrivacyPolicyProps {
  currentLanguage: Language;
}

export default function PrivacyPolicy({ currentLanguage }: PrivacyPolicyProps) {
  const navigate = useNavigate();
  const t = translations[currentLanguage];

  const sections = [
    {
      icon: <Fingerprint size={24} />,
      title: "1. Personal Identifiable Information (PII)",
      content: "We collect information that identifies you as a resident of Puttur. This includes your full legal name, a verified email address, phone number, and ward details. This data is mandatory for the creation of a 'Citizen Registry' account and is used to authenticate the validity of filed grievances.",
      accent: "border-l-brand-500",
      color: "bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400"
    },
    {
      icon: <Globe size={24} />,
      title: "2. Geolocation & Spatial Metadata",
      content: "When you report an issue (e.g., waste disposal or road facility), our system captures the precise GPS coordinates and landmark descriptions provided. This spatial metadata is essential for dispatching municipal response teams to the exact location of the incident.",
      accent: "border-l-accent-500",
      color: "bg-accent-50 dark:bg-accent-500/10 text-accent-600 dark:text-accent-400"
    },
    {
      icon: <Eye size={24} />,
      title: "3. Transparency & Usage",
      content: "Your submitted reports (excluding personal contact info) may be visible in public analytics to maintain transparency. However, your specific identity is only visible to authorized PMC administrators and investigators relevant to your case.",
      accent: "border-l-emerald-500",
      color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    },
    {
      icon: <Cookie size={24} />,
      title: "4. Cookies & Session Management",
      content: "We use functional cookies to manage your secure login sessions and remember your theme preferences (Light/Dark mode). We do not use tracking cookies for third-party advertising or profiling.",
      accent: "border-l-amber-500",
      color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
    },
    {
      icon: <Server size={24} />,
      title: "5. Data Retention & Deletion",
      content: "Citizen accounts and associated records are retained as part of the official municipal archive. You may request account deactivation, which will anonymize your historical reports while maintaining the data necessary for public service auditing.",
      accent: "border-l-purple-500",
      color: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
    },
    {
      icon: <Database size={24} />,
      title: "6. Advanced Data Security",
      content: "All citizen data is encrypted using AES-256 standards at rest and TLS 1.3 during transmission. We utilize distributed cloud storage with regional redundancy within India to comply with national data sovereignty laws.",
      accent: "border-l-slate-900 dark:border-l-white",
      color: "bg-slate-900 dark:bg-white text-white dark:text-slate-950"
    }
  ];

  return (
    <div className="bg-surface-pearl dark:bg-slate-950 min-h-screen transition-colors duration-500">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-brand-500/5 blur-[140px] rounded-full animate-float-slow"></div>
        <div className="absolute bottom-[5%] left-[-10%] w-[700px] h-[700px] bg-accent-500/5 blur-[160px] rounded-full animate-float-medium"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-48 pb-32 relative z-10">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-3 text-slate-400 hover:text-brand-600 font-black text-[10px] uppercase tracking-[0.3em] mb-12 transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center group-hover:bg-brand-50 dark:group-hover:bg-brand-500/10 transition-colors shadow-sm">
            <ArrowLeft size={18} />
          </div>
          {t.returnPortal}
        </button>

        <div className="text-left mb-24 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black tracking-[0.4em] uppercase mb-8 border border-white/10 shadow-2xl">
            <ShieldCheck size={14} className="text-brand-500" /> {t.infoIntegrity}
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
            {t.privacyPolicy.split(' ')[0]} <br/> <span className="text-brand-600">{t.privacyPolicy.split(' ')[1] || 'Compliance'}.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            The Puttur Municipal Corporation (PMC) prioritizes the digital sovereignty of its residents. 
            This protocol outlines our rigorous standards for data protection, ensuring your civic engagement is both secure and private.
            <br/><br/>
            Last Updated: October 2024
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {sections.map((section, idx) => (
              <section key={idx} className={`bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] border border-slate-100 dark:border-white/5 unique-card-shadow relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 border-l-[8px] ${section.accent} text-left`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 dark:bg-white/5 rounded-bl-[120px] -translate-y-6 translate-x-6 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-6 mb-8 relative">
                  <div className={`w-16 h-16 rounded-[1.5rem] ${section.color} flex items-center justify-center shadow-2xl shadow-black/5`}>
                    {section.icon}
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{section.title}</h2>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed font-medium relative">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-white/5 shadow-sm sticky top-40 text-left">
              <div className="flex items-center gap-3 mb-8">
                <ShieldAlert size={22} className="text-accent-600" />
                <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-[0.3em]">{t.complianceHub}</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-10 font-medium">
                Our platform operates under the direct supervision of the PMC Information Security & Data Protection Department.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <CheckCircle size={18}/>, text: "ISO 27001 Certified" },
                  { icon: <Lock size={18}/>, text: "End-to-End Encryption" },
                  { icon: <Globe size={18}/>, text: "Indian Data Residency" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-tight">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
