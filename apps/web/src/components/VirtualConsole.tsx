'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Terminal, Copy, Trash2, Check, ArrowDownCircle, X } from 'lucide-react';

interface VirtualConsoleProps {
  logs: string;
  onClear?: () => void;
  onClose?: () => void;
  title?: string;
  isRunning?: boolean;
}

/** Map log line to a color class based on content keywords */
function getLineStyle(line: string): string {
  const l = line.toLowerCase();
  if (line.includes('[ORCHESTRATOR]')) return 'text-[#EAB308] font-medium';
  if (line.includes('[ERROR]') || l.includes('error:') || l.includes('× ') || l.includes('✗')) return 'text-rose-400';
  if (l.includes('failed') && !l.includes('0 failed')) return 'text-rose-300';
  if (l.includes('passed') || l.includes('✓') || l.includes('sukses') || l.includes('selesai')) return 'text-[#EAB308]';
  if (l.includes('[warn') || l.includes('warning')) return 'text-amber-400';
  if (line.startsWith('  ') && (l.includes('passed') || l.includes('failed') || l.includes('skipped'))) return 'text-[#F5F5F0] font-medium';
  if (line.startsWith('Running') || line.startsWith('  ')) return 'text-[#A1A19D]';
  return 'text-[#8b8b88]';
}

export function VirtualConsole({
  logs,
  onClear,
  onClose,
  isRunning = false,
}: VirtualConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll when logs update
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(logs).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [logs]);

  const lines = logs.split('\n');

  return (
    <div className="h-full w-full flex flex-col bg-[#0d0d0f] font-mono text-[11px] select-text">
      {/* Tab Bar */}
      <div className="h-9 px-3 bg-[#111113] border-b border-[#222224] flex items-center justify-between shrink-0 select-none">
        {/* Left: title + status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-heading">
            <Terminal className="w-3.5 h-3.5 text-[#EAB308]" />
            <span className="text-[#D4D4CE]">Terminal</span>
          </div>

          {isRunning ? (
            <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              berjalan...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] text-[#52525b] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3f3f46]" />
              idle
            </span>
          )}
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded transition-colors ${
              autoScroll ? 'text-[#EAB308]' : 'text-[#52525b] hover:text-[#A1A19D]'
            }`}
            title={autoScroll ? 'Auto-scroll aktif — klik untuk nonaktifkan' : 'Auto-scroll nonaktif — klik untuk aktifkan'}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-[#52525b] hover:text-[#A1A19D] transition-colors"
            title="Salin semua log"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#EAB308]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {onClear && (
            <button
              onClick={onClear}
              className="p-1.5 rounded text-[#52525b] hover:text-rose-400 transition-colors"
              title="Hapus log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded text-[#52525b] hover:text-[#A1A19D] transition-colors ml-0.5 pl-2 border-l border-[#222224]"
              title="Tutup panel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Log Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 leading-5 bg-[#0d0d0f]"
        onScroll={(e) => {
          const el = e.currentTarget;
          const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
          setAutoScroll(isAtBottom);
        }}
      >
        {/* Environment header — shown once */}
        <div className="text-[#3a3a3f] text-[10px] pb-2 mb-2 border-b border-[#1a1a1d] space-y-0.5 select-none">
          <div>orchesTathya · Playwright Chromium Subprocess · win32-x64</div>
        </div>

        {logs.trim().length === 0 ? (
          <div className="py-6 text-[#3a3a3f] space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[#EAB308]">$</span>
              <span>tt ready — pilih aksi untuk memulai</span>
              <span className="inline-block w-2 h-3.5 bg-[#EAB308]/60 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {lines.map((line, idx) => (
              <div
                key={idx}
                className={`whitespace-pre-wrap break-words py-[1px] ${getLineStyle(line)}`}
              >
                {line || '\u00A0'}
              </div>
            ))}
          </div>
        )}

        {/* Blinking cursor at bottom */}
        <div className="mt-2 flex items-center gap-1.5 text-[11px]">
          <span className="text-[#EAB308] select-none">$</span>
          {isRunning ? (
            <span className="text-[#52525b] italic animate-pulse">executing...</span>
          ) : (
            <span className="inline-block w-2 h-3.5 bg-[#EAB308]/70 animate-[pulse_1.2s_ease-in-out_infinite]" />
          )}
        </div>
      </div>
    </div>
  );
}
