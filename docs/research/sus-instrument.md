# System Usability Scale (SUS) Evaluation Instrument

Kuesioner ini digunakan untuk mengukur tingkat kebergunaan (*usability*) dari **TathyaTest Web Orchestrator** yang diuji oleh responden (QA Engineer, Developer, atau Mahasiswa).

---

## 1. Skala Penilaian (Likert Scale)
Setiap butir dinilai dari rentang **1 (Sangat Tidak Setuju)** hingga **5 (Sangat Setuju)**:
- **1** = Sangat Tidak Setuju (STS)
- **2** = Tidak Setuju (TS)
- **3** = Netral / Ragu-ragu (N)
- **4** = Setuju (S)
- **5** = Sangat Setuju (SS)

---

## 2. Sepuluh Butir Pernyataan Standar SUS (Brooke, 1996)

| No | Pernyataan (*Item Statement*) | STS (1) | TS (2) | N (3) | S (4) | SS (5) |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Q1** | Saya berpikir akan sering menggunakan sistem Web Orchestrator ini untuk pengujian otomatis. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Q2** | Saya merasa sistem ini terlalu rumit untuk digunakan secara visual. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Q3** | Saya merasa antarmuka Web Orchestrator ini mudah untuk digunakan. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Q4** | Saya pikir saya membutuhkan bantuan dari orang teknis untuk dapat menggunakan sistem ini. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Q5** | Saya merasa fitur-fitur (Graph, Virtual Console, Test Table) dalam sistem ini terintegrasi dengan sangat baik. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Q6** | Saya merasa ada terlalu banyak hal yang tidak konsisten pada sistem ini. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Q7** | Saya yakin kebanyakan orang dapat mempelajari sistem ini dengan sangat cepat. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Q8** | Saya merasa sistem ini sangat membingungkan saat pertama kali dijalankan. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Q9** | Saya merasa sangat percaya diri saat mengoperasikan sistem pengujian otomatis ini. | [ ] | [ ] | [ ] | [ ] | [ ] |
| **Q10** | Saya harus belajar banyak hal terlebih dahulu sebelum bisa mulai menggunakan sistem ini. | [ ] | [ ] | [ ] | [ ] | [ ] |

---

## 3. Formula Perhitungan Skor Akhir SUS

Untuk setiap responden, skor akhir dihitung dengan rumus:

$$\text{SUS Score} = \left( \sum_{i \in \text{ganjil}} (Q_i - 1) + \sum_{j \in \text{genap}} (5 - Q_j) \right) \times 2.5$$

- Rentang Skor: **0 – 100**
- Kriteria Kelayakan:
  - **> 68.0**: *Above Average* (Layak digunakan / *Acceptable*)
  - **> 80.3**: *Excellent / Grade A* (Sangat baik dan memuaskan)
