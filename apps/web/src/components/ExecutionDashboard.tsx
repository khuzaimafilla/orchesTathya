'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, BarChart2, ShieldCheck, Play, ExternalLink } from 'lucide-react';
import { BenchmarkRecord } from '@/lib/benchmark-timer';

interface ExecutionStats {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

interface ExecutionDashboardProps {
  stats: ExecutionStats | null;
  durationSeconds: number;
  benchmarks: BenchmarkRecord[];
  onOpenSus: () => void;
  onReRun: () => void;
  isRunning: boolean;
}

export function ExecutionDashboard({
  stats,
  durationSeconds,
  benchmarks,
  onOpenSus,
  onReRun,
  isRunning,
}: ExecutionDashboardProps) {
  const latestRunBench = benchmarks.find((b) => b.step === 'run');

  return (
    <div className="space-y-6">
      {/* Test Result Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Passed */}
        <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-900/50 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{stats?.passed ?? 0}</div>
            <div className="text-xs font-semibold text-emerald-200/70 uppercase tracking-wider">Passed</div>
          </div>
        </div>

        {/* Failed */}
        <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-900/50 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-400">{stats?.failed ?? 0}</div>
            <div className="text-xs font-semibold text-rose-200/70 uppercase tracking-wider">Failed</div>
          </div>
        </div>

        {/* Skipped */}
        <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-zinc-800 text-zinc-400 border border-zinc-700">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-zinc-300">{stats?.skipped ?? 0}</div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Skipped</div>
          </div>
        </div>

        {/* Duration / Latency Overhead */}
        <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-900/50 flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-400">
              {durationSeconds > 0 ? `${durationSeconds}s` : latestRunBench ? `${latestRunBench.durationSeconds}s` : '0s'}
            </div>
            <div className="text-xs font-semibold text-indigo-200/70 uppercase tracking-wider">Δ Execution Time</div>
          </div>
        </div>
      </div>

      {/* Post-Execution Actions & SUS Prompt */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-zinc-900 border border-indigo-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-violet-400" />
            <h4 className="text-sm font-semibold text-zinc-100">Evaluasi Pengguna (System Usability Scale)</h4>
          </div>
          <p className="text-xs text-zinc-400 max-w-xl">
            Sebagai bagian dari penelitian skripsi, mohon luangkan waktu 1 menit untuk mengisi 10 pertanyaan
            kuesioner SUS mengenai pengalaman Anda menggunakan Web Orchestrator ini.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={onReRun}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all flex items-center space-x-2"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Jalankan Ulang</span>
          </button>

          <button
            onClick={onOpenSus}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 hover:scale-[1.02]"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Isi Kuesioner SUS Sekarang</span>
          </button>
        </div>
      </div>

      {/* Benchmarking History Log Table (For Skripsi Chapter 4) */}
      <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
              Empirical Benchmarking Log (Overhead Analysis)
            </h4>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {benchmarks.length} Rekaman Benchmarking Tersimpan
          </span>
        </div>

        {benchmarks.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-4 text-center">
            Belum ada log benchmarking. Jalankan tahap Crawl, Generate, atau Run untuk mengumpulkan data latensi.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950/80 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Step</th>
                  <th className="px-3 py-2">Command</th>
                  <th className="px-3 py-2">Duration (ΔT)</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-[11px]">
                {benchmarks.slice(0, 10).map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-900/30">
                    <td className="px-3 py-2 text-zinc-500">{b.id}</td>
                    <td className="px-3 py-2 uppercase font-semibold text-indigo-400">{b.step}</td>
                    <td className="px-3 py-2 text-zinc-300 truncate max-w-xs">{b.cliCommand}</td>
                    <td className="px-3 py-2 font-bold text-emerald-400">{b.durationSeconds}s</td>
                    <td className="px-3 py-2">
                      {b.success ? (
                        <span className="text-emerald-400 text-[10px]">SUCCESS</span>
                      ) : (
                        <span className="text-rose-400 text-[10px]">FAILED</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-zinc-500 text-[10px]">
                      {new Date(b.startedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
