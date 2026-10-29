'use client';

import React, { useState, useEffect } from 'react';
import { Database, Download, RefreshCw, BarChart2, ShieldCheck, Cpu, Trash2, Award } from 'lucide-react';
import { BenchmarkRecord } from '@/lib/benchmark-timer';

interface ResearcherTelemetryProps {
  benchmarks: BenchmarkRecord[];
  onRefresh: () => void;
}

export function ResearcherTelemetry({ benchmarks, onRefresh }: ResearcherTelemetryProps) {
  const [susData, setSusData] = useState<{ submissions: any[]; count: number; averageScore: number }>({
    submissions: [],
    count: 0,
    averageScore: 0,
  });
  const [isResettingLock, setIsResettingLock] = useState(false);

  const fetchSusData = async () => {
    try {
      const res = await fetch('/api/evaluation/sus');
      const data = await res.json();
      setSusData(data);
    } catch (e) {
      console.error('Failed to fetch SUS data', e);
    }
  };

  useEffect(() => {
    fetchSusData();
  }, []);

  // Export Benchmarks as CSV
  const handleExportBenchmarksCsv = () => {
    if (benchmarks.length === 0) return;
    const headers = ['ID', 'Step', 'CLI_Command', 'Duration_Seconds', 'Success', 'Exit_Code', 'Started_At', 'Target_URL'];
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

  // Export SUS dataset as CSV
  const handleExportSusCsv = () => {
    if (susData.submissions.length === 0) return;
    const headers = ['ID', 'Respondent_Name', 'Role', 'SUS_Score', 'Grade', 'Acceptability', 'Timestamp', 'Feedback', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10'];
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

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#121214] border border-[#EAB308]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#18181b] border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308]">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-base text-[#F5F5F0]">
              Telemetry & Dataset Riset Skripsi (Mode Peneliti)
            </h3>
            <p className="font-sans text-xs text-[#A1A19D]">
              Halaman internal peneliti untuk merekam data kuantitatif: Latency Overhead (ΔTime) & evaluasi System Usability Scale (SUS).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              onRefresh();
              fetchSusData();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-heading font-semibold bg-[#18181b] hover:bg-[#27272a] text-[#F5F5F0] border border-[#27272a] transition-all flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#EAB308]" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards for Skripsi Chapter 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Benchmarks */}
        <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-xs font-sans text-[#A1A19D]">
            <span>Total Rekaman Latensi (ΔT)</span>
            <BarChart2 className="w-4 h-4 text-[#EAB308]" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-[#F5F5F0]">{benchmarks.length}</div>
          <p className="text-[11px] text-[#71717A] font-sans">Sample titik uji eksekusi engine</p>
        </div>

        {/* Total SUS Respondents */}
        <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-2">
          <div className="flex items-center justify-between text-xs font-sans text-[#A1A19D]">
            <span>Total Responden SUS</span>
            <ShieldCheck className="w-4 h-4 text-[#EAB308]" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-[#F5F5F0]">{susData.count}</div>
          <p className="text-[11px] text-[#71717A] font-sans">Kuesioner evaluasi yang telah disubmit</p>
        </div>

        {/* Average SUS Score */}
        <div className="p-5 rounded-xl bg-[#121214] border border-[#EAB308]/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-sans text-[#A1A19D]">
            <span>Skor Rata-Rata SUS</span>
            <Award className="w-4 h-4 text-[#EAB308]" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-[#EAB308]">
            {susData.averageScore} <span className="text-base text-[#71717A]">/ 100</span>
          </div>
          <p className="text-[11px] text-[#A1A19D] font-sans">
            {susData.averageScore >= 80.3
              ? 'Predikat: Grade A (Excellent / Acceptable)'
              : susData.averageScore >= 68
              ? 'Predikat: Grade C (OK / Marginal)'
              : 'Predikat: Butuh Peningkatan'}
          </p>
        </div>
      </div>

      {/* Section 1: Benchmarking Latency Table */}
      <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-3">
          <div>
            <h4 className="font-heading text-xs font-semibold text-[#F5F5F0] uppercase tracking-wider">
              1. Tabel Latensi Eksekusi (Benchmark Overhead)
            </h4>
            <p className="font-sans text-xs text-[#A1A19D] mt-0.5">
              Waktu komputasi mesin per tahap (Crawl, Generate, Run) untuk analisis efisiensi skripsi.
            </p>
          </div>

          <button
            onClick={handleExportBenchmarksCsv}
            disabled={benchmarks.length === 0}
            className="px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold bg-[#EAB308] hover:bg-[#FACC15] text-black transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Latensi</span>
          </button>
        </div>

        {benchmarks.length === 0 ? (
          <p className="text-xs text-[#71717A] italic py-6 text-center">
            Belum ada data benchmarking. Silakan jalankan alur pengujian.
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
                {benchmarks.slice(0, 15).map((b) => (
                  <tr key={b.id} className="hover:bg-[#18181b]/50">
                    <td className="px-3 py-2 text-[#71717A]">{b.id}</td>
                    <td className="px-3 py-2 uppercase font-semibold text-[#EAB308]">{b.step}</td>
                    <td className="px-3 py-2 text-[#F5F5F0] truncate max-w-xs">{b.cliCommand}</td>
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

      {/* Section 2: SUS Survey Submissions Table */}
      <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-3">
          <div>
            <h4 className="font-heading text-xs font-semibold text-[#F5F5F0] uppercase tracking-wider">
              2. Dataset Evaluasi Usabilitas (SUS Responses)
            </h4>
            <p className="font-sans text-xs text-[#A1A19D] mt-0.5">
              Tanggapan responden pengujian kuesioner usabilitas 10-item Likert scale.
            </p>
          </div>

          <button
            onClick={handleExportSusCsv}
            disabled={susData.submissions.length === 0}
            className="px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold bg-[#EAB308] hover:bg-[#FACC15] text-black transition-all flex items-center space-x-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Kuesioner SUS</span>
          </button>
        </div>

        {susData.submissions.length === 0 ? (
          <p className="text-xs text-[#71717A] italic py-6 text-center">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] text-[11px]">
                {susData.submissions.map((s) => (
                  <tr key={s.id} className="hover:bg-[#18181b]/50">
                    <td className="px-3 py-2 font-medium text-[#F5F5F0]">{s.respondentName}</td>
                    <td className="px-3 py-2 text-[#A1A19D]">{s.respondentRole}</td>
                    <td className="px-3 py-2 font-bold text-[#EAB308]">{s.susScore}</td>
                    <td className="px-3 py-2 text-emerald-400">{s.grade}</td>
                    <td className="px-3 py-2 text-[#F5F5F0]">{s.acceptability}</td>
                    <td className="px-3 py-2 text-[#71717A] italic max-w-xs truncate">
                      {s.feedback || '-'}
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
