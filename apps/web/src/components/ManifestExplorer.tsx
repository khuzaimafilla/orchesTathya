'use client';

import React, { useState } from 'react';
import { Layers, Play, Search, Filter } from 'lucide-react';

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
      <div className="p-12 text-center rounded-2xl border border-dashed border-[#27272a] bg-[#121214] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto text-[#EAB308]">
          <Layers className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="font-heading font-semibold text-sm text-[#F5F5F0]">Belum Ada Skenario Uji (Manifest Kosong)</h3>
          <p className="font-sans text-xs text-[#A1A19D] mt-1 leading-relaxed">
            Selesaikan Tahap 1 (Crawl) dan Tahap 2 (Generate Specs) agar generator Playwright menghasilkan
            skenario pengujian otomatis berdasarkan model form dan batas kendala input.
          </p>
        </div>
      </div>
    );
  }

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
      <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-heading text-sm font-semibold text-[#F5F5F0]">Matriks Skenario Pengujian (Manifest)</h3>
              <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/40">
                {manifest.length} Skenario Playwright
              </span>
            </div>
            <p className="font-sans text-xs text-[#A1A19D] mt-1">
              Filter dan jalankan skenario Playwright secara selektif atau keseluruhan.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs font-sans text-[#A1A19D] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={headedMode}
                onChange={(e) => setHeadedMode(e.target.checked)}
                className="rounded bg-[#09090b] border-[#27272a] text-[#EAB308] focus:ring-0 w-3.5 h-3.5"
              />
              <span>Headed Browser</span>
            </label>

            <button
              onClick={() => onRunTests({ grep: '@positive', headed: headedMode })}
              disabled={isRunning || isLocked}
              className="px-3 py-2 rounded-xl text-xs font-heading font-semibold bg-[#18181b] hover:bg-[#27272a] text-[#EAB308] border border-[#EAB308]/40 transition-all flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Jalankan @positive ({countPositive})</span>
            </button>

            <button
              onClick={() => onRunTests({ headed: headedMode })}
              disabled={isRunning || isLocked}
              className={`px-5 py-2 rounded-xl text-xs font-heading font-bold flex items-center space-x-2 transition-all ${
                isRunning || isLocked
                  ? 'bg-[#18181b] text-[#71717A] border border-[#27272a] cursor-not-allowed'
                  : 'bg-[#EAB308] hover:bg-[#FACC15] text-black shadow-md shadow-[#EAB308]/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>{isRunning ? 'Running Tests...' : 'Jalankan Semua Skenario'}</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#27272a] font-sans">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari skenario, field, atau route..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] placeholder-[#71717A] focus:outline-none focus:border-[#EAB308] font-mono"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#A1A19D]">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#EAB308] font-mono"
            >
              <option value="all">Semua Kategori</option>
              <option value="auth">Auth (Login/Logout)</option>
              <option value="crud">CRUD (Forms)</option>
              <option value="rbac">RBAC (Roles)</option>
              <option value="nav">Navigasi</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#A1A19D]">Tier:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] focus:outline-none focus:border-[#EAB308] font-mono"
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
      <div className="rounded-xl border border-[#27272a] bg-[#121214] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09090b] text-[#A1A19D] text-[10px] uppercase font-mono border-b border-[#27272a]">
              <tr>
                <th className="px-4 py-3">ID & Skenario</th>
                <th className="px-3 py-3">Tier</th>
                <th className="px-3 py-3">Kategori</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Route / Target Field</th>
                <th className="px-3 py-3">Assertions</th>
                <th className="px-3 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a] font-mono text-[11px]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#18181b]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-heading font-semibold text-[#F5F5F0] text-xs">{item.title}</div>
                    <div className="text-[10px] text-[#71717A] mt-0.5">{item.id}</div>
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.tier === 'positive'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : item.tier === 'negative'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}
                    >
                      {item.tier}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-[#EAB308] uppercase text-[10px]">{item.category}</td>

                  <td className="px-3 py-3 text-[#A1A19D] text-[10px]">{item.role}</td>

                  <td className="px-3 py-3 text-[#A1A19D]">
                    <div className="text-[#F5F5F0]">{item.route || '-'}</div>
                    {item.targetField && (
                      <div className="text-[10px] text-[#EAB308]">Field: {item.targetField}</div>
                    )}
                  </td>

                  <td className="px-3 py-3 text-[#F5F5F0]">{item.assertionCount}</td>

                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => onRunTests({ grep: item.title, headed: headedMode })}
                      disabled={isRunning || isLocked}
                      className="px-2.5 py-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#EAB308] border border-[#27272a] text-[10px] transition-colors"
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
