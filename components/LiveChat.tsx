
import React, { useState, useEffect, useRef } from 'react';
import { getSupportResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const LiveChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      text: 'আসসালামু আলাইকুম, আমি লাবনী আক্তার। ক্রিয়েটিভ বিজ (Creative Biz) স্টুডিওতে আপনাকে স্বাগতম। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?', 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await getSupportResponse(input, messages.map(m => ({ role: m.role, text: m.text })));
      const modelMsg: Message = { role: 'model', text: response, timestamp: Date.now() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: 'দুঃখিত, কানেকশনে একটু সমস্যা হচ্ছে। আমি লাবনী আক্তার, দয়া করে আরেকবার চেষ্টা করবেন কি?', 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-6 w-[400px] h-[600px] glass-panel rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/10 animate-in slide-in-from-bottom-10 fade-in duration-300">
          {/* Header */}
          <div className="p-8 bg-black/50 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center border border-yellow-500/20">
                  <i className="fa-solid fa-user-nurse text-yellow-500 text-xl"></i>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-widest">লাবনী আক্তার</h4>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">ক্রিয়েটিভ বিজ সাপোর্ট</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-600 hover:text-white transition-colors">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] px-6 py-4 rounded-3xl text-sm leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-yellow-500 text-black font-medium rounded-tr-none' 
                  : 'bg-zinc-900/80 text-zinc-300 rounded-tl-none border border-white/5'
                }`}>
                  {m.text}
                </div>
                <span className="text-[9px] text-zinc-600 mt-2 uppercase tracking-widest font-mono">
                  {m.role === 'user' ? 'আপনি' : 'লাবনী'} • {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="flex flex-col items-start animate-pulse">
                <div className="bg-zinc-900/80 text-zinc-500 px-6 py-4 rounded-3xl rounded-tl-none border border-white/5 text-xs italic tracking-widest">
                  লাবনী লিখছেন...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-8 bg-black/50 border-t border-white/5">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="লাবনীকে কিছু বলুন..."
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-xs font-medium text-white outline-none focus:border-yellow-500 transition-all placeholder:text-zinc-700"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-yellow-500 hover:text-white transition-colors"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAB Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 shadow-[0_20px_50px_rgba(234,179,8,0.3)] hover:scale-110 active:scale-90
          ${isOpen ? 'bg-zinc-900 text-white rotate-90' : 'bg-yellow-500 text-black'}
        `}
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-comment-dots'} text-2xl`}></i>
      </button>
    </div>
  );
};