import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { getEnginePaths } from '@/lib/engine-paths';
import { getBenchmarkHistory } from '@/lib/benchmark-timer';

export async function GET() {
  const paths = getEnginePaths();

  let crawlData = null;
  let crawlRole = null;

  if (fs.existsSync(paths.crawlDir)) {
    const files = fs.readdirSync(paths.crawlDir).filter((f) => f.endsWith('.json'));
    if (files.length > 0) {
      crawlRole = files[0].replace('.json', '');
      try {
        const crawlContent = fs.readFileSync(path.join(paths.crawlDir, files[0]), 'utf-8');
        crawlData = JSON.parse(crawlContent);
      } catch (e) {
        console.error('Failed to parse crawl JSON', e);
      }
    }
  }

  let manifestData = null;
  if (fs.existsSync(paths.manifestPath)) {
    try {
      const manifestContent = fs.readFileSync(paths.manifestPath, 'utf-8');
      manifestData = JSON.parse(manifestContent);
    } catch (e) {
      console.error('Failed to parse manifest JSON', e);
    }
  }

  const benchmarks = getBenchmarkHistory();

  return NextResponse.json({
    crawlData,
    crawlRole,
    manifest: manifestData,
    benchmarks,
  });
}
