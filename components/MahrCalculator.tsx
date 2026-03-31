
import React, { useState, useEffect } from 'react';
import { Info, Crescent, X, ChevronRight, ExternalLink, Save, RefreshCw } from './Icons';
import { MAHR_TYPES, SILVER_NISAB_DIVISOR } from '../constants';
import { MahrType } from '../types';
import { useFirebase } from '../src/context/FirebaseContext';
import { useFinancialData } from '../src/context/UserContext';
import { Save as SaveIcon } from 'lucide-react';
import { getLiveMarketRates, FALLBACK_SILVER_PRICE } from '../src/services/marketService';

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
  </svg>
);

export const MahrCalculator: React.FC = () => {
  const [silverPricePerGram, setSilverPricePerGram] = useState<number>(FALLBACK_SILVER_PRICE); // Modern average in GBP
  const [selectedMahrInfo, setSelectedMahrInfo] = useState<MahrType | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [sources, setSources] = useState<{title: string, uri: string}[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { user, saveCalculation } = useFirebase();
  const { financialProfile, updateFinancialProfile } = useFinancialData();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [customMahrTotal, setCustomMahrTotal] = useState<number>(0);
  const [customMahrPaid, setCustomMahrPaid] = useState<number>(0);

  // Auto-fetch market rates on mount
  useEffect(() => {
    const fetchInitialRates = async () => {
      setIsFetching(true);
      try {
        const rates = await getLiveMarketRates();
        setSilverPricePerGram(rates.silver);
        setLastUpdated(new Date(rates.timestamp).toLocaleTimeString());
      } catch (err) {
        console.error("Mahr Calculator: Failed to fetch initial rates", err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchInitialRates();
  }, []);

  // Auto-fill from profile
  useEffect(() => {
    if (financialProfile) {
      if (financialProfile.mahr_total && customMahrTotal === 0) {
        setCustomMahrTotal(financialProfile.mahr_total);
      }
      if (financialProfile.mahr_paid && customMahrPaid === 0) {
        setCustomMahrPaid(financialProfile.mahr_paid);
      }
    }
  }, [financialProfile]);

  const handleUpdateProfile = async (total?: number, paid?: number) => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      await updateFinancialProfile({
        mahr_total: total ?? customMahrTotal,
        mahr_paid: paid ?? customMahrPaid
      });
      alert("Mahr profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSave = async (mahr: MahrType) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const label = prompt("Enter a label for this calculation (e.g., 'Wedding Mahr')") || `Mahr ${mahr.name}`;
      const value = mahr.grams * silverPricePerGram;
      await saveCalculation('mahr', label, {
        mahrType: mahr.name,
        grams: mahr.grams,
        silverPrice: silverPricePerGram
      }, value, '£');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save calculation.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif font-bold text-slate-800 dark:text-white mb-2">Authentic Mahr Calculator</h2>
        <p className="text-slate-600 dark:text-slate-400">Determining mahr based on contemporary silver market valuations</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 md:p-8 mb-10 border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-start gap-4 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl mb-8">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
          <div className="text-sm">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">Market Valuation Help</h4>
            <p className="text-blue-800 dark:text-blue-400 leading-relaxed">
              Islamic Mahr traditions are historically tied to the weight of Silver Dirhams. 
              The values below are automatically updated based on live market rates for Silver.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-medium">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 items-end">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 flex justify-between">
              <span>Price Per Gram (GBP)</span>
              {lastUpdated && <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase">Updated: {lastUpdated}</span>}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold text-lg">£</span>
              <input 
                type="number" 
                step="0.0001" 
                value={silverPricePerGram}
                onChange={(e) => {
                  setSilverPricePerGram(parseFloat(e.target.value) || 0);
                  setLastUpdated(null);
                }}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-2xl transition-all outline-none font-bold text-slate-800 dark:text-white text-xl"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 shadow-sm transition-all">
              <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Syncing Market Data...' : 'Live Market Price Active'}
            </div>
            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
              Synced with Zakat & Dashboard Market Rates
            </p>
          </div>
        </div>

        {sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Data Sources:</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {MAHR_TYPES.map(mahr => {
          const value = (mahr.grams * silverPricePerGram).toFixed(2);
          return (
            <div key={mahr.id} className={`${mahr.bgColor} dark:bg-slate-900 rounded-3xl shadow-lg border-2 ${mahr.borderColor} dark:border-slate-800 overflow-hidden group hover:shadow-2xl transition-all`}>
              <div className={`bg-gradient-to-br ${mahr.color} p-6 text-white`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{mahr.name}</h3>
                  <Crescent className="w-5 h-5 opacity-50 fill-current" />
                </div>
                <p className="text-xs font-medium opacity-80 uppercase tracking-widest">{mahr.arabicName}</p>
              </div>
              <div className="p-6">
                <p className={`text-3xl font-black ${mahr.textColor} dark:text-white mb-4`}>£{parseFloat(value).toLocaleString()}</p>
                <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4 text-xs font-semibold mb-6 min-h-[80px] border border-white/20">
                  <span className={`${mahr.textColor} dark:text-slate-300`}>{mahr.description}</span>
                  <div className={`mt-2 text-[10px] opacity-70 ${mahr.textColor} dark:text-slate-400`}>Weight: {mahr.grams}g Silver</div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedMahrInfo(mahr)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 border-2 ${mahr.borderColor} dark:border-slate-800 rounded-xl text-sm font-bold ${mahr.textColor} dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors`}
                  >
                    Details <ChevronRight className="w-4 h-4" />
                  </button>
                  {user && (
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleSave(mahr)}
                        disabled={isSaving}
                        className={`p-3 bg-gradient-to-br ${mahr.color} text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50`}
                        title="Save Calculation"
                      >
                        <Save className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => {
                          const val = mahr.grams * silverPricePerGram;
                          handleUpdateProfile(val, 0);
                        }}
                        disabled={isUpdatingProfile}
                        className={`p-3 border-2 ${mahr.borderColor} dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50`}
                        title="Set as My Mahr Total"
                      >
                        <SaveIcon size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 md:p-8 mb-12 border border-slate-100 dark:border-slate-800 transition-colors">
        <h3 className="text-xl font-serif font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
          <SaveIcon className="w-5 h-5 text-emerald-600" />
          My Mahr Tracking
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Total Mahr Amount (GBP)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold text-lg">£</span>
              <input 
                type="number" 
                value={customMahrTotal}
                onChange={(e) => setCustomMahrTotal(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-2xl transition-all outline-none font-bold text-slate-800 dark:text-white text-xl"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Amount Paid So Far (GBP)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold text-lg">£</span>
              <input 
                type="number" 
                value={customMahrPaid}
                onChange={(e) => setCustomMahrPaid(parseFloat(e.target.value) || 0)}
                className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-2xl transition-all outline-none font-bold text-slate-800 dark:text-white text-xl"
              />
            </div>
          </div>
        </div>
        
        {customMahrTotal > 0 && (
          <div className="mt-8">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-600 dark:text-slate-400">Payment Progress</span>
              <span className="text-emerald-600 dark:text-emerald-400">{Math.min(100, Math.round((customMahrPaid / customMahrTotal) * 100))}%</span>
            </div>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-1000"
                style={{ width: `${Math.min(100, (customMahrPaid / customMahrTotal) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Paid: £{customMahrPaid.toLocaleString()}</span>
              <span>Remaining: £{Math.max(0, customMahrTotal - customMahrPaid).toLocaleString()}</span>
            </div>
          </div>
        )}

        {user && (
          <button
            onClick={() => handleUpdateProfile()}
            disabled={isUpdatingProfile}
            className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none"
          >
            {isUpdatingProfile ? <RefreshCw className="w-5 h-5 animate-spin" /> : <SaveIcon className="w-5 h-5" />}
            Update Mahr Profile
          </button>
        )}
      </div>

      <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-2xl">
          <h3 className="text-2xl font-serif font-bold mb-6">Mahr Principles in Islam</h3>
          <div className="space-y-6 text-slate-300 dark:text-slate-400 text-sm leading-relaxed">
            <p>
              <strong className="text-emerald-400">Essential Obligation:</strong> Mahr is a mandatory gift from the groom to the bride. It is her exclusive property and symbolizes the groom's responsibility to provide and protect.
            </p>
            <p>
              <strong className="text-emerald-400">Flexibility:</strong> There is no maximum cap on Mahr. While the Sunnah encourages moderation to facilitate marriage, the bride is entitled to whatever amount is mutually agreed.
            </p>
            <p>
              <strong className="text-emerald-400">Hanafi School:</strong> Requires a minimum (10 Dirhams). Other schools of thought (Shafi'i, Maliki, Hanbali) do not specify a strict minimum but recommend anything of value.
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20"></div>
      </div>

      {selectedMahrInfo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedMahrInfo(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-serif font-bold text-slate-800 dark:text-white">{selectedMahrInfo.name}</h3>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">{selectedMahrInfo.arabicName}</p>
              </div>
              <button onClick={() => setSelectedMahrInfo(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400 dark:text-slate-500" />
              </button>
            </div>
            <div className="space-y-4 mb-8">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed border border-slate-100 dark:border-slate-700">
                {selectedMahrInfo.details}
              </div>
              <div className="flex justify-between items-center px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Calculated Weight</span>
                <span className="font-mono font-bold text-emerald-900 dark:text-emerald-400">{selectedMahrInfo.grams}g Silver</span>
              </div>
            </div>
            <button 
              onClick={() => setSelectedMahrInfo(null)}
              className="w-full bg-slate-900 dark:bg-slate-800 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700"
            >
              Understand and Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
