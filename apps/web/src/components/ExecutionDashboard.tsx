'use client';

import React from 'react';
import { CheckCircle2, XCircle, Minus, Clock, ShieldCheck, Play, ArrowRight, Award, Info } from 'lucide-react';

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
  const passRate = stats && stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0;
  const hasRun = stats !== null;

  if (!hasRun && !isRunning) {
    return (
      <div className="space-y-6">
        <div className="p-10 rounded-2xl border border-dashed border-[#27272a] bg-[#121214] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto text-[#EAB308]">
            <Play className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm text-[#F5F5F0]">Belum ada hasil pengujian</h3>
            <p className="font-sans text-xs text-[#71717A] mt-1 max-w-sm mx-auto leading-relaxed">
              Kembali ke tab <strong className="text-[#A1A19D]">Skenario</strong> dan pilih skenario mana yang ingin dijalankan, lalu klik tombol eksekusi.
            </p>
          </div>
          <button
            onClick={onReRun}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl text-xs font-heading font-bold bg-[#EAB308] hover:bg-[#FACC15] text-black shadow-md shadow-[#EAB308]/20 transition-all inline-flex items-center space-x-2"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Jalankan Semua Skenario</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#121214] border border-[#EAB308]/30 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[#EAB308]">{stats?.passed ?? 0}</div>
            <div className="text-[11px] text-[#71717A]">Lulus</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121214] border border-rose-900/40 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-800/40 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-rose-400">{stats?.failed ?? 0}</div>
            <div className="text-[11px] text-[#71717A]">Gagal</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#18181b] text-[#71717A] border border-[#27272a] shrink-0">
            <Minus className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[#A1A19D]">{stats?.skipped ?? 0}</div>
            <div className="text-[11px] text-[#71717A]">Dilewati</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121214] border border-[#EAB308]/30 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading text-2xl font-bold text-[#EAB308]">
              {durationSeconds > 0 ? `${durationSeconds}s` : '—'}
            </div>
            <div className="text-[11px] text-[#71717A]">Durasi</div>
          </div>
        </div>
      </div>

      {/* Pass Rate Bar */}
      {stats && stats.total > 0 && (
        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A1A19D] font-sans">Pass Rate</span>
            <span className="font-heading font-bold text-[#F5F5F0]">
              {passRate}%{' '}
              <span className="text-[#71717A] font-normal">
                ({stats.passed}/{stats.total} skenario)
              </span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#27272a] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                passRate >= 80
                  ? 'bg-[#EAB308]'
                  : passRate >= 50
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${passRate}%` }}
            />
          </div>
          {stats.failed > 0 && (
            <p className="text-[11px] text-[#71717A] flex items-center gap-1.5 pt-1">
              <Info className="w-3 h-3 text-amber-400 shrink-0" />
              <span>
                Ada <strong className="text-rose-400">{stats.failed} skenario gagal</strong>. Lihat
                log terminal di panel kanan untuk detail error Playwright.
              </span>
            </p>
          )}
        </div>
      )}

      {/* SUS Prompt */}
      {isWorkflowCompleted ? (
        <div className="p-5 rounded-2xl bg-[#121214] border border-[#EAB308]/50 shadow-lg shadow-[#EAB308]/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#EAB308]/10 border border-[#EAB308]/30 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-[#EAB308]" />
            </div>
            <div>
              <h4 className="font-heading text-sm font-bold text-[#F5F5F0]">
                Pengujian selesai — terima kasih!
              </h4>
              <p className="font-sans text-xs text-[#71717A] mt-0.5 max-w-lg leading-relaxed">
                Silakan luangkan 2–3 menit untuk mengisi kuesioner SUS. Penilaian Anda sangat
                berarti untuk penelitian ini.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto">
            <button
              onClick={onReRun}
              disabled={isRunning}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-lg text-[11px] font-heading font-semibold bg-[#18181b] hover:bg-[#27272a] text-[#A1A19D] border border-[#27272a] transition-all flex items-center justify-center space-x-1.5"
            >
              <Play className="w-3 h-3" />
              <span>Ulangi</span>
            </button>

            <button
              onClick={onOpenSus}
              className="flex-1 md:flex-none px-5 py-2 rounded-lg text-[11px] font-heading font-bold bg-[#EAB308] hover:bg-[#FACC15] text-black shadow-md shadow-[#EAB308]/20 transition-all flex items-center justify-center space-x-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-black" />
              <span>Isi Kuesioner SUS</span>
              <ArrowRight className="w-3 h-3 text-black" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] flex items-center justify-between gap-4">
          <p className="text-xs text-[#71717A] font-sans leading-relaxed">
            Kuesioner SUS akan terbuka setelah Anda menyelesaikan seluruh alur pengujian (Crawl →
            Generate → Run).
          </p>
          <button
            onClick={onReRun}
            disabled={isRunning}
            className="shrink-0 px-4 py-2 rounded-lg text-[11px] font-heading font-semibold bg-[#18181b] hover:bg-[#27272a] text-[#EAB308] border border-[#EAB308]/30 transition-all flex items-center space-x-1.5"
          >
            <Play className="w-3 h-3" />
            <span>Mulai Uji</span>
          </button>
        </div>
      )}
    </div>
  );
}
