'use client'
import { useState, useRef, useEffect } from 'react';

export function AiAssistant() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! Ask me about your spending. (e.g., "How much did I spend on food?")' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!query.trim()) return;

    const newMessages = [...messages, { role: 'user', text: query }];
    setMessages(newMessages);
    setQuery("");
    setLoading(true);

    try {
      const token = localStorage.getItem('sb-token');
      if (!token) {
        setMessages([...newMessages, { role: 'ai', text: "Please login to use the chat assistant." }]);
        return;
      }
      
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: query }),
      });
      
      const data = await res.json();
      setMessages([...newMessages, { role: 'ai', text: data.response }]);
    } catch (err) {
      setMessages([...newMessages, { role: 'ai', text: "Error connecting to server." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
      <div className="bg-blue-600 text-white p-4 font-bold flex justify-between items-center rounded-t-xl">
        <span>Finance Assistant</span>
        <span className="text-xs bg-blue-500 px-2 py-1 rounded">FinsAI</span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-400 text-xs italic ml-2">Thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t flex gap-2 rounded-b-xl">
        <input 
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask about your expenses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
