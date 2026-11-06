import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { lockManager } from '@/lib/lock-manager';
import { getEnginePaths } from '@/lib/engine-paths';
import { saveBenchmarkRecord } from '@/lib/benchmark-timer';

const GENERATE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes max for generate

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId: string = body.userId || `user_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Acquire mutex lock
  const lockResult = lockManager.acquire(userId, 'generate');
  if (!lockResult.success) {
    return NextResponse.json({ success: false, error: lockResult.message, lock: lockResult.state }, { status: 423 });
  }

  const paths = getEnginePaths();

  // 2. Pre-flight check: crawl must exist before generate
  const hasCrawl = fs.existsSync(paths.crawlDir) &&
    fs.readdirSync(paths.crawlDir).filter((f) => f.endsWith('.json')).length > 0;

  if (!hasCrawl) {
    lockManager.release(userId);
    return NextResponse.json(
      { success: false, error: 'Crawl belum dijalankan. Jalankan Crawl Engine terlebih dahulu (Tahap 1) sebelum menghasilkan skenario pengujian.' },
      { status: 400 }
    );
  }

  const startTime = Date.now();
  const startedAtIso = new Date(startTime).toISOString();
  const args = ['-c', 'tathya.config.yaml', 'generate'];
  let fullLog = '';
  let timedOut = false;

  try {
    const exitCode = await new Promise<number>((resolve) => {
      const child = spawn('node', [paths.cliScript, ...args], {
        cwd: paths.engineDir,
        shell: process.platform === 'win32',
        env: {
          ...process.env,
          NODE_OPTIONS: '--no-deprecation',
          FORCE_COLOR: '0',
        },
      });

      const killTimer = setTimeout(() => {
        timedOut = true;
        try { child.kill('SIGTERM'); } catch {}
        resolve(1);
      }, GENERATE_TIMEOUT_MS);

      child.stdout.on('data', (chunk: Buffer) => { fullLog += chunk.toString(); });
      child.stderr.on('data', (chunk: Buffer) => { fullLog += chunk.toString(); });
      child.on('error', (err) => {
        fullLog += `\n[Process Error]: ${err.message}`;
        clearTimeout(killTimer);
        resolve(1);
      });
      child.on('close', (code) => {
        clearTimeout(killTimer);
        resolve(code ?? 1);
      });
    });

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationSeconds = +(durationMs / 1000).toFixed(2);
    const success = exitCode === 0 && !timedOut;

    if (timedOut) {
      fullLog += `\n\n[ORCHESTRATOR] ⚠ Generate dihentikan paksa setelah ${GENERATE_TIMEOUT_MS / 60000} menit (timeout).`;
    }

    // 3. Save benchmark
    const bench = saveBenchmarkRecord({
      step: 'generate',
      cliCommand: `node generator/dist/main.js ${args.join(' ')}`,
      startedAt: startedAtIso,
      endedAt: new Date(endTime).toISOString(),
      durationMs,
      durationSeconds,
      success,
      exitCode,
      targetUrl: 'tathya.config.yaml',
    });

    // 4. Read manifest.json
    let manifestData = null;
    if (fs.existsSync(paths.manifestPath)) {
      try {
        manifestData = JSON.parse(fs.readFileSync(paths.manifestPath, 'utf-8'));
      } catch (e) {
        console.error('Failed to parse manifest JSON', e);
      }
    }

    return NextResponse.json({
      success,
      exitCode,
      timedOut,
      durationSeconds,
      benchmark: bench,
      logs: fullLog,
      manifest: manifestData,
      totalScenarios: Array.isArray(manifestData) ? manifestData.length : 0,
      userId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Generate execution failed', userId },
      { status: 500 }
    );
  } finally {
    lockManager.release(userId);
  }
}
