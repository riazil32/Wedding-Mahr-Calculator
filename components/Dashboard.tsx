import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Calendar, 
  Heart, 
  Calculator, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  Coins, 
  History,
  RefreshCw,
  Zap
} from 'lucide-react';
import { useUser } from '../src/context/UserContext';
import { TabType } from '../types';
import { getLiveMarketRates } from '../src/services/marketService';
import { FITRANA_RATE } from '../constants';

interface DashboardProps {
  onNavigate: (tab: TabType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user, financialProfile, stealthMode, setStealthMode } = useUser();
  const [nisab, setNisab] = useState({ gold: 0, silver: 0 });
  const [loadingNisab, setLoadingNisab] = useState(true);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const [isCooldown, setIsCooldown] = useState(false);

  const fetchNisab = async (force = false) => {
    setLoadingNisab(true);
    try {
      const rates = await getLiveMarketRates(force);
      
      // Apply Nisab Adjustment % from profile
      const adjustment = financialProfile?.nisab_adjustment || 0;
      const multiplier = 1 + (adjustment / 100);
      
      // Nisab thresholds: 87.48g gold or 612.36g silver
      setNisab({
        gold: rates.gold * multiplier * 87.48,
        silver: rates.silver * multiplier * 612.36
      });
      setLastFetched(rates.timestamp);
      
      // Cooldown is handled by the service, but we can check the local flag
      // if we want to disable the button in the UI
      const cooldown = localStorage.getItem('hisabbayt_market_cooldown');
      if (cooldown && Date.now() - parseInt(cooldown) < 5 * 60 * 1000) {
        setIsCooldown(true);
      } else {
        setIsCooldown(false);
      }
    } catch (error) {
      console.error('Failed to fetch Nisab prices', error);
    } finally {
      setLoadingNisab(false);
    }
  };

