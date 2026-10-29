import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { lockManager } from '@/lib/lock-manager';
import { getEnginePaths } from '@/lib/engine-paths';
import { saveBenchmarkRecord } from '@/lib/benchmark-timer';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId = body.userId || `user_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Acquire mutex lock
  const lockResult = lockManager.acquire(userId, 'generate');
  if (!lockResult.success) {
    return NextResponse.json({ success: false, error: lockResult.message, lock: lockResult.state }, { status: 423 });
  }

  const paths = getEnginePaths();
  const startTime = Date.now();
  const startedAtIso = new Date(startTime).toISOString();

  try {
    const args = ['-c', 'tathya.config.yaml', 'generate'];
    const logs: string[] = [];

    const exitCode = await new Promise<number>((resolve, reject) => {
      const child = spawn('node', [paths.cliScript, ...args], {
        cwd: paths.engineDir,
        shell: process.platform === 'win32',
        env: {
          ...process.env,
          NODE_OPTIONS: '--no-deprecation',
        },
      });

      child.stdout.on('data', (chunk) => logs.push(chunk.toString()));
      child.stderr.on('data', (chunk) => logs.push(chunk.toString()));
      child.on('error', (err) => {
        logs.push(`\n[Process Error]: ${err.message}`);
        reject(err);
      });
      child.on('close', (code) => resolve(code ?? 0));
    });

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationSeconds = +(durationMs / 1000).toFixed(2);
    const success = exitCode === 0;

    // 2. Save benchmark
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

    // 3. Read manifest.json
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
      durationSeconds,
      benchmark: bench,
      logs: logs.join(''),
      manifest: manifestData,
      totalScenarios: Array.isArray(manifestData) ? manifestData.length : 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Generate execution failed',
      },
      { status: 500 }
    );
  } finally {
    // 4. Release lock
    lockManager.release(userId);
  }
}
