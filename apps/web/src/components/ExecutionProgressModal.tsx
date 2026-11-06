'use client';

import React, { useEffect, useRef } from 'react';
import {
  Monitor,
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export interface ExecutionProgressModalProps {
  isOpen: boolean;
  isRunning: boolean;
  headedMode: boolean;
  scenarioFilter?: string;
  totalScenarios?: number;
  liveLogs: string;
  liveStats: { passed: number; failed: number; skipped: number; total: number } | null;
  durationSeconds: number;
  isCompleted: boolean;
  errorMessage?: string;
  onViewResults: () => void;
  onClose?: () => void;
}

export function ExecutionProgressModal({
  isOpen,
  isRunning,
  headedMode,
  scenarioFilter,
  totalScenarios = 0,
  liveLogs,
  liveStats,
  durationSeconds,
  isCompleted,
  errorMessage,
  onViewResults,
  onClose,
}: ExecutionProgressModalProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // 1. Anti-refresh protection while testing is running
  useEffect(() => {
    if (!isRunning) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Pengujian Playwright sedang berlangsung. Jangan refresh atau tinggalkan halaman ini.';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning]);

  // 2. Auto-scroll terminal log to bottom
  useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveLogs, isOpen]);

  if (!isOpen) return null;

  // Format log lines
  const renderFormattedLine = (line: string, index: number) => {
    const l = line.toLowerCase();
    let colorClass = 'text-[#A1A19D]';

    if (line.includes('[ORCHESTRATOR]')) {
      colorClass = 'text-[#EAB308] font-semibold';
    } else if (line.includes('[ERROR]') || l.includes('error:') || l.includes('failed')) {
      colorClass = 'text-rose-400 font-medium';
    } else if (l.includes('passed') || line.includes('✓') || l.includes('sukses')) {
      colorClass = 'text-[#EAB308] font-medium';
    } else if (line.startsWith('$') || line.startsWith('>')) {
      colorClass = 'text-[#FACC15] font-bold';
    }

    return (
      <div key={index} className={`whitespace-pre-wrap break-words py-0.5 ${colorClass}`}>
        {line || '\u00A0'}
      </div>
    );
  };

  const lines = liveLogs.split('\n');
  const passedCount = liveStats?.passed ?? 0;
  const failedCount = liveStats?.failed ?? 0;
  const skippedCount = liveStats?.skipped ?? 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none">
      <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-auto border-t-2 border-t-[#EAB308]">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-[#121214] border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308] shrink-0">
              {isRunning ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : isCompleted ? (
                <CheckCircle2 className="w-5 h-5 text-[#EAB308]" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading text-sm font-bold text-[#F5F5F0]">
                  {isRunning
                    ? 'Proses Pengujian Sedang Berlangsung'
                    : isCompleted
                    ? 'Pengujian Selesai Dilaksanakan'
                    : 'Menyiapkan Pengujian'}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isRunning
                      ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 animate-pulse'
                      : isCompleted
                      ? 'bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/40'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {isRunning ? 'RUNNING' : isCompleted ? 'FINISHED' : 'QUEUED'}
                </span>
              </div>
              <p className="font-sans text-xs text-[#71717A] mt-0.5">
                Target: {scenarioFilter ? `Filter "${scenarioFilter}"` : 'Seluruh Skenario Pengujian'} ({totalScenarios} skenario)
              </p>
            </div>
          </div>

          {/* Time Counter */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] text-xs font-mono text-[#EAB308]">
            <Clock className="w-3.5 h-3.5" />
            <span>{durationSeconds > 0 ? `${durationSeconds}s` : isRunning ? 'berjalan...' : '0s'}</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 font-sans select-text">
          {/* Mode Notice Card: Headed vs Headless */}
          {headedMode ? (
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 flex items-start space-x-3 text-xs">
              <div className="p-2 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/60 shrink-0 mt-0.5">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading font-semibold text-amber-200">
                  Mode Browser Terbuka (Headed) Aktif
                </div>
                <p className="text-[#A1A19D] mt-0.5 leading-relaxed">
                  Jendela browser Chromium Playwright dibuka di layar komputer Anda. Anda dapat melihat
                  navigasi halaman dan simulasi klik form secara visual dan langsung.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#121214] border border-[#27272a] flex items-start space-x-3 text-xs">
              <div className="p-2 rounded-lg bg-[#18181b] text-[#EAB308] border border-[#27272a] shrink-0 mt-0.5">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading font-semibold text-[#F5F5F0]">
                  Mode Headless (Eksekusi Latar Belakang)
                </div>
                <p className="text-[#71717A] mt-0.5 leading-relaxed">
                  Pengujian dijalankan secara otomatis di latar belakang tanpa membuka jendela browser grafis.
                  Pantau setiap progres melalui streaming log di bawah.
                </p>
              </div>
            </div>
          )}

          {/* Real-time Metric Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#121214] border border-[#EAB308]/30">
              <div className="font-heading text-xl font-bold text-[#EAB308]">{passedCount}</div>
              <div className="text-[10px] text-[#A1A19D] uppercase tracking-wider font-mono">Lulus (Passed)</div>
            </div>

            <div className="p-3 rounded-xl bg-[#121214] border border-rose-900/40">
              <div className="font-heading text-xl font-bold text-rose-400">{failedCount}</div>
              <div className="text-[10px] text-[#A1A19D] uppercase tracking-wider font-mono">Gagal (Failed)</div>
            </div>

            <div className="p-3 rounded-xl bg-[#121214] border border-[#27272a]">
              <div className="font-heading text-xl font-bold text-[#A1A19D]">{skippedCount}</div>
              <div className="text-[10px] text-[#71717A] uppercase tracking-wider font-mono">Dilewati (Skipped)</div>
            </div>
          </div>

          {/* Live Virtual Terminal Box inside Modal */}
          <div className="rounded-xl border border-[#27272a] bg-[#0c0c0e] overflow-hidden">
            <div className="px-3 py-2 bg-[#121214] border-b border-[#222224] flex items-center justify-between text-[11px] font-mono text-[#71717A]">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-[#EAB308]" />
                <span className="text-[#D4D4CE]">Playwright Real-Time Stream</span>
              </div>
              {isRunning && (
                <span className="flex items-center space-x-1 text-amber-400 text-[10px] animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Streaming output...</span>
                </span>
              )}
            </div>

            <div className="p-3 max-h-56 sm:max-h-64 overflow-y-auto font-mono text-[11px] leading-relaxed bg-[#0c0c0e]">
              {lines.length === 0 || liveLogs.trim() === '' ? (
                <div className="py-6 text-center text-[#52525b] italic">
                  Menghubungkan ke Playwright engine subprocess...
                </div>
              ) : (
                lines.map((line, idx) => renderFormattedLine(line, idx))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Error Message if Any */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2">
              <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Anti-Refresh Alert Warning while testing */}
          {isRunning && (
            <div className="p-2.5 rounded-lg bg-[#18181b] border border-amber-900/40 text-[11px] text-amber-300/90 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                <strong>Perhatian:</strong> Pengujian sedang berjalan. Jangan me-refresh atau menutup tab peramban ini agar hasil tidak terputus.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#121214] border-t border-[#27272a] flex items-center justify-between gap-3">
          <div className="text-xs text-[#71717A] font-sans">
            {isRunning ? (
              <span className="italic flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping" />
                <span>Playwright sedang mengeksekusi skenario...</span>
              </span>
            ) : isCompleted ? (
              <span className="text-[#EAB308] font-semibold">
                ✓ Selesai dalam {durationSeconds} detik ({passedCount} lulus, {failedCount} gagal)
              </span>
            ) : (
              <span>Menunggu respons engine...</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* If completed, show button to view full report on runner tab */}
            {isCompleted ? (
              <button
                type="button"
                onClick={onViewResults}
                className="px-5 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#FACC15] text-black font-heading text-xs font-bold shadow-md shadow-[#EAB308]/20 transition-all flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Lihat Hasil Lengkap & Evaluasi</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-xl bg-[#18181b] text-[#52525b] border border-[#27272a] text-xs font-heading font-medium cursor-not-allowed flex items-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menjalankan Tes...</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

