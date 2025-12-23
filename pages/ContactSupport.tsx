
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { User, Language } from '../types.ts';
import { translations } from '../translations.ts';

interface ContactSupportProps {
  user: User | null;
  currentLanguage: Language;
}

const ContactSupport: React.FC<ContactSupportProps> = ({ user, currentLanguage }) => {
  const navigate = useNavigate();
  const t = translations[currentLanguage];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setFormData({ ...formData, subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 animate-fadeIn">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={18} />
        {t.goBack}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-500/10 rounded-lg text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase tracking-widest mb-4 border border-brand-100 dark:border-brand-500/20">
              <HelpCircle size={14} />
              {t.helpCenter}
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-4">{t.howAssist}</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              Our support team is dedicated to providing swift assistance to all citizens and municipal staff. Expect a response within 24 business hours.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{t.emailUs}</h4>
                <p className="text-sm text-slate-500">public-help@muniserve.gov</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Available 24/7</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{t.callSupport}</h4>
                <p className="text-sm text-slate-500">1800-MUNI-CARE</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Mon - Fri: 9AM - 6PM</p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{t.mainOffice}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Municipal Council Plaza, Block B<br />
                  Civic Center, Sector 12
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-white/5 p-8 md:p-12 relative overflow-hidden">
            {isSent ? (
              <div className="text-center py-16 animate-fadeIn">
                <div className="w-24 h-24 bg-brand-50 dark:bg-brand-500/10 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle size={56} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Message Received!</h2>
                <p className="text-slate-500 font-medium mb-10 max-w-sm mx-auto">
                  Your ticket has been logged in our system. A support representative will be in touch shortly.
                </p>
                <button 
                  onClick={() => setIsSent(false)}
                  className="px-8 py-3 bg-slate-900 dark:bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 dark:hover:bg-brand-500 transition-all active:scale-95 shadow-xl shadow-brand-500/10"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8">{t.sendMessage}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.fullName}</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                        placeholder="John Citizen"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.emailAddress}</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.subject}</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                      placeholder="e.g. Technical issue"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.contextDescription}</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:bg-white dark:focus:bg-slate-900 focus:border-brand-500 outline-none transition-all font-bold text-slate-800 dark:text-white resize-none"
                      placeholder="..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group w-full py-5 bg-brand-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-brand-700 shadow-2xl shadow-brand-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        {t.dispatchTicket}
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport;
