'use client';

import React, { useState } from 'react';
import { Layers, CheckCircle2, Play, Search, Filter, ShieldAlert, Sparkles, Tag, ArrowRight } from 'lucide-react';

interface ManifestEntry {
  id: string;
  title: string;
  category: 'auth' | 'crud' | 'nav' | 'rbac';
  tier: 'positive' | 'negative' | 'edge';
  role: string;
  route: string | null;
  targetForm: string | null;
  targetField: string | null;
  constraintKind: string | null;
  assertionCount: number;
  locatorStrategy: string | null;
  faultClass: string | null;
  mutating: boolean;
}

interface ManifestExplorerProps {
  manifest: ManifestEntry[] | null;
  onRunTests: (options: { grep?: string; headed?: boolean }) => void;
  isRunning: boolean;
  isLocked: boolean;
}

export function ManifestExplorer({ manifest, onRunTests, isRunning, isLocked }: ManifestExplorerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [headedMode, setHeadedMode] = useState(false);

  if (!manifest || manifest.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <Layers className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-zinc-200">Belum Ada Skenario Uji (Manifest Kosong)</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Selesaikan Tahap 1 (Crawl) dan Tahap 2 (Generate Specs) agar generator Playwright menghasilkan
            skenario pengujian otomatis berdasarkan model form dan batas kendala input.
          </p>
        </div>
      </div>
    );
  }

  // Filtered manifest
  const filtered = manifest.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.targetField && item.targetField.toLowerCase().includes(search.toLowerCase())) ||
      (item.route && item.route.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesTier = selectedTier === 'all' || item.tier === selectedTier;

    return matchesSearch && matchesCategory && matchesTier;
  });

  const countPositive = manifest.filter((m) => m.tier === 'positive').length;
  const countNegative = manifest.filter((m) => m.tier === 'negative').length;
  const countEdge = manifest.filter((m) => m.tier === 'edge').length;

  return (
    <div className="space-y-6">
      {/* Top Controls & Run Trigger */}
      <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-zinc-100">Test Scenario Matrix</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                {manifest.length} Skenario Dihasilkan
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Filter dan jalankan skenario Playwright secara selektif atau keseluruhan.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={headedMode}
                onChange={(e) => setHeadedMode(e.target.checked)}
                className="rounded bg-zinc-950 border-zinc-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
              />
              <span>Headed Browser</span>
            </label>

            <button
              onClick={() => onRunTests({ grep: '@positive', headed: headedMode })}
              disabled={isRunning || isLocked}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 transition-all flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Jalankan @positive ({countPositive})</span>
            </button>

            <button
              onClick={() => onRunTests({ headed: headedMode })}
              disabled={isRunning || isLocked}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg transition-all ${
                isRunning || isLocked
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isRunning ? 'Running Tests...' : 'Jalankan Semua Skenario'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari skenario, field, atau route..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="all">Semua Category</option>
              <option value="auth">Auth (Login/Logout)</option>
              <option value="crud">CRUD (Forms)</option>
              <option value="rbac">RBAC (Roles)</option>
              <option value="nav">Navigasi</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400">Tier:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value="all">Semua Tier ({manifest.length})</option>
              <option value="positive">Positive ({countPositive})</option>
              <option value="negative">Negative ({countNegative})</option>
              <option value="edge">Edge Cases ({countEdge})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Manifest Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 text-[10px] uppercase font-mono border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">ID & Skenario</th>
                <th className="px-3 py-3">Tier</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Route / Target Field</th>
                <th className="px-3 py-3">Assertions</th>
                <th className="px-3 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-zinc-200 font-sans text-xs">{item.title}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{item.id}</div>
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.tier === 'positive'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : item.tier === 'negative'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          : 'bg-purple-950 text-purple-400 border border-purple-800/60'
                      }`}
                    >
                      {item.tier}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-indigo-400 uppercase text-[10px]">{item.category}</td>

                  <td className="px-3 py-3 text-zinc-400 text-[10px]">{item.role}</td>

                  <td className="px-3 py-3 text-zinc-400">
                    <div className="text-zinc-300">{item.route || '-'}</div>
                    {item.targetField && (
                      <div className="text-[10px] text-violet-400">Field: {item.targetField}</div>
                    )}
                  </td>

                  <td className="px-3 py-3 text-zinc-300">{item.assertionCount}</td>

                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => onRunTests({ grep: item.title, headed: headedMode })}
                      disabled={isRunning || isLocked}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] transition-colors"
                      title="Run single scenario"
                    >
                      Run
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
