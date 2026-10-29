import fs from 'node:fs';
import path from 'node:path';

export interface BenchmarkRecord {
  id: string;
  step: 'crawl' | 'generate' | 'run';
  cliCommand: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  durationSeconds: number;
  success: boolean;
  exitCode: number | null;
  targetUrl: string;
  environment: {
    platform: string;
    nodeVersion: string;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BENCHMARK_FILE = path.join(DATA_DIR, 'benchmarks.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function saveBenchmarkRecord(record: Omit<BenchmarkRecord, 'id' | 'environment'>): BenchmarkRecord {
  ensureDataDir();

  const fullRecord: BenchmarkRecord = {
    id: `bench_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...record,
    environment: {
      platform: process.platform,
      nodeVersion: process.version,
    },
  };

  let records: BenchmarkRecord[] = [];
  if (fs.existsSync(BENCHMARK_FILE)) {
    try {
      const content = fs.readFileSync(BENCHMARK_FILE, 'utf-8');
      records = JSON.parse(content);
    } catch {
      records = [];
    }
  }

  records.unshift(fullRecord);
  // Keep last 100 benchmark entries
  if (records.length > 100) records = records.slice(0, 100);

  fs.writeFileSync(BENCHMARK_FILE, JSON.stringify(records, null, 2), 'utf-8');
  return fullRecord;
}

export function getBenchmarkHistory(): BenchmarkRecord[] {
  ensureDataDir();
  if (!fs.existsSync(BENCHMARK_FILE)) return [];
  try {
    const content = fs.readFileSync(BENCHMARK_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}
