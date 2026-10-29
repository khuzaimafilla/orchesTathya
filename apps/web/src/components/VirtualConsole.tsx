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
    <div className="rounded-xl border border-[#27272a] bg-[#09090b] shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
      {/* Console Header */}
      <div className="px-4 py-2.5 bg-[#121214] border-b border-[#27272a] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[#A1A19D] font-heading font-semibold text-[11px] flex items-center space-x-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-[#EAB308]" />
            <span>{title}</span>
          </span>
          {isRunning && (
            <span className="flex items-center space-x-1 text-[10px] text-[#EAB308] bg-[#EAB308]/10 px-2 py-0.5 rounded-full border border-[#EAB308]/30 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]"></span>
              <span>Running...</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded text-[10px] transition-colors flex items-center space-x-1 ${
              autoScroll ? 'text-[#EAB308] bg-[#EAB308]/15 border border-[#EAB308]/40' : 'text-[#71717A] hover:text-[#A1A19D]'
            }`}
            title="Toggle Auto Scroll"
          >
            <ArrowDownCircle className="w-3 h-3" />
            <span>Scroll</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-1 text-[#A1A19D] hover:text-[#F5F5F0] hover:bg-[#18181b] rounded transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onClear && (
            <button
              onClick={onClear}
              className="p-1 text-[#A1A19D] hover:text-rose-400 hover:bg-[#18181b] rounded transition-colors"
              title="Clear logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Console Content */}
      <div className="p-4 bg-[#09090b] text-[#F5F5F0] max-h-72 min-h-48 overflow-y-auto leading-relaxed select-text font-mono text-[11px]">
        {logs.trim().length === 0 ? (
          <div className="text-[#71717A] italic py-6 text-center select-none font-sans text-xs">
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
