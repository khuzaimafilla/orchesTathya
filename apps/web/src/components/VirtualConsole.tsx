'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Copy, Trash2, Check, ArrowDownCircle } from 'lucide-react';

interface VirtualConsoleProps {
  logs: string;
  onClear?: () => void;
  title?: string;
  isRunning?: boolean;
}

export function VirtualConsole({ logs, onClear, title = 'CLI Engine Live Stream', isRunning = false }: VirtualConsoleProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
      {/* Console Header */}
      <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-zinc-400 font-semibold text-[11px] flex items-center space-x-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>{title}</span>
          </span>
          {isRunning && (
            <span className="flex items-center space-x-1 text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/50 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Running...</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded text-[10px] transition-colors flex items-center space-x-1 ${
              autoScroll ? 'text-indigo-400 bg-indigo-950/50 border border-indigo-800/50' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Toggle Auto Scroll"
          >
            <ArrowDownCircle className="w-3 h-3" />
            <span>Scroll</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onClear && (
            <button
              onClick={onClear}
              className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Console Content */}
      <div className="p-4 bg-zinc-950 text-zinc-300 max-h-72 min-h-48 overflow-y-auto leading-relaxed select-text font-mono text-[11px]">
        {logs.trim().length === 0 ? (
          <div className="text-zinc-600 italic py-6 text-center select-none">
            [Ready] Belum ada proses eksekusi. Pilih konfigurasi dan klik tombol aksi untuk memulai.
          </div>
        ) : (
          <pre className="whitespace-pre-wrap break-words">{logs}</pre>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
