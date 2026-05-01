import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { 
  MessageSquare, LayoutDashboard, Clock, Utensils, 
  Bell, Send, ChevronLeft, FileText, GraduationCap, X 
} from 'lucide-react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeDetail, setActiveDetail] = useState(null);

  const API_URL = "https://campus-sync-ai.onrender.com/api/chat";

  const handleSend = async (forcedInput = null) => {
    const messageToSend = forcedInput || input;
    if (!messageToSend.trim()) return;

    setLoading(true);
    const userMsg = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Server is waking up. Please wait 30 seconds and try again." 
      }]);
    }
    setLoading(false);
  };

  const downloadPDF = (content) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 20);
    doc.save("CampusSync_Official_Document.pdf");
  };

  // --- DETAIL MODAL COMPONENT ---
  const DetailModal = ({ type, onClose }) => {
    const contentData = {
      attendance: {
        title: "Attendance Report",
        color: "text-blue-500",
        details: [
          { label: "Total Working Hours", value: "120 hrs" },
          { label: "Hours Present", value: "102 hrs" },
          { label: "Hours Absent", value: "18 hrs" },
          { label: "Medical Leaves", value: "02" },
        ],
        note: "You need 75% for exams. You are currently safe at 85%."
      },
      mess: {
        title: "Weekly Mess Menu",
        color: "text-orange-500",
        details: [
          { label: "Mon", value: "Morning: Idli | Afternoon: Sambhar Rice | Night: Chapati/Dal" },
          { label: "Tue", value: "Morning: Dosa | Afternoon: Veg Pulav | Night: Variety Rice" },
          { label: "Wed", value: "Morning: Pongal | Afternoon: Egg Curry/Rice | Night: Poori" },
          { label: "Thu", value: "Morning: Poha | Afternoon: Curd Rice/Potato | Night: Fried Rice" },
          { label: "Fri", value: "Morning: Uttapam | Afternoon: Fish/Veg Meals | Night: Parotta" },
          { label: "Sat", value: "Morning: Upma | Afternoon: Lemon Rice | Night: Veg Noodles" },
          { label: "Sun", value: "Morning: Special Breakfast | Afternoon: Chicken Biryani | Night: Gobi 65" },
        ],
        note: "Timings: 7:30 AM | 12:30 PM | 7:30 PM"
      },
      notices: {
        title: "Internship & Placement Cell",
        color: "text-purple-500",
        details: [
          { label: "Google STEP", value: "Applications open for 2nd years. Deadline: May 15" },
          { label: "Zoho Corp", value: "Off-campus drive for Web Developers. Apply on portal." },
          { label: "TCS NQT", value: "Mock test scheduled for Friday at 4:00 PM." },
          { label: "Workshop", value: "AI/ML Workshop by IIT Madras. Registration: ₹200." },
        ],
        note: "Contact your HOD for Bonafide certificates for Google/Zoho."
      }
    };

    const current = contentData[type];
    if (!current) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
            <h2 className={`text-2xl font-bold ${current.color}`}>{current.title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><X /></button>
          </div>
          <div className="p-8 max-h-[60vh] overflow-y-auto space-y-4">
            {current.details.map((item, i) => (
              <div key={i} className="flex flex-col border-b border-slate-800/50 pb-3">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{item.label}</span>
                <span className="text-slate-200 text-sm mt-1">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="p-6 bg-slate-950/50">
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
              <p className="text-blue-400 text-xs italic">{current.note}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!showChat) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-black italic text-blue-500">CAMPUSSYNC AI</h1>
              <p className="text-slate-400 text-sm">SMVEC Engineering Portal • 2026</p>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div onClick={() => setActiveDetail('attendance')} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 hover:border-blue-500 cursor-pointer transition-all group">
              <LayoutDashboard className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold mb-2">Attendance</h3>
              <p className="text-slate-400 text-sm mb-4">You have been present for 102/120 hours.</p>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full w-[85%]"></div></div>
            </div>

            <div onClick={() => setActiveDetail('mess')} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 hover:border-orange-500 cursor-pointer transition-all group">
              <Utensils className="text-orange-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold mb-2">Mess Menu</h3>
              <p className="text-slate-400 text-sm">Today's Special: Paneer & Naan. Click for weekly schedule.</p>
            </div>

            <div onClick={() => setActiveDetail('notices')} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 hover:border-purple-500 cursor-pointer transition-all group">
              <Bell className="text-purple-500 mb-6 group-hover:scale-110 transition-transform" size={40} />
              <h3 className="text-xl font-bold mb-2">Notices</h3>
              <p className="text-slate-400 text-sm">2 New Internship opportunities from Google & Zoho.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-900 p-10 rounded-[3rem] shadow-2xl text-center md:text-left relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">SMVEC Smart Assistant</h2>
              <p className="text-blue-100 mb-8 max-w-lg">Generate official Leave Letters or Bonafide Certificate requests for your HOD instantly.</p>
              <button onClick={() => setShowChat(true)} className="bg-white text-blue-700 px-12 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-50 transition-colors">Start Assistant</button>
            </div>
          </div>
        </div>
        {activeDetail && <DetailModal type={activeDetail} onClose={() => setActiveDetail(null)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col p-4 md:p-8">
      <div className="max-w-3xl w-full mx-auto flex flex-col h-[85vh]">
        <div className="flex items-center justify-between mb-6 px-4">
          <button onClick={() => setShowChat(false)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} /> Back
          </button>
          <h2 className="text-xl font-black text-blue-500 tracking-tighter">CAMPUSSYNC AI</h2>
        </div>
        
        <div className="flex-1 bg-slate-900/90 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center space-y-8 py-10">
                <MessageSquare size={60} className="text-slate-800" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md px-4">
                  <button onClick={() => handleSend("Generate a formal Leave Letter for my HOD. Mention I am in CSE at SMVEC and have 85% attendance.")} className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl hover:border-blue-500 transition-all text-left">
                    <FileText className="text-blue-400 mb-2" />
                    <p className="text-blue-400 font-bold text-sm uppercase">Leave Letter</p>
                  </button>
                  <button onClick={() => handleSend("Draft a request letter to the HOD for a Bonafide Certificate for my internship registration.")} className="bg-slate-800/50 border border-slate-700 p-5 rounded-3xl hover:border-purple-500 transition-all text-left">
                    <GraduationCap className="text-purple-400 mb-2" />
                    <p className="text-purple-400 font-bold text-sm uppercase">Bonafide Request</p>
                  </button>
                </div>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-6 rounded-3xl ${msg.role === 'user' ? 'bg-blue-600 rounded-tr-none' : 'bg-slate-800 border border-slate-700 rounded-tl-none shadow-xl'}`}>
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{msg.content}</p>
                  {msg.role === 'assistant' && (msg.content.includes("Subject:") || msg.content.includes("To,")) && (
                    <button onClick={() => downloadPDF(msg.content)} className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 p-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all">Download Official PDF</button>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="p-4 text-blue-400 animate-pulse text-xs font-bold tracking-widest">AI IS DRAFTING...</div>}
          </div>
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="relative flex items-center max-w-2xl mx-auto w-full">
              <input className="w-full bg-slate-950 border border-slate-800 p-5 pr-16 rounded-3xl outline-none focus:border-blue-500 transition-all" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask for a letter or request..." />
              <button onClick={() => handleSend()} className="absolute right-3 bg-blue-600 p-3 rounded-2xl shadow-lg active:scale-90"><Send size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;