
import React, { useState, useEffect } from 'react';
import { Crescent, Coins, Heart, Sun, Moon, ShoppingBag, Home as HomeIcon, Mail, Settings, MapPin, Coffee, Share2, Globe } from './components/Icons';
import { SettingsModal } from './components/SettingsModal';
import { ZakatCalculator } from './components/ZakatCalculator';
import { MahrCalculator } from './components/MahrCalculator';
import { ZakatFitrCalculator } from './components/ZakatFitrCalculator';
import { MasjidFinder } from './components/MasjidFinder';
import { Home } from './components/Home';
import { Contact } from './components/Contact';
import { SavedCalculations } from './components/SavedCalculations';
import Dashboard from './components/Dashboard';
import { TabType } from './types';
import { FirebaseProvider, useFirebase } from './src/context/FirebaseContext';
import { UserProvider } from './src/context/UserContext';
import { LogIn, LogOut, User as UserIcon, History, LayoutDashboard } from './components/Icons';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const { user, signIn, signOut } = useFirebase();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [showLangMenu, setShowLangMenu] = useState(false);
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
              {user && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'dashboard' 
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>
              )}
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
                onClick={() => setActiveTab('masjid')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'masjid' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <MapPin className="w-5 h-5" />
                Masjid
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
              <button
                onClick={() => setActiveTab('contact')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  activeTab === 'contact' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Mail className="w-5 h-5" />
                Contact
              </button>
              {user && (
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    activeTab === 'saved' 
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <History className="w-5 h-5" />
                  Saved
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="hidden sm:block text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{user.displayName}</span>
                    <button 
                      onClick={signOut} 
                      className="text-[9px] font-black text-rose-500 uppercase tracking-wider hover:text-rose-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                  <div className="relative group">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={signIn}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-100 dark:shadow-none text-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
              )}

              <div className="flex items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
                  aria-label="Toggle theme"
                >
                  {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm flex items-center"
                    aria-label="Select language"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  
                  {showLangMenu && (
                    <div className="absolute right-0 mt-3 w-28 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                      {[
                        { code: 'en', name: 'EN' },
                        { code: 'ar', name: 'AR' },
                        { code: 'bn', name: 'BN' },
                        { code: 'ur', name: 'UR' }
                      ].map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setShowLangMenu(false);
                          }}
                          className={`w-full px-3 py-2 text-center text-[10px] font-black transition-colors ${
                            language === lang.code 
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' 
                              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          {lang.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pb-24">
        {activeTab === 'home' && <Home onNavigate={setActiveTab} />}
        {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
        {activeTab === 'zakat' && <ZakatCalculator />}
        {activeTab === 'fitr' && <ZakatFitrCalculator />}
        {activeTab === 'mahr' && <MahrCalculator />}
        {activeTab === 'masjid' && <MasjidFinder />}
        {activeTab === 'contact' && <Contact />}
        {activeTab === 'saved' && <SavedCalculations />}
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
            onClick={() => setActiveTab('saved')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] font-bold text-sm transition-all ${
              activeTab === 'saved' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <History className="w-5 h-5" />
            Saved
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
            Simple, accurate tools to help you manage Zakat, Fitrana, and Mahr with confidence.
          </p>
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <button 
              onClick={() => setActiveTab('contact')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline uppercase tracking-widest"
            >
              Contact Us
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button 
              onClick={() => setActiveTab('home')}
              className="text-xs font-bold text-slate-400 dark:text-slate-600 hover:underline uppercase tracking-widest"
            >
              Home
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <a 
              href="https://www.buymeacoffee.com/hisabbayt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-500 hover:underline uppercase tracking-widest"
            >
              <Coffee className="w-3.5 h-3.5" />
              Buy Coffee
            </a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'HisabBayt - Islamic Finance Tools',
                    text: 'Check out HisabBayt for Zakat and Mahr calculations!',
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline uppercase tracking-widest"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Site
            </button>
          </div>
          <div className="mt-8 text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
            Made with <span className="text-rose-500 mx-1">❤️</span> by Riazil
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <FirebaseProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </FirebaseProvider>
  );
};

export default App;
