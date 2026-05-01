import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { MessageSquare, LayoutDashboard, Clock, Utensils, Bell, Send } from 'lucide-react';

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
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection Error. Render might be waking up..." }]);
    }
    setLoading(false);
  };

  const downloadPDF = (content) => {
    const doc = new jsPDF();
    doc.text(content, 15, 20, { maxWidth: 180 });
    doc.save("SMVEC_Document.pdf");
  };

  if (!showChat) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-8 font-sans">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-blue-500">CampusSync <span className="text-white">AI</span></h1>
            <p className="text-gray-400 text-sm">SMVEC Engineering Management Portal</p>
          </div>
          <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-green-500/30 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-green-400">System: Active</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <LayoutDashboard className="text-blue-500 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-1">Attendance</h3>
            <p className="text-gray-400 text-sm mb-4">Current: 85%</p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[85%]"></div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <Clock className="text-green-500 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-1">Timetable</h3>
            <p className="text-gray-400 text-sm">Next: AI & Logic @ 2PM</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <Utensils className="text-orange-500 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-1">Mess Menu</h3>
            <p className="text-gray-400 text-sm">Today: Paneer & Naan</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <Bell className="text-purple-500 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-1">Notices</h3>
            <p className="text-gray-400 text-sm">2 New Internship Updates</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 rounded-3xl shadow-2xl">
          <h2 className="text-2xl font-bold mb-2">Ask CampusSync AI</h2>
          <p className="text-blue-100 mb-6">I can help you check your marks or draft leave letters to the HOD.</p>
          <button 
            onClick={() => setShowChat(true)}
            className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
          >
            Start Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col p-4">
      <div className="max-w-2xl w-full mx-auto flex flex-col h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">← Back to Dashboard</button>
          <h2 className="text-xl font-bold text-blue-500">CampusSync AI</h2>
        </div>
        
        <div className="flex-1 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <p className="text-center text-gray-500 mt-10">Type "leave letter" to begin...</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 shadow-lg' : 'bg-slate-800 border border-slate-700'}`}>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  {msg.role === 'assistant' && msg.content.includes("Respectfully") && (
                    <button 
                      onClick={() => downloadPDF(msg.content)} 
                      className="mt-3 flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                    >
                      DOWNLOAD OFFICIAL PDF
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="text-blue-500 text-xs animate-pulse">AI is typing...</div>}
          </div>
          
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input 
              className="flex-1 bg-slate-800 border border-slate-700 p-3 rounded-xl outline-none focus:border-blue-500 transition-all text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
            />
            <button 
              onClick={handleSend}
              className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-all shadow-lg"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;