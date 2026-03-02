
import React, { useState, useEffect } from 'react';
import { X, Info, Sparkles, RefreshCw } from './Icons';
import { GoogleGenAI } from "@google/genai";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('HISABBAYT_GEMINI_API_KEY');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('HISABBAYT_GEMINI_API_KEY', apiKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1500);
  };

  const handleTestConnection = async () => {
    if (!apiKey) {
      setTestResult({ success: false, message: 'Please enter an API key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Say 'Success' if you can read this.",
      });
      
      if (response.text) {
        setTestResult({ success: true, message: 'Connection successful! Your API key is valid.' });
      } else {
        throw new Error('Empty response from API');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: `Connection failed: ${err.message || 'Unknown error'}` });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Settings</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Configure your application preferences</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl">
            <div className="flex gap-3 items-start">
              <Info className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">Manual Deployment Support</h4>
                <p className="text-emerald-800 dark:text-emerald-400/80 leading-relaxed">
                  If you are deploying this site manually (e.g. Netlify Drag & Drop), you can enter your Gemini API key here. 
                  It will be stored securely in your browser's local storage.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Gemini API Key</label>
            <div className="relative">
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here..."
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-900 rounded-2xl transition-all outline-none font-mono text-sm text-slate-800 dark:text-slate-200"
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
              Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline">Google AI Studio</a>
            </p>
          </div>

          {testResult && (
            <div className={`p-4 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
              testResult.success 
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/50' 
              : 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-800/50'
            }`}>
              {testResult.message}
            </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={handleTestConnection}
              disabled={isTesting || !apiKey}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaved}
              className={`flex-[2] py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                isSaved 
                ? 'bg-emerald-500 text-white' 
                : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800 dark:hover:bg-slate-100'
              }`}
            >
              {isSaved ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Saved!
                </>
              ) : (
                'Save Configuration'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
