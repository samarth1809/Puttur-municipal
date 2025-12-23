
import React from 'react';
import { Gavel, UserCheck, ShieldAlert, ArrowLeft, Scale, BookOpen, Zap, HelpCircle, FileWarning, Handshake, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface TermsAndConditionsProps {
  currentLanguage: Language;
}

export default function TermsAndConditions({ currentLanguage }: TermsAndConditionsProps) {
  const navigate = useNavigate();
  const t = translations[currentLanguage];

  const sections = [
    {
      icon: <UserCheck size={24} />,
      title: "1. Acceptance of Civic Terms",
      content: "By accessing and using the PMC Digital Portal, you agree to abide by the rules of civic engagement outlined herein. This portal is a public utility designed for honest communication between the citizens of Puttur and the Municipal Corporation.",
      color: "bg-slate-950 dark:bg-white text-white dark:text-slate-950",
      accent: "border-l-slate-900 dark:border-l-white"
    },
    {
      icon: <Handshake size={24} />,
      title: "2. Citizen Responsibility",
      content: "Users are responsible for the accuracy of their reports. Filing intentionally false, misleading, or malicious grievances is a violation of municipal policy and may result in account suspension or legal administrative action.",
      color: "bg-brand-500 text-white",
      accent: "border-l-brand-600"
    },
    {
      icon: <ShieldAlert size={24} />,
      title: "3. Content & Evidence Submission",
      content: "Any images or text uploaded as evidence must be relevant to the reported municipal issue. Prohibited content includes offensive language, private individual photography without consent, and non-civic related media.",
      color: "bg-rose-500 text-white",
      accent: "border-l-rose-600"
    },
    {
      icon: <Zap size={24} />,
      title: "4. Service Expectations",
      content: "While PMC strives for rapid redressal, the portal does not guarantee immediate resolution. Ticket prioritization is determined by AI-assisted severity analysis and available municipal resources.",
      color: "bg-accent-600 text-white",
      accent: "border-l-accent-700"
    },
    {
      icon: <Scale size={24} />,
      title: "5. Intellectual Property",
      content: "All portal designs, logos, and official data are property of the Puttur Municipal Corporation. Citizen-contributed reports grant PMC a non-exclusive license to use the data for public service improvement and reporting.",
      color: "bg-emerald-600 text-white",
      accent: "border-l-emerald-700"
    },
    {
      icon: <AlertTriangle size={24} />,
      title: "6. Limitation of Liability",
      content: "The PMC is not liable for indirect damages arising from your use of the portal, including but not limited to, data loss or service interruptions during critical emergency periods. For life-threatening emergencies, always use direct emergency helplines.",
      color: "bg-amber-600 text-white",
      accent: "border-l-amber-700"
    }
  ];

  return (
    <div className="bg-surface-pearl dark:bg-slate-950 min-h-screen transition-colors duration-500">
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
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black tracking-[0.4em] uppercase mb-8 border border-white/10 shadow-xl">
            <Gavel size={14} className="text-brand-500" /> {t.civicConduct}
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
            {t.termsEngagement.split(' ')[0]} <br/> <span className="text-brand-600">{t.termsEngagement.split(' ')[1] || 'Engagement'}.</span>
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            These terms govern your digital relationship with the Puttur Municipal Corporation. 
            By using this platform, you commit to being an active, honest participant in our city's growth.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {sections.map((section, idx) => (
              <section key={idx} className={`bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] border border-slate-100 dark:border-white/5 unique-card-shadow relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 border-l-[8px] ${section.accent} text-left`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 dark:bg-white/5 rounded-bl-[120px] -translate-y-6 translate-x-6 transition-transform group-hover:scale-110"></div>
                <div className="flex items-center gap-6 mb-8 relative">
                  <div className={`w-16 h-16 rounded-[1.5rem] ${section.color} flex items-center justify-center shadow-2xl shadow-black/10`}>
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
             <div className="bg-slate-900 dark:bg-brand-600 p-10 rounded-[3.5rem] text-white shadow-2xl sticky top-40 text-left overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl"></div>
                <HelpCircle size={40} className="mb-8 opacity-50" />
                <h3 className="text-xl font-black mb-4 uppercase tracking-tighter">Need Legal Clarity?</h3>
                <p className="text-white/70 text-sm font-medium leading-relaxed mb-8">
                  For formal inquiries regarding municipal laws or our digital terms, please reach out to our legal cell.
                </p>
                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Official Contact</div>
                  <div className="font-bold text-sm">legal-cell@puttur.gov</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
