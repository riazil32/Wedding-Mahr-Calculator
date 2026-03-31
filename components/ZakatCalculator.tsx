
import React, { useState, useEffect } from 'react';
import { Info, Crescent, Coins, Wallet, Banknote, TrendingUp, ChevronRight, ExternalLink, Save, RefreshCw } from './Icons';
import { ZAKAT_NISAB_SILVER_GRAMS, ZAKAT_NISAB_GOLD_GRAMS, ZAKAT_RATE } from '../constants';
import { useFirebase } from '../src/context/FirebaseContext';
import { useFinancialData } from '../src/context/UserContext';
import { Save as SaveIcon, Zap } from 'lucide-react';
import { getLiveMarketRates, FALLBACK_GOLD_PRICE, FALLBACK_SILVER_PRICE } from '../src/services/marketService';

export const ZakatCalculator: React.FC = () => {
  const [goldPrice, setGoldPrice] = useState<number>(FALLBACK_GOLD_PRICE); // Default GBP/g (Market Estimate)
  const [silverPrice, setSilverPrice] = useState<number>(FALLBACK_SILVER_PRICE); // Default GBP/g (Market Estimate)
  const [nisabAdjustment, setNisabAdjustment] = useState<number>(0);
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Assets
  const [cash, setCash] = useState<number>(0);
  const [goldWeight, setGoldWeight] = useState<number>(0);
  const [silverWeight, setSilverWeight] = useState<number>(0);
  const [investments, setInvestments] = useState<number>(0);
  const [businessAssets, setBusinessAssets] = useState<number>(0);
  const [moneyOwedToYou, setMoneyOwedToYou] = useState<number>(0);

  // Liabilities
  const [debts, setDebts] = useState<number>(0);
  const [expenses, setExpenses] = useState<number>(0);

  const { user, saveCalculation } = useFirebase();
  const { financialProfile, updateFinancialProfile } = useFinancialData();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isCooldown, setIsCooldown] = useState(false);

  // Auto-fill from profile
  useEffect(() => {
    if (financialProfile?.total_assets_last_year && cash === 0) {
      setCash(financialProfile.total_assets_last_year);
    }
    if (financialProfile?.nisab_adjustment !== undefined) {
      setNisabAdjustment(financialProfile.nisab_adjustment);
    }
  }, [financialProfile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      await updateFinancialProfile({
        total_assets_last_year: totalAssets,
        nisab_adjustment: nisabAdjustment
      });
      alert("Financial profile updated with current assets and adjustment!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const label = prompt("Enter a label for this calculation (e.g., 'Ramadan 2024')") || `Zakat ${new Date().toLocaleDateString()}`;
      await saveCalculation('zakat', label, {
        cash, goldWeight, silverWeight, investments, businessAssets, moneyOwedToYou,
        debts, expenses, goldPrice, silverPrice
      }, zakatDue, '£');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save calculation.");
    } finally {
      setIsSaving(false);
    }
  };

  const fetchLivePrices = async (force = false) => {
    setIsFetching(true);
    setError(null);
    try {
      const rates = await getLiveMarketRates(force);
      
      // Apply Nisab Adjustment %
      const multiplier = 1 + (nisabAdjustment / 100);
      setGoldPrice(rates.gold * multiplier);
      setSilverPrice(rates.silver * multiplier);
      
      setLastUpdated(new Date(rates.timestamp).toLocaleTimeString());
      
      // Cooldown is handled by the service
      const cooldown = localStorage.getItem('hisabbayt_market_cooldown');
      if (cooldown && Date.now() - parseInt(cooldown) < 5 * 60 * 1000) {
        setIsCooldown(true);
      } else {
        setIsCooldown(false);
      }
    } catch (err: any) {
      console.error("Error fetching prices:", err);
      setError(`Error: ${err.message || "Market data temporarily unavailable"}. Please check your API key in Settings.`);
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-fetch on load
  useEffect(() => {
    fetchLivePrices();
  }, []);

  const totalAssets = cash + (goldWeight * goldPrice) + (silverWeight * silverPrice) + investments + businessAssets + moneyOwedToYou;
  const totalLiabilities = debts + expenses;
  const netAssets = Math.max(0, totalAssets - totalLiabilities);
  
  const silverNisabValue = ZAKAT_NISAB_SILVER_GRAMS * silverPrice;
  const goldNisabValue = ZAKAT_NISAB_GOLD_GRAMS * goldPrice;
  
  // Most scholars recommend using Silver Nisab as it benefits the poor more (lower threshold)
  const isEligible = netAssets >= silverNisabValue;
  const zakatDue = isEligible ? netAssets * ZAKAT_RATE : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-slate-800 dark:text-white mb-2">Precision Zakat Calculator</h2>
        <p className="text-slate-600 dark:text-slate-400">Calculate your obligatory charity based on real-time market valuations</p>
      </div>

      {/* Market Data Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 md:p-8 mb-8 border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center relative">
              <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              {!isFetching && lastUpdated && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <Zap size={8} className="text-white fill-current" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 dark:text-white">Live Market Rates</h3>
                {!isFetching && lastUpdated && (
                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold rounded uppercase tracking-wider">
                    Live
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lastUpdated ? `Prices updated as of ${lastUpdated}` : 'Current prices per gram (GBP)'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Gold (24k) /g</p>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-bold">£</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none outline-none text-lg font-black text-slate-800 dark:text-white w-20"
                />
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Silver /g</p>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-bold">£</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={silverPrice}
                  onChange={(e) => setSilverPrice(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none outline-none text-lg font-black text-slate-800 dark:text-white w-20"
                />
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-700">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Nisab Adj. %</p>
              <div className="flex items-center gap-1">
                <input 
                  type="number" 
                  step="0.1"
                  value={nisabAdjustment}
                  onChange={(e) => setNisabAdjustment(parseFloat(e.target.value) || 0)}
                  className="bg-transparent border-none outline-none text-lg font-black text-slate-800 dark:text-white w-16"
                />
                <span className="text-slate-400 font-bold">%</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a 
                href="https://www.bullionvault.com/gold-price-chart.do" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 hover:underline bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg border border-amber-100 dark:border-amber-800/50 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3 h-3" />
                Check Gold
              </a>
              <a 
                href="https://www.bullionvault.com/silver-price-chart.do" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:underline bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3 h-3" />
                Check Silver
              </a>
            </div>
            <button 
              onClick={() => fetchLivePrices(true)}
              disabled={isFetching || isCooldown}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                isFetching || isCooldown 
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-none'
              }`}
              title={isCooldown ? "Refresh available in 5 minutes" : "Refresh prices"}
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Updating...' : isCooldown ? 'Refreshed' : 'Sync with NZF / Market Rates'}
            </button>
          </div>
        </div>
        {lastUpdated && <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase mt-4 text-right">Last Sync: {lastUpdated}</p>}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Inputs Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Assets Section */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="bg-emerald-600 p-6 text-white flex items-center gap-3">
              <Wallet className="w-6 h-6" />
              <h3 className="text-xl font-bold">Your Assets</h3>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cash (Hand & Bank)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold">£</span>
                    <input type="number" value={cash || ''} onChange={e => setCash(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-xl outline-none transition-all font-bold text-slate-800 dark:text-white" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Gold Weight (Grams)</label>
                  <div className="relative">
                    <input type="number" value={goldWeight || ''} onChange={e => setGoldWeight(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-xl outline-none transition-all font-bold text-slate-800 dark:text-white" placeholder="0.00" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 text-xs font-bold">g</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Silver Weight (Grams)</label>
                  <div className="relative">
                    <input type="number" value={silverWeight || ''} onChange={e => setSilverWeight(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-xl outline-none transition-all font-bold text-slate-800 dark:text-white" placeholder="0.00" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 text-xs font-bold">g</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Investments (Shares/Crypto)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold">£</span>
                    <input type="number" value={investments || ''} onChange={e => setInvestments(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-xl outline-none transition-all font-bold text-slate-800 dark:text-white" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Business Assets (Stock/Cash)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold">£</span>
                    <input type="number" value={businessAssets || ''} onChange={e => setBusinessAssets(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-xl outline-none transition-all font-bold text-slate-800 dark:text-white" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Money Owed to You</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold">£</span>
                    <input type="number" value={moneyOwedToYou || ''} onChange={e => setMoneyOwedToYou(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-xl outline-none transition-all font-bold text-slate-800 dark:text-white" placeholder="0.00" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Liabilities Section */}
          <section className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            <div className="bg-slate-800 dark:bg-slate-950 p-6 text-white flex items-center gap-3">
              <Banknote className="w-6 h-6" />
              <h3 className="text-xl font-bold">Liabilities</h3>
            </div>
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Debts (Short-term/Overdue)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold">£</span>
                    <input type="number" value={debts || ''} onChange={e => setDebts(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-400 focus:bg-white dark:focus:bg-slate-700 rounded-xl outline-none transition-all font-bold text-slate-800 dark:text-white" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Immediate Expenses</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold">£</span>
                    <input type="number" value={expenses || ''} onChange={e => setExpenses(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-400 focus:bg-white dark:focus:bg-slate-700 rounded-xl outline-none transition-all font-bold text-slate-800 dark:text-white" placeholder="0.00" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Summary Column */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden sticky top-24 transition-colors">
            <div className="p-8">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Crescent className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                Calculation Summary
              </h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Assets</span>
                  <span className="text-slate-800 dark:text-white font-bold">£{totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total Liabilities</span>
                  <span className="text-red-500 font-bold">- £{totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 dark:text-slate-300 font-bold">Net Zakatable</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">£{netAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className={`p-6 rounded-3xl mb-8 border transition-all ${isEligible ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isEligible ? 'bg-emerald-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Zakat Due (2.5%)</p>
                    <p className={`text-3xl font-black ${isEligible ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
                      £{zakatDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                
                {!isEligible && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Your net assets are below the Silver Nisab threshold (approx. £{silverNisabValue.toFixed(2)}). Zakat is not obligatory at this time.
                  </p>
                )}
                {isEligible && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                    Your wealth exceeds the Nisab. This amount is due to be distributed to the eligible categories of recipients.
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <p className="text-[10px] text-blue-800 dark:text-blue-300 font-medium">
                    Nisab (Silver): £{silverNisabValue.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                    Nisab (Gold): £{goldNisabValue.toFixed(2)}
                  </p>
                </div>
              </div>

              {user && (
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || zakatDue === 0}
                    className={`w-full mt-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                      saveSuccess 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                        : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50'
                    }`}
                  >
                    {isSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saveSuccess ? 'Saved Successfully!' : 'Save Calculation'}
                  </button>
                  
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-sm"
                  >
                    {isUpdatingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <SaveIcon size={16} />}
                    Update Financial Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Educational Section */}
      <div className="mt-12 bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden transition-colors">
        <div className="relative z-10 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-6">Understanding Zakat</h3>
            <div className="space-y-6 text-slate-300 dark:text-slate-400 text-sm leading-relaxed">
              <p>
                <strong className="text-emerald-400">Pillar of Islam:</strong> Zakat is the third pillar of Islam, a mandatory charitable contribution for every adult Muslim who meets the wealth threshold (Nisab).
              </p>
              <p>
                <strong className="text-emerald-400">Nisab Threshold:</strong> The minimum amount of wealth one must possess for a full lunar year (Hawl) before Zakat becomes due. It is equivalent to 87.48g of Gold or 612.36g of Silver.
              </p>
              <p>
                <strong className="text-emerald-400">Purification:</strong> The word Zakat means "purification" and "growth." It purifies your wealth and provides social security for the less fortunate.
              </p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              Who Receives Zakat?
            </h4>
            <ul className="space-y-3 text-xs text-slate-300 dark:text-slate-400 font-medium">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                The Poor (Al-Fuqara)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                The Needy (Al-Masakin)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Zakat Administrators
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Those whose hearts are to be reconciled
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Those in Bondage (Slavery/Captivity)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                The Debt-Ridden
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                In the Cause of Allah
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                The Wayfarer (Stranded Travelers)
              </li>
            </ul>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10"></div>
      </div>
      {/* NZF Branding Footer */}
      <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3 opacity-70">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-700/50">
          <Info className="w-3.5 h-3.5 text-emerald-500" />
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
