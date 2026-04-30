import React, { useState } from 'react';
import { jsPDF } from "jspdf";

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // FIXED: Production URL
  const API_URL = "https://campus-sync-ai.onrender.com/api/chat";

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages([...newMsgs, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages([...newMsgs, { role: 'assistant', content: "Connection Error. Check if Render is awake." }]);
    }
    setLoading(false);
    setInput('');
  };

  const downloadPDF = (content) => {
    const doc = new jsPDF();
    doc.text(content, 15, 20, { maxWidth: 180 });
    doc.save("SMVEC_Document.pdf");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold text-blue-500 mb-6">CAMPUSSYNC AI</h1>
      <div className="w-full max-w-lg bg-slate-900 rounded-xl shadow-xl overflow-hidden">
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg text-sm ${msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-800'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && !msg.content.includes("Error") && (
                  <button onClick={() => downloadPDF(msg.content)} className="mt-2 block w-full bg-green-600 text-[10px] py-1 rounded font-bold">PDF DOWNLOAD</button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800 flex gap-2">
          <input className="flex-1 bg-slate-800 p-2 rounded outline-none text-sm" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask for a letter..." />
          <button onClick={handleSend} className="bg-blue-600 px-4 py-2 rounded font-bold text-sm">{loading ? "..." : "SEND"}</button>
        </div>
      </div>
    </div>
  );
}

export default App;