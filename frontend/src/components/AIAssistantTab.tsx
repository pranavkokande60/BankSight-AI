import React, { useState } from 'react';
import { Bot, Send, User, Sparkles, HelpCircle } from 'lucide-react';
import { api } from '../api';

export const AIAssistantTab: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      text: "Hello! I am BankSight AI, your quantitative banking assistant. Ask me anything about customer churn patterns in Germany, the multi-product cliff, high-value deposit exposure, or the EARA retention allocation framework.",
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsg = {
      role: 'user',
      text: q,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    api.chatAssistant(q)
      .then((res) => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: res.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      })
      .catch((err) => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Error connecting to assistant: ${err.message}`,
            time: 'Now',
          },
        ]);
      })
      .finally(() => setLoading(false));
  };

  const sampleQuestions = [
    "Why is churn so high in Germany?",
    "Explain the multi-product holding cliff",
    "How does the EARA retention framework work?",
    "What are our champion model benchmark metrics?",
    "What is our high-value balance exposure?",
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 space-y-4">
      <div className="flex items-center space-x-2">
        <Bot className="w-5 h-5 text-sky-400" />
        <div>
          <h1 className="text-base font-bold text-slate-100">AI Banking Decision Assistant</h1>
          <p className="text-xs text-slate-400">Conversational natural-language query interface for European banking portfolio intelligence.</p>
        </div>
      </div>

      {/* Suggested Queries */}
      <div className="flex flex-wrap gap-2">
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-xs text-slate-300 hover:text-sky-300 transition-colors"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto fintech-card p-4 space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              m.role === 'user'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-800 border border-slate-700 text-sky-400'
            }`}>
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
              m.role === 'user'
                ? 'bg-sky-600 text-white rounded-tr-none'
                : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
            }`}>
              {m.text}
              <span className={`block text-[10px] mt-2 font-mono ${m.role === 'user' ? 'text-sky-200' : 'text-slate-500'}`}>
                {m.time}
              </span>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Bot className="w-4 h-4 text-sky-400 animate-spin" />
            <span>BankSight AI is analyzing portfolio data...</span>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about German churn, product holding cliff, model accuracy..."
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-5 py-3 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center space-x-1.5"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};
