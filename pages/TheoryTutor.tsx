import React, { useState, useRef, useEffect } from 'react';
import { sendTheoryQuestion } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, Bot, User, AlertCircle, Loader2 } from 'lucide-react';

export const TheoryTutor: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm ProTutor, your AI driving theory assistant. Ask me anything about the Highway Code, road signs, or safe driving!",
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendTheoryQuestion(input);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-80px)] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-2xl flex flex-col h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Chat Header */}
        <div className="bg-brand-600 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">ProTutor AI</h1>
            <p className="text-brand-100 text-xs">Expert on UK Highway Code</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1
                    ${msg.role === 'user' ? 'bg-brand-100 text-brand-700' : 'bg-accent-100 text-accent-700'}
                  `}
                >
                  {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                <div 
                  className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap
                    ${msg.role === 'user' 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : msg.isError 
                        ? 'bg-red-50 text-red-600 border border-red-200 rounded-tl-none'
                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                    }
                  `}
                >
                  {msg.isError && <AlertCircle className="w-4 h-4 inline mr-1" />}
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start w-full">
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center mt-1">
                   <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex items-center gap-2">
                   <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                   <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-4 border-t border-slate-100">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., What is the stopping distance at 30mph?"
              className="flex-grow px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-700 text-sm placeholder-slate-400 transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="mt-2 text-center">
             <p className="text-[10px] text-slate-400">
               AI can make mistakes. Always check the official Highway Code.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};