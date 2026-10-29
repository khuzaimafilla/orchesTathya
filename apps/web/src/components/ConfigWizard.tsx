'use client';

import React, { useState } from 'react';
import { TargetConfigInput, SAUCEDEMO_PRESET } from '@/lib/config-builder';
import { Globe, Key, Compass, Play, Sparkles, RefreshCw, Layers } from 'lucide-react';

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
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-zinc-900 border border-indigo-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Evaluasi Target Web Aplikasi</h3>
            <p className="text-xs text-zinc-400">
              Pilih preset evaluasi SauceDemo (React SPA Publik) atau konfigurasi URL target custom Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => handleApplyPreset('saucedemo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              presetType === 'saucedemo'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            SauceDemo SPA (Preset)
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              presetType === 'custom'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Custom SUT
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Target App & Authentication */}
          <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                1. Target URL & Autentikasi
              </h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Base URL (SUT)</label>
                <input
                  type="url"
                  required
                  value={config.baseUrl}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Login Path</label>
                <input
                  type="text"
                  required
                  value={config.loginPath}
                  onChange={(e) => setConfig({ ...config, loginPath: e.target.value })}
                  placeholder="/"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={config.role.name}
                    onChange={(e) =>
                      setConfig({ ...config, role: { ...config.role, name: e.target.value } })
                    }
                    placeholder="standard_user"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={config.role.username}
                    onChange={(e) =>
                      setConfig({ ...config, role: { ...config.role, username: e.target.value } })
                    }
                    placeholder="username"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={config.role.password}
                    onChange={(e) =>
                      setConfig({ ...config, role: { ...config.role, password: e.target.value } })
                    }
                    placeholder="password"
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Crawler & Extraction Constraints */}
          <div className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
              <Compass className="w-4 h-4 text-violet-400" />
              <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                2. Crawler Scope & Oracle
              </h4>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Max Depth</label>
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
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Max Pages</label>
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
                    className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Include Routes (Pisahkan koma)
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
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Oracle Error Selector (CSS)
                </label>
                <input
                  type="text"
                  value={config.oracleErrorSelector || ''}
                  onChange={(e) => setConfig({ ...config, oracleErrorSelector: e.target.value })}
                  placeholder='[data-test="error"]'
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono"
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
            className={`px-6 py-2.5 rounded-xl font-semibold text-xs flex items-center space-x-2 shadow-lg transition-all ${
              isLoading || isLocked
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Sedang Melakukan Crawling & Ekstraksi...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Simpan Konfigurasi & Mulai Crawl Engine</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
