'use client';

import React, { useState } from 'react';
import { Network, FileText, ChevronRight, Layers, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';

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
      <div className="p-12 text-center rounded-2xl border border-dashed border-[#27272a] bg-[#121214] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto text-[#EAB308]">
          <Network className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="font-heading font-semibold text-sm text-[#F5F5F0]">Belum Ada Model Hasil Crawling</h3>
          <p className="font-sans text-xs text-[#A1A19D] mt-1 leading-relaxed">
            Jalankan Tahap 1 (Konfigurasi SUT & Crawl) terlebih dahulu agar crawler Playwright dapat mengeksplorasi
            dan memetakan struktur halaman, form, dan kontrol interaktif.
          </p>
        </div>
      </div>
    );
  }

  const pages = crawlData.pages;
  const activePage = pages[selectedPageIndex] || pages[0];

  const totalPages = pages.length;
  const totalForms = pages.reduce((acc: number, p: any) => acc + (p.forms?.length || 0), 0);
  const totalLinks = pages.reduce((acc: number, p: any) => acc + (p.links?.length || 0), 0);
  const totalButtons = pages.reduce((acc: number, p: any) => acc + (p.buttons?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F5F5F0]">{totalPages}</div>
            <div className="text-[11px] text-[#A1A19D] font-mono">Halaman Terpeta</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F5F5F0]">{totalForms}</div>
            <div className="text-[11px] text-[#A1A19D] font-mono">Form DOM (CRUD)</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30">
            <ExternalLink className="w-4 h-4" />
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F5F5F0]">{totalLinks}</div>
            <div className="text-[11px] text-[#A1A19D] font-mono">Tautan Rute</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#EAB308]/10 text-[#EAB308] border border-[#EAB308]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-heading text-lg font-bold text-[#F5F5F0]">{totalButtons}</div>
            <div className="text-[11px] text-[#A1A19D] font-mono">Tombol Aksi</div>
          </div>
        </div>
      </div>

      {/* Main Exploration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page List Sidebar */}
        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] space-y-3">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5">
            <h4 className="font-heading text-xs font-semibold text-[#F5F5F0] uppercase tracking-wider flex items-center space-x-1.5">
              <Network className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>Daftar Halaman ({pages.length})</span>
            </h4>
            <span className="text-[10px] text-[#A1A19D] font-mono">Role: {crawlData.role}</span>
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
                      ? 'bg-[#18181b] border-[#EAB308] text-[#F5F5F0] shadow-sm'
                      : 'bg-[#09090b] border-[#27272a] text-[#A1A19D] hover:text-[#F5F5F0] hover:border-[#3f3f46]'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className="font-heading font-semibold truncate text-[#F5F5F0]">{p.title || 'Halaman Tanpa Judul'}</div>
                    <div className="text-[10px] font-mono text-[#71717A] truncate mt-0.5">{p.url}</div>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    {p.forms?.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/40">
                        {p.forms.length} Form
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#EAB308]' : 'text-[#71717A]'}`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Page Details & Form Inspector */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#27272a] pb-3 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading text-sm font-semibold text-[#F5F5F0]">{activePage.title || 'Untitled Page'}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  HTTP 200
                </span>
              </div>
              <p className="text-xs font-mono text-[#A1A19D] mt-0.5 break-all">{activePage.url}</p>
            </div>

            {/* Quick Action to Generate Specs */}
            <button
              onClick={onProceedToGenerate}
              disabled={isGenerating || isLocked}
              className={`px-4 py-2 rounded-xl text-xs font-heading font-bold flex items-center space-x-2 transition-all ${
                isGenerating || isLocked
                  ? 'bg-[#18181b] text-[#71717A] border border-[#27272a] cursor-not-allowed'
                  : 'bg-[#EAB308] hover:bg-[#FACC15] text-black shadow-md shadow-[#EAB308]/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : 'Lanjut: Generate Test Specs'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Forms Section */}
          <div className="space-y-3 font-sans">
            <h5 className="font-heading text-xs font-semibold text-[#F5F5F0] uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>Formulir & Elemen Input ({activePage.forms?.length || 0})</span>
            </h5>

            {(!activePage.forms || activePage.forms.length === 0) ? (
              <p className="text-xs text-[#71717A] italic p-4 rounded-lg bg-[#09090b] border border-[#27272a]">
                Tidak ada form HTML pada halaman ini (halaman navigasi / read-only).
              </p>
            ) : (
              <div className="space-y-3">
                {activePage.forms.map((form: any, fIdx: number) => (
                  <div key={fIdx} className="p-4 rounded-lg bg-[#09090b] border border-[#27272a] space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          form.method === 'POST' ? 'bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/40' : 'bg-zinc-800 text-[#F5F5F0] border border-zinc-700'
                        }`}>
                          {form.method}
                        </span>
                        <span className="text-[#A1A19D]">Action: {form.action || activePage.url}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#18181b] text-[#A1A19D] border border-[#27272a]">
                        Op: {form.crudOp}
                      </span>
                    </div>

                    {/* Form Fields Table */}
                    <div className="border border-[#27272a] rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#121214] text-[#A1A19D] text-[10px] uppercase font-mono">
                          <tr>
                            <th className="px-3 py-2">Field Name</th>
                            <th className="px-3 py-2">Input Type</th>
                            <th className="px-3 py-2">Required</th>
                            <th className="px-3 py-2">Locator Strategy</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272a] font-mono text-[11px]">
                          {form.fields.map((f: any, fldIdx: number) => (
                            <tr key={fldIdx} className="hover:bg-[#18181b]/50">
                              <td className="px-3 py-2 font-medium text-[#F5F5F0]">{f.name}</td>
                              <td className="px-3 py-2 text-[#EAB308]">{f.type}</td>
                              <td className="px-3 py-2">
                                {f.required ? (
                                  <span className="text-rose-400 text-[10px]">YES</span>
                                ) : (
                                  <span className="text-[#71717A] text-[10px]">NO</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-[#A1A19D] text-[10px]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-sans">
            <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2">
              <div className="text-xs font-heading font-semibold text-[#F5F5F0] flex items-center justify-between">
                <span>Tautan Terkait</span>
                <span className="text-[10px] font-mono text-[#EAB308]">{activePage.links?.length || 0}</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono text-[#A1A19D]">
                {activePage.links?.map((l: any, lIdx: number) => (
                  <div key={lIdx} className="truncate hover:text-[#F5F5F0]">
                    • {l.text || l.href}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#09090b] border border-[#27272a] space-y-2">
              <div className="text-xs font-heading font-semibold text-[#F5F5F0] flex items-center justify-between">
                <span>Tombol Interaktif</span>
                <span className="text-[10px] font-mono text-[#EAB308]">{activePage.buttons?.length || 0}</span>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono text-[#A1A19D]">
                {activePage.buttons?.map((b: any, bIdx: number) => (
                  <div key={bIdx} className="truncate hover:text-[#F5F5F0]">
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
