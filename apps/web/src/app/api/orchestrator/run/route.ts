import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import { lockManager } from '@/lib/lock-manager';
import { getEnginePaths } from '@/lib/engine-paths';
import { saveBenchmarkRecord } from '@/lib/benchmark-timer';

/** Maximum time (ms) we wait for the Playwright run before force-killing it (15 mins default). */
const RUN_TIMEOUT_MS = Number(process.env.PLAYWRIGHT_TIMEOUT) || 15 * 60 * 1000;
/** Maximum log buffer (chars) to prevent memory issues. */
const MAX_LOG_CHARS = 200_000;

/** Parse Playwright summary from the LAST occurrence to avoid false positives. */
function parsePlaywrightSummary(log: string): { passed: number; failed: number; skipped: number } {
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  const passedMatches = [...log.matchAll(/\b(\d+)\s+passed/g)];
  if (passedMatches.length > 0) passed = parseInt(passedMatches[passedMatches.length - 1][1], 10);

  const failedMatches = [...log.matchAll(/\b(\d+)\s+failed/g)];
  if (failedMatches.length > 0) failed = parseInt(failedMatches[failedMatches.length - 1][1], 10);

  const skippedMatches = [...log.matchAll(/\b(\d+)\s+skipped/g)];
  if (skippedMatches.length > 0) skipped = parseInt(skippedMatches[skippedMatches.length - 1][1], 10);

  return { passed, failed, skipped };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId || `user_${Math.random().toString(36).substring(2, 7)}`);
  const grep = body.grep as string | undefined;
  const headed = !!body.headed;
  const workers = Number(body.workers) || 1;

  // 1. Acquire mutex lock
  const lockResult = lockManager.acquire(userId, 'run');
  if (!lockResult.success) {
    return NextResponse.json({ success: false, error: lockResult.message, lock: lockResult.state }, { status: 423 });
  }

  const paths = getEnginePaths();
  const startTime = Date.now();
  const startedAtIso = new Date(startTime).toISOString();

  const args = ['-c', 'tathya.config.yaml', 'run', '--workers', String(workers)];
  if (grep) args.push('--grep', grep);
  if (headed) args.push('--headed');

  // Setup streaming response
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  const sendEvent = async (event: Record<string, any>) => {
    try {
      await writer.write(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    } catch {
      // Writer might be closed if client disconnected
    }
  };

  let fullLog = '';
  let isClosed = false;
  let timedOut = false;

  const closeStream = async () => {
    if (!isClosed) {
      isClosed = true;
      try {
        await writer.close();
      } catch {}
    }
  };

  // Start background child process
  (async () => {
    let child: ReturnType<typeof spawn> | null = null;
    let killTimer: NodeJS.Timeout | null = null;

    try {
      child = spawn('node', [paths.cliScript, ...args], {
        cwd: paths.engineDir,
        shell: process.platform === 'win32',
        env: {
          ...process.env,
          NODE_OPTIONS: '--no-deprecation',
          FORCE_COLOR: '0',
        },
      });

      // Handle client abort / disconnect (e.g. user refreshed or closed browser)
      req.signal.addEventListener('abort', () => {
        if (child) {
          try { child.kill('SIGTERM'); } catch {}
        }
        lockManager.release(userId);
        closeStream();
      });

      killTimer = setTimeout(() => {
        timedOut = true;
        if (child) {
          try { child.kill('SIGTERM'); } catch {}
        }
      }, RUN_TIMEOUT_MS);

      child.stdout?.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        fullLog += text;
        if (fullLog.length > MAX_LOG_CHARS) {
          fullLog = '[... log truncated ...]\n' + fullLog.slice(-MAX_LOG_CHARS);
        }
        sendEvent({ type: 'log', chunk: text });
      });

      child.stderr?.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        fullLog += text;
        if (fullLog.length > MAX_LOG_CHARS) {
          fullLog = '[... log truncated ...]\n' + fullLog.slice(-MAX_LOG_CHARS);
        }
        sendEvent({ type: 'log', chunk: text });
      });

      child.on('error', (err) => {
        const errText = `\n[Process Error]: ${err.message}\n`;
        fullLog += errText;
        sendEvent({ type: 'log', chunk: errText });
      });

      child.on('close', async (code) => {
        if (killTimer) clearTimeout(killTimer);

        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const durationSeconds = +(durationMs / 1000).toFixed(2);
        const exitCode = code ?? 1;

        if (timedOut) {
          const timeoutText = `\n[ORCHESTRATOR] ⚠ Pengujian dihentikan paksa setelah ${RUN_TIMEOUT_MS / 60000} menit (timeout).\n`;
          fullLog += timeoutText;
          await sendEvent({ type: 'log', chunk: timeoutText });
        }

        const stats = parsePlaywrightSummary(fullLog);
        const total = stats.passed + stats.failed + stats.skipped;

        const bench = saveBenchmarkRecord({
          step: 'run',
          cliCommand: `node generator/dist/main.js ${args.join(' ')}`,
          startedAt: startedAtIso,
          endedAt: new Date(endTime).toISOString(),
          durationMs,
          durationSeconds,
          success: exitCode === 0 && !timedOut,
          exitCode,
          targetUrl: 'tathya.config.yaml',
        });

        // Release mutex lock immediately
        lockManager.release(userId);

        // Send completion event
        await sendEvent({
          type: 'done',
          success: exitCode === 0 && !timedOut,
          exitCode,
          timedOut,
          durationSeconds,
          benchmark: bench,
          stats: { total, ...stats },
          userId,
        });

        await closeStream();
      });
    } catch (err: any) {
      if (killTimer) clearTimeout(killTimer);
      lockManager.release(userId);
      await sendEvent({
        type: 'error',
        error: err.message || 'Run execution failed',
        userId,
      });
      await closeStream();
    }
  })();

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in Nginx if hosted
    },
  });
}
