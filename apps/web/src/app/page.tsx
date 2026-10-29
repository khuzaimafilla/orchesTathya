'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ConfigWizard } from '@/components/ConfigWizard';
import { SitemapVisualizer } from '@/components/SitemapVisualizer';
import { ManifestExplorer } from '@/components/ManifestExplorer';
import { ExecutionDashboard } from '@/components/ExecutionDashboard';
import { VirtualConsole } from '@/components/VirtualConsole';
import { SusModal } from '@/components/SusModal';
import { TargetConfigInput } from '@/lib/config-builder';
import { LockState } from '@/lib/lock-manager';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'config' | 'sitemap' | 'manifest' | 'runner'>('config');
  const [lockState, setLockState] = useState<LockState | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [crawlData, setCrawlData] = useState<any>(null);
  const [manifest, setManifest] = useState<any[] | null>(null);
  const [executionStats, setExecutionStats] = useState<any>(null);
  const [executionDuration, setExecutionDuration] = useState<number>(0);

  // Workflow progress gatekeepers
  const [hasCrawled, setHasCrawled] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSusOpen, setIsSusOpen] = useState<boolean>(false);

  // Status check & load previous artifacts
  const refreshStatus = async () => {
    try {
      const res = await fetch('/api/orchestrator/status');
      const data = await res.json();
      setLockState(data.lock);

      const artRes = await fetch('/api/orchestrator/artifacts');
      const artData = await artRes.json();
      if (artData.crawlData) {
        setCrawlData(artData.crawlData);
        setHasCrawled(true);
      }
      if (artData.manifest) {
        setManifest(artData.manifest);
        setHasGenerated(true);
      }
      if (artData.benchmarks) {
        const hasRunBench = artData.benchmarks.some((b: any) => b.step === 'run' && b.success);
        if (hasRunBench) setHasRun(true);
      }
    } catch (e) {
      console.error('Failed to fetch status', e);
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const isWorkflowCompleted = hasCrawled && hasGenerated && hasRun;

  // Step 1: Start Crawl
  const handleStartCrawl = async (config: TargetConfigInput) => {
    setIsLoading(true);
    setLogs((prev) => `${prev}\n\n[ORCHESTRATOR] === Memulai Crawl & Ekstraksi Model SUT ===\nTarget URL: ${config.baseUrl}\n`);

    try {
      const res = await fetch('/api/orchestrator/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      const data = await res.json();
      if (data.logs) {
        setLogs((prev) => `${prev}\n${data.logs}`);
      }

      if (data.success && data.crawlData) {
        setCrawlData(data.crawlData);
        setHasCrawled(true);
        setLogs((prev) => `${prev}\n[ORCHESTRATOR] Crawl sukses dalam ${data.durationSeconds}s! Ditemukan ${data.crawlData.pages?.length || 0} halaman.`);
        setActiveTab('sitemap'); // Auto-advance to Step 2
      } else if (!data.success) {
        setLogs((prev) => `${prev}\n[ERROR] Crawl gagal: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setLogs((prev) => `${prev}\n[ERROR] Gangguan jaringan: ${err.message}`);
    } finally {
      setIsLoading(false);
      refreshStatus();
    }
  };

  // Step 2: Generate Specs
  const handleGenerateSpecs = async () => {
    setIsLoading(true);
    setLogs((prev) => `${prev}\n\n[ORCHESTRATOR] === Menjalankan Generator Spesifikasi Pengujian ===\nPerintah: tt generate...\n`);

    try {
      const res = await fetch('/api/orchestrator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (data.logs) {
        setLogs((prev) => `${prev}\n${data.logs}`);
      }

      if (data.success && data.manifest) {
        setManifest(data.manifest);
        setHasGenerated(true);
        setLogs((prev) => `${prev}\n[ORCHESTRATOR] Generator sukses dalam ${data.durationSeconds}s! Dihasilkan ${data.totalScenarios} skenario uji Playwright.`);
        setActiveTab('manifest'); // Auto-advance to Step 3
      } else if (!data.success) {
        setLogs((prev) => `${prev}\n[ERROR] Generate gagal: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setLogs((prev) => `${prev}\n[ERROR] Gangguan jaringan: ${err.message}`);
    } finally {
      setIsLoading(false);
      refreshStatus();
    }
  };

  // Step 3: Run Tests
  const handleRunTests = async (options: { grep?: string; headed?: boolean }) => {
    setIsLoading(true);
    setLogs((prev) => `${prev}\n\n[ORCHESTRATOR] === Menjalankan Suite Pengujian Playwright ===\nFilter: ${options.grep || 'Semua Skenario'} | Headed: ${options.headed ? 'Ya' : 'Tidak'}\n`);

    try {
      const res = await fetch('/api/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      const data = await res.json();
      if (data.logs) {
        setLogs((prev) => `${prev}\n${data.logs}`);
      }

      if (data.stats) {
        setExecutionStats(data.stats);
        setExecutionDuration(data.durationSeconds || 0);
        setHasRun(true);
        setLogs((prev) => `${prev}\n[ORCHESTRATOR] Eksekusi selesai dalam ${data.durationSeconds}s: ${data.stats.passed} lulus, ${data.stats.failed} gagal, ${data.stats.skipped} dilewati.`);
        setActiveTab('runner'); // Auto-advance to Step 4
      }
    } catch (err: any) {
      setLogs((prev) => `${prev}\n[ERROR] Eksekusi uji gagal: ${err.message}`);
    } finally {
      setIsLoading(false);
      refreshStatus();
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#F5F5F0] flex flex-col font-sans selection:bg-[#EAB308] selection:text-black">
      {/* Navigation Header for Respondents */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lockState={lockState}
        onOpenSus={() => setIsSusOpen(true)}
        isWorkflowCompleted={isWorkflowCompleted}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Step 1: Config */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-xl font-bold tracking-tight text-[#F5F5F0]">
                Tahap 1: Konfigurasi Target Aplikasi & Crawl
              </h2>
              <p className="font-sans text-xs text-[#A1A19D] mt-1">
                Tentukan URL SUT, akun login, dan batasan eksplorasi untuk crawler otomatis Playwright.
              </p>
            </div>
            <ConfigWizard
              onStartCrawl={handleStartCrawl}
              isLoading={isLoading}
              isLocked={lockState?.isLocked ?? false}
            />
          </div>
        )}

        {/* Step 2: Sitemap */}
        {activeTab === 'sitemap' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-xl font-bold tracking-tight text-[#F5F5F0]">
                Tahap 2: Visualisasi Struktur Sitemap & Form DOM
              </h2>
              <p className="font-sans text-xs text-[#A1A19D] mt-1">
                Hasil crawling otomatis memetakan relasi halaman, formulir CRUD, tombol aksi, dan strategi locator.
              </p>
            </div>
            <SitemapVisualizer
              crawlData={crawlData}
              onProceedToGenerate={handleGenerateSpecs}
              isGenerating={isLoading}
              isLocked={lockState?.isLocked ?? false}
            />
          </div>
        )}

        {/* Step 3: Manifest */}
        {activeTab === 'manifest' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-xl font-bold tracking-tight text-[#F5F5F0]">
                Tahap 3: Matriks Skenario Pengujian (Manifest)
              </h2>
              <p className="font-sans text-xs text-[#A1A19D] mt-1">
                Pilih skenario pengujian spesifikasi yang ingin dieksekusi berdasarkan tier (Positive, Negative, Edge) atau kategori.
              </p>
            </div>
            <ManifestExplorer
              manifest={manifest}
              onRunTests={handleRunTests}
              isRunning={isLoading}
              isLocked={lockState?.isLocked ?? false}
            />
          </div>
        )}

        {/* Step 4: Runner */}
        {activeTab === 'runner' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-xl font-bold tracking-tight text-[#F5F5F0]">
                Tahap 4: Hasil Eksekusi Pengujian Playwright
              </h2>
              <p className="font-sans text-xs text-[#A1A19D] mt-1">
                Hasil pengujian Playwright Chromium dan ringkasan status kelulusan skenario (Passed / Failed).
              </p>
            </div>
            <ExecutionDashboard
              stats={executionStats}
              durationSeconds={executionDuration}
              onOpenSus={() => setIsSusOpen(true)}
              onReRun={() => handleRunTests({})}
              isRunning={isLoading}
              isWorkflowCompleted={isWorkflowCompleted}
            />
          </div>
        )}

        {/* Live Virtual Console (Terminal feedback for respondents) */}
        <div className="pt-4">
          <VirtualConsole
            logs={logs}
            onClear={() => setLogs('')}
            isRunning={isLoading}
            title="TathyaTest Engine Subprocess Stream (stdout / stderr)"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#27272a] bg-[#09090b] py-6 mt-12 text-center text-xs text-[#71717A] font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-heading font-medium text-[#A1A19D]">
            orchesTathya Web Orchestrator • Penelitian Skripsi Teknik Informatika
          </span>
          <span className="font-mono text-[11px] text-[#71717A]">
            Next.js 16 • TathyaTest CLI Engine • Playwright
          </span>
        </div>
      </footer>

      {/* SUS Modal */}
      <SusModal
        isOpen={isSusOpen}
        onClose={() => setIsSusOpen(false)}
        onSubmitted={refreshStatus}
      />
    </div>
  );
}
