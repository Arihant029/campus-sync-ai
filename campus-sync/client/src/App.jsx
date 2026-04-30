import React, { useState } from 'react';
import { jsPDF } from "jspdf";

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://campus-sync-ai.onrender.com/api/chat";

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: "Connection Error: Check Render Logs." }]);
    }
    setLoading(false);
    setInput('');
  };

  const downloadPDF = (content) => {
    const doc = new jsPDF();
    doc.setFont("times", "normal");
    doc.text(content, 15, 20, { maxWidth: 180 });
    doc.save("SMVEC_Document.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center font-sans">
      <h1 className="text-3xl font-bold text-blue-500 mb-6">CAMPUSSYNC AI 🚀</h1>
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 rounded-xl max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 shadow-lg' : 'bg-slate-800 border border-slate-700 text-slate-300'}`}>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                {msg.role === 'assistant' && !msg.content.includes("Error") && (
                  <button onClick={() => downloadPDF(msg.content)} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] py-2 rounded-lg font-bold tracking-widest transition-all">
                    DOWNLOAD OFFICIAL PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800 flex gap-2 bg-slate-900/50">
          <input className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask for a document..." />
          <button onClick={handleSend} className="bg-blue-600 px-6 py-2 rounded-xl font-bold shadow-lg text-sm">{loading ? "..." : "SEND"}</button>
        </div>
      </div>
    </div>
  );
}

export default App;