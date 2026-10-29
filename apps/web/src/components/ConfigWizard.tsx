'use client';

import React, { useState } from 'react';
import { TargetConfigInput, SAUCEDEMO_PRESET } from '@/lib/config-builder';
import { Globe, Compass, Play, RefreshCw, BookmarkCheck } from 'lucide-react';

interface ConfigWizardProps {
  onStartCrawl: (config: TargetConfigInput) => void;
  isLoading: boolean;
  isLocked: boolean;
}

export function ConfigWizard({ onStartCrawl, isLoading, isLocked }: ConfigWizardProps) {
  const [config, setConfig] = useState<TargetConfigInput>(SAUCEDEMO_PRESET);
  const [presetType, setPresetType] = useState<'saucedemo' | 'custom'>('saucedemo');

  const handleApplyPreset = (type: 'saucedemo' | 'custom') => {
    setPresetType(type);
    if (type === 'saucedemo') {
      setConfig(SAUCEDEMO_PRESET);
    } else {
      setConfig({
        baseUrl: 'http://localhost:8000',
        loginPath: '/login',
        role: {
          name: 'admin',
          username: 'admin@example.com',
          password: 'password',
        },
        crawl: {
          maxDepth: 3,
          maxPages: 30,
          include: ['/dashboard', '/users', '/products'],
          exclude: ['/logout'],
        },
        oracleErrorSelector: '.invalid-feedback, [role="alert"]',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartCrawl(config);
  };

  return (
    <div className="space-y-6">
      {/* Preset Banner */}
      <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#EAB308]/30 flex items-center justify-center text-[#EAB308]">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm text-[#F5F5F0]">Pilih Preset Target Uji (SUT)</h3>
            <p className="font-sans text-xs text-[#A1A19D]">
              Gunakan preset SauceDemo (React SPA e-commerce publik) untuk demonstrasi instan atau masukkan URL target custom.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('saucedemo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
              presetType === 'saucedemo'
                ? 'bg-[#EAB308] text-black shadow-sm'
                : 'bg-[#18181b] text-[#A1A19D] hover:text-[#F5F5F0] border border-[#27272a]'
            }`}
          >
            SauceDemo SPA (Preset)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
              presetType === 'custom'
                ? 'bg-[#EAB308] text-black shadow-sm'
                : 'bg-[#18181b] text-[#A1A19D] hover:text-[#F5F5F0] border border-[#27272a]'
            }`}
          >
            Custom Target
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Target App & Authentication */}
          <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#27272a] pb-3">
              <Globe className="w-4 h-4 text-[#EAB308]" />
              <h4 className="font-heading text-xs font-semibold text-[#F5F5F0] uppercase tracking-wider">
                1. Target URL & Kredensial Login
              </h4>
            </div>

            <div className="space-y-3 font-sans">
              <div>
                <label className="block text-xs font-medium text-[#A1A19D] mb-1">Base URL (SUT)</label>
                <input
                  type="url"
                  required
                  value={config.baseUrl}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] placeholder-[#71717A] focus:outline-none focus:border-[#EAB308] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A19D] mb-1">Login Path</label>
                <input
                  type="text"
                  required
                  value={config.loginPath}
                  onChange={(e) => setConfig({ ...config, loginPath: e.target.value })}
                  placeholder="/"
                  className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] placeholder-[#71717A] focus:outline-none focus:border-[#EAB308] font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#A1A19D] mb-1">Nama Role</label>
                  <input
                    type="text"
                    required
                    value={config.role.name}
                    onChange={(e) =>
                      setConfig({ ...config, role: { ...config.role, name: e.target.value } })
                    }
                    placeholder="standard_user"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A1A19D] mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={config.role.username}
                    onChange={(e) =>
                      setConfig({ ...config, role: { ...config.role, username: e.target.value } })
                    }
                    placeholder="username"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A1A19D] mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={config.role.password}
                    onChange={(e) =>
                      setConfig({ ...config, role: { ...config.role, password: e.target.value } })
                    }
                    placeholder="password"
                    className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Crawler & Extraction Constraints */}
          <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#27272a] pb-3">
              <Compass className="w-4 h-4 text-[#EAB308]" />
              <h4 className="font-heading text-xs font-semibold text-[#F5F5F0] uppercase tracking-wider">
                2. Batasan Crawler & Oracle Error
              </h4>
            </div>

            <div className="space-y-3 font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A1A19D] mb-1">Kedalaman Max (Depth)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.crawl.maxDepth}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        crawl: { ...config.crawl, maxDepth: parseInt(e.target.value) || 1 },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#A1A19D] mb-1">Halaman Max (Pages)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={config.crawl.maxPages}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        crawl: { ...config.crawl, maxPages: parseInt(e.target.value) || 10 },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A19D] mb-1">
                  Rute yang Disertakan (Pisahkan koma)
                </label>
                <input
                  type="text"
                  value={config.crawl.include.join(', ')}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      crawl: {
                        ...config.crawl,
                        include: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  placeholder="/inventory.html, /cart.html"
                  className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A19D] mb-1">
                  Oracle Error Selector (CSS)
                </label>
                <input
                  type="text"
                  value={config.oracleErrorSelector || ''}
                  onChange={(e) => setConfig({ ...config, oracleErrorSelector: e.target.value })}
                  placeholder='[data-test="error"]'
                  className="w-full px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-[#F5F5F0] font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || isLocked}
            className={`px-6 py-2.5 rounded-xl text-xs font-heading font-bold flex items-center space-x-2 transition-all ${
              isLoading || isLocked
                ? 'bg-[#18181b] text-[#71717A] border border-[#27272a] cursor-not-allowed'
                : 'bg-[#EAB308] hover:bg-[#FACC15] text-black shadow-md shadow-[#EAB308]/20 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-black" />
                <span>Sedang Melakukan Crawling & Ekstraksi...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>Simpan Konfigurasi & Mulai Crawl Engine</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
