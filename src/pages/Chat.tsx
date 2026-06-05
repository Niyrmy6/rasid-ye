import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageShell, { MAIN_CLASS } from '../components/PageShell';
import PageHeader from '../components/PageHeader';
import { supabase } from '../lib/supabase';
import { useErrorHandler } from '../hooks/useErrorHandler';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function Chat() {
  const { t, i18n } = useTranslation();
  const { handleError } = useErrorHandler();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: 'assistant',
      content: t('chat.welcomeMessage')
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const initialInputRef = useRef<string>("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom effect has been removed as requested. User will scroll manually.

  const toggleListening = () => {
    // If already listening, stop
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.__manualStop = true;
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    const windowAny = window as any;
    const SpeechRecognition = windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(i18n.language === 'ar'
        ? 'متصفحك لا يدعم التعرف على الصوت. يُنصح باستخدام Chrome.'
        : 'Your browser does not support speech recognition. Please use Chrome.');
      return;
    }

    // Cancel any ongoing speech synthesis
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    const startRecognition = () => {
      const recognition = new SpeechRecognition();
      recognition.__manualStop = false;
      recognitionRef.current = recognition;

      recognition.lang = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        if (finalText.trim()) {
          // Append final text to what was already in the input
          const prev = initialInputRef.current;
          const space = prev ? ' ' : '';
          initialInputRef.current = prev + space + finalText.trim();
          setInputVal(initialInputRef.current);
        } else if (interimText) {
          // Show interim preview (will be replaced by final)
          const prev = initialInputRef.current;
          const space = prev ? ' ' : '';
          setInputVal(prev + space + interimText);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          alert(i18n.language === 'ar'
            ? 'يرجى السماح للمتصفح باستخدام الميكروفون.'
            : 'Please allow microphone access.');
          setIsListening(false);
          recognitionRef.current = null;
        }
        // Ignore no-speech errors — onend will auto-restart
      };

      recognition.onend = () => {
        // Continuous dictation until user taps stop — __manualStop set in toggleListening
        if (!recognition.__manualStop && recognitionRef.current === recognition) {
          try { startRecognition(); } catch (_) {}
        } else {
          setIsListening(false);
        }
      };

      recognition.start();
    };

    // Snapshot input so interim/final speech appends without losing typed text
    initialInputRef.current = inputVal;
    startRecognition();
  };


  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        return;
      }
      
      const cleanText = text
        .replace(/[#*`_-]/g, '')
        .replace(/🚨|👨‍⚕️|🩺|💡|⚠️|📢|🔍/g, ''); 
        
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(i18n.language === 'ar' ? 'ar' : 'en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  const generateBotResponse = async (userQuestion: string) => {
    setIsLoading(true);
    try {
      // Public health Q&A only — no direct DB access from the bot (enforced in Edge Function prompt)
      const { data, error: supaError } = await supabase.functions.invoke('chat-rag-bot', {
        body: { 
          userQuestion,
          lang: i18n.language
        },
      });

      if (supaError) {
        handleError(supaError, { context: 'Chat Bot RPC' });
        const errMsg = t('chat.serverError');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errMsg }]);
        return;
      }

      const botReply = data?.reply || t('chat.botNoAnswer');
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: botReply }]);
    } catch (error) {
      handleError(error, { context: 'Chat Bot Catch' });
      const errMsg = t('chat.serverError');
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errMsg }]);
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
    <PageShell withBottomNav>
      <PageHeader title={t('chat.smartAssistant')} brandLabel={t('Rasidna')} />

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6 pb-48 max-w-md mx-auto w-full hide-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.role === 'assistant' ? 'bg-mint-light dark:bg-[#1a3c30] text-[#2C7A6B] dark:text-[#bcecdb]' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 text-gray-500'}`}>
              <span className="material-symbols-outlined text-2xl">{msg.role === 'assistant' ? 'smart_toy' : 'person'}</span>
            </div>
            <div className={`${msg.role === 'assistant' ? 'bg-mint-light dark:bg-[#1e2a2a] rounded-tr-none' : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 rounded-tl-none'} p-4 rounded-2xl max-w-[85%] shadow-sm relative group`}>
              <p className="text-sm leading-relaxed text-text-main whitespace-pre-wrap">
                {msg.content}
              </p>
              {msg.role === 'assistant' && (
                <div className="flex justify-end mt-2 pt-1 border-t border-black/5 dark:border-white/5">
                  <button 
                    onClick={() => speakText(msg.content)}
                    className="flex items-center gap-1 text-xs text-[#2C7A6B] dark:text-[#bcecdb] hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">volume_up</span>
                    <span>{i18n.language === 'ar' ? 'استمع' : 'Listen'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-mint-light dark:bg-[#1a3c30] flex items-center justify-center text-[#2C7A6B] dark:text-[#bcecdb]">
              <span className="material-symbols-outlined text-2xl">smart_toy</span>
            </div>
            <div className="bg-mint-light dark:bg-[#1e2a2a] p-4 rounded-2xl rounded-tr-none flex gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2C7A6B] dark:bg-primary animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-[#2C7A6B] dark:bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-[#2C7A6B] dark:bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
            <button 
              type="button"
              onClick={toggleListening}
              className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
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
              type="button"
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

    </PageShell>
  );
}
