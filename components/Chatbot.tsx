
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Minimize2, Bot, ShieldCheck, ChevronRight, Info, AlertCircle } from 'lucide-react';
import { createMuniBotChat } from '../services/geminiService.ts';
import { Chat } from '@google/genai';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatbotProps {
  currentLanguage: Language;
}

const Chatbot: React.FC<ChatbotProps> = ({ currentLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[currentLanguage];
  
  const getGreeting = () => {
    switch(currentLanguage) {
      case Language.KANNADA:
        return "ನಮಸ್ಕಾರ! ನಾನು ಮುನಿಬಾಟ್. ಪುತ್ತೂರು ನಗರಸಭೆಯ ಸಹಾಯಕಿ. ಸಂಕ್ಷಿಪ್ತವಾಗಿ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?";
      case Language.HINDI:
        return "नमस्ते! मैं मुनीबॉट हूँ। पुत्तुर नगर निगम सहायक। मैं संक्षेप में आपकी कैसे मदद कर सकता हूँ?";
      default:
        return "Hello! I'm MuniBot. PMC Assistant. How can I help you? (Step-by-step & Short)";
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: getGreeting() }
  ]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatInstance = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    currentLanguage === Language.KANNADA ? "ವರದಿ ಮಾಡುವುದು ಹೇಗೆ?" : currentLanguage === Language.HINDI ? "रिपोर्ट कैसे करें?" : "How to report?",
    currentLanguage === Language.KANNADA ? "ತುರ್ತು ಸಹಾಯವಾಣಿ?" : currentLanguage === Language.HINDI ? "आपातकालीन नंबर?" : "Emergency number?",
    currentLanguage === Language.KANNADA ? "ವಾರ್ಡ್‌ಗಳು ಯಾವುವು?" : currentLanguage === Language.HINDI ? "वार्ड कौन से हैं?" : "Wards?"
  ];

  useEffect(() => {
    chatInstance.current = createMuniBotChat(currentLanguage);
    setMessages([{ role: 'bot', text: getGreeting() }]);
  }, [currentLanguage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!chatInstance.current) {
      chatInstance.current = createMuniBotChat(currentLanguage);
    }
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessage = textToSend.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      if (!chatInstance.current) {
        chatInstance.current = createMuniBotChat(currentLanguage);
      }

      const result = await chatInstance.current.sendMessage({ message: userMessage });
      const botResponse = result.text || "Service error. Try again.";
      
      setMessages(prev => [...prev, { role: 'bot', text: botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "Service unavailable." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[150] font-sans">
      <button
        onClick={toggleChat}
        className={`w-16 h-16 rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-all duration-500 transform hover:scale-110 active:scale-95 group relative ${
          isOpen ? 'bg-slate-900 rotate-90' : 'bg-brand-600 hover:bg-brand-500'
        }`}
      >
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse z-10"></div>
        )}
        {isOpen ? (
          <X className="text-white" size={28} />
        ) : (
          <MessageSquare className="text-white group-hover:animate-bounce" size={28} />
        )}
      </button>

      <div className={`absolute bottom-24 right-0 w-[90vw] sm:w-[400px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-500 transform origin-bottom-right ${
        isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-slate-900 dark:bg-slate-950 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={60} className="text-brand-500" />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-white leading-none">MuniBot</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Short & Step-by-Step AI</span>
              </div>
            </div>
          </div>
        </div>

        <div ref={scrollRef} className="h-[350px] overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[9px] font-black ${
                msg.role === 'user' ? 'bg-accent-500/10 text-accent-500' : 'bg-brand-500/10 text-brand-500'
              }`}>
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-medium leading-relaxed shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-accent-600 text-white border-accent-500 rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-white/5 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2">
               <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-500"><Bot size={12} /></div>
               <div className="flex gap-1 animate-pulse">
                 <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                 <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
               </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
          {!isTyping && messages.length < 4 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestions.map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(suggestion)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-brand-500 hover:text-white rounded-xl text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex gap-2">
            <input
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Query..." 
              className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none px-4 py-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white transition-all"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isTyping} 
              className="p-3 bg-brand-600 text-white rounded-xl hover:bg-brand-500 active:scale-95 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
