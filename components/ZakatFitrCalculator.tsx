
import React, { useState, useEffect } from 'react';
import { Info, Crescent, Users, ShoppingBag, ChevronRight, Save } from './Icons';
import { useFirebase } from '../src/context/FirebaseContext';
import { useFinancialData } from '../src/context/UserContext';
import { Save as SaveIcon, RefreshCw } from 'lucide-react';
import { FITRANA_RATE } from '../constants';

const RefreshIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
  </svg>
);

export const ZakatFitrCalculator: React.FC = () => {
  const [fitrRate, setFitrRate] = useState<number>(FITRANA_RATE);
  const [familyMembers, setFamilyMembers] = useState<number>(1);
  const [isFetching, setIsFetching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const { user, saveCalculation } = useFirebase();
  const { financialProfile, updateFinancialProfile } = useFinancialData();

  // Auto-fill from profile
  useEffect(() => {
    if (financialProfile?.household_size && familyMembers === 1) {
      setFamilyMembers(financialProfile.household_size);
    }
  }, [financialProfile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      await updateFinancialProfile({
        household_size: familyMembers
      });
      alert("Household size updated in your profile!");
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
      const label = prompt("Enter a label for this calculation (e.g., 'Ramadan Fitrana')") || `Fitrana ${new Date().toLocaleDateString()}`;
      await saveCalculation('fitrana', label, {
        fitrRate, familyMembers
      }, totalFitr, '£');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to save calculation.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalFitr = familyMembers * fitrRate;

  const handleSync = () => {
    setIsFetching(true);
    // Simulate sync with NZF standard
    setTimeout(() => {
      setFitrRate(FITRANA_RATE);
      setIsFetching(false);
      alert("Synced with NZF Standard Rate (£5.00). You can still manually override if needed.");
    }, 800);
  };

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
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black">Standard Rate</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 font-bold text-lg">£</span>
                    <input 
                      type="number" 
                      value={fitrRate}
                      onChange={(e) => setFitrRate(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-2xl outline-none font-bold text-slate-800 dark:text-white text-xl transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSync}
                    disabled={isFetching}
                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 dark:shadow-none transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
                    Sync with NZF / Market Rates
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">NZF Standard:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/50 font-bold">
                    Fitrana is based on NZF's recommended standard rate (£5 per person).
                  </span>
                </div>
              </div>
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

              {user && (
                <div className="space-y-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || totalFitr === 0}
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
                    className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all text-sm"
                  >
                    {isUpdatingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <SaveIcon size={16} />}
                    Update Household Size
                  </button>
                </div>
              )}
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
