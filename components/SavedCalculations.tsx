import React, { useEffect, useState } from 'react';
import { useFirebase } from '../src/context/FirebaseContext';
import { History, Trash2, Coins, ShoppingBag, Heart, ChevronRight, RefreshCw } from './Icons';

export const SavedCalculations: React.FC = () => {
  const { user, getCalculations, deleteCalculation } = useFirebase();
  const [calculations, setCalculations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = getCalculations((data: any[]) => {
      setCalculations(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
          <History className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">Sign in to view history</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Create an account to securely save and access your Zakat, Fitrana, and Mahr calculations from any device.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Saved Calculations</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Your personal history of Islamic financial planning</p>
        </div>
        <div className="bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-xl text-emerald-700 dark:text-emerald-400 font-bold text-sm">
          {calculations.length} Saved
        </div>
      </div>

      {calculations.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-12 text-center border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
            <History className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No calculations saved yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Your saved Zakat, Fitrana, and Mahr calculations will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {calculations.map((calc) => (
            <div 
              key={calc.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    calc.type === 'zakat' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    calc.type === 'fitrana' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                  }`}>
                    {calc.type === 'zakat' && <Coins className="w-6 h-6" />}
                    {calc.type === 'fitrana' && <ShoppingBag className="w-6 h-6" />}
                    {calc.type === 'mahr' && <Heart className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {calc.label || 'Untitled Calculation'}
                      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md">
                        {calc.type}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(calc.createdAt).toLocaleDateString(undefined, { 
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Result</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {calc.currency} {calc.result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <button 
                    onClick={() => deleteCalculation(calc.id)}
                    className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
