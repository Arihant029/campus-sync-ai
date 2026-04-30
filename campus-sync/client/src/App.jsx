import React, { useState } from 'react';
import { LayoutDashboard, Bell, Calendar, Utensils, MessageSquare, X, Send, Loader2, FileText, Award, MapPin } from 'lucide-react';

const Card = ({ icon, title, info, bar }) => (
  <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 hover:border-blue-500/30 transition-all group">
    <div className="mb-6 transform group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-slate-500 text-sm">{info}</p>
    {bar && (
      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
        <div className={`h-full rounded-full ${bar}`}></div>
      </div>
    )}
  </div>
);

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Welcome to the CampusSync Automation Suite. Select a document type below or type your request." }
  ]);

  const handleSend = async (overrideInput) => {
    const messageToSend = overrideInput || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMsg = { role: 'user', text: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "System connection error. Please ensure your Node.js backend is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-12 font-sans relative overflow-hidden text-left">
      <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <header className="flex justify-between items-center mb-10 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-500">
            CampusSync <span className="text-white underline decoration-blue-600 underline-offset-8">AI</span>
          </h1>
          <p className="text-slate-400 mt-3 uppercase tracking-[0.2em] text-[10px] font-bold">Document Automation Engine</p>
        </div>
        <div className="hidden md:flex bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-xs font-medium text-emerald-500 items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          Systems Live
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        <Card icon={<LayoutDashboard className="text-blue-400 w-10 h-10" />} title="Attendance" info="Status: 85%" bar="w-[85%] bg-blue-500" />
        <Card icon={<FileText className="text-emerald-400 w-10 h-10" />} title="Documents" info="3 Ready to generate" />
        <Card icon={<Award className="text-orange-400 w-10 h-10" />} title="Internships" info="Registration Active" />
        <Card icon={<MapPin className="text-purple-400 w-10 h-10" />} title="Campus" info="SMVEC Main" />
      </div>

      <div className="mt-12 p-10 bg-linear-to-br from-blue-700/20 to-indigo-900/20 border border-blue-500/20 rounded-[2.5rem] backdrop-blur-sm">
        <h2 className="text-2xl font-bold mb-2">Automate Institutional Paperwork</h2>
        <p className="text-slate-400 mb-8 max-w-xl">Generate formal letters, bonafide requests, and internship NOCs instantly using SMVEC-approved templates.</p>
        <button onClick={() => setChatOpen(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-10 py-4 rounded-2xl flex items-center gap-3 transition-all transform hover:scale-105 shadow-xl shadow-blue-600/20">
          <MessageSquare size={22} /> Open Automation Suite
        </button>
      </div>

      {chatOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-7 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600/20 p-2 rounded-xl"><MessageSquare className="text-blue-500" size={20} /></div>
                <h2 className="font-bold text-xl text-white">CampusSync AI</h2>
              </div>
              <X className="cursor-pointer text-slate-400 hover:text-white transition-colors" onClick={() => setChatOpen(false)} />
            </div>
            
            <div className="h-112.5 p-8 overflow-y-auto space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-6 rounded-3xl max-w-[95%] text-[14px] leading-relaxed border shadow-lg ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 border-blue-500 rounded-tr-none text-white' 
                      : 'bg-slate-800 border-slate-700 rounded-tl-none text-slate-200'
                  }`}>
                    {msg.text.split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>{line}<br /></React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && <div className="flex gap-2 text-slate-500 animate-pulse items-center"><Loader2 className="animate-spin" size={16} /> Formatting document...</div>}
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800">
              {/* NEW: QUICK ACTION CHIPS */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['Leave Letter', 'Bonafide Request', 'Internship NOC'].map((type) => (
                  <button 
                    key={type}
                    onClick={() => handleSend(type)}
                    className="whitespace-nowrap px-4 py-2 rounded-xl border border-slate-700 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all bg-slate-950/50"
                  >
                    + {type}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 bg-slate-950 p-2 rounded-3xl border border-slate-800 focus-within:border-blue-500/50 transition-all">
                <input 
                  type="text" value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                  placeholder="Ask for a document..." 
                  className="flex-1 bg-transparent px-6 py-3 outline-none text-white" 
                />
                <button onClick={() => handleSend()} className="bg-blue-600 p-4 rounded-full text-white"><Send size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}