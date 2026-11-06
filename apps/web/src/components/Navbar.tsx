'use client';

import React from 'react';
import {
  Cpu,
  Lock,
  ShieldCheck,
  PanelRight,
  PanelRightClose,
  SlidersHorizontal,
  Network,
  ListChecks,
  Play,
} from 'lucide-react';
import { LockState } from '@/lib/lock-manager';

interface NavbarProps {
  activeTab: 'config' | 'sitemap' | 'manifest' | 'runner';
  setActiveTab: (tab: 'config' | 'sitemap' | 'manifest' | 'runner') => void;
  lockState: LockState | null;
  onOpenSus: () => void;
  isWorkflowCompleted: boolean;
  isConsoleOpen: boolean;
  setIsConsoleOpen: (val: boolean) => void;
  hasCrawled: boolean;
  hasGenerated: boolean;
  hasRun: boolean;
}

const STEPS = [
  { id: 'config', label: 'Konfigurasi', icon: SlidersHorizontal, step: 1 },
  { id: 'sitemap', label: 'Sitemap', icon: Network, step: 2 },
  { id: 'manifest', label: 'Skenario', icon: ListChecks, step: 3 },
  { id: 'runner', label: 'Eksekusi', icon: Play, step: 4 },
] as const;

export function Navbar({
  activeTab,
  setActiveTab,
  lockState,
  onOpenSus,
  isWorkflowCompleted,
  isConsoleOpen,
  setIsConsoleOpen,
  hasCrawled,
  hasGenerated,
  hasRun,
}: NavbarProps) {
  const isLocked = lockState?.isLocked ?? false;
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const stepCompleted = (stepId: string) => {
    if (!mounted) return false;
    if (stepId === 'config') return hasCrawled;
    if (stepId === 'sitemap') return hasGenerated;
    if (stepId === 'manifest') return hasRun;
    if (stepId === 'runner') return isWorkflowCompleted;
    return false;
  };

  const canOpenSus = mounted && isWorkflowCompleted;

  return (
    <header className="border-b border-[#27272a] bg-[#121214] sticky top-0 z-50 h-14 shrink-0 select-none">
      <div className="w-full h-full px-4 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-2.5 shrink-0">
          {/* <div className="w-7 h-7 rounded-lg bg-[#18181b] border border-[#EAB308]/40 flex items-center justify-center shadow-md shadow-[#EAB308]/10">
            <Cpu className="w-3.5 h-3.5 text-[#EAB308]" />
          </div> */}
          <div>
            <div className="font-heading font-bold text-sm tracking-tight text-[#F5F5F0]">
              orchesTathya
            </div>  
          </div>
        </div>

        {/* Step Navigation — with labels and completion indicators */}
        <nav className="flex items-center bg-[#09090b] rounded-xl border border-[#27272a] p-1 gap-0.5">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = activeTab === step.id;
            const isDone = stepCompleted(step.id);

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveTab(step.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-heading font-medium transition-all ${
                    isActive
                      ? 'bg-[#EAB308] text-black shadow-sm'
                      : isDone
                      ? 'text-[#EAB308] hover:bg-[#18181b]'
                      : 'text-[#71717A] hover:text-[#A1A19D] hover:bg-[#18181b]'
                  }`}
                  aria-label={`Tahap ${step.step}: ${step.label}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className="w-px h-4 bg-[#27272a] mx-0.5" />
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Engine Lock Status: Clean typography without outline or background color */}
          <div className="hidden sm:flex items-center space-x-1.5 text-[11px] select-none font-sans">
            <span className="text-[#71717A]">Status Engine :</span>
            <span className={`font-semibold tracking-wide ${isLocked ? 'text-[#EAB308]' : 'text-[#A1A19D]'}`}>
              {isLocked ? (lockState?.activeStep ? lockState.activeStep.toUpperCase() : 'RUN') : 'IDLE'}
            </span>
            {isLocked && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse ml-0.5" />
            )}
          </div>

          {/* SUS Survey Button */}
          {canOpenSus ? (
            <button
              type="button"
              onClick={onOpenSus}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#EAB308] hover:bg-[#FACC15] text-black text-[11px] font-heading font-bold shadow-md shadow-[#EAB308]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Isi Kuesioner SUS</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={true}
              suppressHydrationWarning
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#18181b] text-[#52525b] border border-[#27272a] text-[11px] font-heading font-medium cursor-not-allowed"
              title="Selesaikan alur pengujian (Crawl → Generate → Run) untuk membuka kuesioner usabilitas"
            >
              <Lock className="w-3 h-3" />
              <span className="hidden sm:inline">Kuesioner SUS</span>
            </button>
          )}

          {/* Terminal Panel Toggle */}
          <button
            type="button"
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`p-1.5 rounded-lg border transition-all ${
              isConsoleOpen
                ? 'bg-[#18181b] text-[#EAB308] border-[#EAB308]/30'
                : 'bg-[#18181b] text-[#52525b] border-[#27272a] hover:text-[#A1A19D]'
            }`}
            title={isConsoleOpen ? 'Tutup Panel Terminal' : 'Buka Panel Terminal'}
          >
            {isConsoleOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
