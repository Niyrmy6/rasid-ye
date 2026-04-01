import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../components/BottomNav';
import { supabase } from '../lib/supabase';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: 'assistant',
      content: t('chat.welcomeMessage')
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (userQuestion: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-rag-bot', {
        body: { userQuestion },
      });

      if (error) {
        throw error;
      }

      const botReply = data?.reply || t('chat.botNoAnswer');
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: botReply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: t('chat.serverError') }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!inputVal.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputVal.trim()
    };
    
    setMessages(prev => [...prev, newMsg]);
    setInputVal('');
    
    generateBotResponse(newMsg.content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const quickQuestions = [
    t('chat.quickQuestions.q1'),
    t('chat.quickQuestions.q2'),
    t('chat.quickQuestions.q3'),
    t('chat.quickQuestions.q4')
  ];

  const handleQuickQuestion = (q: string) => {
    setInputVal(q);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-text-main dark:text-slate-100 antialiased selection:bg-primary selection:text-white h-screen flex flex-col overflow-hidden">
      <header className="sticky top-0 z-40 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between shadow-sm max-w-md mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#eefcfc] dark:bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">shield</span>
          </div>
          <span className="text-xl font-bold text-text-main dark:text-slate-100">{t('Rasid')}</span>
        </div>
        <h1 className="text-lg font-bold text-text-main dark:text-slate-100">{t('chat.smartAssistant')}</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-48 max-w-md mx-auto w-full hide-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === 'assistant' ? 'bg-mint-light text-[#2C7A6B]' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              <span className="material-symbols-outlined text-2xl">{msg.role === 'assistant' ? 'smart_toy' : 'person'}</span>
            </div>
            <div className={`${msg.role === 'assistant' ? 'bg-mint-light dark:bg-[#2C3E50] rounded-tr-none' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-tl-none'} p-4 rounded-2xl max-w-[85%] shadow-sm`}>
              <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-mint-light flex items-center justify-center text-[#2C7A6B]">
              <span className="material-symbols-outlined text-2xl">smart_toy</span>
            </div>
            <div className="bg-mint-light dark:bg-[#2C3E50] p-4 rounded-2xl rounded-tr-none flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2C7A6B] animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-[#2C7A6B] animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#2C7A6B] animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <div className="fixed bottom-[65px] left-0 right-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md pt-2 max-w-md mx-auto">
        <div className="px-4 mb-3">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {quickQuestions.map((q, idx) => (
              <button 
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                className="whitespace-nowrap px-4 py-2 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-full text-sm text-text-muted hover:border-primary hover:text-primary transition-colors shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4">
          <div className="bg-white dark:bg-surface-dark rounded-full shadow-lg border border-gray-100 dark:border-gray-800 p-2 flex items-center gap-2">
            <button className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined">mic</span>
            </button>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-text-main dark:text-white placeholder-gray-400 min-w-0"
              placeholder={t('chat.typeMessage')}
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="flex-shrink-0 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors shadow-md flex items-center gap-1 disabled:opacity-50"
            >
              <span>{isLoading ? t('chat.loading') : t('chat.send')}</span>
              {!isLoading && <span className="material-symbols-outlined text-[18px] rotate-180">send</span>}
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
