'use client';

import React, { useState } from 'react';
import { Layers, Play, Search, ChevronDown, RefreshCw } from 'lucide-react';

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

const TIER_STYLES: Record<string, string> = {
  positive: 'text-[#EAB308]',
  negative: 'text-amber-400',
  edge: 'text-[#71717A]',
};

const CATEGORY_LABEL: Record<string, string> = {
  auth: 'Auth',
  crud: 'CRUD',
  nav: 'Nav',
  rbac: 'RBAC',
};

export function ManifestExplorer({ manifest, onRunTests, isRunning, isLocked }: ManifestExplorerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [headedMode, setHeadedMode] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (!manifest || manifest.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-[#27272a] bg-[#121214] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto text-[#EAB308]">
          <Layers className="w-6 h-6" />
        </div>
        <div className="max-w-sm mx-auto">
          <h3 className="font-heading font-semibold text-sm text-[#F5F5F0]">Belum ada skenario</h3>
          <p className="font-sans text-xs text-[#71717A] mt-1 leading-relaxed">
            Selesaikan Tahap 1 (Crawl) lalu klik <strong className="text-[#A1A19D]">Generate Test Specs</strong> di tab Sitemap untuk membuat skenario pengujian otomatis.
          </p>
        </div>
      </div>
    );
  }

  const filtered = manifest.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.targetField && item.targetField.toLowerCase().includes(q)) ||
      (item.route && item.route.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesTier = selectedTier === 'all' || item.tier === selectedTier;

    return matchesSearch && matchesCategory && matchesTier;
  });

  const counts = {
    all: manifest.length,
    positive: manifest.filter((m) => m.tier === 'positive').length,
    negative: manifest.filter((m) => m.tier === 'negative').length,
    edge: manifest.filter((m) => m.tier === 'edge').length,
  };

  const isDisabled = isRunning || isLocked;

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-sm font-semibold text-[#F5F5F0]">Skenario Pengujian</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30">
                {manifest.length} skenario
              </span>
            </div>
            <p className="text-[11px] text-[#71717A] mt-0.5">
              {counts.positive} positif · {counts.negative} negatif · {counts.edge} edge case
            </p>
          </div>

          {/* Run Actions */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-[11px] text-[#71717A] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={headedMode}
                onChange={(e) => setHeadedMode(e.target.checked)}
                className="w-3.5 h-3.5 rounded"
              />
              <span>Browser terlihat</span>
            </label>

            <button
              onClick={() => onRunTests({ grep: '@positive', headed: headedMode })}
              disabled={isDisabled}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-heading font-semibold flex items-center gap-1.5 transition-all ${
                isDisabled
                  ? 'bg-[#18181b] text-[#52525b] cursor-not-allowed border border-[#27272a]'
                  : 'bg-[#18181b] hover:bg-[#27272a] text-[#EAB308] border border-[#EAB308]/30'
              }`}
            >
              <Play className="w-3 h-3" />
              <span>Positif ({counts.positive})</span>
            </button>

            <button
              onClick={() => onRunTests({ headed: headedMode })}
              disabled={isDisabled}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-heading font-bold flex items-center gap-1.5 transition-all ${
                isDisabled
                  ? 'bg-[#18181b] text-[#52525b] cursor-not-allowed border border-[#27272a]'
                  : 'bg-[#EAB308] hover:bg-[#FACC15] text-black shadow-sm shadow-[#EAB308]/20'
              }`}
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>Berjalan...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-black" />
                  <span>Jalankan Semua</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-[#27272a]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#52525b] absolute left-2.5 top-2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari skenario, field, route..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#09090b] border border-[#27272a] text-[11px] text-[#F5F5F0] placeholder-[#52525b] focus:outline-none focus:border-[#EAB308]/50 font-mono"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#09090b] border border-[#27272a] text-[11px] text-[#F5F5F0] focus:outline-none focus:border-[#EAB308]/50 font-mono"
          >
            <option value="all">Semua Kategori</option>
            <option value="auth">Auth (Login/Logout)</option>
            <option value="crud">CRUD (Formulir)</option>
            <option value="rbac">RBAC (Hak Akses)</option>
            <option value="nav">Navigasi</option>
          </select>

          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-[#09090b] border border-[#27272a] text-[11px] text-[#F5F5F0] focus:outline-none focus:border-[#EAB308]/50 font-mono"
          >
            <option value="all">Semua Tier ({counts.all})</option>
            <option value="positive">Positif ({counts.positive})</option>
            <option value="negative">Negatif ({counts.negative})</option>
            <option value="edge">Edge Case ({counts.edge})</option>
          </select>
        </div>
      </div>

      {/* Results info */}
      {search || selectedCategory !== 'all' || selectedTier !== 'all' ? (
        <p className="text-[11px] text-[#52525b] font-mono px-1">
          Menampilkan {filtered.length} dari {manifest.length} skenario
        </p>
      ) : null}

      {/* Scenario Table */}
      <div className="rounded-xl border border-[#27272a] bg-[#121214] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-[#52525b] text-xs">
            Tidak ada skenario yang cocok dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-[#09090b] text-[#52525b] text-[10px] font-mono border-b border-[#27272a]">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Skenario</th>
                  <th className="px-3 py-2.5 font-medium">Tier</th>
                  <th className="px-3 py-2.5 font-medium">Kategori</th>
                  <th className="px-3 py-2.5 font-medium hidden md:table-cell">Route</th>
                  <th className="px-3 py-2.5 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e21] font-mono">
                {filtered.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr
                      className="hover:bg-[#18181b]/40 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
                    >
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-sans text-[11px] text-[#D4D4CE] leading-snug line-clamp-2">{item.title}</div>
                        <div className="text-[9px] text-[#52525b] mt-0.5 font-mono">{item.id}</div>
                      </td>

                      <td className="px-3 py-3">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${TIER_STYLES[item.tier] || 'text-[#71717A]'}`}>
                          {item.tier}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <span className="text-[#A1A19D] text-[10px] font-medium uppercase tracking-wider">
                          {CATEGORY_LABEL[item.category] || item.category}
                        </span>
                      </td>

                      <td className="px-3 py-3 hidden md:table-cell text-[#71717A] text-[10px] font-mono truncate max-w-[140px]">
                        {item.route || '—'}
                      </td>

                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); onRunTests({ grep: item.title, headed: headedMode }); }}
                            disabled={isDisabled}
                            className={`px-2 py-1 rounded text-[10px] font-heading font-semibold transition-colors ${
                              isDisabled
                                ? 'bg-[#18181b] text-[#52525b] cursor-not-allowed'
                                : 'bg-[#18181b] hover:bg-[#27272a] text-[#EAB308] border border-[#27272a]'
                            }`}
                          >
                            Run
                          </button>
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-[#52525b] transition-transform ${expandedRow === item.id ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expandedRow === item.id && (
                      <tr className="bg-[#111113]">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-mono text-[#71717A]">
                            {item.targetField && (
                              <div>
                                <div className="text-[#52525b] mb-0.5">Target Field</div>
                                <div className="text-[#A1A19D]">{item.targetField}</div>
                              </div>
                            )}
                            {item.constraintKind && (
                              <div>
                                <div className="text-[#52525b] mb-0.5">Constraint</div>
                                <div className="text-[#A1A19D]">{item.constraintKind}</div>
                              </div>
                            )}
                            {item.locatorStrategy && (
                              <div>
                                <div className="text-[#52525b] mb-0.5">Locator</div>
                                <div className="text-[#A1A19D]">{item.locatorStrategy}</div>
                              </div>
                            )}
                            <div>
                              <div className="text-[#52525b] mb-0.5">Assertions</div>
                              <div className="text-[#A1A19D]">{item.assertionCount}</div>
                            </div>
                            <div>
                              <div className="text-[#52525b] mb-0.5">Role</div>
                              <div className="text-[#A1A19D]">{item.role}</div>
                            </div>
                            {item.mutating !== undefined && (
                              <div>
                                <div className="text-[#52525b] mb-0.5">Mutating</div>
                                <div className={item.mutating ? 'text-amber-400' : 'text-[#A1A19D]'}>
                                  {item.mutating ? 'Ya (write)' : 'Tidak (read)'}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
