'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { ConfigWizard } from '@/components/ConfigWizard';
import { SitemapVisualizer } from '@/components/SitemapVisualizer';
import { ManifestExplorer } from '@/components/ManifestExplorer';
import { ExecutionDashboard } from '@/components/ExecutionDashboard';
import { VirtualConsole } from '@/components/VirtualConsole';
import { SusModal } from '@/components/SusModal';
import { TargetConfigInput, SAUCEDEMO_PRESET } from '@/lib/config-builder';
import { LockState } from '@/lib/lock-manager';
import { BenchmarkRecord } from '@/lib/benchmark-timer';
import { Cpu, Terminal, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'config' | 'sitemap' | 'manifest' | 'runner' | 'benchmarks'>('config');
  const [lockState, setLockState] = useState<LockState | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [crawlData, setCrawlData] = useState<any>(null);
  const [manifest, setManifest] = useState<any[] | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkRecord[]>([]);
  const [executionStats, setExecutionStats] = useState<any>(null);
  const [executionDuration, setExecutionDuration] = useState<number>(0);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSusOpen, setIsSusOpen] = useState<boolean>(false);

  // Poll engine status and artifacts on load
  const refreshStatus = async () => {
    try {
      const res = await fetch('/api/orchestrator/status');
      const data = await res.json();
      setLockState(data.lock);

      // Load artifacts if available
      const artRes = await fetch('/api/orchestrator/artifacts');
      const artData = await artRes.json();
      if (artData.crawlData) setCrawlData(artData.crawlData);
      if (artData.manifest) setManifest(artData.manifest);
      if (artData.benchmarks) setBenchmarks(artData.benchmarks);
    } catch (e) {
      console.error('Failed to fetch status', e);
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  // Step 1: Start Crawl
  const handleStartCrawl = async (config: TargetConfigInput) => {
    setIsLoading(true);
    setLogs((prev) => `${prev}\n\n[ORCHESTRATOR] === Starting Crawl & SUT Model Extraction ===\nTarget URL: ${config.baseUrl}\n`);

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
        setLogs((prev) => `${prev}\n[ORCHESTRATOR] Crawl completed successfully in ${data.durationSeconds}s! Discovered ${data.crawlData.pages?.length || 0} pages.`);
        setActiveTab('sitemap'); // Auto-advance to step 2
      } else if (!data.success) {
        setLogs((prev) => `${prev}\n[ERROR] Crawl failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setLogs((prev) => `${prev}\n[ERROR] Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
      refreshStatus();
    }
  };

  // Step 2: Generate Specs
  const handleGenerateSpecs = async () => {
    setIsLoading(true);
    setLogs((prev) => `${prev}\n\n[ORCHESTRATOR] === Starting Test Specification Generator ===\nExecuting: tt generate...\n`);

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
        setLogs((prev) => `${prev}\n[ORCHESTRATOR] Generator completed successfully in ${data.durationSeconds}s! Generated ${data.totalScenarios} test scenarios.`);
        setActiveTab('manifest'); // Auto-advance to step 3
      } else if (!data.success) {
        setLogs((prev) => `${prev}\n[ERROR] Generate failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setLogs((prev) => `${prev}\n[ERROR] Network error: ${err.message}`);
    } finally {
      setIsLoading(false);
      refreshStatus();
    }
  };

  // Step 3: Run Tests
  const handleRunTests = async (options: { grep?: string; headed?: boolean }) => {
    setIsLoading(true);
    setLogs((prev) => `${prev}\n\n[ORCHESTRATOR] === Executing Playwright Test Suite ===\nGrep Filter: ${options.grep || 'All Scenarios'} | Headed: ${options.headed ? 'Yes' : 'No'}\n`);

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
        setLogs((prev) => `${prev}\n[ORCHESTRATOR] Execution finished in ${data.durationSeconds}s: ${data.stats.passed} passed, ${data.stats.failed} failed, ${data.stats.skipped} skipped.`);
        setActiveTab('runner'); // Auto-advance to step 4
      }
    } catch (err: any) {
      setLogs((prev) => `${prev}\n[ERROR] Test run failed: ${err.message}`);
    } finally {
      setIsLoading(false);
      refreshStatus();
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lockState={lockState}
        onOpenSus={() => setIsSusOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Active Tab Panel */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">Tahap 1: Konfigurasi Target Aplikasi & Crawl</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Tentukan URL SUT, kredensial login, dan batasan eksplorasi untuk crawler otomatis Playwright.
              </p>
            </div>
            <ConfigWizard
              onStartCrawl={handleStartCrawl}
              isLoading={isLoading}
              isLocked={lockState?.isLocked ?? false}
            />
          </div>
        )}

        {activeTab === 'sitemap' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">Tahap 2: Visualisasi Model Sitemap & Form DOM</h2>
              <p className="text-xs text-zinc-400 mt-1">
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

        {activeTab === 'manifest' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">Tahap 3: Matriks Skenario Pengujian (Manifest)</h2>
              <p className="text-xs text-zinc-400 mt-1">
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

        {activeTab === 'runner' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">Tahap 4: Dasbor Hasil Pengujian & Overhead Latensi</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Hasil pengujian Playwright Chromium dan analisis benchmarking waktu eksekusi (ΔTime).
              </p>
            </div>
            <ExecutionDashboard
              stats={executionStats}
              durationSeconds={executionDuration}
              benchmarks={benchmarks}
              onOpenSus={() => setIsSusOpen(true)}
              onReRun={() => handleRunTests({})}
              isRunning={isLoading}
            />
          </div>
        )}

        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-100">Tahap 5: Metrik Penelitian & Evaluasi Usabilitas (SUS)</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Data empiris benchmarking latensi dan hasil penilaian kuesioner System Usability Scale untuk Bab 4 Skripsi.
              </p>
            </div>
            <ExecutionDashboard
              stats={executionStats}
              durationSeconds={executionDuration}
              benchmarks={benchmarks}
              onOpenSus={() => setIsSusOpen(true)}
              onReRun={() => handleRunTests({})}
              isRunning={isLoading}
            />
          </div>
        )}

        {/* Live Virtual Console (Always Visible at Bottom for Real-Time Feedback) */}
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
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-6 mt-12 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>orchesTathya Web Orchestrator • Skripsi Teknik Informatika</span>
          <span className="text-zinc-600">Powered by Next.js 16 • TathyaTest CLI • Playwright</span>
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
