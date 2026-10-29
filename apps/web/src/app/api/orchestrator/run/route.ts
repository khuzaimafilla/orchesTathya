import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import { lockManager } from '@/lib/lock-manager';
import { getEnginePaths } from '@/lib/engine-paths';
import { saveBenchmarkRecord } from '@/lib/benchmark-timer';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId = body.userId || `user_${Math.random().toString(36).substring(2, 7)}`;
  const grep = body.grep; // Optional filter string
  const headed = !!body.headed;
  const workers = body.workers || 1;

  // 1. Acquire mutex lock
  const lockResult = lockManager.acquire(userId, 'run');
  if (!lockResult.success) {
    return NextResponse.json({ success: false, error: lockResult.message, lock: lockResult.state }, { status: 423 });
  }

  const paths = getEnginePaths();
  const startTime = Date.now();
  const startedAtIso = new Date(startTime).toISOString();

  try {
    const args = ['-c', 'tathya.config.yaml', 'run'];
    if (grep) {
      args.push('--grep', grep);
    }
    if (headed) {
      args.push('--headed');
    }
    if (workers) {
      args.push('--workers', String(workers));
    }

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
    const fullLog = logs.join('');

    // Parse Playwright summary: e.g. "25 passed, 5 skipped, 1 failed (2.1m)"
    let passed = 0;
    let failed = 0;
    let skipped = 0;

    const passedMatch = fullLog.match(/(\d+)\s+passed/);
    if (passedMatch) passed = parseInt(passedMatch[1], 10);

    const failedMatch = fullLog.match(/(\d+)\s+failed/);
    if (failedMatch) failed = parseInt(failedMatch[1], 10);

    const skippedMatch = fullLog.match(/(\d+)\s+skipped/);
    if (skippedMatch) skipped = parseInt(skippedMatch[1], 10);

    const total = passed + failed + skipped;

    // 2. Save benchmark
    const bench = saveBenchmarkRecord({
      step: 'run',
      cliCommand: `node generator/dist/main.js ${args.join(' ')}`,
      startedAt: startedAtIso,
      endedAt: new Date(endTime).toISOString(),
      durationMs,
      durationSeconds,
      success: exitCode === 0,
      exitCode,
      targetUrl: 'tathya.config.yaml',
    });

    return NextResponse.json({
      success: exitCode === 0,
      exitCode,
      durationSeconds,
      benchmark: bench,
      logs: fullLog,
      stats: {
        total,
        passed,
        failed,
        skipped,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Run execution failed',
      },
      { status: 500 }
    );
  } finally {
    // 3. Release lock
    lockManager.release(userId);
  }
}
