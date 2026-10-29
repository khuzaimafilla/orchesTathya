'use client';

import React from 'react';
import { Cpu, Lock, Unlock, ShieldCheck } from 'lucide-react';
import { LockState } from '@/lib/lock-manager';

interface NavbarProps {
  activeTab: 'config' | 'sitemap' | 'manifest' | 'runner';
  setActiveTab: (tab: 'config' | 'sitemap' | 'manifest' | 'runner') => void;
  lockState: LockState | null;
  onOpenSus: () => void;
  isWorkflowCompleted: boolean;
}

export function Navbar({
  activeTab,
  setActiveTab,
  lockState,
  onOpenSus,
  isWorkflowCompleted,
}: NavbarProps) {
  const isLocked = lockState?.isLocked ?? false;

  return (
    <header className="border-b border-[#27272a] bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#121214] border border-[#EAB308]/40 flex items-center justify-center shadow-md shadow-[#EAB308]/10">
            <Cpu className="w-5 h-5 text-[#EAB308]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-bold text-base tracking-tight text-[#F5F5F0]">
                orchesTathya
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-md bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30">
                CLI Orchestrator
              </span>
            </div>
            <p className="text-[11px] text-[#A1A19D] font-sans">
              Pengujian Otomatis SUT & Evaluasi Usabilitas
            </p>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#121214] p-1 rounded-xl border border-[#27272a]">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
              activeTab === 'config'
                ? 'bg-[#EAB308] text-black font-semibold shadow-sm'
                : 'text-[#A1A19D] hover:text-[#F5F5F0] hover:bg-[#1a1a1e]'
            }`}
          >
            1. Konfigurasi SUT
          </button>

          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
              activeTab === 'sitemap'
                ? 'bg-[#EAB308] text-black font-semibold shadow-sm'
                : 'text-[#A1A19D] hover:text-[#F5F5F0] hover:bg-[#1a1a1e]'
            }`}
          >
            2. Struktur Sitemap
          </button>

          <button
            onClick={() => setActiveTab('manifest')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
              activeTab === 'manifest'
                ? 'bg-[#EAB308] text-black font-semibold shadow-sm'
                : 'text-[#A1A19D] hover:text-[#F5F5F0] hover:bg-[#1a1a1e]'
            }`}
          >
            3. Matriks Skenario
          </button>

          <button
            onClick={() => setActiveTab('runner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
              activeTab === 'runner'
                ? 'bg-[#EAB308] text-black font-semibold shadow-sm'
                : 'text-[#A1A19D] hover:text-[#F5F5F0] hover:bg-[#1a1a1e]'
            }`}
          >
            4. Eksekusi Pengujian
          </button>
        </nav>

        {/* Right Section: Engine Lock & Gated SUS Action */}
        <div className="flex items-center space-x-3">
          {/* Engine Lock Status */}
          <div
            className={`hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
              isLocked
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                : 'bg-[#121214] text-emerald-400 border-emerald-900/40'
            }`}
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

          {/* Gated SUS Survey Button: Enabled only if user completed the workflow */}
          {isWorkflowCompleted ? (
            <button
              onClick={onOpenSus}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#EAB308] hover:bg-[#FACC15] text-black text-xs font-heading font-bold shadow-md shadow-[#EAB308]/20 transition-all hover:scale-[1.02] active:scale-[0.98] animate-bounce"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>Isi Kuesioner SUS</span>
            </button>
          ) : (
            <button
              disabled
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#18181b] text-[#71717A] border border-[#27272a] text-xs font-heading font-medium cursor-not-allowed opacity-80"
              title="Selesaikan alur pengujian (Crawl -> Generate -> Run) untuk membuka kuesioner usabilitas"
            >
              <Lock className="w-3 h-3" />
              <span>Kuesioner SUS (Terkunci)</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
