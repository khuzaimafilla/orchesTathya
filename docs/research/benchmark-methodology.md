# Metodologi Pengujian Latensi & Overhead (Benchmarking)

Dokumen ini menjelaskan prosedur eksperimen untuk mengukur dampak *overhead* performa saat mengeksekusi TathyaTest melalui **Web Orchestrator** dibandingkan dengan **CLI murni (*Raw CLI*)**.

---

## 1. Variabel Penelitian

- **Variabel Bebas (*Independent Variable*)**: Lingkungan eksekusi (*CLI Native* vs *Web Orchestrator Subprocess*).
- **Variabel Terikat (*Dependent Variable*)**: Waktu eksekusi total ($T_{\text{execution}}$) dan beban memori (*Memory Heap RSS*).
- **Subjek Uji (*Target Subject*)**: SauceDemo SPA dan Laravel Todo Blade.

---

## 2. Metrik Pengukuran Latensi

Waktu eksekusi diukur dengan presisi tinggi menggunakan `performance.now()` di Node.js:

$$\Delta \text{Time} = T_{\text{end}} - T_{\text{start}}$$

### Perhitungan Overhead Tambahan:
$$\text{Overhead Latency} = \Delta T_{\text{Web Orchestrator}} - \Delta T_{\text{CLI Native}}$$

$$\text{Overhead Ratio (\%)} = \left( \frac{\Delta T_{\text{Web Orchestrator}} - \Delta T_{\text{CLI Native}}}{\Delta T_{\text{CLI Native}}} \right) \times 100\%$$

---

## 3. Protokol Eksperimen

1. Setiap pengujian diulang sebanyak **5 kali (*Repeat = 5*)** untuk mendapatkan nilai rata-rata dan deviasi standar.
2. Kondisi *cache* dibersihkan sebelum tiap putaran (`--fresh`).
3. Seluruh log latensi otomatis disimpan ke dalam file dataset riset `evaluation_metrics.json`.
