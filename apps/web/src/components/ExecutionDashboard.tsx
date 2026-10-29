'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, ShieldCheck, Play, ArrowRight, Award } from 'lucide-react';

interface ExecutionStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

interface ExecutionDashboardProps {
  stats: ExecutionStats | null;
  durationSeconds: number;
  onOpenSus: () => void;
  onReRun: () => void;
  isRunning: boolean;
  isWorkflowCompleted: boolean;
}

export function ExecutionDashboard({
  stats,
  durationSeconds,
  onOpenSus,
  onReRun,
  isRunning,
  isWorkflowCompleted,
}: ExecutionDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Test Result Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Passed */}
        <div className="p-5 rounded-xl bg-[#121214] border border-emerald-900/40 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-emerald-400">{stats?.passed ?? 0}</div>
            <div className="font-sans text-xs font-semibold text-[#A1A19D] uppercase tracking-wider">Passed</div>
          </div>
        </div>

        {/* Failed */}
        <div className="p-5 rounded-xl bg-[#121214] border border-rose-900/40 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-950/60 text-rose-400 border border-rose-800/40">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-rose-400">{stats?.failed ?? 0}</div>
            <div className="font-sans text-xs font-semibold text-[#A1A19D] uppercase tracking-wider">Failed</div>
          </div>
        </div>

        {/* Skipped */}
        <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-[#18181b] text-[#A1A19D] border border-[#27272a]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[#F5F5F0]">{stats?.skipped ?? 0}</div>
            <div className="font-sans text-xs font-semibold text-[#A1A19D] uppercase tracking-wider">Skipped</div>
          </div>
        </div>

        {/* Duration */}
        <div className="p-5 rounded-xl bg-[#121214] border border-[#EAB308]/30 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[#EAB308]">
              {durationSeconds > 0 ? `${durationSeconds}s` : '0s'}
            </div>
            <div className="font-sans text-xs font-semibold text-[#A1A19D] uppercase tracking-wider">Waktu Eksekusi</div>
          </div>
        </div>
      </div>

      {/* SUS Prompt Card: Gated by Workflow Completion */}
      {isWorkflowCompleted ? (
        <div className="p-6 rounded-2xl bg-[#121214] border-2 border-[#EAB308] shadow-lg shadow-[#EAB308]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#EAB308]" />
              <h4 className="font-heading text-sm font-bold text-[#F5F5F0]">
                Alur Pengujian Selesai! Kuesioner Usabilitas Terbuka
              </h4>
            </div>
            <p className="font-sans text-xs text-[#A1A19D] max-w-xl leading-relaxed">
              Selamat, Anda telah menguji seluruh fitur orchesTathya mulai dari konfigurasi, crawling sitemap,
              inspeksi skenario, hingga eksekusi pengujian Playwright. Mohon berikan penilaian objektif Anda melalui 10 pertanyaan SUS.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={onReRun}
              disabled={isRunning}
              className="px-4 py-2.5 rounded-xl text-xs font-heading font-semibold bg-[#18181b] hover:bg-[#27272a] text-[#F5F5F0] border border-[#27272a] transition-all flex items-center space-x-2"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Jalankan Ulang</span>
            </button>

            <button
              onClick={onOpenSus}
              className="px-5 py-2.5 rounded-xl text-xs font-heading font-bold bg-[#EAB308] hover:bg-[#FACC15] text-black shadow-md shadow-[#EAB308]/30 transition-all flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-black" />
              <span>Isi Kuesioner SUS Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] flex items-center justify-between">
          <div className="text-xs text-[#A1A19D] font-sans">
            <span className="text-[#EAB308] font-heading font-semibold mr-1">Status Pengujian:</span>
            Selesaikan eksekusi pengujian Playwright di atas untuk membuka formulir kuesioner System Usability Scale (SUS).
          </div>
          <button
            onClick={onReRun}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl text-xs font-heading font-semibold bg-[#18181b] hover:bg-[#27272a] text-[#F5F5F0] border border-[#27272a] transition-all flex items-center space-x-2"
          >
            <Play className="w-3.5 h-3.5 text-[#EAB308]" />
            <span>Mulai Uji Sekarang</span>
          </button>
        </div>
      )}
    </div>
  );
}
