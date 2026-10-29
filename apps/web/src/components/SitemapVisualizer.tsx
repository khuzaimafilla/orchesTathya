'use client';

import React, { useState } from 'react';
import { Network, FileText, ChevronRight, ChevronDown, CheckCircle2, Layers, Play, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

interface SitemapVisualizerProps {
  crawlData: any;
  onProceedToGenerate: () => void;
  isGenerating: boolean;
  isLocked: boolean;
}

export function SitemapVisualizer({
  crawlData,
  onProceedToGenerate,
  isGenerating,
  isLocked,
}: SitemapVisualizerProps) {
  const [selectedPageIndex, setSelectedPageIndex] = useState<number>(0);

  if (!crawlData || !crawlData.pages || crawlData.pages.length === 0) {
    return (
      <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <Network className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-sm font-semibold text-zinc-200">Belum Ada Model Hasil Crawling</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
            Jalankan Tahap 1 (Target Config & Crawl) terlebih dahulu agar crawler Playwright dapat mengeksplorasi
            dan memetakan struktur halaman, form, dan kontrol interaktif.
          </p>
        </div>
      </div>
    );
  }

  const pages = crawlData.pages;
  const activePage = pages[selectedPageIndex] || pages[0];

  // Calculate statistics
  const totalPages = pages.length;
  const totalForms = pages.reduce((acc: number, p: any) => acc + (p.forms?.length || 0), 0);
  const totalLinks = pages.reduce((acc: number, p: any) => acc + (p.links?.length || 0), 0);
  const totalButtons = pages.reduce((acc: number, p: any) => acc + (p.buttons?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-zinc-100">{totalPages}</div>
            <div className="text-[11px] text-zinc-400 font-mono">Discovered Pages</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-zinc-100">{totalForms}</div>
            <div className="text-[11px] text-zinc-400 font-mono">DOM Forms (CRUD)</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-zinc-100">{totalLinks}</div>
            <div className="text-[11px] text-zinc-400 font-mono">Discovered Links</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-zinc-100">{totalButtons}</div>
            <div className="text-[11px] text-zinc-400 font-mono">Interactive Buttons</div>
          </div>
        </div>
      </div>

      {/* Main Exploration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page List Sidebar */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Network className="w-3.5 h-3.5 text-indigo-400" />
              <span>Daftar Halaman ({pages.length})</span>
            </h4>
            <span className="text-[10px] text-zinc-500 font-mono">Role: {crawlData.role}</span>
          </div>

          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {pages.map((p: any, idx: number) => {
              const isSelected = idx === selectedPageIndex;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedPageIndex(idx)}
                  className={`w-full text-left p-3 rounded-lg text-xs transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-600/60 text-indigo-200 shadow-sm'
                      : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className="font-medium truncate text-zinc-200">{p.title || 'Untitled Page'}</div>
                    <div className="text-[10px] font-mono text-zinc-500 truncate">{p.url}</div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    {p.forms?.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                        {p.forms.length} Form
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-zinc-600'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Page Details & Form Inspector */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-zinc-100">{activePage.title || 'Untitled Page'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  HTTP 200
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5 break-all">{activePage.url}</p>
            </div>

            {/* Quick Action to Generate Specs */}
            <button
              onClick={onProceedToGenerate}
              disabled={isGenerating || isLocked}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg transition-all ${
                isGenerating || isLocked
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : 'Lanjut: Generate Test Specs'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Forms Section */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Formulir & Elemen Input ({activePage.forms?.length || 0})</span>
            </h5>

            {(!activePage.forms || activePage.forms.length === 0) ? (
              <p className="text-xs text-zinc-500 italic p-4 rounded-lg bg-zinc-950/40 border border-zinc-800/60">
                Tidak ada form HTML pada halaman ini (halaman navigasi / read-only).
              </p>
            ) : (
              <div className="space-y-3">
                {activePage.forms.map((form: any, fIdx: number) => (
                  <div key={fIdx} className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          form.method === 'POST' ? 'bg-amber-950 text-amber-400 border border-amber-800/60' : 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                        }`}>
                          {form.method}
                        </span>
                        <span className="text-zinc-300">Action: {form.action || activePage.url}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400">
                        Op: {form.crudOp}
                      </span>
                    </div>

                    {/* Form Fields Table */}
                    <div className="border border-zinc-800/80 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-900/90 text-zinc-400 text-[10px] uppercase font-mono">
                          <tr>
                            <th className="px-3 py-2">Field Name</th>
                            <th className="px-3 py-2">Input Type</th>
                            <th className="px-3 py-2">Required</th>
                            <th className="px-3 py-2">Locator Strategy</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                          {form.fields.map((f: any, fldIdx: number) => (
                            <tr key={fldIdx} className="hover:bg-zinc-900/30">
                              <td className="px-3 py-2 font-medium text-zinc-200">{f.name}</td>
                              <td className="px-3 py-2 text-indigo-400">{f.type}</td>
                              <td className="px-3 py-2">
                                {f.required ? (
                                  <span className="text-rose-400 text-[10px]">YES</span>
                                ) : (
                                  <span className="text-zinc-500 text-[10px]">NO</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-zinc-400 text-[10px]">
                                {f.locator?.strategy}: {f.locator?.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Links & Buttons Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-2">
              <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Discovered Links</span>
                <span className="text-[10px] font-mono text-indigo-400">{activePage.links?.length || 0}</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono text-zinc-400">
                {activePage.links?.map((l: any, lIdx: number) => (
                  <div key={lIdx} className="truncate hover:text-zinc-200">
                    • {l.text || l.href}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 space-y-2">
              <div className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Interactive Buttons</span>
                <span className="text-[10px] font-mono text-violet-400">{activePage.buttons?.length || 0}</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono text-zinc-400">
                {activePage.buttons?.map((b: any, bIdx: number) => (
                  <div key={bIdx} className="truncate hover:text-zinc-200">
                    • {b.text || b.locator?.value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
