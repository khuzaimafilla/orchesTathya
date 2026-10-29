import path from 'node:path';
import fs from 'node:fs';

/**
 * Resolves paths to the TathyaTest engine and outputs regardless of whether
 * Next.js is run from monorepo root, apps/web, or a junction.
 */
export function getEnginePaths() {
  const cwd = process.cwd();

  // Possible candidates for engine directory
  const candidates = [
    path.resolve(cwd, '../../engine'), // If cwd is apps/web
    path.resolve(cwd, '../engine'),    // If cwd is apps
    path.resolve(cwd, 'engine'),       // If cwd is root
    path.resolve(cwd, '../TathyaTest/engine'),
    path.resolve(cwd, '../orchesTathya/engine'),
    'D:\\laragon\\www\\orchesTathya\\engine',
    'D:\\laragon\\www\\TathyaTest\\engine',
  ];

  let engineDir = candidates.find((dir) => fs.existsSync(dir));

  if (!engineDir) {
    // Default fallback to expected monorepo structure
    engineDir = path.resolve(cwd, '../../engine');
  }

  const cliScript = path.join(engineDir, 'generator', 'dist', 'main.js');
  const configPath = path.join(engineDir, 'tathya.config.yaml');
  const crawlDir = path.join(engineDir, 'crawl');
  const testsDir = path.join(engineDir, 'tests');
  const generatedDir = path.join(testsDir, 'generated');
  const manifestPath = path.join(generatedDir, 'manifest.json');
  const resultsDir = path.join(testsDir, 'results');

  return {
    engineDir,
    cliScript,
    configPath,
    crawlDir,
    testsDir,
    generatedDir,
    manifestPath,
    resultsDir,
  };
}
