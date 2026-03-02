
import React, { useState, useEffect } from 'react';
import { Info, Crescent, Users, ShoppingBag, ChevronRight, ExternalLink } from './Icons';
import { GoogleGenAI } from "@google/genai";

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
  </svg>
);

export const ZakatFitrCalculator: React.FC = () => {
  const [fitrRate, setFitrRate] = useState<number>(5.00); // Default GBP per person
  const [familyMembers, setFamilyMembers] = useState<number>(1);
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);

  const fetchLiveRate = async () => {
    setIsFetching(true);
    setError(null);
    setSources([]);
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
        contents: "What is the current recommended Zakat ul Fitr (Fitrana) rate per person in the UK for 2026 in GBP? Please provide a single numeric value (the average or most common rate) and include sources in grounding metadata.",
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "";
      const match = text.match(/£?(\d+(\.\d+)?)/);
      if (match) {
        setFitrRate(parseFloat(match[1]));
        setLastUpdated(new Date().toLocaleTimeString());
      }

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const foundSources = chunks
          .filter(c => c.web && c.web.title && c.web.uri)
          .map(c => ({ title: c.web!.title!, uri: c.web!.uri! }));
        setSources(foundSources);
      }
    } catch (err: any) {
      console.error("Error fetching Fitr rate:", err);
      setError(`Error: ${err.message || "Could not fetch live rate"}. Please check your API key in Settings.`);
    } finally {
      setIsFetching(false);
    }
  };

  const totalFitr = familyMembers * fitrRate;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-slate-800 dark:text-white mb-2">Zakat ul Fitr Calculator</h2>
        <p className="text-slate-600 dark:text-slate-400">Calculate your Fitrana obligation before the Eid prayer</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3 space-y-8">
          {/* Rate Configuration Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-start gap-4 p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl mb-8">
              <ShoppingBag className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
              <div className="text-sm">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">What is Zakat ul Fitr?</h4>
                <p className="text-emerald-800 dark:text-emerald-400 leading-relaxed">
                  A mandatory charity given at the end of Ramadan. It is traditionally equivalent to one Sa'a (approx. 3kg) of staple food. 
                  In the UK, this is typically converted to a monetary value.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                    <span>Rate Per Person (GBP)</span>
                    {lastUpdated && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">Live Rate: {lastUpdated}</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold text-lg">£</span>
                    <input 
                      type="number" 
                      step="0.50" 
                      value={fitrRate}
                      onChange={(e) => setFitrRate(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-2xl transition-all outline-none font-bold text-slate-800 dark:text-white text-xl"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <a 
                    href="https://nzf.org.uk/zakat-calculator/zakat-al-fitr/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Check NZF Fitrana Rate
                  </a>
                  <button 
                    onClick={fetchLiveRate}
                    disabled={isFetching}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all ${
                      isFetching ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 shadow-lg'
                    }`}
                  >
                    <RefreshIcon className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                    {isFetching ? 'Fetching...' : 'Get Live Rate'}
                  </button>
                </div>
              </div>

              {sources.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Sources for 2026 Rates:</p>
                  <div className="flex flex-wrap gap-2">
                    {sources.map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-transparent dark:border-slate-700">
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Family Input Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg p-6 md:p-8 border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Household Size</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Include yourself and all dependents</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => setFamilyMembers(Math.max(1, familyMembers - 1))}
                  className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <span className="text-5xl font-black text-slate-900 dark:text-white">{familyMembers}</span>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">People</p>
                </div>
                <button 
                  onClick={() => setFamilyMembers(familyMembers + 1)}
                  className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  +
                </button>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={familyMembers} 
                onChange={(e) => setFamilyMembers(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Result Column */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden sticky top-24 transition-colors">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 dark:shadow-none">
                  <Crescent className="w-6 h-6 fill-white/20" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Total Fitrana</h3>
              </div>

              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Calculation</span>
                  <span className="text-slate-800 dark:text-white font-bold">{familyMembers} × £{fitrRate.toFixed(2)}</span>
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800"></div>
                <div className="text-center py-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-800">
                  <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-2">Amount Due</p>
                  <p className="text-5xl font-black text-emerald-700 dark:text-emerald-400">£{totalFitr.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                    Must be paid before the Eid-ul-Fitr prayer. It is recommended to pay early in Ramadan so the poor can prepare for Eid.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Principles Section */}
      <div className="mt-12 bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden transition-colors">
        <div className="relative z-10 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-serif font-bold mb-6">Zakat ul Fitr Principles</h3>
            <div className="space-y-6 text-slate-300 dark:text-slate-400 text-sm leading-relaxed">
              <p>
                <strong className="text-emerald-400">Universal Obligation:</strong> Unlike Zakat on wealth, Zakat ul Fitr is due from every Muslim, regardless of age, provided they have food in excess of their needs for one day and night.
              </p>
              <p>
                <strong className="text-emerald-400">The Purpose:</strong> It serves two main purposes: to purify the fasting person from any indecent act or speech during Ramadan, and to provide food for the needy.
              </p>
              <p>
                <strong className="text-emerald-400">Timing:</strong> The deadline is before the Eid prayer. If paid after the prayer, it is considered ordinary charity (Sadaqah) and not Zakat ul Fitr.
              </p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <h4 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <ChevronRight className="w-4 h-4" />
              Key Rulings
            </h4>
            <ul className="space-y-4 text-xs text-slate-300 dark:text-slate-400 font-medium">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                <span>The head of the household pays for themselves and all dependents (children, spouse, etc).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                <span>Traditionally given as one Sa'a of food (wheat, barley, dates, or raisins).</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                <span>Scholars permit giving the equivalent value in money to facilitate distribution in modern contexts.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5"></div>
                <span>It should be distributed within the community where one resides, unless there is a greater need elsewhere.</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10"></div>
      </div>
    </div>
  );
};
