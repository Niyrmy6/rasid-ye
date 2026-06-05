import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 text-center font-display overflow-hidden relative selection:bg-teal-500 selection:text-white" dir="rtl">
      
      {/* Animated Background Elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-teal-200/30 rounded-full mix-blend-multiply blur-3xl opacity-60 animate-bounce" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-rose-200/30 rounded-full mix-blend-multiply blur-3xl opacity-60 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-purple-200/30 rounded-full mix-blend-multiply blur-3xl opacity-50 animate-bounce" style={{ animationDuration: '7s' }}></div>

      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg mx-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-10 sm:p-14 rounded-[3rem] shadow-2xl shadow-teal-500/10 border border-white/50 dark:border-white/10">
        
        {/* Face Icon Container */}
        <div 
          className="relative cursor-pointer mb-8 flex justify-center w-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {/* Soft Glow Behind Face */}
          <div className={`absolute inset-0 m-auto blur-2xl rounded-full transition-colors duration-500 w-32 h-32 ${isHovered ? 'bg-red-300/40' : 'bg-teal-300/40'}`}></div>
          
          <span 
            className={`relative z-10 material-symbols-outlined drop-shadow-sm transition-colors duration-500 ${isHovered ? 'text-rose-500' : 'text-teal-500'}`}
            style={{ fontVariationSettings: "'FILL' 1", fontSize: "160px", lineHeight: "1" }}
          >
            {isHovered ? 'sentiment_dissatisfied' : 'sentiment_satisfied'}
          </span>
        </div>
        
        <h1 className="text-7xl sm:text-8xl font-black text-slate-800 dark:text-white mb-2 tracking-tight drop-shadow-sm">
          404
        </h1>
        
        <div className="h-1 w-16 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full mb-6 mx-auto opacity-70"></div>
        
        <p className="text-xl sm:text-2xl font-bold text-slate-600 dark:text-slate-300 mb-10 transition-colors duration-500 leading-relaxed">
          {isHovered ? 'أوه لا! يبدو أنك ضللت الطريق في التطبيق...' : 'عذراً يا صديقي، الصفحة التي تبحث عنها غير موجودة.'}
        </p>

        <Link
          to="/"
          className={`relative overflow-hidden px-8 py-4 sm:px-10 sm:py-5 rounded-2xl text-white font-bold text-lg sm:text-xl shadow-xl flex items-center gap-3 transition-all duration-300 transform active:scale-95 group ${isHovered ? 'bg-gradient-to-r from-slate-700 to-slate-800 shadow-slate-900/20' : 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-teal-500/30'}`}
        >
          <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="material-symbols-outlined rtl:rotate-180 transition-transform duration-300 group-hover:-translate-x-1">arrow_back</span>
          <span className="relative z-10">{isHovered ? 'أنقذني وأعدني للرئيسية' : 'خذني للصفحة الرئيسية'}</span>
        </Link>
      </div>
    </div>
  );
}
