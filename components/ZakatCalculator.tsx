
import React, { useState, useEffect } from 'react';
import { Info, Crescent, Coins, Wallet, Banknote, TrendingUp, ChevronRight, ExternalLink } from './Icons';
import { ZAKAT_NISAB_SILVER_GRAMS, ZAKAT_NISAB_GOLD_GRAMS, ZAKAT_RATE } from '../constants';
import { GoogleGenAI } from "@google/genai";

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
  </svg>
);

export const ZakatCalculator: React.FC = () => {
  const [goldPrice, setGoldPrice] = useState<number>(65.50); // Default GBP/g
  const [silverPrice, setSilverPrice] = useState<number>(0.85); // Default GBP/g
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

  const fetchLivePrices = async () => {
    setIsFetching(true);
    setError(null);
    try {
      const apiKey = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || 
                     import.meta.env.VITE_GEMINI_API_KEY || 
                     localStorage.getItem('HISABBAYT_GEMINI_API_KEY');
      
      if (!apiKey) {
        throw new Error("API Key not found. Please set it in Settings or via environment variables.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `What is the current market price of Gold and Silver per gram in GBP (British Pounds) for today, March 2, 2026? 
        Please provide the values in this format:
        GOLD: [value]
        SILVER: [value]
        Only provide the numeric values after the labels.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const goldMatch = text.match(/GOLD:\s*£?(\d+(\.\d+)?)/i);
      const silverMatch = text.match(/SILVER:\s*£?(\d+(\.\d+)?)/i);

      if (goldMatch) setGoldPrice(parseFloat(goldMatch[1]));
      if (silverMatch) setSilverPrice(parseFloat(silverMatch[1]));
      
      if (goldMatch || silverMatch) {
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        throw new Error("Could not parse prices from AI response. Please try again or update manually.");
      }
    } catch (err: any) {
      console.error("Error fetching prices:", err);
      setError(`Error: ${err.message || "Market data temporarily unavailable"}. Please check your API key in Settings.`);
    } finally {
      setIsFetching(false);
    }
  };

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
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Live Market Rates</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current prices per gram (GBP)</p>
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
              onClick={fetchLivePrices}
              disabled={isFetching}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                isFetching ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-none'
              }`}
            >
              <RefreshIcon className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Updating...' : 'Update Prices'}
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
    </div>
  );
};
