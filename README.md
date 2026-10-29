# orchesTathya

> **Web Orchestrator & GUI Dashboard untuk TathyaTest CLI Engine**

orchesTathya adalah antarmuka web modern berbasis **Next.js** yang membungkus mesin pengujian otomatis **TathyaTest (Playwright)**. Sistem ini mengubah alur pengujian CLI yang sebelumnya manual (mengedit file YAML) menjadi alur visual yang mudah digunakan: mulai dari memasukkan URL target, memetakan formulir DOM, memilih skenario uji, hingga memantau eksekusi pengujian secara langsung.

---

## 🚀 Cara Menjalankan Sistem

### 1. Prasyarat
- **Node.js** (versi 20 atau lebih baru)
- **npm** (versi 10 atau lebih baru)
- **Git**

### 2. Setup Engine (Sekali Saja)
Buka terminal di folder root repositori:
```bash
# Masuk ke folder engine dan build generator CLI
cd engine
npm install
cd generator
npm install
npm run build
npm link
cd ../..

# Pasang browser Chromium Playwright
npx playwright install chromium
```

### 3. Jalankan Web Orchestrator
```bash
cd apps/web
npm install
npm run dev
```

---

## 📖 Panduan Penggunaan (Alur 4 Langkah)

Sistem dirancang dengan alur pengujian yang terstruktur dalam 4 langkah:

### 1. Konfigurasi Target (Tahap 1)
- Masukkan URL aplikasi web yang ingin diuji, rute login, dan kredensial akun.
- **Tip Praktis**: Anda dapat langsung mengklik tombol **"SauceDemo SPA (Preset)"** untuk mencoba pengujian instan pada aplikasi e-commerce publik SauceDemo.
- Klik tombol **"Simpan Konfigurasi & Mulai Crawl Engine"**. Crawler Playwright akan mulai menjelajahi halaman web target di latar belakang.

### 2. Struktur Sitemap & Form (Tahap 2)
- Setelah crawling selesai, halaman ini akan menampilkan daftar seluruh halaman web yang berhasil ditemukan.
- Anda dapat menginspeksi formulir HTML (CRUD), tombol interaktif, serta rincian kolom input (tipe data, aturan validasi, dan selector elemen).
- Klik tombol **"Lanjut: Generate Test Specs"** untuk membuat skenario uji otomatis.

### 3. Matriks Skenario Uji (Tahap 3)
- Generator akan menghasilkan skenario pengujian fungsional Playwright (misal: 31 skenario pada SauceDemo).
- Anda dapat menyaring skenario berdasarkan:
  - **Kategori**: Auth (Login/Logout), CRUD (Formulir), RBAC (Peran Akun), atau Navigasi.
  - **Tier**: Skenario positif (data valid), negatif (input salah/kosong), atau nilai batas (*edge cases*).
- Anda dapat menjalankan seluruh skenario sekaligus, hanya skenario `@positive`, atau memilih skenario tertentu secara spesifik.

### 4. Eksekusi Pengujian & Hasil (Tahap 4)
- Playwright Chromium akan mengeksekusi skenario uji secara otomatis.
- **Virtual Console**: Kotak terminal di bagian bawah layar menampilkan streaming log eksekusi secara *real-time*.
- Setelah eksekusi selesai, kartu ringkasan akan menampilkan jumlah tes yang **Passed** (Lulus), **Failed** (Gagal), **Skipped** (Dilewati), dan total durasi waktu eksekusi.
- Responden dapat melengkapi survei evaluasi singkat usabilitas (SUS) yang terbuka otomatis di akhir pengujian.

---

## 📁 Struktur Folder Utama

```text
orchesTathya/
├── apps/
│   └── web/          # Aplikasi Web Orchestrator (Next.js, Tailwind CSS)
│       ├── src/      # Komponen UI, halaman dashboard, dan API controller
│       └── data/     # Penyimpanan log riwayat eksekusi dan kuesioner
│
├── engine/           # Inti pengujian TathyaTest CLI (Playwright Crawler & Generator)
│   └── generator/    # Source code TypeScript CLI (tt)
│
└── README.md
```
