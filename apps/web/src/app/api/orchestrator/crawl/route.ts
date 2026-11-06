import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { lockManager } from '@/lib/lock-manager';
import { getEnginePaths } from '@/lib/engine-paths';
import { buildTathyaConfigYaml, TargetConfigInput } from '@/lib/config-builder';
import { saveBenchmarkRecord } from '@/lib/benchmark-timer';

const CRAWL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes max for a crawl

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId: string = body.userId || `user_${Math.random().toString(36).substring(2, 7)}`;
  const configInput: TargetConfigInput = body.config;

  // 1. Acquire mutex lock
  const lockResult = lockManager.acquire(userId, 'crawl');
  if (!lockResult.success) {
    return NextResponse.json({ success: false, error: lockResult.message, lock: lockResult.state }, { status: 423 });
  }

  const paths = getEnginePaths();
  const startTime = Date.now();
  const startedAtIso = new Date(startTime).toISOString();

  try {
    // 2. Write tathya.config.yaml
    const yamlContent = buildTathyaConfigYaml(configInput);
    fs.writeFileSync(paths.configPath, yamlContent, 'utf-8');

    // 3. Prepare CLI execution
    const args = ['-c', 'tathya.config.yaml', 'crawl'];
    let fullLog = '';
    let timedOut = false;

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
      }, CRAWL_TIMEOUT_MS);

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
      fullLog += `\n\n[ORCHESTRATOR] ⚠ Crawl dihentikan paksa setelah ${CRAWL_TIMEOUT_MS / 60000} menit (timeout).`;
    }

    // 4. Save benchmark record
    const bench = saveBenchmarkRecord({
      step: 'crawl',
      cliCommand: `node generator/dist/main.js ${args.join(' ')}`,
      startedAt: startedAtIso,
      endedAt: new Date(endTime).toISOString(),
      durationMs,
      durationSeconds,
      success,
      exitCode,
      targetUrl: configInput.baseUrl,
    });

    // 5. Read crawl output — try configured role name first, then fallback to any .json file
    let crawlData = null;
    const preferredRole = configInput.role?.name || 'standard_user';
    const preferredFile = path.join(paths.crawlDir, `${preferredRole}.json`);

    if (fs.existsSync(preferredFile)) {
      try { crawlData = JSON.parse(fs.readFileSync(preferredFile, 'utf-8')); } catch {}
    } else if (fs.existsSync(paths.crawlDir)) {
      // Fallback: pick the first JSON file found in crawlDir
      const files = fs.readdirSync(paths.crawlDir).filter((f) => f.endsWith('.json'));
      if (files.length > 0) {
        try { crawlData = JSON.parse(fs.readFileSync(path.join(paths.crawlDir, files[0]), 'utf-8')); } catch {}
      }
    }

    return NextResponse.json({
      success,
      exitCode,
      timedOut,
      durationSeconds,
      benchmark: bench,
      logs: fullLog,
      crawlData,
      userId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Crawl execution failed', userId },
      { status: 500 }
    );
  } finally {
    lockManager.release(userId);
  }
}