  useEffect(() => {
    fetchNisab();
  }, []);

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '—';
    const formatted = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);

    return stealthMode ? (
      <span className="blur-sm select-none">{formatted}</span>
    ) : (
      formatted
    );
  };

  const calculateDaysRemaining = (dateStr: string | undefined) => {
    if (!dateStr) return null;
    const anniversary = new Date(dateStr);
    const today = new Date();
    
    // Set anniversary to this year or next year
    anniversary.setFullYear(today.getFullYear());
    if (anniversary < today) {
      anniversary.setFullYear(today.getFullYear() + 1);
    }
    
    const diffTime = Math.abs(anniversary.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(financialProfile?.zakat_anniversary_date);
  const zakatProgress = daysRemaining !== null ? Math.max(0, Math.min(100, (354 - daysRemaining) / 354 * 100)) : 0;

  const mahrPaid = financialProfile?.mahr_paid || 0;
  const mahrTotal = financialProfile?.mahr_total || 0;
  const mahrProgress = mahrTotal > 0 ? (mahrPaid / mahrTotal) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#064e3b] dark:text-emerald-400">Assalamu Alaikum, {user?.displayName?.split(' ')[0] || 'Brother/Sister'}</h1>
          <p className="text-gray-600 dark:text-slate-400">Your spiritual & financial overview</p>
        </div>
        <button
          onClick={() => setStealthMode(!stealthMode)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow-md transition-all text-[#064e3b] dark:text-emerald-400 font-medium"
        >
          {stealthMode ? <EyeOff size={18} /> : <Eye size={18} />}
          {stealthMode ? 'Stealth Mode On' : 'Stealth Mode Off'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Nisab Live Tracker */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#064e3b] dark:text-emerald-400">
              <TrendingUp size={20} />
              <h2 className="font-semibold uppercase tracking-wider text-xs">Nisab Live Tracker</h2>
            </div>
            <div className="flex items-center gap-2">
              {!loadingNisab && lastFetched && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  LIVE
                </div>
              )}
              <button
                onClick={() => fetchNisab(true)}
                disabled={loadingNisab || isCooldown}
                className={`p-1.5 rounded-lg transition-all ${
                  isCooldown 
                  ? 'text-gray-300 dark:text-slate-700 cursor-not-allowed' 
                  : 'text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-[#064e3b] dark:hover:text-emerald-400'
                }`}
                title={isCooldown ? "Refresh available in 5 minutes" : "Manual Refresh"}
              >
                <RefreshCw size={14} className={loadingNisab ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          {loadingNisab ? (
            <div className="animate-pulse space-y-3">
              <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Gold Nisab (87.48g)</p>
                  <p className="text-2xl font-bold text-[#064e3b] dark:text-emerald-400">{formatCurrency(nisab.gold)}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]">
                  <Coins size={16} />
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Silver Nisab (612.36g)</p>
                  <p className="text-2xl font-bold text-[#064e3b] dark:text-emerald-400">{formatCurrency(nisab.silver)}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-slate-500">
                  <Coins size={16} />
                </div>
              </div>
              {lastFetched && (
                <p className="text-[10px] text-gray-400 dark:text-slate-500 pt-2 border-t border-gray-50 dark:border-slate-800">
                  Prices updated as of {new Date(lastFetched).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </motion.div>

        {/* Zakat Countdown */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center"
        >
          <div className="flex items-center gap-2 mb-4 text-[#064e3b] dark:text-emerald-400 self-start">
            <Calendar size={20} />
            <h2 className="font-semibold uppercase tracking-wider text-xs">Zakat Countdown</h2>
          </div>
          
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-100 dark:text-slate-800"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 - (364.4 * zakatProgress) / 100}
                className="text-[#d4af37] dark:text-emerald-500 transition-all duration-1000"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[#064e3b] dark:text-emerald-400">{daysRemaining ?? '—'}</span>
              <span className="text-[10px] uppercase text-gray-500 dark:text-slate-400">Days Left</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {financialProfile?.zakat_anniversary_date 
              ? `Next Hawl: ${new Date(financialProfile.zakat_anniversary_date).toLocaleDateString()}`
              : 'Set your anniversary date in settings'}
          </p>
        </motion.div>

        {/* Mahr Progress */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-2 mb-4 text-[#064e3b] dark:text-emerald-400">
            <Heart size={20} />
            <h2 className="font-semibold uppercase tracking-wider text-xs">Mahr Progress</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-slate-400">Paid: {formatCurrency(mahrPaid)}</span>
              <span className="text-gray-500 dark:text-slate-400">Total: {formatCurrency(mahrTotal)}</span>
            </div>
            
            <div className="w-full h-4 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${mahrProgress}%` }}
                className="h-full bg-[#064e3b] dark:bg-emerald-500"
              />
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div>
                <p className="text-xs text-gray-400 dark:text-slate-500 uppercase">Outstanding</p>
                <p className="text-xl font-bold text-[#064e3b] dark:text-emerald-400">{formatCurrency(mahrTotal - mahrPaid)}</p>
              </div>
              <div className="px-3 py-1 bg-[#064e3b]/5 dark:bg-emerald-900/20 rounded-full text-[#064e3b] dark:text-emerald-400 text-xs font-bold">
                {Math.round(mahrProgress)}% Complete
              </div>
            </div>
          </div>
        </motion.div>

        {/* Fitrana Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <div className="flex items-center gap-2 mb-4 text-[#064e3b] dark:text-emerald-400">
            <Zap size={20} />
            <h2 className="font-semibold uppercase tracking-wider text-xs">Fitrana</h2>
          </div>
          
          <div className="space-y-4">
            <div className="text-center py-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800">
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">£{FITRANA_RATE.toFixed(2)} per person</p>
              <p className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                {formatCurrency((financialProfile?.household_size || 1) * FITRANA_RATE)}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mt-1">
                Total for {financialProfile?.household_size || 1} { (financialProfile?.household_size || 1) === 1 ? 'Person' : 'People' }
              </p>
            </div>
            
            <button 
              onClick={() => onNavigate('fitr')}
              className="w-full py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
            >
              Pay Fitrana
            </button>
          </div>
        </motion.div>
      </div>

      {/* Quick Action Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#064e3b] dark:text-emerald-400">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionCard 
            title="Zakat Calculator" 
            description="Calculate your annual Zakat based on your current assets."
            icon={<Calculator className="text-[#064e3b] dark:text-emerald-400" />}
            onClick={() => onNavigate('zakat')}
          />
          <ActionCard 
            title="Mahr Calculator" 
            description="Manage and track your Mahr obligations and history."
            icon={<Heart className="text-[#064e3b] dark:text-emerald-400" />}
            onClick={() => onNavigate('mahr')}
          />
          <ActionCard 
            title="Fitrana Calculator" 
            description="Calculate Zakat al-Fitr for your entire household."
            icon={<History className="text-[#064e3b] dark:text-emerald-400" />}
            onClick={() => onNavigate('fitr')}
          />
        </div>
      </div>

      {/* Financial Profile Summary */}
      <div className="bg-[#064e3b] text-[#f5f5f4] p-8 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-6">Financial Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Last Year Assets</p>
              <p className="text-xl font-semibold">{formatCurrency(financialProfile?.total_assets_last_year)}</p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Household Size</p>
              <p className="text-xl font-semibold">{financialProfile?.household_size || '—'} Members</p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Nisab Adjustment</p>
              <p className="text-xl font-semibold">{financialProfile?.nisab_adjustment || 0}%</p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">Last Updated</p>
              <p className="text-xl font-semibold">
                {financialProfile?.updatedAt ? new Date(financialProfile.updatedAt).toLocaleDateString() : '—'}
              </p>
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => onNavigate('zakat')} // Zakat tab has the adjustment field
                className="text-xs font-bold uppercase tracking-widest border-b border-[#d4af37] text-[#d4af37] hover:text-white hover:border-white transition-all"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* NZF Branding Footer */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3 opacity-70">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-medium">Nisab weights used: 87.48g (Gold) / 612.36g (Silver). Calculated following NZF UK guidelines.</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
          <span>NZF Aligned</span>
          <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
          <span>Evergreen Standards</span>
          <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
          <span>Precision Logic</span>
        </div>
      </div>
    </div>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-left hover:border-[#d4af37] dark:hover:border-emerald-500 hover:shadow-md transition-all group"
    >
      <div className="w-12 h-12 bg-[#064e3b]/5 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#064e3b] dark:group-hover:bg-emerald-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-[#064e3b] dark:text-emerald-400 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{description}</p>
      <div className="flex items-center text-[#d4af37] dark:text-emerald-500 text-xs font-bold uppercase tracking-wider">
        Start Calculating <ChevronRight size={14} className="ml-1" />
      </div>
    </button>
  );
};

export default Dashboard;
