'use client';

import React from 'react';
import { ShieldCheck, Terminal, Cpu, Activity, BarChart2, CheckCircle2, Lock, Unlock } from 'lucide-react';
import { LockState } from '@/lib/lock-manager';

interface NavbarProps {
  activeTab: 'config' | 'sitemap' | 'manifest' | 'runner' | 'benchmarks';
  setActiveTab: (tab: 'config' | 'sitemap' | 'manifest' | 'runner' | 'benchmarks') => void;
  lockState: LockState | null;
  onOpenSus: () => void;
}

export function Navbar({ activeTab, setActiveTab, lockState, onOpenSus }: NavbarProps) {
  const isLocked = lockState?.isLocked ?? false;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-zinc-100">orchesTathya</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                Web Orchestrator
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">TathyaTest CLI GUI & Benchmark Suite</p>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'config'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <span>1. Target Config</span>
          </button>

          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'sitemap'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <span>2. Sitemap Graph</span>
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'manifest'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <span>3. Test Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('runner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'runner'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <span>4. Test Execution</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              activeTab === 'benchmarks'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>5. Research Metrics</span>
          </button>
        </nav>

        {/* Status & SUS Action */}
        <div className="flex items-center space-x-3">
          {/* Mutex Lock Status */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono border ${
              isLocked
                ? 'bg-amber-950/60 text-amber-300 border-amber-800/60 animate-pulse'
                : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
            }`}
            title={isLocked ? `Engine busy on [${lockState?.activeStep}]` : 'Engine lock free'}
          >
            {isLocked ? (
              <>
                <Lock className="w-3 h-3 text-amber-400" />
                <span>BUSY ({lockState?.activeStep})</span>
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 text-emerald-400" />
                <span>READY</span>
              </>
            )}
          </div>

          {/* SUS Survey Button */}
          <button
            onClick={onOpenSus}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Isi Kuesioner SUS</span>
          </button>
        </div>
      </div>
    </header>
  );
}
