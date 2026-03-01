
import React, { useState, useEffect } from 'react';
import { Crescent, Coins, Heart, Sun, Moon, ShoppingBag, Home as HomeIcon, Mail, Settings } from './components/Icons';
import { SettingsModal } from './components/SettingsModal';
import { ZakatCalculator } from './components/ZakatCalculator';
import { MahrCalculator } from './components/MahrCalculator';
import { ZakatFitrCalculator } from './components/ZakatFitrCalculator';
import { Home } from './components/Home';
import { Contact } from './components/Contact';
import { TabType } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-100 selection:text-emerald-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-100 dark:shadow-none">
              <Crescent className="w-6 h-6 text-white fill-white/20" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-white leading-tight">HisabBayt</h1>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Zakat & Mahr Tools</p>
            </div>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('zakat')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'zakat' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Coins className="w-5 h-5" />
                Zakat
              </button>
              <button
                onClick={() => setActiveTab('fitr')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'fitr' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                Fitrana
              </button>
              <button
                onClick={() => setActiveTab('mahr')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'mahr' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Heart className="w-5 h-5" />
                Mahr
              </button>
            </div>

            <button
              onClick={() => setActiveTab('contact')}
              className={`hidden md:flex items-center gap-2 px-4 py-3 rounded-2xl font-bold transition-all border ${
                activeTab === 'contact'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Mail className="w-5 h-5" />
              Contact
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-24">
        {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
        {activeTab === 'zakat' && <ZakatCalculator />}
        {activeTab === 'fitr' && <ZakatFitrCalculator />}
        {activeTab === 'mahr' && <MahrCalculator />}
        {activeTab === 'contact' && <Contact />}
      </main>

      {/* Mobile Sticky Navigation */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-[2rem] p-2 flex border border-white/10 shadow-2xl">
          <button
            onClick={() => setActiveTab('zakat')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-bold text-sm transition-all ${
              activeTab === 'zakat' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Coins className="w-5 h-5" />
            Zakat
          </button>
          <button
            onClick={() => setActiveTab('fitr')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-bold text-sm transition-all ${
              activeTab === 'fitr' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Fitrana
          </button>
          <button
            onClick={() => setActiveTab('mahr')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-bold text-sm transition-all ${
              activeTab === 'mahr' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Heart className="w-5 h-5" />
            Mahr
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-12 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="flex flex-col items-center">
          <Crescent className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-4 fill-current opacity-50" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium max-w-md leading-relaxed">
            Helping Muslims manage their financial obligations with wisdom, clarity, and adherence to authentic Islamic principles.
          </p>
          <div className="mt-6 text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">
            Made with <span className="text-rose-500 mx-1">❤️</span> by Riazil
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
