import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function ChatCoach({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setIsTyping(true);

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // 2. Call Gemini
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are the Katagiri High Nutrition Club. The lead coach is Miyamura Izumi. 
          Provide nutritional analysis while simulating a group chat with multiple characters.
          
          Character Profiles & Image URLs:
          - Miyamura Izumi: Gentle, shy, polite. (Image: https://res.cloudinary.com/dleg7ww07/image/upload/v1/animeint)
          - Tohru Ishikawa: Blunt, energetic, teases Miyamura. (Image: https://res.cloudinary.com/dleg7ww07/image/upload/v1/tohru_chibi)
          - Sengoku Kakeru: Dramatic, worried about frailty. (Image: https://res.cloudinary.com/dleg7ww07/image/upload/v1/sengoku_chibi)
          - Kyoko Hori: Bossy, protective, efficient. (Image: https://res.cloudinary.com/dleg7ww07/image/upload/v1/hori_chibi)
          - Yuki Yoshikawa: Sweet, focuses on "vibes" and colors. (Image: https://res.cloudinary.com/dleg7ww07/image/upload/v1/yuki_chibi)
          - Sakura & Remi: Dessert specialists. (Images: sakura_chibi, remi_chibi)
          
          Response Logic:
          - Always provide a JSON-style list of replies.
          - Miyamura starts most replies.
          - Tohru or Sengoku must tease Miyamura's advice.
          - If the user talks about heavy meals, Hori should interject.
          - If it's sweets, Sakura or Remi should jump in.
          
          Required Format: Output ONLY a JSON array of objects. No markdown blocks.
          [
            {"char": "Miyamura", "img": "https://res.cloudinary.com/dleg7ww07/image/upload/v1/animeint", "text": "That looks like a healthy choice... I hope you enjoy it."},
            {"char": "Tohru", "img": "https://res.cloudinary.com/dleg7ww07/image/upload/v1/tohru_chibi", "text": "Look at Miyamura being all serious again! Just eat the food already!"},
            {"char": "Hori", "img": "https://res.cloudinary.com/dleg7ww07/image/upload/v1/hori_chibi", "text": "Make sure you finish every bite! No leaving leftovers!"}
          ]`
        },
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }))
      });

      const response = await chat.sendMessage({ message: userMessage });
      const botResponse = response.text;

      setMessages(prev => [...prev, {
        role: 'model',
        content: botResponse,
        timestamp: new Date()
      }]);

    } catch (err) {
      console.error("Chat error", err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh] glass-card p-0 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <User className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-display font-bold">Miyamura & Friends</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs text-indigo-500 font-medium tracking-tight">Hanging out in class</span>
            </div>
          </div>
        </div>
        <button className="text-gray-500 hover:text-white transition-colors">
            <Sparkles className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="text-center py-20 space-y-4"
             >
               <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20">
                 <User className="w-10 h-10 text-indigo-400" />
               </div>
               <div className="space-y-1">
                 <p className="text-white font-bold">"Um... hello! I'm Miyamura."</p>
                 <p className="text-gray-500 text-xs max-w-xs mx-auto">
                   The whole class is here to help you stay healthy! Ask me anything, or maybe Tohru has some advice...
                 </p>
               </div>
             </motion.div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={msg.id || `msg-${i}`}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-4 transition-all",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border overflow-hidden",
                msg.role === 'user' ? "bg-blue-500/10 border-blue-500/20" : "bg-indigo-500/10 border-indigo-500/20"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-blue-400" /> : <img src="https://res.cloudinary.com/dleg7ww07/image/upload/v1/animeint" className="w-full h-full object-cover" />}
              </div>
              <div className={cn(
                "max-w-[80%] space-y-2",
                msg.role === 'user' ? "text-right" : "text-left"
              )}>
                {msg.role === 'user' ? (
                  <div className="bg-blue-500 text-white rounded-2xl rounded-tr-none p-4 text-sm shadow-lg">
                    {msg.content}
                  </div>
                ) : (
                  (() => {
                    try {
                      const data = JSON.parse(msg.content);
                      if (Array.isArray(data)) {
                        return data.map((entry: any, idx: number) => (
                          <div key={idx} className="flex gap-3 mb-2 animate-in fade-in slide-in-from-left-2 duration-300">
                             <img src={entry.img} className="w-6 h-6 rounded-full shrink-0 border border-white/10" />
                             <div className="glass rounded-2xl rounded-tl-none p-3 text-sm text-gray-200">
                               <span className="font-bold text-xs text-indigo-400 block mb-1">{entry.char}</span>
                               {entry.text}
                             </div>
                          </div>
                        ));
                      }
                      return <div className="glass p-4 rounded-2xl text-sm">{msg.content}</div>;
                    } catch {
                      return <div className="glass p-4 rounded-2xl text-sm">{msg.content}</div>;
                    }
                  })()
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="glass rounded-2xl rounded-tl-none p-4 px-6">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.2 }}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-6 bg-white/[0.02] border-t border-white/5">
        <div className="relative">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your health..."
            className="w-full glass bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className={cn(
              "absolute right-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all",
              input.trim() && !isTyping ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 text-gray-600"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
