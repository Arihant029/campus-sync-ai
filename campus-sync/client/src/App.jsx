// client/src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { jsPDF } from "jspdf";
import { 
  MessageSquare, LayoutDashboard, Utensils, 
  Bell, Send, ChevronLeft, FileText, GraduationCap, X 
} from 'lucide-react';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [activeDetail, setActiveDetail] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = useRef(null);
  const API_URL = "https://campus-sync-ai.onrender.com/api/chat";

  // --- 1. Mess Menu Data & Logic ---
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentDay = days[new Date().getDay()];

  const messSchedule = {
    "Mon": "Dosa | Variety Rice | Chapati & Dal",
    "Tue": "Idli | Veg Biryani | Variety Rice",
    "Wed": "Pongal | Egg Curry & Rice | Poori",
    "Thu": "Poha | Curd Rice | Veg Fried Rice",
    "Fri": "Uttapam | Fish/Veg Meals | Parotta",
    "Sat": "Upma | Lemon Rice | Veg Noodles",
    "Sun": "Special Tiffin | Chicken Biryani | Gobi 65"
  };

  // --- 2. Effects & Helpers ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && showChat) setShowChat(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showChat]);

  const typeWriter = (text) => {
    setIsTyping(true);
    let index = -1;
    let currentText = "";
    setMessages(prev => [...prev, { role: 'assistant', content: "" }]);
    const interval = setInterval(() => {
      index++;
      if (index < text.length) {
        currentText += text.charAt(index);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = currentText;
          return updated;
        });
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 15);
  };

  const handleSend = async (forcedInput = null) => {
    const messageToSend = forcedInput || input;
    if (!messageToSend.trim() || isTyping) return;
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setInput('');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await response.json();
      setLoading(false);
      typeWriter(data.reply);
    } catch (err) {
      setLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: "Server error. Try again in 30s!" }]);
    }
  };

  const downloadPDF = (content) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 15, 20);
    doc.save("CampusSync_Document.pdf");
  };

  const DetailModal = ({ type, onClose }) => {
    const contentData = {
      attendance: {
        title: "Attendance Analysis",
        color: "text-blue-500",
        details: [
          { label: "Current Percentage", value: "85%" },
          { label: "Total Hours", value: "120" },
          { label: "Hours Present", value: "102" },
          { label: "Hours Absent", value: "18" },
        ],
        note: "You can miss up to 12 more hours to stay above 75%."
      },
      mess: {
        title: "Weekly Mess Menu",
        color: "text-orange-500",
        details: Object.entries(messSchedule).map(([day, menu]) => ({ label: day, value: menu })),
        note: "Special Sunday lunch served at 12:45 PM."
      },
      notices: {
        title: "Internship & Placement Notices",
        color: "text-purple-500",
        details: [
          { label: "Google STEP", value: "Applications for 2nd year CSE open." },
          { label: "Zoho Drive", value: "Off-campus drive on May 10." },
          { label: "TCS NQT", value: "Registration closes tonight at 11:59 PM." },
        ],
        note: "Apply for certificates via AI Assistant."
      }
    };
    const current = contentData[type];
    if (!current) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h2 className={`text-xl font-bold ${current.color}`}>{current.title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full"><X /></button>
          </div>
          <div className="p-6 space-y-4">
            {current.details.map((item, i) => (
              <div key={i} className={`flex justify-between items-start border-b border-slate-800/50 pb-2 ${item.label === currentDay ? 'bg-orange-500/10 p-1 rounded' : ''}`}>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{item.label}</span>
                <span className={`text-sm text-right max-w-[200px] ${item.label === currentDay ? 'text-orange-400 font-bold' : 'text-slate-200'}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <div className="p-6 bg-slate-950/50">
            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl"><p className="text-blue-400 text-xs italic">{current.note}</p></div>
          </div>
        </div>
      </div>
    );
  };

  if (!showChat) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 font-sans">
        <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
          <h1 className="text-3xl font-black text-blue-500 tracking-tighter">CAMPUSSYNC AI</h1>
          <div className="bg-slate-800/40 px-4 py-2 rounded-full border border-green-500/30 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-green-400 uppercase">System: Active</span>
          </div>
        </header>

        {/* --- AI ASSISTANT SECTION (NOW ON TOP) --- */}
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-800 p-10 rounded-[3rem] shadow-2xl mb-12">
          <h2 className="text-3xl font-bold mb-4">Need an official document?</h2>
          <p className="text-blue-100 mb-8 max-w-md">Our AI can draft leave letters or bonafide requests for the HOD in seconds.</p>
          <button onClick={() => setShowChat(true)} className="bg-white text-blue-700 px-10 py-4 rounded-2xl font-bold hover:scale-105 transition-transform">Start Assistant</button>
        </div>

        {/* --- DASHBOARD CARDS SECTION (NOW ON BOTTOM) --- */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div onClick={() => setActiveDetail('attendance')} className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 hover:border-blue-500 cursor-pointer transition-all">
            <LayoutDashboard className="text-blue-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Attendance</h3>
            <p className="text-slate-400 text-sm mb-4">Current: 85%. View detailed hour-wise split.</p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden"><div className="bg-blue-500 h-full w-[85%]"></div></div>
          </div>

          <div onClick={() => setActiveDetail('mess')} className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 hover:border-orange-500 cursor-pointer transition-all">
            <Utensils className="text-orange-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Mess Menu</h3>
            {/* --- DYNAMIC PREVIEW OF TODAY'S FOOD --- */}
            <p className="text-orange-400 text-sm font-bold mb-1">Today ({currentDay}):</p>
            <p className="text-slate-400 text-xs">{messSchedule[currentDay]}</p>
          </div>

          <div onClick={() => setActiveDetail('notices')} className="bg-slate-900/50 p-8 rounded-[2rem] border border-slate-800 hover:border-purple-500 cursor-pointer transition-all">
            <Bell className="text-purple-500 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Notices</h3>
            <p className="text-slate-400 text-sm">2 Internship opportunities found. Click to see details.</p>
          </div>
        </div>
        {activeDetail && <DetailModal type={activeDetail} onClose={() => setActiveDetail(null)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col p-4 md:p-8">
      <div className="max-w-3xl w-full mx-auto flex flex-col h-[85vh]">
        <header className="flex justify-between items-center mb-6">
          <button onClick={() => setShowChat(false)} className="flex items-center gap-2 text-slate-400 hover:text-white"><ChevronLeft size={20} /> Dashboard (Esc)</button>
          <h2 className="text-lg font-bold text-blue-500">AI Assistant</h2>
        </header>
        <div className="flex-1 bg-slate-900/90 rounded-[2.5rem] border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <MessageSquare size={48} className="text-slate-800" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
                  <button disabled={isTyping} onClick={() => handleSend("Generate a leave letter for the HOD")} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-blue-500 text-left transition-all">
                    <FileText className="text-blue-400 mb-1" size={20} /><p className="text-sm font-bold">Leave Letter</p>
                  </button>
                  <button disabled={isTyping} onClick={() => handleSend("Draft a Bonafide Certificate request")} className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 hover:border-purple-500 text-left transition-all">
                    <GraduationCap className="text-purple-400 mb-1" size={20} /><p className="text-sm font-bold">Bonafide Request</p>
                  </button>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-5 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 rounded-tr-none' : 'bg-slate-800 border border-slate-700 rounded-tl-none shadow-lg'}`}>
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{msg.content}</p>
                  {msg.role === 'assistant' && !isTyping && (msg.content.includes("Subject:") || msg.content.includes("To,")) && (
                    <button onClick={() => downloadPDF(msg.content)} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 p-3 rounded-xl text-xs font-bold uppercase transition-all">Download Official PDF</button>
                  )}
                </div>
              </div>
            ))}
            {loading && <div className="text-blue-400 animate-pulse text-xs font-bold px-2">AI is drafting...</div>}
            <div ref={chatEndRef} />
          </div>
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="relative flex items-center max-w-2xl mx-auto w-full">
              <input className="w-full bg-slate-950 border border-slate-800 p-4 pr-16 rounded-2xl outline-none focus:border-blue-500" value={input} disabled={isTyping} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={isTyping ? "AI is typing..." : "Type anything..."} />
              <button onClick={() => handleSend()} disabled={isTyping} className="absolute right-2 bg-blue-600 p-3 rounded-xl"><Send size={20} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;