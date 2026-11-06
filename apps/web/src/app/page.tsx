'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { ConfigWizard } from '@/components/ConfigWizard';
import { SitemapVisualizer } from '@/components/SitemapVisualizer';
import { ManifestExplorer } from '@/components/ManifestExplorer';
import { ExecutionDashboard } from '@/components/ExecutionDashboard';
import { ExecutionProgressModal } from '@/components/ExecutionProgressModal';
import { VirtualConsole } from '@/components/VirtualConsole';
import { SusModal } from '@/components/SusModal';
import { TargetConfigInput } from '@/lib/config-builder';
import { LockState } from '@/lib/lock-manager';
import { Terminal } from 'lucide-react';

/** Persistent user session ID (stays same across reloads in same browser tab) */
function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'ssr_user';
  const key = 'orchestathya_user_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `user_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'config' | 'sitemap' | 'manifest' | 'runner'>('config');
  const [lockState, setLockState] = useState<LockState | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [crawlData, setCrawlData] = useState<any>(null);
  const [manifest, setManifest] = useState<any[] | null>(null);
  const [executionStats, setExecutionStats] = useState<any>(null);
  const [executionDuration, setExecutionDuration] = useState<number>(0);

  const [hasCrawled, setHasCrawled] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSusOpen, setIsSusOpen] = useState<boolean>(false);

  // Execution Progress Modal States
  const [isProgressModalOpen, setIsProgressModalOpen] = useState<boolean>(false);
  const [isExecutingRun, setIsExecutingRun] = useState<boolean>(false);
  const [isTestingCompleted, setIsTestingCompleted] = useState<boolean>(false);
  const [runOptions, setRunOptions] = useState<{ grep?: string; headed?: boolean }>({});
  const [modalLiveLogs, setModalLiveLogs] = useState<string>('');
  const [modalLiveStats, setModalLiveStats] = useState<{ passed: number; failed: number; skipped: number; total: number } | null>(null);
  const [modalDurationSeconds, setModalDurationSeconds] = useState<number>(0);
  const [modalError, setModalError] = useState<string>('');

  const userIdRef = useRef<string>('');
  useEffect(() => {
    userIdRef.current = getOrCreateUserId();
  }, []);

  const appendLog = (text: string) => setLogs((prev) => `${prev}${text}`);

  const refreshStatus = async () => {
    try {
      const [statusRes, artRes] = await Promise.all([
        fetch('/api/orchestrator/status'),
        fetch('/api/orchestrator/artifacts'),
      ]);
      const statusData = await statusRes.json();
      setLockState(statusData.lock);

      const artData = await artRes.json();
      if (artData.crawlData) { setCrawlData(artData.crawlData); setHasCrawled(true); }
      if (artData.manifest) { setManifest(artData.manifest); setHasGenerated(true); }
      if (artData.benchmarks) {
        const hasRunBench = artData.benchmarks.some((b: any) => b.step === 'run');
        if (hasRunBench) setHasRun(true);
      }
    } catch {}
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const isWorkflowCompleted = hasCrawled && hasGenerated && hasRun;

  // Step 1: Crawl
  const handleStartCrawl = async (config: TargetConfigInput) => {
    setIsLoading(true);
    setIsConsoleOpen(true);
    appendLog(`\n[ORCHESTRATOR] Memulai crawl target: ${config.baseUrl}\n`);

    try {
      const res = await fetch('/api/orchestrator/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, userId: userIdRef.current }),
      });
      const data = await res.json();
      if (data.logs) appendLog(data.logs);

      if (data.success && data.crawlData) {
        setCrawlData(data.crawlData);
        setHasCrawled(true);
        appendLog(`\n[ORCHESTRATOR] ✓ Crawl selesai dalam ${data.durationSeconds}s — ${data.crawlData.pages?.length || 0} halaman ditemukan.\n`);
        setActiveTab('sitemap');
      } else {
        appendLog(`\n[ERROR] Crawl gagal: ${data.error || 'Periksa log di atas untuk detail.'}\n`);
      }
    } catch (err: any) {
      appendLog(`\n[ERROR] Tidak dapat terhubung ke API: ${err.message}\n`);
    } finally {
      setIsLoading(false);
      refreshStatus();
    }
  };

  // Step 2: Generate
  const handleGenerateSpecs = async () => {
    setIsLoading(true);
    setIsConsoleOpen(true);
    appendLog(`\n[ORCHESTRATOR] Membuat spesifikasi pengujian dari hasil crawl...\n`);

    try {
      const res = await fetch('/api/orchestrator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userIdRef.current }),
      });
      const data = await res.json();
      if (data.logs) appendLog(data.logs);

      if (data.success && data.manifest) {
        setManifest(data.manifest);
        setHasGenerated(true);
        appendLog(`\n[ORCHESTRATOR] ✓ ${data.totalScenarios} skenario pengujian berhasil dibuat dalam ${data.durationSeconds}s.\n`);
        setActiveTab('manifest');
      } else {
        appendLog(`\n[ERROR] Generate gagal: ${data.error || 'Periksa log di atas.'}\n`);
      }
    } catch (err: any) {
      appendLog(`\n[ERROR] Tidak dapat terhubung ke API: ${err.message}\n`);
    } finally {
      setIsLoading(false);
      refreshStatus();
    }
  };

  // Step 3: Run Tests (Real-Time Streaming with Execution Progress Modal)
  const handleRunTests = async (options: { grep?: string; headed?: boolean }) => {
    setRunOptions(options);
    setIsProgressModalOpen(true);
    setIsExecutingRun(true);
    setIsTestingCompleted(false);
    setModalLiveLogs('');
    setModalLiveStats(null);
    setModalDurationSeconds(0);
    setModalError('');
    setIsLoading(true);

    const filterLabel = options.grep ? `filter: "${options.grep}"` : 'semua skenario';
    const startMsg = `[ORCHESTRATOR] Memulai eksekusi Playwright (${filterLabel}) — Mode ${options.headed ? 'Headed (Browser Terbuka)' : 'Headless (Latar Belakang)'}...\n`;
    appendLog(`\n${startMsg}`);
    setModalLiveLogs(startMsg);

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      setModalDurationSeconds(+((Date.now() - startTime) / 1000).toFixed(1));
    }, 100);

    try {
      const res = await fetch('/api/orchestrator/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...options, userId: userIdRef.current }),
      });

      if (res.status === 423) {
        const lockData = await res.json().catch(() => ({}));
        const errMsg = lockData.error || 'Engine sedang sibuk digunakan oleh sesi pengujian lain.';
        setModalError(errMsg);
        appendLog(`\n[ERROR] ${errMsg}\n`);
        setIsExecutingRun(false);
        clearInterval(timerInterval);
        setIsLoading(false);
        return;
      }

      if (!res.body) {
        throw new Error('Tidak ada stream response dari engine');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(trimmed.slice(6));

            if (payload.type === 'log') {
              appendLog(payload.chunk);
              setModalLiveLogs((prev) => prev + payload.chunk);

              // Live extraction of passed/failed counts from stdout
              const passedMatches = [...payload.chunk.matchAll(/\b(\d+)\s+passed/g)];
              const failedMatches = [...payload.chunk.matchAll(/\b(\d+)\s+failed/g)];
              if (passedMatches.length > 0 || failedMatches.length > 0) {
                setModalLiveStats((prev) => {
                  const p = passedMatches.length > 0 ? parseInt(passedMatches[passedMatches.length - 1][1], 10) : prev?.passed ?? 0;
                  const f = failedMatches.length > 0 ? parseInt(failedMatches[failedMatches.length - 1][1], 10) : prev?.failed ?? 0;
                  return { passed: p, failed: f, skipped: prev?.skipped ?? 0, total: manifest?.length || 0 };
                });
              }
            } else if (payload.type === 'done') {
              clearInterval(timerInterval);
              setExecutionStats(payload.stats);
              setModalLiveStats(payload.stats);
              const dur = payload.durationSeconds || +((Date.now() - startTime) / 1000).toFixed(2);
              setExecutionDuration(dur);
              setModalDurationSeconds(dur);
              setHasRun(true);
              setIsExecutingRun(false);
              setIsTestingCompleted(true);
              setIsLoading(false);
              appendLog(`\n[ORCHESTRATOR] ✓ Pengujian selesai dalam ${dur}s: ${payload.stats.passed} lulus, ${payload.stats.failed} gagal, ${payload.stats.skipped} dilewati.\n`);
            } else if (payload.type === 'error') {
              clearInterval(timerInterval);
              setModalError(payload.error || 'Terjadi kesalahan eksekusi');
              appendLog(`\n[ERROR] ${payload.error}\n`);
              setIsExecutingRun(false);
              setIsLoading(false);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      clearInterval(timerInterval);
      const errMsg = err.message || 'Tidak dapat terhubung ke proses engine.';
      setModalError(errMsg);
      appendLog(`\n[ERROR] ${errMsg}\n`);
      setIsExecutingRun(false);
      setIsLoading(false);
    } finally {
      clearInterval(timerInterval);
      setIsLoading(false);
      refreshStatus();
    }
  };

  const handleViewResults = () => {
    setIsProgressModalOpen(false);
    setActiveTab('runner');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] text-[#F5F5F0] overflow-hidden font-sans selection:bg-[#EAB308] selection:text-black">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lockState={lockState}
        onOpenSus={() => setIsSusOpen(true)}
        isWorkflowCompleted={isWorkflowCompleted}
        isConsoleOpen={isConsoleOpen}
        setIsConsoleOpen={setIsConsoleOpen}
        hasCrawled={hasCrawled}
        hasGenerated={hasGenerated}
        hasRun={hasRun}
      />

      <div className="flex-1 flex overflow-hidden w-full">
        {/* Main Content */}
        <main className="flex-1 h-full overflow-y-auto p-6 lg:p-8 bg-[#09090b]">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Step 1: Config */}
            {activeTab === 'config' && (
              <div className="space-y-5">
                <div>
                  <h2 className="font-heading text-lg font-bold text-[#F5F5F0]">Konfigurasi Target & Crawl</h2>
                  <p className="text-xs text-[#71717A] mt-1">
                    Masukkan URL aplikasi web yang ingin diuji beserta akun login. Crawler Playwright akan menjelajahi halamannya secara otomatis.
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
              <div className="space-y-5">
                <div>
                  <h2 className="font-heading text-lg font-bold text-[#F5F5F0]">Peta Halaman & Formulir</h2>
                  <p className="text-xs text-[#71717A] mt-1">
                    Hasil crawl menampilkan halaman yang ditemukan, formulir CRUD, dan elemen interaktif beserta strategi locator-nya.
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
              <div className="space-y-5">
                <div>
                  <h2 className="font-heading text-lg font-bold text-[#F5F5F0]">Daftar Skenario Pengujian</h2>
                  <p className="text-xs text-[#71717A] mt-1">
                    Pilih skenario mana yang ingin dijalankan — bisa semua sekaligus, hanya yang positif, atau satu per satu.
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
              <div className="space-y-5">
                <div>
                  <h2 className="font-heading text-lg font-bold text-[#F5F5F0]">Hasil Eksekusi Pengujian</h2>
                  <p className="text-xs text-[#71717A] mt-1">
                    Ringkasan hasil Playwright Chromium — berapa skenario lulus, gagal, dan waktu total eksekusi.
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

            {/* Footer */}
            <div className="pt-6 pb-4 border-t border-[#18181b] flex items-center justify-between text-[10px] text-[#52525b] font-mono">
              <span>orchesTathya v0.1</span>
              <span>Playwright Chromium Engine</span>
            </div>
          </div>
        </main>

        {/* Right Panel: Terminal */}
        {isConsoleOpen && (
          <aside className="w-[400px] xl:w-[460px] 2xl:w-[520px] shrink-0 h-full border-l border-[#27272a] bg-[#0c0c0e] flex flex-col overflow-hidden">
            <VirtualConsole
              logs={logs}
              onClear={() => setLogs('')}
              onClose={() => setIsConsoleOpen(false)}
              isRunning={isLoading}
              title="tt-engine"
            />
          </aside>
        )}
      </div>

      <SusModal
        isOpen={isSusOpen}
        onClose={() => setIsSusOpen(false)}
        onSubmitted={refreshStatus}
      />

      {/* Execution Progress & Warp Modal (Anti-Close, Anti-Refresh, Live Stream) */}
      <ExecutionProgressModal
        isOpen={isProgressModalOpen}
        isRunning={isExecutingRun}
        headedMode={!!runOptions.headed}
        scenarioFilter={runOptions.grep}
        totalScenarios={manifest?.length || 0}
        liveLogs={modalLiveLogs}
        liveStats={modalLiveStats}
        durationSeconds={modalDurationSeconds}
        isCompleted={isTestingCompleted}
        errorMessage={modalError}
        onViewResults={handleViewResults}
        onClose={() => {
          if (!isExecutingRun) setIsProgressModalOpen(false);
        }}
      />
    </div>
  );
}
