
import React from 'react';
import { Crescent, Coins, ShoppingBag, Heart, ChevronRight } from './Icons';
import { TabType } from '../types';

interface HomeProps {
  onNavigate: (tab: TabType) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const tools = [
    {
      id: 'zakat' as TabType,
      name: 'Zakat al-Mal',
      description: 'Calculate your annual zakat on wealth, including cash, gold, silver, and investments.',
      icon: <Coins className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-100 dark:border-emerald-800',
    },
    {
      id: 'fitr' as TabType,
      name: 'Zakat ul-Fitr',
      description: 'Calculate your Fitrana obligation for the household before the Eid prayer.',
      icon: <ShoppingBag className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      color: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-100 dark:border-blue-800',
    },
    {
      id: 'mahr' as TabType,
      name: 'Mahr Calculator',
      description: 'Determine authentic mahr amounts based on contemporary silver market valuations.',
      icon: <Heart className="w-8 h-8 text-rose-600 dark:text-rose-400" />,
      color: 'bg-rose-50 dark:bg-rose-900/20',
      borderColor: 'border-rose-100 dark:border-rose-800',
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4">
          <Crescent className="w-4 h-4 fill-current" />
          Welcome to HisabBayt
        </div>
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 dark:text-white mb-6 leading-tight">
          Manage Your <span className="text-emerald-600 dark:text-emerald-400">Financial Obligations</span> with Clarity
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Authentic, real-time tools designed to help you fulfill your religious duties with precision and ease. 
          Powered by live market data and grounded in Islamic principles.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onNavigate(tool.id)}
            className="group text-left bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-800 relative overflow-hidden"
          >
            <div className={`w-16 h-16 rounded-2xl ${tool.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {tool.icon}
            </div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-3">{tool.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
              {tool.description}
            </p>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              Open Tool <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className={`absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 ${tool.color} rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity`}></div>
          </button>
        ))}
      </div>

      {/* Features Section */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-serif font-bold mb-6">Why Choose HisabBayt?</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Real-time Market Data</h4>
                  <p className="text-sm text-slate-400">Live gold and silver prices fetched via Google Search to ensure your calculations are always accurate.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Shariah-First Approach</h4>
                  <p className="text-sm text-slate-400">All calculations are based on established Islamic principles across major schools of thought.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Privacy Focused</h4>
                  <p className="text-sm text-slate-400">Your financial data stays on your device. We don't store any of your sensitive information.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-emerald-600/20 to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Crescent className="w-32 h-32 text-emerald-500/20 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
