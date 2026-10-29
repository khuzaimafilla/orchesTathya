'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Database,
  Download,
  RefreshCw,
  BarChart2,
  ShieldCheck,
  Cpu,
  Award,
  ArrowLeft,
  Unlock,
  Lock,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { BenchmarkRecord } from '@/lib/benchmark-timer';

export default function ResearchPortalPage() {
  const [benchmarks, setBenchmarks] = useState<BenchmarkRecord[]>([]);
  const [susData, setSusData] = useState<{ submissions: any[]; count: number; averageScore: number }>({
    submissions: [],
    count: 0,
    averageScore: 0,
  });
  const [lockStatus, setLockStatus] = useState<any>(null);
  const [isResettingLock, setIsResettingLock] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchData = async () => {
    try {
      // 1. Fetch artifacts & benchmarks
      const artRes = await fetch('/api/orchestrator/artifacts');
      const artData = await artRes.json();
      if (artData.benchmarks) setBenchmarks(artData.benchmarks);

      // 2. Fetch SUS data
      const susRes = await fetch('/api/evaluation/sus');
      const sus = await susRes.json();
      setSusData(sus);

      // 3. Fetch lock status
      const statRes = await fetch('/api/orchestrator/status');
      const stat = await statRes.json();
      setLockStatus(stat.lock);
    } catch (err) {
      console.error('Failed to load research data', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResetLock = async () => {
    setIsResettingLock(true);
    try {
      const res = await fetch('/api/orchestrator/reset-lock', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLockStatus(data.lock);
        setFeedbackMsg('Mutex lock berhasil di-reset menjadi IDLE.');
        setTimeout(() => setFeedbackMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsResettingLock(false);
    }
  };

  // Export Latency Benchmarks to CSV
  const handleExportBenchmarksCsv = () => {
    if (benchmarks.length === 0) return;
    const headers = ['ID', 'Tahap', 'Perintah_CLI', 'Durasi_Detik', 'Status_Success', 'Exit_Code', 'Timestamp_Mulai', 'Target_URL'];
    const rows = benchmarks.map((b) => [
      b.id,
      b.step,
      `"${b.cliCommand.replace(/"/g, '""')}"`,
      b.durationSeconds,
      b.success,
      b.exitCode ?? 0,
      b.startedAt,
      `"${b.targetUrl}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `benchmarks_latency_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export SUS survey dataset to CSV
  const handleExportSusCsv = () => {
    if (susData.submissions.length === 0) return;
    const headers = ['ID', 'Nama_Responden', 'Peran', 'Skor_SUS', 'Grade', 'Acceptability', 'Timestamp', 'Masukan_Kualitatif', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'];
    const rows = susData.submissions.map((s) => [
      s.id,
      `"${s.respondentName}"`,
      `"${s.respondentRole}"`,
      s.susScore,
      `"${s.grade}"`,
      `"${s.acceptability}"`,
      s.timestamp,
      `"${(s.feedback || '').replace(/"/g, '""')}"`,
      ...(s.responses || Array(10).fill('')),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sus_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute average latencies per step
  const crawlBenchmarks = benchmarks.filter((b) => b.step === 'crawl' && b.success);
  const generateBenchmarks = benchmarks.filter((b) => b.step === 'generate' && b.success);
  const runBenchmarks = benchmarks.filter((b) => b.step === 'run' && b.success);

  const avgCrawl = crawlBenchmarks.length > 0
    ? +(crawlBenchmarks.reduce((acc, b) => acc + b.durationSeconds, 0) / crawlBenchmarks.length).toFixed(2)
    : 0;

  const avgGenerate = generateBenchmarks.length > 0
    ? +(generateBenchmarks.reduce((acc, b) => acc + b.durationSeconds, 0) / generateBenchmarks.length).toFixed(2)
    : 0;

  const avgRun = runBenchmarks.length > 0
    ? +(runBenchmarks.reduce((acc, b) => acc + b.durationSeconds, 0) / runBenchmarks.length).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-[#F5F5F0] flex flex-col font-sans selection:bg-[#EAB308] selection:text-black">
      {/* Header */}
      <header className="border-b border-[#27272a] bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <Link
              href="/"
              className="p-2 rounded-lg bg-[#121214] border border-[#27272a] text-[#A1A19D] hover:text-[#F5F5F0] transition-colors"
              title="Kembali ke Web Orchestrator"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-9 h-9 rounded-xl bg-[#121214] border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308] shadow-md shadow-[#EAB308]/10">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-bold text-base tracking-tight text-[#F5F5F0]">
                  Portal Riset & Telemetri Skripsi
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded-md bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/40">
                  Secret Route: /research
                </span>
              </div>
              <p className="text-[11px] text-[#A1A19D] font-sans">
                Data Kuantitatif untuk Bab 4 Skripsi (Overhead Latensi & Usabilitas SUS)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {feedbackMsg && (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                {feedbackMsg}
              </span>
            )}

            <button
              onClick={fetchData}
              className="px-3 py-1.5 rounded-lg text-xs font-heading font-semibold bg-[#121214] hover:bg-[#18181b] text-[#F5F5F0] border border-[#27272a] transition-all flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Benchmarks */}
          <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A1A19D] font-sans">
              <span>Total Titik Uji Latensi</span>
              <BarChart2 className="w-4 h-4 text-[#EAB308]" />
            </div>
            <div className="font-heading text-3xl font-extrabold text-[#F5F5F0]">{benchmarks.length}</div>
            <p className="text-[11px] text-[#71717A] font-mono">Rekaman eksekusi engine</p>
          </div>

          {/* Average Latency Summary */}
          <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A1A19D] font-sans">
              <span>Rata-Rata Waktu Eksekusi</span>
              <Clock className="w-4 h-4 text-[#EAB308]" />
            </div>
            <div className="font-heading text-xl font-bold text-[#EAB308]">
              Crawl: {avgCrawl}s • Run: {avgRun}s
            </div>
            <p className="text-[11px] text-[#71717A] font-mono">Generate: {avgGenerate}s</p>
          </div>

          {/* Total SUS Respondents */}
          <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A1A19D] font-sans">
              <span>Total Responden SUS</span>
              <ShieldCheck className="w-4 h-4 text-[#EAB308]" />
            </div>
            <div className="font-heading text-3xl font-extrabold text-[#F5F5F0]">{susData.count}</div>
            <p className="text-[11px] text-[#71717A] font-mono">Penguji terdaftar</p>
          </div>

          {/* Average SUS Score */}
          <div className="p-5 rounded-xl bg-[#121214] border border-[#EAB308]/40 space-y-1">
            <div className="flex items-center justify-between text-xs text-[#A1A19D] font-sans">
              <span>Skor Rata-Rata SUS</span>
              <Award className="w-4 h-4 text-[#EAB308]" />
            </div>
            <div className="font-heading text-3xl font-extrabold text-[#EAB308]">
              {susData.averageScore} <span className="text-sm text-[#71717A]">/ 100</span>
            </div>
            <p className="text-[11px] text-[#A1A19D] font-mono">
              {susData.averageScore >= 80.3 ? 'Grade A (Excellent)' : susData.averageScore >= 68 ? 'Grade C (Average)' : 'Memerlukan Evaluasi'}
            </p>
          </div>
        </div>

        {/* Mutex Lock Manager Card */}
        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 font-sans">
            <div className="p-2 rounded-lg bg-[#18181b] border border-[#27272a] text-[#EAB308]">
              {lockStatus?.isLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
            </div>
            <div>
              <div className="text-xs font-heading font-semibold text-[#F5F5F0]">
                Status Engine Mutex Lock: {lockStatus?.isLocked ? 'BUSY (Terkunci)' : 'IDLE (Bebas)'}
              </div>
              <p className="text-[11px] text-[#71717A] font-mono">
                {lockStatus?.isLocked ? `Aktif pada tahap: ${lockStatus.activeStep} oleh ${lockStatus.userId}` : 'Tidak ada proses pengujian concurrent yang berjalan.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetLock}
            disabled={isResettingLock || !lockStatus?.isLocked}
            className="px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold bg-[#18181b] hover:bg-[#27272a] text-rose-400 border border-rose-900/40 transition-all disabled:opacity-40"
          >
            {isResettingLock ? 'Mereset...' : 'Emergency Reset Lock'}
          </button>
        </div>

        {/* Section 1: Benchmarking Latency Table */}
        <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-3">
            <div>
              <h4 className="font-heading text-xs font-semibold text-[#F5F5F0] uppercase tracking-wider flex items-center space-x-1.5">
                <BarChart2 className="w-4 h-4 text-[#EAB308]" />
                <span>1. Rekaman Overhead Latensi Komputasi (ΔTime)</span>
              </h4>
              <p className="font-sans text-xs text-[#A1A19D] mt-0.5">
                Data durasi eksekusi engine (Crawl, Generate, Run) untuk analisis efisiensi skripsi.
              </p>
            </div>

            <button
              onClick={handleExportBenchmarksCsv}
              disabled={benchmarks.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-[#EAB308] hover:bg-[#FACC15] text-black transition-all flex items-center space-x-1.5 disabled:opacity-50 shadow-md shadow-[#EAB308]/20"
            >
              <FileSpreadsheet className="w-4 h-4 text-black" />
              <span>Export CSV Latensi</span>
            </button>
          </div>

          {benchmarks.length === 0 ? (
            <p className="text-xs text-[#71717A] italic py-6 text-center font-sans">
              Belum ada rekaman latensi benchmarking.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#09090b] text-[#A1A19D] text-[10px] uppercase border-b border-[#27272a]">
                  <tr>
                    <th className="px-3 py-2.5">ID</th>
                    <th className="px-3 py-2.5">Tahap</th>
                    <th className="px-3 py-2.5">Perintah CLI</th>
                    <th className="px-3 py-2.5">Durasi (ΔT)</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a] text-[11px]">
                  {benchmarks.map((b) => (
                    <tr key={b.id} className="hover:bg-[#18181b]/50">
                      <td className="px-3 py-2 text-[#71717A]">{b.id}</td>
                      <td className="px-3 py-2 uppercase font-semibold text-[#EAB308]">{b.step}</td>
                      <td className="px-3 py-2 text-[#F5F5F0] truncate max-w-sm">{b.cliCommand}</td>
                      <td className="px-3 py-2 font-bold text-emerald-400">{b.durationSeconds}s</td>
                      <td className="px-3 py-2">
                        {b.success ? (
                          <span className="text-emerald-400 text-[10px]">SUCCESS</span>
                        ) : (
                          <span className="text-rose-400 text-[10px]">FAILED</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-[#71717A] text-[10px]">
                        {new Date(b.startedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 2: SUS Survey Responses Dataset */}
        <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-3">
            <div>
              <h4 className="font-heading text-xs font-semibold text-[#F5F5F0] uppercase tracking-wider flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-[#EAB308]" />
                <span>2. Dataset Responden Usabilitas (SUS Evaluation)</span>
              </h4>
              <p className="font-sans text-xs text-[#A1A19D] mt-0.5">
                Tanggapan instrumen 10-pernyataan System Usability Scale yang telah disubmit responden.
              </p>
            </div>

            <button
              onClick={handleExportSusCsv}
              disabled={susData.submissions.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-heading font-bold bg-[#EAB308] hover:bg-[#FACC15] text-black transition-all flex items-center space-x-1.5 disabled:opacity-50 shadow-md shadow-[#EAB308]/20"
            >
              <FileSpreadsheet className="w-4 h-4 text-black" />
              <span>Export CSV Dataset SUS</span>
            </button>
          </div>

          {susData.submissions.length === 0 ? (
            <p className="text-xs text-[#71717A] italic py-6 text-center font-sans">
              Belum ada responden yang mengisi kuesioner SUS.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#09090b] text-[#A1A19D] text-[10px] uppercase border-b border-[#27272a]">
                  <tr>
                    <th className="px-3 py-2.5">Nama Responden</th>
                    <th className="px-3 py-2.5">Peran / Latar Belakang</th>
                    <th className="px-3 py-2.5">Skor SUS</th>
                    <th className="px-3 py-2.5">Grade</th>
                    <th className="px-3 py-2.5">Acceptability</th>
                    <th className="px-3 py-2.5">Masukan Kualitatif</th>
                    <th className="px-3 py-2.5">Waktu Submit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a] text-[11px]">
                  {susData.submissions.map((s) => (
                    <tr key={s.id} className="hover:bg-[#18181b]/50">
                      <td className="px-3 py-2 font-medium text-[#F5F5F0]">{s.respondentName}</td>
                      <td className="px-3 py-2 text-[#A1A19D]">{s.respondentRole}</td>
                      <td className="px-3 py-2 font-bold text-[#EAB308] text-sm">{s.susScore}</td>
                      <td className="px-3 py-2 text-emerald-400">{s.grade}</td>
                      <td className="px-3 py-2 text-[#F5F5F0]">{s.acceptability}</td>
                      <td className="px-3 py-2 text-[#71717A] italic max-w-xs truncate">
                        {s.feedback || '-'}
                      </td>
                      <td className="px-3 py-2 text-[#71717A] text-[10px]">
                        {new Date(s.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#27272a] bg-[#09090b] py-6 mt-12 text-center text-xs text-[#71717A] font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-heading font-medium text-[#A1A19D]">
            orchesTathya • Research Telemetry Portal
          </span>
          <Link href="/" className="text-[#EAB308] hover:underline font-mono text-[11px]">
            Kembali ke Antarmuka Pengujian (SUT) →
          </Link>
        </div>
      </footer>
    </div>
  );
}
