import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { lockManager } from '@/lib/lock-manager';
import { getEnginePaths } from '@/lib/engine-paths';
import { getBenchmarkHistory } from '@/lib/benchmark-timer';

export async function GET() {
  const paths = getEnginePaths();
  const lock = lockManager.getState();
  const benchmarks = getBenchmarkHistory();

  // Check artifacts existence
  const hasConfig = fs.existsSync(paths.configPath);
  let hasCrawl = false;
  let crawlRole = '';

  if (fs.existsSync(paths.crawlDir)) {
    const files = fs.readdirSync(paths.crawlDir).filter((f) => f.endsWith('.json'));
    if (files.length > 0) {
      hasCrawl = true;
      crawlRole = files[0].replace('.json', '');
    }
  }

  const hasManifest = fs.existsSync(paths.manifestPath);

  // Check playwright report
  const htmlReportPath = path.join(paths.engineDir, 'playwright-report', 'index.html');
  const hasHtmlReport = fs.existsSync(htmlReportPath);

  return NextResponse.json({
    lock,
    paths: {
      engineDir: paths.engineDir,
      cliReady: fs.existsSync(paths.cliScript),
    },
    artifacts: {
      hasConfig,
      hasCrawl,
      crawlRole,
      hasManifest,
      hasHtmlReport,
    },
    latestBenchmark: benchmarks[0] || null,
  });
}
