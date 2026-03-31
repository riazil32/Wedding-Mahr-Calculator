
import React, { useState } from 'react';
import { Mail, MessageSquare, Crescent, ChevronRight, Coffee } from './Icons';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Suggestion',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd send this to a backend. 
    // For now, we'll just show a success message.
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: 'Suggestion', message: '' });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4">
          <MessageSquare className="w-4 h-4" />
          Get in Touch
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">
          Help Us <span className="text-emerald-600 dark:text-emerald-400">Grow</span>
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Have a suggestion for a new tool? Found a bug? Or just want to say salam? 
          We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-12">
        {/* Contact Info */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Email Us</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Direct support & suggestions</p>
              </div>
            </div>
            
            <a 
              href="mailto:riazil32@gmail.com" 
              className="text-lg font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-2"
            >
              riazil32@gmail.com
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <Coffee className="w-6 h-6 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white">Support Us</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Help keep this tool free</p>
              </div>
            </div>
            
            <a 
              href="https://www.buymeacoffee.com/hisabbayt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-lg font-bold text-amber-600 dark:text-amber-500 hover:underline flex items-center gap-2"
            >
              Buy me a coffee
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 text-white relative overflow-hidden transition-colors">
            <h4 className="text-xl font-serif font-bold mb-4">Our Mission</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              HisabBayt is dedicated to providing free, authentic, and accessible financial tools for the global Muslim community.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <Crescent className="w-4 h-4 fill-current" />
              Community Driven
            </div>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-3">
          {isSubmitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-[2.5rem] p-12 text-center border border-emerald-100 dark:border-emerald-800 animate-in zoom-in duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-200 dark:shadow-none">
                <Crescent className="w-10 h-10 fill-white/20" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-emerald-900 dark:text-emerald-300 mb-4">Message Sent!</h3>
              <p className="text-emerald-800 dark:text-emerald-400 mb-8">
                JazakAllah Khair for your message. We'll get back to you as soon as possible.
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Your Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-2xl transition-all outline-none font-medium text-slate-800 dark:text-white"
                    placeholder="Abdullah"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-2xl transition-all outline-none font-medium text-slate-800 dark:text-white"
                    placeholder="abdullah@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Subject</label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-2xl transition-all outline-none font-medium text-slate-800 dark:text-white appearance-none"
                >
                  <option value="Suggestion">New Tool Suggestion</option>
                  <option value="Bug">Report a Bug</option>
                  <option value="General">General Inquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Your Message</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-700 rounded-2xl transition-all outline-none font-medium text-slate-800 dark:text-white resize-none"
                  placeholder="Tell us what's on your mind..."
                />
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-700 transition-all shadow-xl shadow-slate-200 dark:shadow-none flex items-center justify-center gap-3"
              >
                Send Message
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
