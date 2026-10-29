# TathyaTest Web Orchestrator

> **Platform Web Orchestrator Berbasis Next.js dan Visualisasi Graf Interaktif untuk Engine Pengujian Otomatis Playwright (TathyaTest CLI)**  
> *Undergraduate Thesis Project / Proyek Tugas Akhir*

---

## 1. Ringkasan Arsitektur Proyek (Monorepo)

Repositori ini menggabungkan antarmuka visual modern (**Next.js Web Orchestrator**) dengan mesin perayap dan pembuat skenario uji fungsional (**TathyaTest CLI Engine**) ke dalam struktur monorepo yang bersih dan modular:

```text
.
├── apps/
│   └── web/                   # [Frontend & Backend Orchestrator] Next.js (App Router, Tailwind CSS, TypeScript)
│       ├── src/app/           # API routes (/api/orchestrator/*) & halaman dashboard
│       ├── src/components/    # Komponen graf (React Flow), Virtual Console, tabel skenario, modal SUS
│       └── package.json
│
├── engine/                    # [Testing Core] TathyaTest CLI & Headless Playwright Chromium Crawler
│   ├── generator/             # Generator TypeScript CLI (tt)
│   ├── case-study/            # Target studi kasus pengujian (Laravel Blade & Inertia React)
│   ├── playwright.config.ts   # Konfigurasi Playwright (termasuk kompatibilitas Windows)
│   └── package.json
│
├── docs/                      # [Dokumentasi Akademis & Perancangan]
│   ├── diagrams/
│   │   ├── bpmn-tathyatest-orchestrator.drawio  # BPMN 2.0 Collaboration Diagram
│   │   ├── system-flow-tathyatest.drawio       # System Flow Diagram (4 Pools)
│   │   └── system-flow-mermaid.mmd             # Mermaid.js Sequence/Flow
│   └── research/
│       ├── sus-instrument.md                   # Instrumen Kuesioner System Usability Scale (SUS)
│       └── benchmark-methodology.md            # Protokol Pengukuran Latensi Overhead (ΔTime)
│
├── .gitignore
└── README.md
```

---

## 2. Cara Menjalankan Proyek Secara Lokal

### Prasyarat
- **Node.js** >= v20.0.0
- **npm** >= v10.0.0
- **Browser Playwright Chromium**:
  ```bash
  npx playwright install chromium
  ```

---

### Langkah 1: Build Engine CLI (`engine/`)
```bash
cd engine
npm install
cd generator
npm install
npm run build
npm link
cd ../..
```
*Perintah `tt --version` sekarang dapat dijalankan di terminal Anda.*

---

### Langkah 2: Jalankan Web Orchestrator Next.js (`apps/web/`)
Buka terminal baru:
```bash
cd apps/web
npm run dev
```
Buka browser di: **`http://localhost:3000`**

---

## 3. Fitur Utama Web Orchestrator

1. **No-Code Configuration Wizard**: Pengguna cukup menginputkan URL website dan akun login tanpa perlu menyusun file YAML secara manual.
2. **Interactive DOM Site-Map (React Flow)**: Mengubah snapshot `crawl/<role>.json` menjadi topologi graf interaktif.
3. **Execution Lock & Queue Manager**: Mencegah tabrakan sesi saat beberapa responden penelitian mengakses sistem secara bersamaan.
4. **Virtual Terminal Console**: Streaming *real-time* log `stdout/stderr` subprocess Playwright ke browser via *Server-Sent Events (SSE)*.
5. **Research Evaluation Module**:
   - Pencatatan latensi *overhead* presisi: $\Delta \text{Time} = T_{\text{end}} - T_{\text{start}}$.
   - Pop-up modal evaluasi **System Usability Scale (SUS)** dengan 10 pernyataan standar.

---

## 4. Diagram Perancangan Sistem

Diagram arsitektur sistem formal dapat dilihat dan diedit menggunakan [Draw.io / diagrams.net](https://app.diagrams.net):
- BPMN 2.0 Collaboration: [`docs/diagrams/bpmn-tathyatest-orchestrator.drawio`](docs/diagrams/bpmn-tathyatest-orchestrator.drawio)
- System Flow 4-Pool: [`docs/diagrams/system-flow-tathyatest.drawio`](docs/diagrams/system-flow-tathyatest.drawio)
