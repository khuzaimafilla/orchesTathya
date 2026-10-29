import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { lockManager } from '@/lib/lock-manager';
import { getEnginePaths } from '@/lib/engine-paths';
import { buildTathyaConfigYaml, TargetConfigInput } from '@/lib/config-builder';
import { saveBenchmarkRecord } from '@/lib/benchmark-timer';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userId = body.userId || `user_${Math.random().toString(36).substring(2, 7)}`;
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

      child.stdout.on('data', (chunk) => {
        const text = chunk.toString();
        logs.push(text);
      });

      child.stderr.on('data', (chunk) => {
        const text = chunk.toString();
        logs.push(text);
      });

      child.on('error', (err) => {
        logs.push(`\n[Process Error]: ${err.message}`);
        reject(err);
      });

      child.on('close', (code) => {
        resolve(code ?? 0);
      });
    });

    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationSeconds = +(durationMs / 1000).toFixed(2);
    const success = exitCode === 0;

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

    // 5. Read output crawl file if successful
    let crawlData = null;
    const role = configInput.role?.name || 'standard_user';
    const crawlFile = path.join(paths.crawlDir, `${role}.json`);

    if (fs.existsSync(crawlFile)) {
      try {
        crawlData = JSON.parse(fs.readFileSync(crawlFile, 'utf-8'));
      } catch (e) {
        console.error('Failed to parse crawl JSON', e);
      }
    }

    return NextResponse.json({
      success,
      exitCode,
      durationSeconds,
      benchmark: bench,
      logs: logs.join(''),
      crawlData,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Crawl execution failed',
      },
      { status: 500 }
    );
  } finally {
    // 6. Release mutex lock
    lockManager.release(userId);
  }
}
