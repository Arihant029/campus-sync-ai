import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { 
  MessageSquare, 
  LayoutDashboard, 
  Clock, 
  Utensils, 
  Bell, 
  Send, 
  ChevronLeft 
} from 'lucide-react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const API_URL = "https://campus-sync-ai.onrender.com/api/chat";

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection Error. Render server is waking up, please wait 30 seconds and try again." }]);
    }
    setLoading(false);
  };

  const downloadPDF = (content) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 20);
    doc.save("CampusSync_Document.pdf");
  };

  // DASHBOARD VIEW
  if (!showChat) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 font-sans">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight">
                <span className="text-blue-500">CampusSync</span> AI
              </h1>
              <p className="text-slate-400 mt-1">SMVEC Engineering Management Portal</p>
            </div>
            <div className="hidden md:flex bg-slate-800/40 px-4 py-2 rounded-full border border-slate-700 items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">System: Active</span>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
              <LayoutDashboard className="text-blue-500 mb-4" size={32} />
              <h3 className="text-lg font-bold">Attendance</h3>
              <p className="text-slate-400 text-sm mb-4">Current: 85%</p>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[85%] rounded-full"></div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
              <Clock className="text-emerald-500 mb-4" size={32} />
              <h3 className="text-lg font-bold">Timetable</h3>
              <p className="text-slate-400 text-sm">Next: AI & Logic @ 2PM</p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
              <Utensils className="text-orange-500 mb-4" size={32} />
              <h3 className="text-lg font-bold">Mess Menu</h3>
              <p className="text-slate-400 text-sm">Today: Paneer & Naan</p>
            </div>

            <div className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm">
              <Bell className="text-purple-500 mb-4" size={32} />
              <h3 className="text-lg font-bold">Notices</h3>
              <p className="text-slate-400 text-sm">2 Internship Updates</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-3">Ask CampusSync AI</h2>
              <p className="text-blue-100 mb-8 max-w-md">I can help you check your marks, track attendance, or draft official leave letters to the HOD.</p>
              <button 
                onClick={() => setShowChat(true)}
                className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-lg"
              >
                Start Chat
              </button>
            </div>
            <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // CHAT VIEW
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col p-4 md:p-8">
      <div className="max-w-3xl w-full mx-auto flex flex-col h-[85vh]">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setShowChat(false)} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
             <h2 className="text-xl font-bold">AI Assistant</h2>
          </div>
        </div>
        
        <div className="flex-1 bg-slate-900/90 rounded-[2rem] border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                <MessageSquare size={48} className="opacity-20" />
                <p>Type "leave letter" to start drafting</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-2xl ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 border border-slate-700 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{msg.content}</p>
                  {msg.role === 'assistant' && msg.content.includes("Respectfully") && (
                    <button 
                      onClick={() => downloadPDF(msg.content)} 
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 p-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                    >
                      Download Official Document (PDF)
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center text-blue-400 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                <span>AI is thinking...</span>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="relative flex items-center">
              <input 
                className="w-full bg-slate-950 border border-slate-800 p-4 pr-16 rounded-2xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-[15px]"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;